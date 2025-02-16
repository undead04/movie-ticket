import dataSource from "./DataSource";
import { GroupRole } from "./entitys/GroupRole";
import { DeepPartial } from "typeorm";
import BaseRepository from "./utils/BaseRepository";
import AppRole from "./models/modelRequest/AppRole";
import GenreService from "./services/GenreService";
import TheaterService from "./services/TheaterService";
import ScreenServie from "./services/ScreenService";
import SeatService from "./services/SeatService";

async function createRole() {
  const repo = new BaseRepository(GroupRole, "groupRole");
  const array: DeepPartial<GroupRole>[] = [
    {
      name: AppRole.Admin,
      description: "Là người quản lí trang admin",
    },
    {
      name: AppRole.User,
      description: "Là người dùng mặt định",
    },
  ];
  await dataSource.transaction(async (manager) => {
    await repo.createArray(array, manager);
  });
}
async function seedData() {
  const genreService = new GenreService();
  await genreService.createArray([
    { name: "Phim hành động", description: "Là phim đánh nhau" },
    { name: "Tình cảm", description: "Tình cẩm" },
    { name: "Viễn tưởng", description: "vien tuong" },
    { name: "phim hai", description: "Phim hai" },
  ]);
  const theaterService = new TheaterService();
  await theaterService.createArray([
    {
      name: "Galaxy cinema",
      address: "123 Bui quang la",
      city: "Ho chi minh",
    },
    { name: "Ultra cinema", address: "Phong la", city: "Binh duong" },
  ]);
  const screenService = new ScreenServie();
  await screenService.createArray([
    { name: "Phong 1", seatNumber: 40, theater: { id: 1 } },
    { name: "Phong 2", seatNumber: 50, theater: { id: 1 } },
  ]);
  const seatService = new SeatService();
  await seatService.createArray([
    {
      row: 0,
      col: 0,
      seatNumber: "A1",
      screen: { id: 1 },
    },
    { row: 0, col: 1, seatNumber: "A2", screen: { id: 1 } },
  ]);
}
const seedDatabase = async () => {
  await dataSource.initialize();
  const start = Date.now();
  await seedData();
  const end = Date.now();
  console.log(`Thời gian thêm dữ liệu vào sql ${(end - start) / 1000}`);
  console.log("Data seeded!");
  await dataSource.destroy();
};

seedDatabase().catch((error) => console.error(error));
