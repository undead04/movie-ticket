/*export function parseStatusMovie(value: any): StatusMovie {
  if (Object.values(StatusMovie).includes(value)) {
    return value as StatusMovie;
  }
  return StatusMovie.noStatus;
}
export function parseStatusOrder(value: any): StatusOrder {
  if (Object.values(StatusOrder).includes(value)) {
    return value as StatusOrder;
  }
  return StatusOrder.noStatus;
}
export function parseNumber(value: any): number {
  return Number(value);
}*/
export function parseString(value: any): string {
  return value as string;
}
export function parseDate(value: any): Date | null {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    // Kiểm tra nếu đối tượng Date không hợp lệ
    return null;
  }
  return date;
}
export function getHour(value: Date): string {
  // Chuyển 'startTime' sang dạng 'HH:mm:ss'
  const startTime = new Date(value).toISOString().slice(11, 19); // Lấy phần thời gian (HH:mm:ss)
  return startTime;
}
export function getDate(value: Date): string {
  // Chuyển 'showDate' sang ISO string và lấy phần ngày (yyyy-mm-dd)
  const showDateISO = new Date(value).toISOString().split("T")[0]; // Lấy phần ngày 'yyyy-mm-dd'
  return showDateISO;
}
