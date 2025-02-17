import { Movie } from "../entitys/Movie";
import { Screen } from "../entitys/Screen";
import { Showtime } from "../entitys/Showtime";
import { IShowTimeDTO } from "../models/modelRequest/ShowtimeModel";
import BaseService from "utils/BaseService";
import BaseRepository from "utils/BaseRepository";
import { ShowtimeFilter, TypeSort } from "models/modelRequest/FilterModel";
import CustomError from "utils/CustumError";

export default class ShowtimeService extends BaseService<Showtime> {
  protected movieRepository: BaseRepository<Movie>;
  protected screenRepository: BaseRepository<Screen>;
  constructor() {
    super(Showtime, "showtime");
    this.movieRepository = new BaseRepository(Movie, "movie");
    this.screenRepository = new BaseRepository(Screen, "screem");
  }
  protected async isNotFound(id: number): Promise<Showtime> {
    const data = await (await this.repository.getBy(id)).getOne();
    if (data == null) {
      throw new CustomError(
        `Không tồn tại thời gian chiếu phim này có id = ${id}`,
        404
      );
    }
    return data;
  }
  protected async validate(id: number, data: IShowTimeDTO): Promise<void> {
    if (id) await this.isNotFound(id);
    const movieRecord = await (
      await this.movieRepository.getBy(data.movie.id)
    ).getOne();
    const screenRecord = await (
      await this.screenRepository.getBy(data.screen.id)
    ).getOne();
    if (movieRecord == null) {
      throw new CustomError(
        `Không tồn tại phim có id = ${data.movie.id}`,
        400,
        "movieId"
      );
    }
    if (screenRecord == null) {
      throw new CustomError(
        `Không tồn tại phòng chiếu phim có id = ${data.screen.id}`,
        400,
        "screenId"
      );
    }

    const record = await this.isUnique(data);
    if (record && record.id !== id) {
      throw new CustomError(`Thời gian chiếu phim này đã tồn tại`, 400, "name");
    }
  }
  async getFilter(filter: ShowtimeFilter) {
    const { showDate, screenId, theaterId, movieId, orderBy, sort } = filter;
    // Tạo QueryBuilder cho Showtime
    const queryBuilder = await this.repository.createQueryBuilder();
    // Thêm các JOIN
    queryBuilder
      .leftJoinAndSelect("showtime.movie", "movie")
      .leftJoinAndSelect("showtime.screen", "screen")
      .innerJoinAndSelect("screen.theater", "theater");
    // Thêm điều kiện lọc theo movieId nếu có
    if (movieId) {
      queryBuilder.andWhere("showtime.movieId = :movieId", {
        movieId,
      });
    }
    // Thêm điều kiện lọc theo showDate nếu có
    if (showDate) {
      queryBuilder.andWhere("showtime.showDate = :showDate", {
        showDate,
      });
    }
    if (screenId) {
      queryBuilder.andWhere("showtime.screenId=:screenId", {
        screenId,
      });
    }
    if (theaterId) {
      queryBuilder.andWhere("screen.theaterId =:theaterId", { theaterId });
    }
    if (orderBy) {
      queryBuilder.orderBy(
        `showtime.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    // Nhóm kết quả theo movieId và chọn showtime
    const datas = await queryBuilder
      .select("movie.*")
      .addSelect("GROUP_CONCAT(showtime.id)", "showtimes")
      .groupBy("movie.id")
      .getRawMany();

    // Phản hồi kết quả
    const dataDTO = await Promise.all(
      datas.map(async (data) => ({
        ...data,
        showtimes: await this.repository.getByArray(data.showtimes.split(",")),
      }))
    );
    return dataDTO;
  }
  protected async isUnique(data: IShowTimeDTO) {
    // Truy vấn cơ sở dữ liệu
    const record = await (
      await this.repository.createQueryBuilder()
    )
      .andWhere("showtime.showDate = :showDate", {
        showDate: data.showDate.toISOString(),
      }) // So sánh phần ngày
      .andWhere("showtime.screenId = :screenId", { screenId: data.screen.id })
      .andWhere(":startTime BETWEEN showtime.startTime AND showtime.endTime", {
        startTime: data.startTime,
      })
      .getOne();

    // Kiểm tra nếu đã tồn tại một record với thông tin này
    if (record) {
      return record;
    }
    return null; // Trả về null nếu không tìm thấy
  }
}
