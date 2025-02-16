import { Screen } from "../entitys/Screen";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { ScreenFilter } from "../models/modelRequest/FilterModel";
import AppRole from "../models/modelRequest/AppRole";
import { ScreenModel } from "../models/modelRequest/ScreenModel";
import ScreenServie from "../services/ScreenService";
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
@Route("/Screen")
@Tags("Screen Controller")
export class ScreenController extends BaseController<ScreenServie> {
  constructor() {
    const service = new ScreenServie();
    super(service);
  }
  /**
   *Lọc phòng chiếu phim
   */
  @Get("/")
  async getFilter(@Queries() filter: ScreenFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm bản ghi phòng chiếu phim
   *
   */
  @Security("JWT", ["admin"])
  @Middlewares([validateError(ScreenModel)])
  @SuccessResponse(201, "Create")
  async create(@Body() data: ScreenModel) {
    return await super.create({ ...data, theater: { id: data.theaterId } });
  }

  @Get("{id}")
  /**
   * Lấy một bản ghi phòng chiếu phim
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập bản ghi phòng chiếu phim
   * @example id "1"
   */
  @Security("JWT", ["admin"])
  @Middlewares([notFound(Screen, "screen"), validateError(ScreenModel)])
  async update(@Path() id: number, @Body() data: ScreenModel) {
    return await super.update(id, {
      name: data.name,
      seatCapacity: data.seatCapacity,
      theater: { id: data.theaterId },
    });
  }

  @Delete("{id}")
  /**
   * Xóa một bản ghi phòng chiếu phim
   */
  @Security("JWT", ["admin"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin"])
  @Delete("/")
  @Middlewares([notFoundArray(Screen, "screen"), validateError(DeleteModel)])
  /**
   * Xóa một mảng bản ghi phòng chiếu phim
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
