import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';
import { getCategories, getProducts } from './api';

export async function exportToExcel() {
  // Tüm kategori ve ürünleri çek
  const catRes = await getCategories();
  const categories = catRes.data;

  const prodRes = await getProducts(); // categoryId olmadan → tüm ürünler
  const products = prodRes.data;

  // Kategori id → isim map
  const catMap = {};
  categories.forEach((c) => { catMap[c._id] = c.name; });

  // Satırları oluştur
  const rows = products.map((p) => ({
    Kategori: catMap[p.categoryId] || '—',
    'Ürün Adı': p.name,
    Marka: p.brand || '—',
    'Fiyat (₺)': p.price > 0 ? p.price : '—',
    Durum: p.isPurchased ? 'Alındı' : 'Bekliyor',
    'Alınma Tarihi': p.purchasedAt
      ? new Date(p.purchasedAt).toLocaleDateString('tr-TR')
      : '—',
  }));

  // Kategoriye göre sırala
  rows.sort((a, b) => a.Kategori.localeCompare(b.Kategori, 'tr'));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Özet satırları — veri bittikten 2 satır sonra
  const summaryStartRow = rows.length + 3; // 1 header + rows + 1 boşluk
  const purchased = products.filter((p) => p.isPurchased);
  const totalPrice = purchased.reduce((sum, p) => sum + (p.price || 0), 0);

  XLSX.utils.sheet_add_aoa(ws, [
    [''],
    ['Toplam Ürün',    `${products.length}`],
    ['Alınan Ürün',   `${purchased.length}`],
    ['Bekleyen Ürün', `${products.length - purchased.length}`],
    ['Toplam Harcama', `${totalPrice.toLocaleString('tr-TR')} ₺`],
  ], { origin: { r: summaryStartRow, c: 0 } });

  // Sütun genişlikleri
  ws['!cols'] = [
    { wch: 18 }, // Kategori
    { wch: 28 }, // Ürün Adı
    { wch: 16 }, // Marka
    { wch: 12 }, // Fiyat
    { wch: 12 }, // Durum
    { wch: 16 }, // Alınma Tarihi
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Çeyiz Listesi');

  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const now = new Date();
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `ceyiz_${localDate}.xlsx`;
  const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (Platform.OS === 'android') {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return;

    const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      fileName,
      mimeType
    );
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } else {
    // iOS: doğrudan kaydetme yok, paylaşım üzerinden Files'a kaydedilir
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await Sharing.shareAsync(fileUri, {
      mimeType,
      UTI: 'com.microsoft.excel.xlsx',
    });
  }
}
