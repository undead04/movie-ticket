# 🎬 Movie Ticket - Hệ thống đặt vé xem phim trực tuyến

**movie-ticket** là một dự án web giúp người dùng dễ dàng xem danh sách phim, chọn rạp, đặt chỗ và thanh toán vé xem phim trực tuyến.

## 🚀 Tính năng nổi bật

- Xem danh sách phim đang chiếu và sắp chiếu
- Tìm kiếm rạp chiếu phim theo khu vực
- Đặt vé và chọn ghế ngồi trực tuyến
- Thanh toán nhanh chóng và bảo mật
- Xem lịch sử đặt vé

## 🛠️ Công nghệ sử dụng

- TypeScript
- Node.js + Express
- TSOA (Tạo API và tài liệu OpenAPI)
- Handlebars (template engine)
- MySQL (hoặc tùy chỉnh DB)
- Nodemon (cho dev server)
- Thanh toán:MOMO, Stripe
- GỬi email:Nodemailer  

# Clone repo
git clone https://github.com/undead04/movie-ticket.git
cd movie-ticket

# Cài đặt dependencies
npm install

# Tạo file .env và cập nhật cấu hình
cp .env.example .env

# Chạy project ở chế độ dev
npm run dev
