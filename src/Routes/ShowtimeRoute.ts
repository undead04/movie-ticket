import express from 'express';
import showtimeController from '../Controllers/ShowtimeController';


const router = express.Router();

// Lấy tất cả genres với filter và phân trang
router.get('/', showtimeController.getAllWithFilterAndPagination);
router.get("/:id",showtimeController.get)
router.post("/",showtimeController.create)
router.post('/createArray',showtimeController.createArray)
router.put("/:id",showtimeController.update)
router.delete("/:id",showtimeController.remove)
router.delete("/",showtimeController.removeArray)
export default router;
