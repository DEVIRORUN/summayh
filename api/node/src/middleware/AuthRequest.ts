import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Define AuthRequest
export interface AuthRequest extends Request {
    userId?: string; // Optional userId property
}