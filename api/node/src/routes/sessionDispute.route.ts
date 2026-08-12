import { Router } from "express";
import { SessionDisputeController } from "../controllers/sessionDispute.controller";
import { protectRoute } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";


const router = Router();



router.post("/bookings/:bookingId/dispute", protectRoute, SessionDisputeController.raise);
router.patch("/admin/session-disputes/:disputeId/resolve", protectRoute, isAdmin, SessionDisputeController.resolveSessionLevel);
router.post("/admin/session-disputes/:disputeId/escalate", protectRoute, isAdmin, SessionDisputeController.escalate);
router.get("/admin/session-disputes", protectRoute, isAdmin, SessionDisputeController.listForAdmin);

export default router;