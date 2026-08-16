import { Router } from "express";
import { ProSubscriptionController } from "../controllers/proSubscription.controller";
import { protectRoute } from "../middleware/auth";
import { requireSeller } from "../middleware/isSeller";

const router = Router();

router.get("/plans", ProSubscriptionController.listPlans);
router.post("/initialize", protectRoute, requireSeller, ProSubscriptionController.initialize);
router.get("/me", protectRoute, requireSeller, ProSubscriptionController.getMySubscription);

export default router;