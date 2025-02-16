import { Seat } from "../entitys/Seat";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { SeatFilter } from "../models/modelRequest/FilterModel";
import AppRole from "../models/modelRequest/AppRole";
import { SeatModel } from "../models/modelRequest/SeatModel";
import SeatService from "../services/SeatService";
import BaseController from "../utils/BaseController";
import {
  Body,
  Delete,
  Get,
  Middlewares,
  Path,
  Post,
  Put,
  Queries,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from "tsoa";
@Route("/Seat")
@Tags("Seat Controller")
export class SeatController extends BaseController<SeatService> {
  constructor() {
    const service = new SeatService();
    super(service);
  }
  /**
   *Lọc ghế của rạp chiếu phim
   */
  @Get("/")
  async getFilter(@Queries() filter: SeatFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm bản ghi ghế của rạp chiếu phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(SeatModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: SeatModel) {
    return await super.create({ ...data, screen: { id: data.screenId } });
  }

  @Get("{id}")
  /**
   * Lấy một bản ghi ghế của rạp chiếu phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập bản ghi ghế
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Seat, "seat"), validateError(SeatModel)])
  async update(@Path() id: number, @Body() data: SeatModel) {
    return await super.update(id, {
      row: data.row,
      col: data.col,
      seatNumber: data.seatNumber,
      screen: { id: data.screenId },
    });
  }

  @Delete("{id}")
  /**
   * Xóa một bản ghi
   * @example id 1
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([notFoundArray(Seat, "seat"), validateError(DeleteModel)])
  /**
   * Xóa một mảng bản ghi
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
