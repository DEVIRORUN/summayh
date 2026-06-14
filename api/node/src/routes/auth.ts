// api/node/src/routes/auth.ts

import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth";

const router = Router();

// Route: POST /api/auth/

// register new User
router.post("/register", registerUser);

// login existing user
router.post("/login", loginUser);

export default router;

