# Yuvam — Çeyiz Takip Uygulaması

Yuvam, çiftlerin çeyiz alışverişlerini birlikte planlayıp takip edebildiği bir mobil uygulamadır. Kategorilere göre ürün listesi oluşturabilir, satın alınan ürünleri işaretleyebilir, fotoğraf ve fiyat bilgisi ekleyebilir, harcama özetini görüntüleyebilirsiniz.

---

## Özellikler

### Temel
- Kategori bazlı ürün yönetimi (Mutfak, Yatak Odası, Salon vb.)
- Ürün ekleme, düzenleme, silme
- Ürün fotoğrafı yükleme (kamera veya galeri, kırpmasız)
- Alındı işaretleme — marka, fiyat ve fotoğraf girişiyle birlikte
- Alınma tarihi takibi
- Filtre: Tümü / Bekleyenler / Alınanlar (varsayılan: Bekleyenler)
- Fotoğrafa tıklayınca tam ekran görüntüleme
- Benzer ürün adı uyarısı

### Arama
- Kategori içi ürün arama (anlık filtreleme)
- Tüm kategorilerde global ürün arama

### Partner Sistemi
- İki kullanıcı aynı listeyi gerçek zamanlı paylaşır
- Partner ürün/kategori eklediğinde push bildirimi gönderilir (OneSignal)

### AI Asistan
- GPT-4o-mini tabanlı Türkçe çeyiz asistanı
- Asistan üzerinden ürün/kategori ekleme, güncelleme, silme
- Sesli sohbet: konuşarak soru sor, yanıtı sesli dinle (Whisper + expo-speech)
- Excel export asistan üzerinden tetiklenebilir
- Sohbet geçmişi cihazda saklanır

### İstatistikler
- Kategori bazında tamamlanma oranı (progress bar)
- Kategori bazında harcama dağılımı
- Toplam ürün, alınan, bekleyen ve harcama özeti

### Dışa Aktarma
- Excel export (Android: doğrudan kayıt, iOS: paylaşım)
- Tüm ürünler: kategori, marka, fiyat, durum, alınma tarihi
- Özet satırları: toplam ürün, alınan, bekleyen, toplam harcama

---

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Mobile | React Native (Expo SDK 54) |
| Backend | Node.js + Express |
| Veritabanı | MongoDB + Mongoose |
| Görsel Depolama | Cloudinary |
| Kimlik Doğrulama | JWT |
| Push Bildirim | OneSignal |
| AI | OpenAI GPT-4o-mini + Whisper |
| Build | EAS Build |

---

## Klasör Yapısı

```
ceyizApp/
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── partnerController.js
│       │   ├── categoryController.js
│       │   ├── productController.js
│       │   ├── chatController.js
│       │   └── uploadController.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Category.js
│       │   └── Product.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── partner.js
│       │   ├── categories.js
│       │   ├── products.js
│       │   ├── chat.js
│       │   ├── transcribe.js
│       │   └── upload.js
│       ├── middleware/
│       │   └── auth.js
│       ├── utils/
│       │   └── notify.js
│       ├── config/
│       │   └── cloudinary.js
│       └── app.js
│
└── mobile/
    └── src/
        ├── screens/
        │   ├── LoginScreen.js
        │   ├── RegisterScreen.js
        │   ├── HomeScreen.js
        │   ├── ProductListScreen.js
        │   ├── ProductDetailScreen.js
        │   ├── AddEditProductScreen.js
        │   ├── SettingsScreen.js
        │   ├── ChatScreen.js
        │   ├── SearchScreen.js
        │   └── StatisticsScreen.js
        ├── components/
        │   ├── CategoryCard.js
        │   ├── ProductCard.js
        │   ├── FilterBar.js
        │   └── SpendingSummary.js
        ├── context/
        │   └── AuthContext.js
        ├── services/
        │   ├── api.js
        │   └── exportService.js
        └── navigation/
            └── AppNavigator.js
```

