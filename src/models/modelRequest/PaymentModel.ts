import { IsInt } from "class-validator";

export enum PaymentStatus {
  pending = "pending",
  completed = "completed",
  failed = "failed",
}
export enum MethodPayment {
  momo = "momo",
  stripe = "stripe",
}
export class PaymentModel {
  @IsInt()
  showtimeId: number;
  @IsInt()
  seatIds: number[];
}
export interface IPaymentModel {
  userId: number;
  showtimeId: number;
  seatIds: number[];
  paymentMethod: MethodPayment;
}
