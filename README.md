# 🌿 Smart Garden Assistant

Một ứng dụng Vue.js thông minh giúp quản lý vườn cây với trợ lý AI Gemini. Bạn có thể thêm cây, mô tả tình trạng, và trò chuyện với AI để nhận tư vấn chăm sóc cây.

## ✨ Tính năng

- **Thêm cây mới**: Nhập tên và tình trạng ban đầu
- **Tóm tắt tự động**: AI tự động tóm tắt tình trạng cây dựa trên cuộc trò chuyện
- **Trò chuyện với AI**: Tư vấn chăm sóc cây từ Gemini AI
- **Lưu trữ cục bộ**: Dữ liệu được lưu trong localStorage
- **Giao diện thân thiện**: Responsive và dễ sử dụng

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js (phiên bản 18+)
- npm hoặc yarn

### Cài đặt

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Truy cập http://localhost:5173 để xem ứng dụng.

### Build cho production

```bash
npm run build
npm run start
```

## 🛠️ Công nghệ sử dụng

- **Vue 3** - Framework frontend
- **Vite** - Build tool và dev server
- **Google Gemini AI** - Trợ lý AI cho tư vấn cây
- **Local Storage** - Lưu trữ dữ liệu

## 📁 Cấu trúc dự án

```
src/
├── components/          # Các component Vue
│   ├── AddPlantForm.vue
│   ├── ChatInput.vue
│   ├── ChatSection.vue
│   ├── MessageBubble.vue
│   ├── PlantList.vue
│   └── PlantSidebar.vue
├── composables/         # Logic tái sử dụng
│   ├── useGemini.js
│   └── useLocalStorage.js
├── App.vue              # Component chính
└── main.js              # Entry point
```

## 🔧 Cấu hình

Để sử dụng Gemini AI, bạn cần API key từ Google AI Studio. Tạo file `.env` ở thư mục gốc dự án và thêm:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_RATE_LIMIT_MAX=10
GEMINI_RATE_LIMIT_WINDOW_MS=60000
```

## 📝 License

MIT License