---

## Partner Sistemi

Her kullanıcı kayıt olduğunda `householdId` olarak kendi `_id`'si atanır. Ana kullanıcı partner ekleyince partner'ın `householdId`'si ana kullanıcının `householdId`'siyle eşitlenir. Tüm kategori ve ürün sorguları bu `householdId` üzerinden filtrelenir; böylece çift aynı veriyi gerçek zamanlı paylaşır.

---

## API Endpointleri

Tüm endpointler (auth hariç) `Authorization: Bearer <token>` header'ı gerektirir.

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kayıt ol |
| POST | `/api/auth/login` | Giriş yap |
| PUT | `/api/auth/player-id` | OneSignal player ID güncelle |
| GET | `/api/partner` | Partner bilgisini getir |
| POST | `/api/partner/add` | Partner hesabı oluştur |
| PUT | `/api/partner/:id` | Partner bilgilerini güncelle |
| GET | `/api/categories` | Kategorileri listele |
| POST | `/api/categories` | Kategori oluştur |
| PUT | `/api/categories/:id` | Kategori güncelle |
| DELETE | `/api/categories/:id` | Kategori sil |
| GET | `/api/products?categoryId=` | Ürünleri listele |
| GET | `/api/products?search=` | Ürün ara (global) |
| GET | `/api/products/:id` | Ürün detayını getir |
| POST | `/api/products` | Ürün ekle |
| PUT | `/api/products/:id` | Ürün güncelle |
| DELETE | `/api/products/:id` | Ürün sil |
| POST | `/api/chat` | AI asistanla mesajlaş |
| POST | `/api/transcribe` | Ses kaydını metne çevir (Whisper) |
| POST | `/api/upload` | Cloudinary'e görsel yükle |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB Atlas hesabı
- Cloudinary hesabı
- OpenAI hesabı (API key)
- OneSignal hesabı
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Backend

```bash
cd backend
npm install
```

`backend/.env` dosyası oluşturun (`backend/.env.example` dosyasını referans alın):

```env
PORT=5000
MONGO_URI=mongodb+srv://<kullanici>:<sifre>@cluster.mongodb.net/yuvam
JWT_SECRET=gizli_anahtar

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ONESIGNAL_APP_ID=your_onesignal_app_id
ONESIGNAL_REST_API_KEY=your_onesignal_rest_api_key

OPENAI_API_KEY=sk-...
```

```bash
node src/app.js
```

### Mobile

```bash
cd mobile
npm install
```

`mobile/.env` dosyası oluşturun (`mobile/.env.example` dosyasını referans alın):

```env
EXPO_PUBLIC_API_URL=http://192.168.1.X:5000/api
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
```

```bash
npx expo start --clear
```

---

## APK Alma (Android)

EAS dashboard'da şu environment variable'ları tanımlayın:

```
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
```

```bash
cd mobile
eas login
eas build --platform android --profile preview
```

Build tamamlandığında Expo konsolundan `.apk` indirme linki gelir.

---

## Ekranlar

| Ekran | Açıklama |
|-------|----------|
| Login / Register | JWT ile kimlik doğrulama |
| Home | Kategori listesi, harcama özeti, arama ve istatistik butonları |
| ProductList | Seçili kategorideki ürünler, filtre, kategori içi arama |
| ProductDetail | Ürün detayı, fotoğraf tam ekran görüntüleme, alındı işaretleme |
| AddEditProduct | Ürün ekleme/düzenleme; alındı işaretlerken marka, fiyat, fotoğraf girişi |
| Search | Tüm kategorilerde global ürün arama |
| Statistics | Kategori tamamlanma oranları ve harcama dağılımı grafikleri |
| Chat | AI asistan — sesli/yazılı sohbet, ürün/kategori yönetimi |
| Settings | Hesap bilgileri, partner yönetimi, Excel export, çıkış |
