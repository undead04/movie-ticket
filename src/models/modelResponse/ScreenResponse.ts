export class ScreenDTO {
  id: number;
  name: string;
  seatCapacity;
  theater: {
    id: number;
    name: string;
    address: string;
  };
}
