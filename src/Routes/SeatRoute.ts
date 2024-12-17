import express from 'express';
import seatController from '../Controllers/SeatController';
import { authenticateToken } from '../Middlewares/Auth';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', seatController.getAllWithFilterAndPagination);
router.get("/:id",seatController.get)
router.get('/seatStatus/:id',seatController.getStatusSeat)
router.post("/",authenticateToken,seatController.create)
router.post("/createArray",authenticateToken,seatController.createArray)
router.put("/:id",authenticateToken,seatController.update)
router.delete("/:id",authenticateToken,seatController.remove)
router.delete("/",authenticateToken,seatController.removeArray)
export default router;
