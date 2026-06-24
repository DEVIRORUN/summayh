import { Response, Request, response } from "express";
import { GigService } from "../services/gig.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";

// Then some services



export class GigController {

    // POST /api/gig/create
    static async createGig(req: Request, res: Response):Promise<any> {
        try {
            const { title, description, tags, categoryId, tiers, requirementTemplates} = req.body
            const userId = (req as any).userId;

            // Validation first: required fields
            if (!title || !description || !categoryId) {
                return res.status(400).json({
                    message: "title, description, and categoryId are required."
                });
            }

            // Validate if the tiers are in Array
            if (!Array.isArray(tags)) {
                return res.status(400).json({
                    message: "tags must be an array (can be empty: [])."
                });
            }

            // Validation: all 3 tiers must be present
            if (!tiers || typeof tiers != "object") {
                return res.status(400).json({
                    message: "tiers must be present, containing basic, standard, and premium."
                });
            }

            const requiredTierKeys = ["basic", "standard", "premium"] as const;
            const missingTiers = requiredTierKeys.filter(key => !tiers[key]);

            if(missingTiers.length > 0) {
                return res.status(400).json({
                    message: `Missing required tier(s): ${missingTiers.join(", ")}. All three tiers are mandatory.`
                });
            }

            // Validation: each tier's required fields
            for (const key of requiredTierKeys) {
                const tier = tiers[key];
                const tierError: string[] = [];

                if (!tier.description) tierError.push("description: No description.");
                if(typeof tier.price != "number" || tier.price <= 500) tierError.push("price (must be higher than 500 niara)");
                if(typeof tier.deliveryDays != "number" || tier.deliveryDays <= 0) tierError.push("deliveryDays (must be a positive number)");
                if(typeof tier.revisionCount != "number" || tier.revisionCount < 0) tierError.push("revisionCount (must be 0 or more)");

                if (tierError.length > 0) {
                    return res.status(400).json({
                        message: `Tier "${key}": is missing or has invalid field(s): ${tierError.join(", ")}.`
                    });
                }
            }
            // Now All good, lets create the gig
            const newGig = await GigService.initiateGigCreation(
                title,
                description,
                tags,
                categoryId,
                userId,
                tiers,
                requirementTemplates
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
    static async updateGig(req: Request, res: Response): Promise<any> {
        try {
            const { title, description, tags, categoryId, tiers, gigId } = req.body;
            const userId = (req as any).userId;

            // Validation: Ensure gigId is present to know what we are updating
            if (!gigId) {
                return res.status(400).json({
                    message: "gigId is required in the body to perform an update."
                });
            }

            // Validation: Only validate tags if they are explicitly sent
            if (tags !== undefined && !Array.isArray(tags)) {
                return res.status(400).json({
                    message: "tags must be an array (can be empty: [])."
                });
            }

            // Validation: Only validate tiers if they are explicitly sent
            if (tiers !== undefined) {
                if (typeof tiers !== "object" || tiers === null) {
                    return res.status(400).json({
                        message: "tiers must be an object containing basic, standard, or premium updates."
                    });
                }

                // Loop through whichever tiers were provided in the payload
                for (const [key, tier] of Object.entries(tiers)) {
                    const validKeys = ["basic", "standard", "premium"];
                    if (!validKeys.includes(key)) {
                        return res.status(400).json({
                            message: `Invalid tier key "${key}". Allowed keys are basic, standard, premium.`
                        });
                    }

                    const currentTier = tier as any;
                    const tierError: string[] = [];

                    // Validations only trigger if the property is explicitly defined
                    if (currentTier.description !== undefined && !currentTier.description) {
                        tierError.push("description cannot be empty.");
                    }
                    if (currentTier.price !== undefined && (typeof currentTier.price !== "number" || currentTier.price <= 500)) {
                        tierError.push("price must be a number higher than 500 naira");
                    }
                    if (currentTier.deliveryDays !== undefined && (typeof currentTier.deliveryDays !== "number" || currentTier.deliveryDays <= 0)) {
                        tierError.push("deliveryDays must be a positive number");
                    }
                    if (currentTier.revisionCount !== undefined && (typeof currentTier.revisionCount !== "number" || currentTier.revisionCount < 0)) {
                        tierError.push("revisionCount must be 0 or more");
                    }

                    if (tierError.length > 0) {
                        return res.status(400).json({
                            message: `Tier "${key}" contains invalid field(s): ${tierError.join(", ")}.`
                        });
                    }
                }
            }

            // Send parameters cleanly to your updated Service layer
            const updatedGig = await GigService.updateGigData(
                gigId,
                userId,
                title,
                description,
                tags,
                categoryId,
                tiers
            );
            
            return res.status(200).json({ // Changed status code to 200 since it's an update, not a creation (201)
                message: "Gig update successful",
                data: updatedGig
            });
    
        } catch(error: any) {
            console.error("ERROR UPDATING GIG bro: ", error);
            // Catch custom errors thrown from the service layer
            if (error.message === "Seller profile not found." || error.message.includes("You can't modify this Gig")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;

            return res.status(500).json({ message: "Failed to update gig. Please try again." });
        }
    }
    static async readGig(req: Request, res: Response): Promise<any> {
        try {
            const { gigId } = req.params; // from URL params instead so non signed in can also see
            const userId = (req as any).userId

            if(!gigId) {
                return res.status(400).json({
                    message: "Bro input teh gigId plaese, let's test this stuff real quick now"
                });
            }

            const gigData = await GigService.readGigData(
                userId,
                gigId as string
            );

            return res.status(200).json({
                message: "We got the data bro",
                data: gigData
            });
        } catch(error: any) {
            console.error("ERROR GETTING DATA BRO: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get gig data" });
        }
        /**
         *   console.error("ERROR UPDATING GIG bro: ", error);
            // Catch custom errors thrown from the service layer
            if (error.message === "Seller profile not found." || error.message.includes("You can't modify this Gig")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;

            return res.status(500).json({ message: "Failed to update gig. Please try again." });
        }
         */
    }
    static async listGigs(req: Request, res: Response): Promise<any> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 30;
            const categoryId = req.query.categoryId as string;
            const userId = (req as any).userId;

            const gigs = await GigService.listGigs(
                userId,
                page,
                limit,
                categoryId
            );

            return res.status(200).json({
                message: "The fecth was succesfull. ^^",
                data: gigs
            })
        } catch(error: any) {
            console.error("ERROR FETCHING MULTIPLE GIGS bro: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get gigs bro, you can't get them gigs huh" })
        }
    }
    static async deleteGig(req: Request, res: Response): Promise<any> {
        try {
            const { gigId } = req.body;
            const userId = ( req as any).userId

            if (!gigId) {
                return res.status(400).json({
                    message: "input some shii in there bro!!! OH MY GOD!!!"
                });
            }

            const deletedGig = await GigService.deleteGig(
                userId,
                gigId
            );

            return res.status(200).json({
                message: "Successfully deleted the gig from db",
                data: deletedGig
            });
        } catch(error: any) {
            console.error("Failed to delete the gig bro", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({
                message: "Failed to delete the gig"
            });
        }
    }
}