
export interface IBillModel{
    totalPrice:number
    expiration_time:Date
    seatId:number[],
    showtimeId:number,
}
export interface IBillUpdateModel{
    statusOrder:StatusOrder
}
export enum StatusOrder{
    noStatus=0,
    pending=1,
    complete=2,
    expired =3,
    fail=4
}
