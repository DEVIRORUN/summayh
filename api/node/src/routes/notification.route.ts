import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { protectRoute } from "../middleware/auth";


const router = Router();

router.get("/", protectRoute, NotificationController.list);
router.patch("/:id/read", protectRoute, NotificationController.markRead);
router.patch("/read-all", protectRoute, NotificationController.markAllRead);

export default router;