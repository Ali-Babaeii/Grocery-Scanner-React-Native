# 🛒 GroceryScan

> A React Native app to scan real European supermarket barcodes — instantly see the product name, image, Nutri-Score, and community-reported price.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-brown?style=for-the-badge)

---

## 📱 Screenshots

| Scanner | Product Found | Cart | Checkout |
|---------|--------------|------|----------|
| Point camera at barcode | Real product data loads | Manage your items | Pay with card or PayPal |

---

## ✨ Features

- **Real barcode scanning** — EAN-13, EAN-8, QR, UPC-A/E, Code128
- **Live product lookup** from 4 real databases (no static data)
- **Real product images** from Open Food Facts
- **Community-reported prices** from European stores (Lidl, Aldi, Rewe, Edeka)
- **Nutri-Score badge** (A–E) for every food product
- **Cart management** — add, remove, increase/decrease quantity
- **Checkout screen** — card, PayPal, Apple/Google Pay UI
- **Multi-source fallback** — if one database doesn't have the product, tries the next automatically

---

## 🗄️ Data Sources (Real APIs — No Static Data)

| Source | What it provides | Cost |
|--------|-----------------|------|
| [Open Food Facts](https://world.openfoodfacts.org) | Product name, image, brand, Nutri-Score, ingredients | Free |
| [OFF Prices API](https://prices.openfoodfacts.org) | Community-reported real store prices (DE/EU) | Free |
| [UPC Item DB](https://www.upcitemdb.com) | Broad product catalog fallback | Free (100/day) |
| [Barcode Lookup](https://www.barcodelookup.com/api) | 900M+ products fallback | Free (50/day) |
| [Go-UPC](https://go-upc.com/api) | Extra fallback coverage | Free (100/month) |

---

## 🏗️ Project Structure

```
GroceryScanner/
├── App.tsx                          # Entry point
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Stack navigator (Scanner → Cart → Payment)
│   ├── screens/
│   │   ├── ScannerScreen.tsx        # Camera + barcode scanning
│   │   ├── CartScreen.tsx           # Cart list with qty controls
│   │   └── PaymentScreen.tsx        # Checkout with payment methods
│   ├── components/
│   │   └── CartItem.tsx             # Individual cart item card
│   ├── services/
│   │   └── productApi.ts            # Multi-source barcode lookup (4 APIs)
│   ├── store/
│   │   └── cartStore.ts             # Zustand global cart state
│   └── types/
│       └── index.ts                 # Shared TypeScript types
├── .env                             # API keys (not committed)
├── .env.example                     # Template for API keys
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/GroceryScan.git
cd GroceryScan
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up API keys

```bash
cp .env.example .env
```

Edit `.env` and add your free API keys:

```env
EXPO_PUBLIC_BARCODE_LOOKUP_KEY=your_key_here
EXPO_PUBLIC_GO_UPC_KEY=your_key_here
```

> **Get free keys:**
> - Barcode Lookup: https://www.barcodelookup.com/api (50 req/day free)
> - Go-UPC: https://go-upc.com/api (100 req/month free)
>
> **Note:** The app works without these keys using Open Food Facts + UPC Item DB alone.

### 4. Start the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or run on a simulator:

```bash
npx expo run:ios
npx expo run:android
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | React Navigation (Stack) |
| State Management | Zustand |
| Camera / Scanner | expo-camera |
| HTTP | Native fetch API |
| Styling | React Native StyleSheet |

---

## 🔄 How Barcode Lookup Works

When you scan a barcode, the app tries each source in order and returns the first match:

```
Scan EAN-13 barcode
        │
        ▼
① Open Food Facts  ──✅ found──▶  merge with OFF Prices API
        │ ❌ not found
        ▼
② UPC Item DB  ──✅ found──▶  return data
        │ ❌ not found
        ▼
③ Barcode Lookup  ──✅ found──▶  return data
        │ ❌ not found
        ▼
④ Go-UPC  ──✅ found──▶  return data
        │ ❌ not found
        ▼
   "Product not found"
```

---

## 🌍 European Store Coverage

Tested with products from:

- 🟡 **Lidl** (DE/AT/NL/PL)
- 🔵 **Aldi** (DE/AT)
- 🔴 **Rewe** (DE/AT)
- 🟠 **Edeka** (DE)
- 🟢 **Albert Heijn** (NL)
- 🔵 **Carrefour** (FR/ES/IT)

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_BARCODE_LOOKUP_KEY` | Optional | Barcode Lookup API key |
| `EXPO_PUBLIC_GO_UPC_KEY` | Optional | Go-UPC API key |

Never commit your `.env` file. It is already listed in `.gitignore`.

---

## 📄 License

MIT © 2024 — feel free to use this project in your own work.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

> Built with ❤️ using React Native + real European supermarket data
