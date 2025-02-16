import { Ticket } from "../entitys/Ticket";
import { StatusOrder } from "../models/modelRequest/BillModel";
import BaseRepository from "../utils/BaseRepository";

export default class StatisticalService {
  protected ticketRepository: BaseRepository<Ticket>;
  constructor() {
    this.ticketRepository = new BaseRepository(Ticket, "ticket");
  }
  async getFillter(
    movieId?: number,
    from?: Date,
    to?: Date,
    theaterId?: number,
    page: number = 1,
    pageSize: number = 10
  ) {
    const queryBuilder = (await this.ticketRepository.createQueryBuilder())
      .innerJoin("ticket.bill", "bill")
      .innerJoin("ticket.showtime", "showtime")
      .innerJoin("showtime.movie", "movie")
      .innerJoin("showtime.screen", "screen")
      .andWhere("bill.statusOrder=:stautsOrder", {
        stautsOrder: StatusOrder.complete,
      })
      .select([
        "movie.title",
        "COUNT(ticket.id) as ticketCount",
        "SUM(bill.totalPrice) as totalPrice",
      ]);
    if (movieId) {
      queryBuilder.andWhere("showtime.movieId=:movieId", { movieId });
    }
    if (from) {
      console.log(from);
      queryBuilder.andWhere("bill.bookingTime >= :from", { from });
    }
    if (to) {
      console.log(to);
      queryBuilder.andWhere("bill.bookingTime <= :to", { to });
    }
    if (theaterId) {
      console.log(theaterId);
      queryBuilder.andWhere("screen.theaterId:=theaterId", { theaterId });
    }
    queryBuilder.groupBy("movie.title");
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const data = queryBuilder.getRawMany();
    return data;
  }
}
