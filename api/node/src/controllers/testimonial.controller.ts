import { Request, Response } from "express";
import { TestimonialService } from "../services/testmonial.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export class TestimonialController {
  static async createTestimonial(req: Request, res: Response): Promise<any> {
    try {
      const buyerId = (req as any).userId;
      const { sellerId, reviewerTitle, text, rating } = req.body;

      if (!buyerId) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      const response = await TestimonialService.createTestimonial({
        sellerId,
        buyerId,
        reviewerTitle,
        text,
        rating: Number(rating),
      });
      return res.status(200).json({
        message: "Successfully created testimonial",
        response,
      });
    } catch (err: any) {
      const handler = handlePrismaError(res, err);
      if (handler) return;
      console.error(new Date(), "-> [Testimonial Controller Error]:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  static async getTestimonial(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized." });
      }

      const testimonial =
        await TestimonialService.getSellerTestimonials(userId);
      console.log(new Date(), "-> [Testimonial]: Fetched successfully");
      return res.status(200).json({
        message: "Fetched testimonial successfully",
        testimonial,
      });
    } catch (err: any) {
      const handler = handlePrismaError(res, err);
      if (handler) return;
      console.error(
        new Date(),
        "-> [Testimonial Fetching Controller Error]:",
        err,
      );
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
