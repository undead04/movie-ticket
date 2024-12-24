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
export function parseNumber(value:any):number{
    return Number(value)
}
export function parseString(value:any):string{
    return value as string
}
export function parseDate(value: any): Date | null {
    const date = new Date(value);
    if (isNaN(date.getTime())) {  // Kiểm tra nếu đối tượng Date không hợp lệ
        return null;
    }
    return date;
}

