export interface IPermissionModel{
    name:string,
    description:string
}
export class ListPermission{
    viewMovie='view_movie'
    createEditMovie='create_edit_movie'
    deleteMovie='delete_movie'
    viewTheater='view_theater'
    createEditTheater='create_edit_theater'
    deleteTheater='delete_theater' 
    viewScreen='view_screen'
    createEditScreen='create_edit_screen'
    deleteScreen='delete_screen' 
    viewSeat='view_seat'
    createEditSeat='create_edit_seat'
    deleteSeat='delete_seat'
    viewTicket='view_ticket'
    viewShowtime='view_showtime'
    createEditShowtime='create_edit_showtime'
    deleteShowtime='delete_showTime'
    viewRole='view_role'
    createEditRole='create_edit_role'
    deleteRole='delete_role'  
}