Uygulama Planı

## Teknolojiler
- **Mobile**: React Native (Expo)
- **Backend**: Node.js + Express
- **Veritabanı**: MongoDB + Mongoose
- **Depolama**: Cloudinary (ürün görselleri)
- **Auth**: JWT + username/email/password

---

## Klasör Yapısı

```
ceyizApp/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── partnerController.js
│   │   │   ├── categoryController.js
│   │   │   ├── productController.js
│   │   │   └── uploadController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   └── Product.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── partner.js
│   │   │   ├── categories.js
│   │   │   ├── products.js
│   │   │   └── upload.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── mobile/
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── ProductListScreen.js
    │   │   ├── ProductDetailScreen.js
    │   │   ├── AddEditProductScreen.js
    │   │   └── SettingsScreen.js
    │   ├── components/
    │   │   ├── CategoryCard.js
    │   │   ├── ProductCard.js
    │   │   ├── FilterBar.js
    │   │   └── SpendingSummary.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   └── api.js
    │   └── navigation/
    │       └── AppNavigator.js
    ├── App.js
    └── package.json
```

---

## Partner Sistemi (householdId Mantığı)

- Her kullanıcı kayıt olduğunda `householdId = kendi _id`'si olur
- Partner eklendiğinde: partner'ın `householdId`'si mevcut kullanıcının `householdId`'sine set edilir
- Tüm kategori ve ürün sorguları `householdId` filtresi ile yapılır
- Böylece iki kullanıcı aynı veriyi paylaşır

---

## API Endpointleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /auth/register | Kayıt |
| POST | /auth/login | Giriş |
| POST | /partner/add | Partner ekle |
| GET | /categories | Kategorileri listele |
| POST | /categories | Kategori oluştur |
| PUT | /categories/:id | Kategori güncelle |
| DELETE | /categories/:id | Kategori sil |
| GET | /products?categoryId= | Ürünleri listele |
| POST | /products | Ürün ekle |
| PUT | /products/:id | Ürün güncelle |
| DELETE | /products/:id | Ürün sil |
| POST | /upload | Cloudinary'e görsel yükle |

---

## Kurulum

### Backend
```bash
cd backend
npm install
# .env dosyasını doldur
node src/app.js
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

### .env Değişkenleri
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=gizli_anahtar
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
