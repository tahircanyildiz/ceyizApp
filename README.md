# Yuvam — Çeyiz Takip Uygulaması

Yuvam, çiftlerin çeyiz alışverişlerini birlikte planlayıp takip edebildiği bir mobil uygulamadır. Kategorilere göre ürün listesi oluşturabilir, satın alınan ürünleri işaretleyebilir, fotoğraf ve fiyat bilgisi ekleyebilir, harcama özetini görüntüleyebilirsiniz.

---

## Özellikler

- Kategori bazlı ürün yönetimi (Mutfak, Yatak Odası, Salon vb.)
- Ürün ekleme, düzenleme, silme
- Ürün fotoğrafı yükleme (kamera veya galeri)
- Alındı işaretleme — marka, fiyat ve fotoğraf girişiyle birlikte
- Alınma tarihi takibi
- Harcama özeti (kategoriler toplamı ve her kategori detayı)
- Filtre: Tümü / Bekleyenler / Alınanlar
- Partner sistemi — iki kullanıcı aynı listeyi paylaşır
- JWT tabanlı kimlik doğrulama

---

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Mobile | React Native (Expo SDK 54) |
| Backend | Node.js + Express |
| Veritabanı | MongoDB + Mongoose |
| Görsel Depolama | Cloudinary |
| Kimlik Doğrulama | JWT |
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
│       │   └── upload.js
│       ├── middleware/
│       │   └── auth.js
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
        │   └── SettingsScreen.js
        ├── components/
        │   ├── CategoryCard.js
        │   ├── ProductCard.js
        │   ├── FilterBar.js
        │   └── SpendingSummary.js
        ├── context/
        │   └── AuthContext.js
        ├── services/
        │   └── api.js
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
| GET | `/api/partner` | Partner bilgisini getir |
| POST | `/api/partner/add` | Partner hesabı oluştur |
| PUT | `/api/partner/:id` | Partner bilgilerini güncelle |
| GET | `/api/categories` | Kategorileri listele |
| POST | `/api/categories` | Kategori oluştur |
| PUT | `/api/categories/:id` | Kategori güncelle |
| DELETE | `/api/categories/:id` | Kategori sil |
| GET | `/api/products?categoryId=` | Ürünleri listele |
| GET | `/api/products/:id` | Ürün detayını getir |
| POST | `/api/products` | Ürün ekle |
| PUT | `/api/products/:id` | Ürün güncelle |
| DELETE | `/api/products/:id` | Ürün sil |
| POST | `/api/upload` | Cloudinary'e görsel yükle |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- MongoDB Atlas hesabı
- Cloudinary hesabı
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)

### Backend

```bash
cd backend
npm install
```

`backend/.env` dosyası oluşturun:

```env
PORT=5000
MONGO_URI=mongodb+srv://<kullanici>:<sifre>@cluster.mongodb.net/ceyizapp
JWT_SECRET=gizli_anahtar
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
node src/app.js
```

### Mobile

```bash
cd mobile
npm install
```

`mobile/.env` dosyası oluşturun:

```env
EXPO_PUBLIC_API_URL=https://<backend-url>/api
```

```bash
npx expo start
```

---

## APK Alma (Android)

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
| Home | Kategori listesi ve toplam harcama özeti |
| ProductList | Seçili kategorideki ürünler, filtre (Tümü / Bekleyenler / Alınanlar) |
| ProductDetail | Ürün detayı, fotoğraf tam ekran görüntüleme, alındı işaretleme |
| AddEditProduct | Ürün ekleme/düzenleme; alındı işaretlerken marka, fiyat, fotoğraf girişi |
| Settings | Hesap bilgileri, partner yönetimi, çıkış |
