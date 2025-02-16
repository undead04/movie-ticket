import { Movie } from "../entitys/Movie";
import { MovieGenre } from "../entitys/MovieGenre";
import dataSource from "../DataSource";
import { Genre } from "../entitys/Genre";
import BaseService from "../utils/BaseService";
import BaseRepository from "../utils/BaseRepository";
import { MovieFilter, TypeSort } from "../models/modelRequest/FilterModel";
import { IsDuplicatesWithSort } from "../utils/GenerationCode";
import CustomError from "../utils/CustumError";
import { MovieModel } from "models/modelRequest/MovieModel";

export enum StatusMovie {
  announcing,
  comingSoon,
  stopShowing,
}
export default class MovieService extends BaseService<Movie> {
  protected genreMovieRepository: BaseRepository<MovieGenre>;
  protected genreRepository: BaseRepository<Genre>;
  constructor() {
    super(Movie, "movie");
    this.genreMovieRepository = new BaseRepository(MovieGenre, "movieGenre");
    this.genreRepository = new BaseRepository(Genre, "genre");
  }
  protected async isNotFound(id: number): Promise<Movie> {
    const data = await (await this.repository.getBy(id))
      .innerJoinAndSelect("movie.movieGenre", "movieGenre")
      .innerJoinAndSelect("movieGenre.genre", "genre")
      .getOne();
    if (data) {
      return data;
    }
    throw new CustomError("Phim này không tồn tại", 404);
  }
  async getFilter(filter: MovieFilter) {
    const { title, genreId, statusMovieEnum, orderBy, sort, page, pageSize } =
      filter;
    let queryBuilder = await this.repository.createQueryBuilder();
    queryBuilder = (await queryBuilder)
      .leftJoinAndSelect("movie.movieGenre", "movieGenre")
      .leftJoinAndSelect("movieGenre.genre", "genre");
    if (title) {
      queryBuilder = queryBuilder.andWhere("movie.title LIKE :title", {
        title: `%${title}%`,
      });
    }
    // Lọc theo genreId từ bảng MovieGenre
    if (genreId && genreId.length > 0) {
      queryBuilder = queryBuilder.andWhere(
        "movieGenre.genreId IN (:...genreId)",
        {
          genreId,
        }
      );
    }

    if (statusMovieEnum) {
      // Lấy ngày hiện tại
      const nowDate = new Date().toISOString(); // Chuyển ngày thành định dạng ISO chuẩn
      console.log(nowDate);
      switch (statusMovieEnum) {
        case StatusMovie.announcing:
          queryBuilder = queryBuilder.andWhere("movie.releaseDate <=:value", {
            value: nowDate,
          });
          queryBuilder = queryBuilder.andWhere("movie.endDate >=:value", {
            value: nowDate,
          });
          break;
        case StatusMovie.comingSoon:
          queryBuilder = queryBuilder.andWhere("movie.releaseDate >=:value", {
            value: nowDate,
          });
          break;
        case StatusMovie.stopShowing:
          queryBuilder = queryBuilder.andWhere("movie.endDate <:value", {
            value: nowDate,
          });
          break;
      }
    }
    if (orderBy) {
      queryBuilder = queryBuilder.orderBy(
        `movie.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    queryBuilder = queryBuilder.select([
      "movie.id", // Thêm dòng này để đảm bảo movie.id có sẵn
      "movie.title",
      "movie.description",
      "movie.duration",
      "movie.trailerUrl",
      "movie.releaseDate",
      "movie.endDate",
      "movie.posterUrl",
      "movie.createdAt",
      "movieGenre",
      "genre.name",
      "genre.id",
    ]);

    const data = await this.repository.getPagination(
      queryBuilder,
      page,
      pageSize
    );
    return data;
  }
  protected async isUnique(name: string) {
    const data = await (await this.repository.getBy(name, "title")).getOne();
    if (data) {
      return data;
    }
  }
  protected async validateGenre(id: number) {
    const data = await (await this.genreRepository.getBy(id)).getOne();
    if (data) {
      return data;
    }
    throw new CustomError(`Không tồn tải thể loại phim có id = ${id}`, 404);
  }
  protected async validate(id: number, data: MovieModel) {
    // Kiểm tra sự tồn tại của bản ghi
    if (id) await this.isNotFound(id);
    if (IsDuplicatesWithSort(data.genreId)) {
      throw new CustomError("Chọn trùng thể loại", 400);
    }
    await Promise.all(
      data.genreId.map(async (id) => await this.validateGenre(id))
    );
    // Kiểm tra tên có trùng hay không
    const record = await this.isUnique(data.title);
    // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
    if (record && record.id !== id) {
      throw new CustomError(`Tên phim ${data.title} đã tồn tại`, 400, "name");
    }
    if (data.releaseDate > data.endDate) {
      throw new CustomError(
        `Ngày phát hành không đc lớn hơn ngày kết thúc`,
        400,
        "releaseDate"
      );
    }
  }
  async create(data: MovieModel): Promise<void> {
    await this.validate(0, data);
    await dataSource.manager.transaction(async (transactionEntityManager) => {
      const dataMovie = await this.repository.create(
        {
          ...data,
        },
        transactionEntityManager
      );
      await this.genreMovieRepository.createArray(
        data.genreId.map((genre) => ({
          movie: { id: dataMovie.id },
          genre: { id: genre },
        })),
        transactionEntityManager
      );
    });
  }
  async update(id: number, data: MovieModel): Promise<void> {
    await this.validate(id, data);
    const genreMovieId = await (
      await this.genreMovieRepository.createQueryBuilder()
    )
      .where("movieGenre.movieId =:movieId", { movieId: id })
      .select(["movieGenre.id"])
      .getMany();
    await dataSource.manager.transaction(async (transactionEntityManager) => {
      const dataMovie = await this.repository.update(
        id,
        {
          title: data.title,
          description: data.description,
          duration: data.duration,
          trailerUrl: data.trailerUrl,
          posterUrl: data.posterUrl,
          releaseDate: data.releaseDate,
          endDate: data.endDate,
        },
        transactionEntityManager
      );
      await this.genreMovieRepository.removeArray(
        genreMovieId.map((item) => item.id),
        transactionEntityManager
      );
      await this.genreMovieRepository.createArray(
        data.genreId.map((genre) => ({
          movie: { id: id },
          genre: { id: genre },
        })),
        transactionEntityManager
      );
    });
  }
}
