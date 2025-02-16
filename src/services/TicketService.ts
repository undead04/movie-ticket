import { Ticket } from "../entitys/Ticket";
import AppRole from "../models/modelRequest/GroupRoleModel";
import BaseRepository from "../utils/BaseRepository";

export default class TicketService {
  protected ticketRepository: BaseRepository<Ticket>;
  constructor() {
    this.ticketRepository = new BaseRepository(Ticket, "ticket");
  }
  async getFillter(
    billId: number,
    movieId: number,
    role: string,
    userId: number
  ) {
    let queryBuilder = (await this.ticketRepository.createQueryBuilder())
      .leftJoinAndSelect("ticket.showtime", "showtime")
      .leftJoinAndSelect("ticket.bill", "bill");
    if (billId) {
      queryBuilder = queryBuilder.andWhere("ticket.billId =:billId", {
        billId,
      });
    }
    if (movieId) {
      queryBuilder = queryBuilder.andWhere("showtime.movieId=:movieId", {
        movieId,
      });
    }
    if (role == AppRole.User) {
      queryBuilder = queryBuilder.andWhere("bill.userId=:value", {
        value: userId,
      });
    }
    const data = this.ticketRepository.getPagination(queryBuilder, 1, 10);
    return data;
  }
}
