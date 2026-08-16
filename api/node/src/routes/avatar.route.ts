import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { AvatarController } from "../controllers/avatar.controller";

const router = Router();

router.post("/upload-url", protectRoute, AvatarController.getUploadUrl);
router.patch("/save", protectRoute, AvatarController.saveAvatar);

export default router;