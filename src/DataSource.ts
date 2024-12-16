import "reflect-metadata";
import { DataSource } from "typeorm";

// Cấu hình kết nối sử dụng DataSource
const dataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  database: "movie_ticket",
  synchronize: false,
  logging: true,
  entities: ["src/Data/*.ts"],
  migrations: [
    // Dẫn đến thư mục migrations của bạn
    "src/migrations/*.ts"
  ],
  subscribers:[]
  
});
export default dataSource

