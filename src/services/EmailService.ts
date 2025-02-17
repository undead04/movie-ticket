import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { Bill } from "entitys/Bill";
export default class EmailService {
  // Hàm gửi mail
  async sendEmail(to: string, subject: string, data: Bill) {
    try {
      // 1. Đọc file template
      const filePath = path.join(__dirname, "../pages/email.hbs");
      const source = fs.readFileSync(filePath, "utf-8");

      // 2. Compile template với Handlebars
      const template = Handlebars.compile(source);
      // 3. Truyền dữ liệu vào template
      const user = data.user;
      const tickets = data.tickets;
      const movie = tickets[0].showtime.movie;
      const screen = tickets[0].showtime.screen;
      const theater = tickets[0].showtime.screen.theater;
      const showtime = tickets[0].showtime;
      const html = template({
        name: user.username,
        price: `${data.totalPrice} vnd`,
        orderCode: data.orderCode,
        nameMovie: movie.title,
        seats: `Phòng: ${screen.name}, Ghế: ${tickets
          .map((ticket) => ticket.seat.seatNumber)
          .join(",")} Địa chỉ: ${theater.name}`,
        hours: `${showtime.showDate} ${showtime.startTime} - ${showtime.endTime}`,
      });
      // Cấu hình transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // Thay bằng SMTP của nhà cung cấp dịch vụ email
        port: 587,
        secure: false, // true cho cổng 465, false cho cổng 587
        auth: {
          user: process.env.EMAIL, // Email của bạn
          pass: process.env.PASSWORD, // Mật khẩu ứng dụng
        },
      });

      // Thông tin email
      const mailOptions = {
        from: `"Your Name" ${process.env.EMAIL}`, // Người gửi
        to, // Người nhận
        subject, // Tiêu đề email
        html: html, // Nội dung email (có thể dùng plain text hoặc html)
      };

      // Gửi mail
      const info = await transporter.sendMail(mailOptions);

      console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email: ${error}`);
    }
  }
}
