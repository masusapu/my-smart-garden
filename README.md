# 🌿 Smart Garden Assistant

Một ứng dụng Vue.js thông minh giúp quản lý vườn cây với trợ lý AI Gemini. Thay vì nhập liệu thủ công, Gemini sẽ đóng vai trò quản gia tự động theo dõi, nhận diện và cập nhật tình trạng khu vườn thông qua cuộc trò chuyện tự nhiên.

## ✨ Tính năng

- **Quản lý vườn tự động**: Gemini tự động nhận diện cây mới và cập nhật trạng thái dựa trên nội dung trò chuyện mà không cần form nhập liệu.
- **Chat tập trung**: Trải nghiệm một khung chat duy nhất cho toàn bộ khu vườn, giúp cuộc hội thoại liền mạch và tự nhiên.
- **Tương tác ngữ cảnh**: Khi chọn một cây cụ thể trong danh sách, Gemini sẽ chủ động hỏi thăm và tập trung tư vấn chuyên sâu cho cây đó.
- **Đồng bộ LocalStorage**: Toàn bộ danh sách cây và lịch sử trò chuyện được lưu trữ cục bộ, đảm bảo dữ liệu không bị mất khi tải lại trang.
- **Giao diện tối giản**: Loại bỏ các thao tác rườm rà, tập trung hoàn toàn vào việc chăm sóc cây qua AI.

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
