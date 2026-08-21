import { Router } from "express";
import { UploadController } from "../controllers/upload.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

router.post("/upload-url", protectRoute, UploadController.getUploadUrl)

export default router;