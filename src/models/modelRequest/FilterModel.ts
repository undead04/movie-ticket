export interface filterPagination {
  page?: number;
  pageSize?: number;
}
export interface filterSort {
  orderBy?: string;
  sort?: TypeSort;
}
export enum TypeSort {
  "DESC",
  "ASC",
}
export interface GenreFilter extends filterPagination, filterSort {
  name?: string;
}
export interface MovieFilter extends filterPagination, filterSort {
  title?: string;
  genreId?: string[];
  statusMovieEnum?: number;
}
export interface ReviewFilter extends filterPagination, filterSort {
  userId?: number;
  rating?: number;
  movieId?: number;
}
export interface ScreenFilter extends filterPagination, filterSort {
  theaterId?: number;
}
export interface TheaterFilter extends filterPagination, filterSort {
  name?: string;
  city?: string;
  address?: string;
}
export interface SeatFilter extends filterPagination, filterSort {
  seatNumber?: string;
  screenId?: number;
}
export interface UserFilter extends filterPagination, filterSort {
  username?: string;
}
export interface ShowtimeFilter extends filterPagination, filterSort {
  showDate?: string;
  movieId?: number;
  theaterId?: number;
  screenId?: number;
}
export interface statusSeatFilter {
  showtimeId: number;
}
export interface BillFilter extends filterPagination, filterSort {
  orderCode?: string;
  statusOrder?: number;
  role?: string;
  userId?: number;
  from?: string;
  to?: string;
}
