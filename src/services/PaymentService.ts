import BillService from "./BillService";
import {
  IPaymentModel,
  MethodPayment,
} from "../models/modelRequest/PaymentModel";
import MomoService from "./MomoService";
import { MomoModel } from "models/modelRequest/MomoModel";
import StripeService from "./StripeService";
import { StripeModel } from "models/modelRequest/StripeModel";
import { StatusOrder } from "entitys/Bill";
import CustomError from "../utils/CustumError";
import EmailService from "./EmailService";
export default class PaymentService {
  protected billService = new BillService();
  protected momoService = new MomoService();
  protected stripeService = new StripeService();
  protected emailService = new EmailService();
  async createBill(model: IPaymentModel) {
    const order = await this.billService.create(model);
    switch (model.paymentMethod) {
      case MethodPayment.momo:
        const momoModel: MomoModel = {
          orderCode: order.orderCode,
          totalPrice: order.totalPrice,
          orderInfo: `Tổng tiền mua vé xem phim là ${order.totalPrice}`,
        };
        const momo = await this.momoService.createMoMoPayment(momoModel);
        return momo;
      case MethodPayment.stripe:
        const stripeModel: StripeModel = {
          showtimeId: model.showtimeId,
          currency: "vnd",
          seatIds: model.seatIds,
          orderCode: order.orderCode,
        };
        const stripe = await this.stripeService.createStripePaymentIntent(
          stripeModel
        );
        return stripe;
    }
  }
  async checkStatusMomo(orderCode: string) {
    const data = await this.momoService.transactionStatusOrder(orderCode);
    const dataBill = await this.billService.getBillCode(data.orderId);
    if (dataBill.statusOrder != StatusOrder.pending) {
      throw new CustomError("Không thể cập nhập hóa đơn nữa", 400);
    }
    if (dataBill == null)
      throw new CustomError("Không tồn tại hóa đơn này", 404);
    switch (data.resultCode) {
      case 0:
        await this.billService.updateStatusBill(
          dataBill.orderCode,
          StatusOrder.complete
        );
        await this.emailService.sendEmail(
          dataBill.user.email,
          "Thông báo giao dịch thành công mua vé xem phim",
          dataBill
        );
        break;
      case 98:
      case 99:
      case 1001:
      case 1002:
      case 1003:
      case 1004:
      case 1005:
      case 1006:
      case 1007:
      case 1017:
      case 1026:
      case 1080:
      case 1081:
      case 1088:
      case 2019:
      case 4001:
      case 4002:
      case 4100:
        await this.billService.updateStatusBill(
          dataBill.orderCode,
          StatusOrder.fail
        );
    }
    return data;
  }
  async checkStatusStripe(session_id: string) {
    const data = await this.stripeService.sessionStatus(session_id);
    return data;
  }
}
