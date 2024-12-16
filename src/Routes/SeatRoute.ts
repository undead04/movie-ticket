import express from 'express';
import seatController from '../Controllers/SeatController';

const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', seatController.getAllWithFilterAndPagination);
router.get("/:id",seatController.get)
router.post("/",seatController.create)
router.post("/createArray",seatController.createArray)
router.put("/:id",seatController.update)
router.delete("/:id",seatController.remove)
router.delete("/",seatController.removeArray)
export default router;
