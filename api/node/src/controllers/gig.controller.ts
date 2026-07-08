import { Response, Request, response } from "express";
import { GigService } from "../services/gig.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { RequirementInputType } from "../../generated/prisma";

// Then some services

/**
 * 
 * My router, umm under pressuere does thsi at times, when i try imultiple pandpoints at once with diffrent tabs,
 * if i would lauch this this error might happen
 * codespace ➜ /workspaces/summayh/api/node (main) $ npm run dev

> node@1.0.0 dev
> tsx watch src/index.ts

◇ injected env (0) from ../../.env // tip: ◈ encrypted .env [www.dotenvx.com]
🚀 Summayh 1.0.0 Engine running on http://localhost:3000
Error in GigService.initiateGigCreation: PrismaClientKnownRequestError: Transaction API error: Unable to start a transaction in the given time.
    at #c (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:61:14054)
    at jt.transaction (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:62:1816)
    at async Proxy._transactionWithCallback (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:79:4678)
    at async Function.initiateGigCreation (/workspaces/summayh/api/node/src/services/gig.service.ts:42:28)
    at async createGig (/workspaces/summayh/api/node/src/controllers/gig.controller.ts:64:28) {
  code: 'P2028',
  meta: {},
  clientVersion: '7.8.0'
}
ERROR CREATING GIG bro:  PrismaClientKnownRequestError: Transaction API error: Unable to start a transaction in the given time.
    at #c (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:61:14054)
    at jt.transaction (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:62:1816)
    at async Proxy._transactionWithCallback (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:79:4678)
    at async Function.initiateGigCreation (/workspaces/summayh/api/node/src/services/gig.service.ts:42:28)
    at async createGig (/workspaces/summayh/api/node/src/controllers/gig.controller.ts:64:28) {
  code: 'P2028',
  meta: {},
  clientVersion: '7.8.0'
}
Unhandled Prisma error code: P2028 PrismaClientKnownRequestError: Transaction API error: Unable to start a transaction in the given time.
    at #c (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:61:14054)
    at jt.transaction (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:62:1816)
    at async Proxy._transactionWithCallback (/workspaces/summayh/api/node/generated/prisma/runtime/client.js:79:4678)
    at async Function.initiateGigCreation (/workspaces/summayh/api/node/src/services/gig.service.ts:42:28)
    at async createGig (/workspaces/summayh/api/node/src/controllers/gig.controller.ts:64:28) {
  code: 'P2028',
  meta: {},
  clientVersion: '7.8.0'
}

 */

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
    static async getAllGigsBySeller(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 15;

            const gigs = await GigService.getAllGigsBySeller(
                userId,
                page,
                limit
            )

            return res.status(200).json({
                message: "Fetched all gigs by seller successfully.",
                data: gigs
            });
        } catch(error: any) {
            console.error("ERROR FETCHING MULTIPLE GIGS by seller bro: ", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Failed to get gigs by seller!!!" })
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
            if (error.message?.includes("Unauthorized") || error.message?.includes("not found")) {
                return res.status(error.message.includes("Unauthorized") ?403: 404).json({ message: error.message })
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({
                message: "Failed to delete the gig"
            });
        }
    }
    static async searchGigs(req: Request, res: Response): Promise<any> {
        try{
            const { query, budgetMax, location, gigType } = req.body;
            if (!query || query.trim().length < 3) {
                return res.status(400).json({ message: "Search query must be at least 3 characters." })
            }

            // Send to FastAPI agentic search
            const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/api/search/gigs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, budgetMax, location, gigType })
            });

            const data = await fastApiResponse.json()

            return res.status(200).json({
                message: "Search Complete",
                ...data
            })
        } catch(error: any) {
            console.error("ERROR SEARCHING FOR GIGS, agentic searcg", error);
            const handled = handlePrismaError(error, res)
            if(handled) return
            return res.status(500).json({
                message: "Umm, Can't find gigs bro, Please try again."
            })
        }
    }
    static async addBulkPricing(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { gigId, tierId }: any = req.params;
            const { bands } = req.body;

            if (!Array.isArray(bands) || bands.length === 0) {
                return res.status(400).json({
                    message: "bands must be a non-empty array of { quantity, totalPrice } objects."
                });
            }
            if (bands.length > 10) {
                return res.status(400).json({
                    message: "Maximum 10 bulk pricing bands per tier."
                });
            }

            const result = await GigService.addBulkingPricing(gigId, tierId, userId, bands);

            return res.status(200).json({
                message: "Bulk pricing updated succesfully.",
                data: result
            })
        } catch(err: any) {
            console.error("ERROR adding bulk pricing: ", err);

            const knownMessage = [
                "Unauthorized", "not found", "Invalid quantity",
                "Invalid totalPrice", "must be less than", "Duplicate quantities"
            ];
            if (knownMessage.some(m => err.message?.includes(m))) {
                return res.status(400).json({ message: err.message }); // Just show the norm error message
            }
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({
                message: "Something went wrong, trying to add bands"
            })
        }
    }
    static async getBulkPricing(req: Request, res: Response): Promise<any> {
        try {
            const { gigId, tierId } = req.params;

            if (!gigId || !tierId) {
                return res.status(400).json({
                    message: "Both/One-of gigId and tierId are missing in the request parameters. Please provide both to fetch bulk pricing."
                })
            }

            const result = await GigService.getBulkPricing(gigId as string, tierId as string);

            return res.status(200).json({
                message: "Bulk pricing fetched successfully.",
                data: result
            })
        } catch(error: any) {
            console.error("ERROR getting bulk pricing: ", error);

            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({
                message: "Something went wrong, trying to get bulk pricing bands."
            })
        }
    }
}