import { StatusMovie } from "../Controllers/MoiveController";
import { StatusOrder } from "../Model/BillModel";

export function parseStatusMovie(value: any): StatusMovie {
    if (Object.values(StatusMovie).includes(value)) {
        return value as StatusMovie;
    }
    return StatusMovie.noStatus
}
export function parseStatusOrder(value: any): StatusOrder {
    if (Object.values(StatusOrder).includes(value)) {
        return value as StatusOrder;
    }
    return StatusOrder.noStatus
}

