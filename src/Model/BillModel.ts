import { ArrayNotEmpty, IsInt, IsNotEmpty } from "class-validator";

export class BillModel{
    @IsNotEmpty()
    @ArrayNotEmpty()
    seatId:number[];
    @IsNotEmpty()
    @IsInt()
    showtimeId:number;
}
export class BillUpdateModel{
    @IsNotEmpty()
    statusOrder:StatusOrder
}
export enum StatusOrder{
    noStatus=0,
    pending=1,
    complete=2,
    expired =3,
    fail=4
}
