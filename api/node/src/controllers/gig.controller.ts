import { Response, Request } from "express";
import { GigService } from "../services/gig.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";

// Then some services



export class GigController {

    // POST /api/gig/create
    static async createGig(req: Request, res: Response):Promise<any> {
        try {
            const { title, description, basePrice, category, categoryId } = req.body
            const userId = (req as any).userId;

            const newGig = await GigService.initiateGigCreation(
                title,
                description,
                basePrice,
                categoryId,
                userId
            );
            
            return res.status(201).json({
                message: "Gig creation successful",
                data: newGig
            });

        } catch(error) {
            console.error("ERROR CREATING GIG bro: ", error);

            const handled = handlePrismaError(error, res);
            if (handled) return;

            // Fallback for really unexpected errors
            return res.status(500).json({ message: "Failed to create gig. Please try again." });
        }
    }
}