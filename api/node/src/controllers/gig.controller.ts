import { Response, Request } from "express";
import { GigService } from "../services/gig.service";

// Then some services



export class GigController {

    // POST /api/gig/create
    static async createGig(req: Request, res: Response):Promise<any> {
        try {
            const { title, description, basePrice, category, categoryId } = req.body
            const sellerId = (req as any).userId

            const newGig = await GigService.initiateGigCreation(
                title,
                description,
                basePrice,
                categoryId,
                sellerId
            )
            
            return res.status(201).json({
                message: "Gig creation successful",
                data: newGig
            })
        } catch(error: any) {
            console.error("ERROR CREATING GIG bro: ", error);
            return res.status(400).json({ error: error.message });
        }
    }
}