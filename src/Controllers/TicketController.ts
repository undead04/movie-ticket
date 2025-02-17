import { NextFunction, Response } from "express";
import BillService from "services/BillService";
import { Controller, Get, Path, Route, Tags } from "tsoa";
import { RepositoryDTO } from "utils/ReponseDTO";
@Route("/ticket")
@Tags("Ticket Controller")
export class TicketController extends Controller {
  protected billService: BillService;
  constructor() {
    super();
    this.billService = new BillService();
  }
  @Get("{orderCode}")
  async getTickets(@Path("orderCode") orderCode: string) {
    try {
      const data = await this.billService.getBillCode(orderCode);
      return RepositoryDTO.WithData(200, "Lấy dữ liệu thành công", data);
    } catch (error) {
      console.log(error);
      console.log(error);
    }
  }
}
