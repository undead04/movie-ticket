import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import "reflect-metadata"; // Import reflect-metadata trước khi sử dụng TypeORM
import dataSource from "./DataSource";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middlewares/ErrorHandle";
import { RegisterRoutes } from "./routes/routes";
import swaggerDocument from "./swagger/swagger.json";
import cron from "node-cron";
import BillService from "services/BillService";
import { Bill, StatusOrder } from "entitys/Bill";
import BaseRepository from "utils/BaseRepository";
import { LessThan } from "typeorm";
import { statusUser } from "./entitys/User";
// Tạo server Express
const app = express();
app.use(bodyParser.json());
app.use(express.json());
// set up cookies
app.use(cookieParser());
dotenv.config();
// Khởi tạo kết nối đến cơ sở dữ liệu
// Cấu hình Swagger UI
app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  res.send(swaggerUi.generateHTML(swaggerDocument));
});
RegisterRoutes(app);

app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: "Not Found",
  });
});
app.use(errorHandler);
dataSource
  .initialize()
  .then(() => {
    console.log("Kết nối đến cơ sở dữ liệu thành công!");
  })
  .catch((error) => {
    console.error("Lỗi khi kết nối đến cơ sở dữ liệu:", error);
  });

// kiểm tra hóa đơn hết hạn
cron.schedule("*/1 * * * *", async () => {
  console.log("Checking for expired bills...");
  const billRepository = new BaseRepository<Bill>(Bill, "bill");
  const expiredBills = await billRepository.getRepository().find({
    where: {
      statusOrder: StatusOrder.pending,
      expiration_time: LessThan(new Date()), // Sử dụng toán tử LessThan của TypeORM,
    },
  });

  for (const bill of expiredBills) {
    await billRepository.update(bill.id, { statusOrder: StatusOrder.expired });
    console.log(`Bill ${bill.id} has expired.`);
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
