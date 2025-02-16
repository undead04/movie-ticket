import "reflect-metadata";
import { DataSource } from "typeorm";

// Cấu hình kết nối sử dụng DataSource
const dataSource = new DataSource({
  type: "mysql",
  host: process.env.MYSQLHOST || "localhost",
  port: Number(process.env.MYSQLPORT) || 3306,
  username: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "movie_ticket",
  synchronize: false,
  logging: true,
  entities: ["src/entitys/*.ts"],
  migrations: [
    // Dẫn đến thư mục migrations của bạn
    "src/migrations/*.ts",
  ],
  subscribers: [],
});
export default dataSource;
