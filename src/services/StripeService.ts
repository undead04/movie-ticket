import { StripeModel } from "models/modelRequest/StripeModel";
import Stripe from "stripe";
import MovieService from "./MovieService";
import BaseRepository from "utils/BaseRepository";
import { Showtime } from "entitys/Showtime";
import BillService from "./BillService";
import { StatusOrder } from "entitys/Bill";

export enum StatusStripe {
  open,
  complete,
  expired,
  canceled,
}

export default class StripeService {
  protected showitmeRepo = new BaseRepository(Showtime, "showtime");
  protected movieService = new MovieService();
  protected billService = new BillService();
  protected stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  protected YOUR_DOMAIN = "http://localhost:5000";
  async createStripePaymentIntent(model: StripeModel) {
    const showtime = await (await this.showitmeRepo.getBy(model.showtimeId))
      .innerJoinAndSelect("showtime.movie", "movie")
      .getOne();
    const movie = await this.movieService.getById(showtime.movie.id);
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: model.currency,
            product_data: {
              name: movie.title,
              description: movie.description,
              images: [movie.posterUrl],
            },
            unit_amount: Math.round(showtime.price),
          },
          quantity: model.seatIds.length,
        },
      ],
      mode: "payment",
      success_url: `${this.YOUR_DOMAIN}/success.html`,
      cancel_url: `${this.YOUR_DOMAIN}/cancel.html`,
      expires_at: Math.floor(Date.now() / 1000) + 1800,
      metadata: {
        orderCode: model.orderCode,
      },
    });
    return {
      url: session.url,
      session_id: session.id,
    };
  }
  async sessionStatus(session_id: string) {
    const session = await this.stripe.checkout.sessions.retrieve(session_id);
    // Truy xuất ID hóa đơn từ metadata
    const orderCode = session.metadata.orderCode;
    console.log(session.status);
    switch (session.status) {
      case "complete":
        await this.billService.updateStatusBill(
          orderCode,
          StatusOrder.complete
        );
        break;
      case "expired":
        await this.billService.updateStatusBill(orderCode, StatusOrder.fail);
    }
    if (session.status == "open") return { status: session.status };
    return {
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details.email,
    };
  }
}
