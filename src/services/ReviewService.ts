import { DeepPartial } from "typeorm";
import { Review } from "../entitys/Review";
import { Movie } from "../entitys/Movie";
import { Ticket } from "../entitys/Ticket";
import BaseService from "../utils/BaseService";
import BaseRepository from "../utils/BaseRepository";
import { ReviewFilter, TypeSort } from "../models/modelRequest/FilterModel";
import CustomError from "../utils/CustumError";
import { StatusOrder } from "entitys/Bill";
import { IReviewDTO } from "models/modelRequest/ReviewModel";

export default class ReviewService extends BaseService<Review> {
  protected movieRepository: BaseRepository<Movie>;
  protected ticketRepository: BaseRepository<Ticket>;
  constructor() {
    super(Review, "review");
    this.movieRepository = new BaseRepository(Movie, "movie");
    this.ticketRepository = new BaseRepository(Ticket, "ticket");
  }
  protected async isNotFound(id: number): Promise<Review> {
    const data = await (await this.repository.getBy(id))
      .innerJoinAndSelect("review.user", "user")
      .getOne();
    if (data) {
      return data;
    }
    throw new CustomError("Bình luận này không tồn tại", 404);
  }
  async getFilter(filter: ReviewFilter) {
    const { userId, rating, movieId, orderBy, sort, page, pageSize } = filter;
    const queryBuilder = await (
      await this.repository.createQueryBuilder()
    ).leftJoinAndSelect("review.user", "user");
    if (rating) {
      queryBuilder.where("review.rating =:rating", { rating });
    }
    if (movieId) {
      queryBuilder.andWhere("review.movieId=:movieId", {
        movieId,
      });
    }
    if (userId) {
      queryBuilder.andWhere("review.userId =:userId", { userId });
    }
    if (orderBy) {
      queryBuilder.orderBy(
        `review.${orderBy}`,
        sort == TypeSort.ASC ? "ASC" : "DESC"
      );
    }
    const data = await this.repository.getPagination(
      queryBuilder,
      page,
      pageSize
    );
    return data;
  }
  protected async isUnique(data: IReviewDTO) {
    const record = await (await this.repository.createQueryBuilder())
      .where("review.userId = :userId", { userId: data.user.id })
      .andWhere("review.movieId = :movie", { movie: data.movie.id })
      .getOne();

    if (record) {
      return record;
    }
  }
  protected async validate(id: number, data: IReviewDTO) {
    // Kiểm tra sự tồn tại của bản ghi
    if (id) {
      const review = await this.isNotFound(id);
      if (review.user.id != data.user.id) {
        throw new CustomError(
          `Bạn không có đủ quyền hạn để cập nhập bình luận này `,
          403
        );
      }
    }
    const movieRecord = await (
      await this.movieRepository.getBy(data.movie.id)
    ).getOne();
    if (movieRecord == null)
      throw new CustomError(`Không tìm thấy bộ phim này`, 404);
    // Kiểm tra tên có trùng hay không
    const record = await this.isUnique(data);
    // Nếu record là null (tức là không có bản ghi nào), kiểm tra tên
    if (record && record.id !== id) {
      throw new CustomError(
        `Phim ${movieRecord.title} này đã đc bình luận rồi không đc bình luận nữa`,
        400,
        "name"
      );
    }
    const ticket = await (
      await this.ticketRepository.createQueryBuilder()
    )
      .innerJoin("ticket.showtime", "showtime")
      .innerJoin("ticket.bill", "bill")
      .andWhere(`bill.statusOrder =:statusOrder`, {
        statusOrder: StatusOrder.complete,
      })
      .andWhere("showtime.movieId=:value", { value: data.movie.id })
      .getOne();
    if (!ticket) {
      throw new CustomError(
        "Bạn không có đủ điều kiện để bình luận phim chiếu rạp này",
        400
      );
    }
  }
}
