import { Review } from "../entitys/Review";
import { notFound, notFoundArray } from "../middlewares/NotFoundHandle";
import validateError from "../middlewares/ValidateErrorDTO";
import { DeleteModel } from "../models/modelRequest/DeleteModel";
import { ReviewFilter } from "../models/modelRequest/FilterModel";
import { ReviewModel } from "../models/modelRequest/ReviewModel";
import ReviewService from "../services/ReviewService";
import BaseController from "../utils/BaseController";
import {
  Body,
  Delete,
  Request,
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
import { UserToken } from "middlewares/authentication";
@Route("/Review")
@Tags("Review Controller")
export class ReviewController extends BaseController<ReviewService> {
  constructor() {
    const service = new ReviewService();
    super(service);
  }
  /**
   *Lọc thể loại đồ ăn thêm tên,page,pagesize,với sắp xếp
   */
  @Get("/")
  async getFilter(@Queries() filter: ReviewFilter) {
    return await super.getFilter({
      ...filter,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10,
    });
  }
  @Post("/")
  /**
   * Thêm dữ liệu thể loại đồ ăn
   *
   */
  @Security("JWT", ["admin", "user"])
  @Middlewares([validateError(ReviewModel)])
  @SuccessResponse(201, "Create")
  async create(@Request() req: any, @Body() data: ReviewModel) {
    const user: UserToken = req.user;
    return await super.create({
      ...data,
      movie: { id: data.movieId },
      user: { id: user.id },
    });
  }

  @Get("{id}")
  /**
   * Lấy một bản ghi thể loại đồ ăn
   *
   */
  async getOne(@Path() id: number) {
    return await super.getOne(id);
  }

  // UPDATE - Cập nhật bản ghi
  @Put("{id}")
  /**
   * Cập nhập thể loại
   * @example id "1"
   */
  @Security("JWT", ["admin", "user"])
  @Middlewares([notFound(Review, "review"), validateError(ReviewModel)])
  async update(
    @Path() id: number,
    @Body() data: ReviewModel,
    @Request() req: any
  ) {
    const user: UserToken = req.user;
    return await super.update(id, {
      rating: data.rating,
      comment: data.comment,
      user: { id: user.id },
      movie: { id: data.movieId },
    });
  }

  @Delete("{id}")
  /**
   * Xóa một thể loại
   * @example id 1
   */
  @Security("JWT", ["admin", "user"])
  async delete(@Path() id: number) {
    return await super.delete(id);
  }
  @Security("JWT", ["admin", "user"])
  @Delete("/")
  @Middlewares([notFoundArray(Review, "review"), validateError(DeleteModel)])
  /**
   * Xóa một mảng thể loại
   * @example{
   * "ids":[1,2,3]
   * }
   */
  async deleteArray(@Body() data: DeleteModel) {
    return await super.deleteArray(data);
  }
}
