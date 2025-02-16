import { ArrayNotEmpty } from "class-validator";

export class DeleteModel {
  @ArrayNotEmpty()
  ids: number[];
}
