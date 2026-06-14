// api/node/src/routes/auth.ts

import { Router } from "express";
import { registerUser } from "../controllers/auth";

const router = Router();

// Route: POST /api/auth/register
router.post("/register", registerUser);

export default router;