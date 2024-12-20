import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import "reflect-metadata";  // Import reflect-metadata trước khi sử dụng TypeORM
import dataSource from './DataSource';
import genreRouter from './Routes/GenreRoute'
import movieRouter from "./Routes/MovieRoute"
import theaterRouter from './Routes/TheaterRoute'
import screenRouter from './Routes/screenRoute'
import seatRoute from './Routes/SeatRoute'
import showtimeRoute from './Routes/ShowtimeRoute'
import groupRoleRoute from './Routes/GroudRoleRoute'
import reviewRoute from './Routes/ReviewRoute'
import authRoute from './Routes/AuthRoute'
import paymentRoute from './Routes/PaymentRoute'
import billRoute from './Routes/BillRoute'
import ticketRoute from './Routes/TicketRoute'
import { errorHandler } from './Middlewares/ErrorHandle';
// Load environment variables from .env file
dotenv.config();
// set up cookies
// Khởi tạo kết nối đến cơ sở dữ liệu
dataSource.initialize()
  .then(() => {
    console.log("Kết nối đến cơ sở dữ liệu thành công!");
  })
  .catch((error) => {
    console.error("Lỗi khi kết nối đến cơ sở dữ liệu:", error);
  });

// Khởi tạo ứng dụng Express
const app = express();
app.use(cookieParser())
// Sử dụng body-parser để xử lý dữ liệu JSON
app.use(bodyParser.json());
//
// Định nghĩa một route ví 
app.use(express.json()); // Đảm bảo rằng middleware này có mặt
app.use("/api/genre",genreRouter)
//app.use("/api/movie",movieRouter)
//app.use("/api/theater",theaterRouter)
//app.use("/api/screen",screenRouter)
//app.use("/api/seat",seatRoute)
//app.use("/api/showtime",showtimeRoute)
//app.use("/api/review",reviewRoute)
app.use("/api",authRoute)
//app.use("/api/payment",paymentRoute)
//app.use('/api/bill',billRoute)
//app.use('/api/groupRole',groupRoleRoute)
//app.use('/api/ticket',ticketRoute)
// Bắt đầu 
app.use(errorHandler)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
