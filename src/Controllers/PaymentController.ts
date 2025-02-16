import {
  Body,
  Controller,
  Post,
  Route,
  Security,
  Tags,
  Request,
  Put,
  Queries,
  Query,
} from "tsoa";
import { RepositoryDTO } from "../utils/ReponseDTO";
import {
  IPaymentModel,
  MethodPayment,
  PaymentModel,
} from "../models/modelRequest/PaymentModel";
import PaymentService from "./../services/PaymentService";
import { UserToken } from "../middlewares/authentication";
import { ITransactionStatus } from "../models/modelRequest/MomoModel";

@Route("/payment")
@Tags("Payment Controller")
export class PaymentController extends Controller {
  protected service = new PaymentService();
  constructor() {
    super();
  }
  @Post("/momo")
  @Security("JWT", ["admin", "user"])
  async createPaymentMoMo(@Body() model: PaymentModel, @Request() req: any) {
    try {
      const user: UserToken = req.user;
      const paymentModel: IPaymentModel = {
        seatIds: model.seatIds,
        showtimeId: model.showtimeId,
        paymentMethod: MethodPayment.momo,
        userId: user.id,
      };
      const data = await this.service.createBill(paymentModel);
      if (data.resultCode != 0) {
        this.setStatus(400);
        return RepositoryDTO.Error(400, data.message);
      }
      this.setStatus(200);
      return RepositoryDTO.WithData(200, "Tạo thanh toán thành công", data);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Post("/stripe")
  @Security("JWT", ["admin", "user"])
  async createPaymentStripe(@Body() model: PaymentModel, @Request() req: any) {
    try {
      const user: UserToken = req.user;
      const paymentModel: IPaymentModel = {
        seatIds: model.seatIds,
        showtimeId: model.showtimeId,
        paymentMethod: MethodPayment.stripe,
        userId: user.id,
      };
      const data = await this.service.createBill(paymentModel);
      this.setStatus(200);
      return RepositoryDTO.WithData(200, "Tạo thanh toán thành công", data);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Put("/checkStautsMomo")
  @Security("JWT", ["admin", "user"])
  async checkStatusMomo(@Body() model: { orderCode: string }) {
    try {
      const data = await this.service.checkStatusMomo(model.orderCode);
      return RepositoryDTO.WithData(200, "Lấy dữ liệu thành công", data);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
  @Put("/checkStautsStripe")
  @Security("JWT", ["admin", "user"])
  async checkStatusStripe(@Query() session_id: string) {
    try {
      const data = await this.service.checkStatusStripe(session_id);
      return RepositoryDTO.WithData(200, "Lấy dữ liệu thành công", data);
    } catch (error: any) {
      console.log(error);
      throw error;
    }
  }
}
