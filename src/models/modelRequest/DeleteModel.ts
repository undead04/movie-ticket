import { ArrayNotEmpty } from "class-validator";

export class DeleteModel {
  @ArrayNotEmpty({ message: "Không đc là mảng trống" })
  ids: number[];
}
