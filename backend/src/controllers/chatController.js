const OpenAI = require('openai');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { notifyPartner } = require('../utils/notify');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools = [
  {
    type: 'function',
    function: {
      name: 'add_product',
      description: 'Kullanıcının çeyiz listesine yeni bir ürün ekler',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Eklenecek ürünün adı' },
          categoryName: {
            type: 'string',
            description: 'Ürünün ekleneceği kategori adı (mevcut kategorilerden biri olmalı)',
          },
        },
        required: ['name', 'categoryName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_category',
      description: 'Kullanıcının çeyiz listesine yeni bir kategori ekler',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Eklenecek kategorinin adı' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_category',
      description: 'Bir kategoriyi ve içindeki tüm ürünleri siler',
      parameters: {
        type: 'object',
        properties: {
          categoryName: { type: 'string', description: 'Silinecek kategorinin adı' },
        },
        required: ['categoryName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_product',
      description: 'Mevcut bir ürünü listeden siler',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Silinecek ürünün adı' },
        },
        required: ['productName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'trigger_export',
      description: 'Kullanıcının çeyiz listesini Excel olarak dışa aktarır',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_product',
      description: 'Mevcut bir ürünün bilgilerini günceller (fiyat, marka, alındı durumu vb.)',
      parameters: {
        type: 'object',
        properties: {
          productName: { type: 'string', description: 'Güncellenecek ürünün adı' },
          brand: { type: 'string', description: 'Yeni marka adı' },
          price: { type: 'number', description: 'Yeni fiyat (TL)' },
          isPurchased: { type: 'boolean', description: 'Alındı olarak işaretlensin mi' },
        },
        required: ['productName'],
      },
    },
  },
];

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'messages dizisi zorunludur' });
    }

    const categories = await Category.find({ householdId: req.householdId });
    const allProducts = await Product.find({ householdId: req.householdId, parentId: null });

    const totalCount = allProducts.length;
    const purchasedCount = allProducts.filter((p) => p.isPurchased).length;
    const pendingCount = totalCount - purchasedCount;
    const totalSpend = allProducts
      .filter((p) => p.isPurchased && p.price > 0)
      .reduce((sum, p) => sum + p.price, 0);

    const catDetails = categories
      .map((cat) => {
        const catProducts = allProducts.filter(
          (p) => p.categoryId.toString() === cat._id.toString()
        );
        if (catProducts.length === 0) return `${cat.name}:\n  (henüz ürün yok)`;
        const lines = catProducts
          .map((p) => {
            let info = `  - ${p.name}: ${p.isPurchased ? 'alındı' : 'bekliyor'}`;
            if (p.brand) info += `, marka: ${p.brand}`;
            if (p.price > 0) info += `, fiyat: ${p.price.toLocaleString('tr-TR')} ₺`;
            return info;
          })
          .join('\n');
        return `${cat.name}:\n${lines}`;
      })
      .join('\n');

    const systemPrompt = `Sen Yuvam uygulamasının Türkçe çeyiz asistanısın. Kullanıcının çeyiz listesi hakkında yardımcı oluyorsun.

Mevcut çeyiz durumu:
- Toplam ürün: ${totalCount} | Alınan: ${purchasedCount} | Bekleyen: ${pendingCount}
- Toplam harcama: ${totalSpend.toLocaleString('tr-TR')} ₺

Ürün listesi:
${catDetails || 'Henüz ürün yok'}

Mevcut kategoriler: ${categories.map((c) => c.name).join(', ') || 'Yok'}

Kısa, samimi ve Türkçe yanıtlar ver.

Fonksiyon kullanım kuralları (yapamayacağın şeyleri yapabildim deme, her zaman ilgili fonksiyonu çağır):
- Listede OLMAYAN yeni ürün ekle: add_product
- Listede OLAN ürünü "aldım/güncelle/düzenle" diyorsa: update_product (add_product KULLANMA)
- "X'i Y markasından Z liraya aldım": update_product ile brand ve price de gönder
- Ürün sil: delete_product
- Kategori sil: delete_category (içindeki tüm ürünler de silinir, kullanıcıya önce sor)
- Kategori ekle: add_category
- Excel/dışa aktar: trigger_export`;

    const apiMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: apiMessages,
      tools,
      tool_choice: 'auto',
      max_tokens: 2000,
      temperature: 0.7,
    });

    const choice = response.choices[0];

    // Fonksiyon çağrısı varsa işle
    if (choice.finish_reason === 'tool_calls') {
      const toolMessages = await Promise.all(
        choice.message.tool_calls.map(async (toolCall) => {
          const args = JSON.parse(toolCall.function.arguments);
          let toolResult;

          if (toolCall.function.name === 'add_product') {
            const category = categories.find(
              (c) => c.name.toLowerCase() === args.categoryName.toLowerCase()
            );
            if (!category) {
              toolResult = `Hata: "${args.categoryName}" kategorisi bulunamadı. Mevcut kategoriler: ${categories.map((c) => c.name).join(', ')}`;
            } else {
              const newProduct = new Product({
                name: args.name,
                categoryId: category._id,
                householdId: req.householdId,
                price: 0,
                brand: '',
                imageUrl: '',
                parentId: null,
              });
              await newProduct.save();
              notifyPartner(req.user._id, req.householdId, 'Yeni Ürün', `"${args.name}" listeye eklendi`);
              toolResult = `"${args.name}" ürünü "${category.name}" kategorisine eklendi.`;
            }
          } else if (toolCall.function.name === 'add_category') {
            const existing = categories.find(
              (c) => c.name.toLowerCase() === args.name.toLowerCase()
            );
            if (existing) {
              toolResult = `Hata: "${args.name}" kategorisi zaten mevcut.`;
            } else {
              const newCategory = new Category({
                name: args.name,
                householdId: req.householdId,
                createdBy: req.user._id,
              });
              await newCategory.save();
              notifyPartner(req.user._id, req.householdId, 'Yeni Kategori', `"${args.name}" kategorisi eklendi`);
              toolResult = `"${args.name}" kategorisi oluşturuldu.`;
            }
          } else if (toolCall.function.name === 'delete_category') {
            const category = categories.find(
              (c) => c.name.toLowerCase() === args.categoryName.toLowerCase()
            );
            if (!category) {
              toolResult = `Hata: "${args.categoryName}" kategorisi bulunamadı.`;
            } else {
              await Product.deleteMany({ categoryId: category._id });
              await Category.findByIdAndDelete(category._id);
              toolResult = `"${category.name}" kategorisi ve içindeki tüm ürünler silindi.`;
            }
          } else if (toolCall.function.name === 'delete_product') {
            const product = allProducts.find(
              (p) => p.name.toLowerCase() === args.productName.toLowerCase()
            );
            if (!product) {
              toolResult = `Hata: "${args.productName}" adında bir ürün bulunamadı.`;
            } else {
              await Product.findByIdAndDelete(product._id);
              toolResult = `"${product.name}" ürünü silindi.`;
            }
          } else if (toolCall.function.name === 'trigger_export') {
            toolResult = 'Export tetiklendi.';
          } else if (toolCall.function.name === 'update_product') {
            const product = allProducts.find(
              (p) => p.name.toLowerCase() === args.productName.toLowerCase()
            );
            if (!product) {
              toolResult = `Hata: "${args.productName}" adında bir ürün bulunamadı.`;
            } else {
              const update = {};
              if (args.brand !== undefined) update.brand = args.brand;
              if (args.price !== undefined) update.price = args.price;
              if (args.isPurchased !== undefined) {
                update.isPurchased = args.isPurchased;
                if (args.isPurchased) update.purchasedAt = new Date();
                else update.purchasedAt = null;
              }
              await Product.findByIdAndUpdate(product._id, update);
              if (args.isPurchased) {
                notifyPartner(req.user._id, req.householdId, 'Ürün Alındı', `"${product.name}" satın alındı olarak işaretlendi`);
              }
              toolResult = `"${product.name}" ürünü güncellendi.`;
            }
          }

          return { role: 'tool', tool_call_id: toolCall.id, content: toolResult };
        })
      );

      const triggerExport = choice.message.tool_calls.some(
        (t) => t.function.name === 'trigger_export'
      );

      // Tüm sonuçları AI'ya ilet
      const finalResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [...apiMessages, choice.message, ...toolMessages],
        max_tokens: 800,
        temperature: 0.7,
      });
 
      return res.json({ reply: finalResponse.choices[0].message.content, triggerExport });
    }

    res.json({ reply: choice.message.content });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ message: 'Yanıt alınamadı', error: err.message });
  }
};
