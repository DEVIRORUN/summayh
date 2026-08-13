"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GigController = void 0;
const gig_service_1 = require("../services/gig.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
const gigStats_service_1 = require("../services/gigStats.service");
const prisma_1 = require("../utils/prisma");
class GigController {
    static async createDraftGig(req, res) {
        try {
            const userId = req.userId;
            const { title, tags, categoryId, deliveryMode } = req.body;
            if (!title || !categoryId) {
                return res.status(400).json({
                    message: "Please type in title and select category form teh options above.",
                });
            }
            if (!Array.isArray(tags) || tags.length > 5) {
                return res.status(400).json({
                    message: "Pleas emakwe sure to choose at most 5 tags!!!",
                });
            }
            const draftGig = await gig_service_1.GigService.createDraftGig(title, categoryId, tags, userId, deliveryMode);
            return res.status(201).json({
                message: "Gig draft creation succesfull",
                data: { id: draftGig.id }, // You said i shoudl return only id, maybe only when user wanst to go backto this page-1 to chaneg some details we'll fey=tch them details, that's another endpoint though
            });
        }
        catch (error) {
            console.log("GIG DRAFT FAILED");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to create the draft gig." });
        }
    }
    static async addDescToGig(req, res) {
        try {
            const sellerId = req.sellerId;
            const { description, faqs } = req.body;
            const { gigId } = req.params;
            console.log("DEBUG - gigId:", gigId, "sellerId:", sellerId);
            if (!description) {
                return res.status(400).json({ message: "Description is required." });
            }
            if (faqs !== undefined && !Array.isArray(faqs)) {
                return res.status(400).json({ message: "FAQs must be an array." });
            }
            const descGig = await gig_service_1.GigService.addDescToDraft(gigId, description, faqs, sellerId);
            return res.status(201).json({
                message: "Succesfully added desc and faq",
                data: descGig,
            });
        }
        catch (error) {
            console.log("DESC ADD TO DRAFT FAILED");
            console.error(error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to add draft+faq to the draft gig." });
        }
    }
    static async addTierToGig(req, res) {
        try {
            const sellerId = req.sellerId;
            const { tiers } = req.body;
            const { gigId } = req.params;
            if (!tiers || typeof tiers != "object") {
                return res
                    .status(400)
                    .json({
                    message: "tier must be present containing basic, standard, and premium.",
                });
            }
            const requiredTierKeys = ["basic", "standard", "premium"];
            const missingTiers = requiredTierKeys.filter((key) => !tiers[key]);
            if (missingTiers.length > 0) {
                return res.status(400).json({
                    message: `Missing required tier(s): ${missingTiers.join(", ")}, All three tiers are mandatory.`,
                });
            }
            // NEVER TRUST CLIENT, fetch gig to know validRoute for deliveryMode
            const gig = await prisma_1.prisma.gig.findFirst({
                where: { id: gigId, sellerId },
                select: { deliveryMode: true }
            });
            if (!gig) {
                return res.status(404).json({ message: "Gig not found or you don't have permission to edit it." });
            }
            const isLive = gig.deliveryMode === "LIVE";
            for (const key of requiredTierKeys) {
                const tier = tiers[key];
                const tierError = [];
                if (!tier.description)
                    tierError.push("DESCRIPTION: No description");
                if (typeof tier.price != "number" || tier.price <= 500)
                    tierError.push("PRICE: (must be higer than 500 naira)");
                if (isLive) {
                    if (typeof tier.sessionLengthMin != "number" || tier.sessionLengthMin <= 0)
                        tierError.push("SESSION LENGTH: must be positive");
                    if (typeof tier.totalSessions != "number" || tier.totalSessions <= 0)
                        tierError.push("TOTAL SESSION: must be positive");
                    if (typeof tier.breakLengthMin != "number" || tier.breakLengthMin < 0)
                        tierError.push("BREAK LENGTH: must be 0 or more");
                }
                else {
                    if (typeof tier.deliveryDays != "number" || tier.deliveryDays <= 0)
                        tierError.push("DELIVERY DAYS:   MUST BE POSITIVE");
                    if (typeof tier.revisionCount != "number" || tier.revisionCount < 0)
                        tierError.push("REVISION COUNT: MUST BE 0 OR MORE");
                }
                if (tierError.length > 0) {
                    return res.status(400).json({
                        message: `Tier "${key}": is missing or has invalid field(s): ${tierError.join(", ")}.`,
                    });
                }
            }
            const tierGig = await gig_service_1.GigService.addTiersToGig(gigId, tiers, sellerId);
            return res.status(201).json({
                message: "Succesfully added tiers",
                data: tierGig,
            });
        }
        catch (error) {
            console.log("TIER ADD TO DRAFT FAILED");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to add draft tier to the draft gig." });
        }
    }
    static async addQuestionsToGig(req, res) {
        try {
            const sellerId = req.sellerId;
            const { requirementTemplates } = req.body;
            const { gigId } = req.params;
            if (requirementTemplates !== undefined &&
                !Array.isArray(requirementTemplates)) {
                return res
                    .status(400)
                    .json({ message: "requirementTemplates must be present." });
            }
            const questionGig = await gig_service_1.GigService.addQuestionsToGig(gigId, sellerId, requirementTemplates);
            return res.status(201).json({
                message: "Succesfully added requirementTemplates",
                data: questionGig,
            });
        }
        catch (error) {
            console.log("TEMPLATES ADD TO DRAFT FAILED");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({
                message: "Failed to add draft requirementTemplates to the draft gig.",
            });
        }
    }
    static async getUploadUrl(req, res) {
        try {
            console.log("[GET UPLAOD URL]: HIT!!!");
            const sellerId = req.sellerId;
            const { gigId } = req.params;
            const { fileType, slot } = req.body;
            console.log("[REQ BODY]:", req.body);
            console.log("[SELLER ID]:", req.sellerId);
            if (!fileType || !slot) {
                return res
                    .status(400)
                    .json({ message: "fileType and slot are required." });
            }
            if (!["image", "video"].includes(slot)) {
                return res
                    .status(400)
                    .json({ message: "slot must be 'image' or 'video'." });
            }
            const { uploadUrl, publicUrl } = await gig_service_1.GigService.generateUploadUrl(gigId, sellerId, fileType, slot);
            console.log("[GET UPLAOD URL]: SUCCESSFUL!!!");
            return res.status(200).json({
                message: "Upload URL generated",
                data: { uploadUrl, publicUrl },
            });
        }
        catch (error) {
            console.log("UPLOAD URL GENERATION FAILED");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to generate upload URL." });
        }
    }
    static async saveGalleryToGig(req, res) {
        try {
            const sellerId = req.sellerId;
            const { gigId } = req.params;
            const { images, video } = req.body;
            if (!Array.isArray(images) || images.length < 1 || images.length > 3) {
                return res
                    .status(400)
                    .json({ message: "Images must be an Array and not exceed 3" });
            }
            if (video !== undefined && video !== null && typeof video !== "string") {
                return res
                    .status(400)
                    .json({ message: "Video must either null or string" });
            }
            const galleryData = await gig_service_1.GigService.saveGalleryToGig(gigId, sellerId, images, video);
            return res.status(200).json({
                message: "galley succesfully saved to gig",
                data: galleryData,
            });
        }
        catch (error) {
            console.log("SAVING GALLERY TO GIG WENT WRONG");
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to save gallery to gig." });
        }
    }
    static async publishGig(req, res) {
        try {
            const sellerId = req.sellerId;
            const { gigId } = req.params;
            const publishGig = await gig_service_1.GigService.publishGig(gigId, sellerId);
            const isPro = publishGig.seller?.isPro;
            if (isPro) {
                fetch(`${process.env.FASTAPI_URL}/api/embeddings/gig`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gigId: publishGig.id,
                        title: publishGig.title,
                        description: publishGig.description,
                        tags: publishGig.tags,
                    }),
                }).catch((err) => console.error("Failed to trigger gig embedding: ", err));
            }
            console.log(new Date(), "-> [Publish Gig]: Successfully created the gig");
            return res.status(200).json({
                message: "Gig creation succesful",
                data: publishGig,
            });
        }
        catch (error) {
            console.error("ERROR PUBLISHING GIG bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            // Fallback for really unexpected errors
            return res
                .status(500)
                .json({ message: "Failed to publish gig. Please try again." });
        }
    }
    // POST /api/gig/create
    // static async createGig(req: Request, res: Response): Promise<any> {
    //   console.log(new Date(), "-> [Gig Controller]: Hit!");
    //   console.log(`[Gig Controller]: Data: ${req.body}`);
    //   try {
    //     const {
    //       title,
    //       description,
    //       tags,
    //       categoryId,
    //       tiers,
    //       requirementTemplates,
    //     } = req.body;
    //     const userId = (req as any).userId;
    //     // Validation first: required fields
    //     if (!title || !description || !categoryId) {
    //       return res.status(400).json({
    //         message: "title, description, and categoryId are required.",
    //       });
    //     }
    //     // Validate if the tiers are in Array
    //     if (!Array.isArray(tags)) {
    //       return res.status(400).json({
    //         message: "tags must be an array (can be empty: []).",
    //       });
    //     }
    //     // Validation: all 3 tiers must be present
    //     if (!tiers || typeof tiers != "object") {
    //       return res.status(400).json({
    //         message:
    //           "tiers must be present, containing basic, standard, and premium.",
    //       });
    //     }
    //     const requiredTierKeys = ["basic", "standard", "premium"] as const;
    //     const missingTiers = requiredTierKeys.filter((key) => !tiers[key]);
    //     if (missingTiers.length > 0) {
    //       return res.status(400).json({
    //         message: `Missing required tier(s): ${missingTiers.join(", ")}. All three tiers are mandatory.`,
    //       });
    //     }
    //     // Validation: each tier's required fields
    //     for (const key of requiredTierKeys) {
    //       const tier = tiers[key];
    //       const tierError: string[] = [];
    //       if (!tier.description) tierError.push("description: No description.");
    //       if (typeof tier.price != "number" || tier.price <= 500)
    //         tierError.push("price (must be higher than 500 niara)");
    //       if (typeof tier.deliveryDays != "number" || tier.deliveryDays <= 0)
    //         tierError.push("deliveryDays (must be a positive number)");
    //       if (typeof tier.revisionCount != "number" || tier.revisionCount < 0)
    //         tierError.push("revisionCount (must be 0 or more)");
    //       if (tierError.length > 0) {
    //         return res.status(400).json({
    //           message: `Tier "${key}": is missing or has invalid field(s): ${tierError.join(", ")}.`,
    //         });
    //       }
    //     }
    //     // Now All good, lets create the gig
    //     const newGig = await GigService.initiateGigCreation(
    //       title,
    //       description,
    //       tags,
    //       categoryId,
    //       userId,
    //       tiers,
    //       requirementTemplates,
    //     );
    //     // Fire-and-forget: only pro sellers get embeddings generated
    //     if (newGig.seller?.isPro) {
    //       fetch(`${process.env.FASTAPI_URL}/api/embeddings/gig`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({
    //           gigId: newGig.id,
    //           title: newGig.title,
    //           description: newGig.description,
    //           tags: newGig.tags,
    //         }),
    //       }).catch((err) =>
    //         console.error("Failed to trigger gig embedding: ", err),
    //       );
    //     }
    //     console.log(
    //       new Date(),
    //       "-> [Gig Controller]: Succesfully created the Gig!",
    //     );
    //     return res.status(201).json({
    //       message: "Gig creation successful",
    //       data: newGig,
    //     });
    //   } catch (error) {
    //     console.error("ERROR CREATING GIG bro: ", error);
    //     const handled = handlePrismaError(error, res);
    //     if (handled) return;
    //     // Fallback for really unexpected errors
    //     return res
    //       .status(500)
    //       .json({ message: "Failed to create gig. Please try again." });
    //   }
    // }
    static async updateGig(req, res) {
        try {
            const { title, description, tags, categoryId, tiers, gigId } = req.body;
            const userId = req.userId;
            // Validation: Ensure gigId is present to know what we are updating
            if (!gigId) {
                return res.status(400).json({
                    message: "gigId is required in the body to perform an update.",
                });
            }
            // Validation: Only validate tags if they are explicitly sent
            if (tags !== undefined && !Array.isArray(tags)) {
                return res.status(400).json({
                    message: "tags must be an array (can be empty: []).",
                });
            }
            // Validation: Only validate tiers if they are explicitly sent
            if (tiers !== undefined) {
                if (typeof tiers !== "object" || tiers === null) {
                    return res.status(400).json({
                        message: "tiers must be an object containing basic, standard, or premium updates.",
                    });
                }
                // Loop through whichever tiers were provided in the payload
                for (const [key, tier] of Object.entries(tiers)) {
                    const validKeys = ["basic", "standard", "premium"];
                    if (!validKeys.includes(key)) {
                        return res.status(400).json({
                            message: `Invalid tier key "${key}". Allowed keys are basic, standard, premium.`,
                        });
                    }
                    const currentTier = tier;
                    const tierError = [];
                    // Validations only trigger if the property is explicitly defined
                    if (currentTier.description !== undefined &&
                        !currentTier.description) {
                        tierError.push("description cannot be empty.");
                    }
                    if (currentTier.price !== undefined &&
                        (typeof currentTier.price !== "number" || currentTier.price <= 500)) {
                        tierError.push("price must be a number higher than 500 naira");
                    }
                    if (currentTier.deliveryDays !== undefined &&
                        (typeof currentTier.deliveryDays !== "number" ||
                            currentTier.deliveryDays <= 0)) {
                        tierError.push("deliveryDays must be a positive number");
                    }
                    if (currentTier.revisionCount !== undefined &&
                        (typeof currentTier.revisionCount !== "number" ||
                            currentTier.revisionCount < 0)) {
                        tierError.push("revisionCount must be 0 or more");
                    }
                    if (tierError.length > 0) {
                        return res.status(400).json({
                            message: `Tier "${key}" contains invalid field(s): ${tierError.join(", ")}.`,
                        });
                    }
                }
            }
            // Send parameters cleanly to your updated Service layer
            const updatedGig = await gig_service_1.GigService.updateGigData(gigId, userId, title, description, tags, categoryId, tiers);
            // Fire-and-forget: only pro sellers get embeddings generated
            if (updatedGig.seller?.isPro) {
                fetch(`${process.env.FASTAPI_URL}/api/embeddings/gig`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gigId: updatedGig.id,
                        title: updatedGig.title,
                        description: updatedGig.description,
                        tags: updatedGig.tags,
                    }),
                }).catch((err) => console.error(new Date(), "-> [Update Gig]: Failed to trigger gig embedding: ", err));
            }
            return res.status(200).json({
                // Changed status code to 200 since it's an update, not a creation (201)
                message: "Gig update successful",
                data: updatedGig,
            });
        }
        catch (error) {
            console.error("ERROR UPDATING GIG bro: ", error);
            // Catch custom errors thrown from the service layer
            if (error.message === "Seller profile not found." ||
                error.message.includes("You can't modify this Gig")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to update gig. Please try again." });
        }
    }
    static async readGig(req, res) {
        try {
            const { gigId } = req.params; // from URL params instead so non signed in can also see
            const userId = req.userId;
            if (!gigId) {
                return res.status(400).json({
                    message: "Bro input teh gigId plaese, let's test this stuff real quick now",
                });
            }
            const gigData = await gig_service_1.GigService.readGigData(userId, gigId);
            // GigStatsService.recordClick(gigId as string).catch(err =>
            //     console.error("Failed to record gig click: ", err)
            // );
            // 3. Fire the stats tracking safely afterward
            console.log(new Date(), "-> [Gig Controller]: Recording click");
            try {
                await gigStats_service_1.GigStatsService.recordClick(gigId);
            }
            catch (err) {
                console.error("Failed to record gig click: ", err);
            }
            console.log(new Date(), "-> [Gig Controller read]: Hit!");
            return res.status(200).json({
                message: "We got the data bro",
                data: gigData,
            });
        }
        catch (error) {
            console.error("ERROR GETTING DATA BRO: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
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
    static async listGigs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 30;
            const categoryId = req.query.categoryId;
            const userId = req.userId;
            const gigs = await gig_service_1.GigService.listGigs(userId, page, limit, categoryId);
            // Fire-and-forget impression tracking for every gig returned in this page
            const gigIds = gigs?.data?.map((g) => g.id) ?? [];
            if (gigIds.length) {
                gigStats_service_1.GigStatsService.recordImpressions(gigIds).catch((err) => console.error("Failed to record gig impression: ", err));
            }
            return res.status(200).json({
                message: "The fecth was succesfull. ^^",
                data: gigs,
            });
        }
        catch (error) {
            console.error("ERROR FETCHING MULTIPLE GIGS bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({
                message: "Failed to get gigs bro, you can't get them gigs huh",
            });
        }
    }
    static async getAllGigsBySeller(req, res) {
        try {
            const userId = req.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const gigs = await gig_service_1.GigService.getAllGigsBySeller(userId, page, limit);
            // console.log(gigs);
            return res.status(200).json({
                message: "Fetched all gigs by seller successfully.",
                ...gigs,
            });
        }
        catch (error) {
            console.error("ERROR FETCHING MULTIPLE GIGS by seller bro: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res
                .status(500)
                .json({ message: "Failed to get gigs by seller!!!" });
        }
    }
    static async deleteGig(req, res) {
        try {
            const { gigId } = req.body;
            const userId = req.userId;
            if (!gigId) {
                return res.status(400).json({
                    message: "input some shii in there bro!!! OH MY GOD!!!",
                });
            }
            const deletedGig = await gig_service_1.GigService.deleteGig(userId, gigId);
            return res.status(200).json({
                message: "Successfully deleted the gig from db",
                data: deletedGig,
            });
        }
        catch (error) {
            console.error("Failed to delete the gig bro", error);
            if (error.message?.includes("Unauthorized") ||
                error.message?.includes("not found")) {
                return res
                    .status(error.message.includes("Unauthorized") ? 403 : 404)
                    .json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({
                message: "Failed to delete the gig",
            });
        }
    }
    static async searchGigs(req, res) {
        try {
            console.log(new Date(), "-> [Gig Controller]: GIG SEARCH Hit");
            // Extract cleanly from POST body OR GET query params
            const query = (req.body?.query || req.query?.q || "").trim();
            const budgetMax = req.body?.budgetMax ?? (req.query?.budgetMax ? Number(req.query.budgetMax) : undefined); // Because it is a number we ise ??
            const location = (req.body?.location || req.query?.location);
            const gigType = (req.body?.gigType || req.query?.gigType);
            if (!query || query.length < 3) {
                return res
                    .status(400)
                    .json({ message: "Search query must be at least 3 characters." });
            }
            // Send to FastAPI agentic search
            console.log(`[Gig Controller]: Sent to fast api`, query, budgetMax, location, gigType);
            const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/api/search/gigs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, budgetMax, location, gigType }),
            });
            if (!fastApiResponse.ok) {
                const errorText = await fastApiResponse.text().catch(() => "");
                console.error("[Gig Controller]: FastAPI Search Error ->", errorText);
                return res.status(fastApiResponse.status).json({
                    message: "Agentic search service unavailable.",
                });
            }
            const data = await fastApiResponse.json();
            // Fire-and-forget impression tracking for every gig returned in this page
            const gigIds = data?.results?.map((g) => g.id) ?? [];
            if (gigIds.length) {
                gigStats_service_1.GigStatsService.recordImpressions(gigIds).catch((err) => console.error("Failed to record gig impression: ", err));
            }
            console.log("FOUND GIGS, agentic search");
            return res.status(200).json({
                message: "Search Complete",
                ...data,
            });
        }
        catch (error) {
            console.error("ERROR SEARCHING FOR GIGS, agentic search", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({
                message: "Umm, Can't find gigs bro, Please try again.",
            });
        }
    }
    // static async searchGigs(req: Request, res: Response): Promise<any> {
    //   try {
    //     console.log(new Date(), "-> [Gig Controller]: GIG SEARCH Hit");
    //     const { query, budgetMax, location, gigType } = req.body;
    //     if (!query || query.trim().length < 3) {
    //       return res
    //         .status(400)
    //         .json({ message: "Search query must be at least 3 characters." });
    //     }
    //     // Send to FastAPI agentic search
    //     console.log(
    //       `[Gig Controller]: Sent to fast api`,
    //       query,
    //       budgetMax,
    //       location,
    //       gigType,
    //     );
    //     const fastApiResponse = await fetch(
    //       `${process.env.FASTAPI_URL}/api/search/gigs`,
    //       {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ query, budgetMax, location, gigType }),
    //       },
    //     );
    //     const data = await fastApiResponse.json();
    //     // Fire-and-forget impression tracking for every gig returned in this page
    //     const gigIds = data?.results?.map((g: any) => g.id) ?? [];
    //     if (gigIds.length) {
    //       GigStatsService.recordImpressions(gigIds).catch((err) =>
    //         console.error("Failed to record gig impression: ", err),
    //       );
    //     }
    //     console.error("FOUND GIGS, agentic searcg");
    //     return res.status(200).json({
    //       message: "Search Complete",
    //       ...data,
    //     });
    //   } catch (error: any) {
    //     console.error("ERROR SEARCHING FOR GIGS, agentic searcg", error);
    //     const handled = handlePrismaError(error, res);
    //     if (handled) return;
    //     return res.status(500).json({
    //       message: "Umm, Can't find gigs bro, Please try again.",
    //     });
    //   }
    // }
    static async addBulkPricing(req, res) {
        try {
            const userId = req.userId;
            const { gigId, tierId } = req.params;
            const { bands } = req.body;
            if (!Array.isArray(bands) || bands.length === 0) {
                return res.status(400).json({
                    message: "bands must be a non-empty array of { quantity, totalPrice } objects.",
                });
            }
            if (bands.length > 10) {
                return res.status(400).json({
                    message: "Maximum 10 bulk pricing bands per tier.",
                });
            }
            const result = await gig_service_1.GigService.addBulkingPricing(gigId, tierId, userId, bands);
            return res.status(200).json({
                message: "Bulk pricing updated succesfully.",
                data: result,
            });
        }
        catch (err) {
            console.error("ERROR adding bulk pricing: ", err);
            const knownMessage = [
                "Unauthorized",
                "not found",
                "Invalid quantity",
                "Invalid totalPrice",
                "must be less than",
                "Duplicate quantities",
            ];
            if (knownMessage.some((m) => err.message?.includes(m))) {
                return res.status(400).json({ message: err.message }); // Just show the norm error message
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({
                message: "Something went wrong, trying to add bands",
            });
        }
    }
    static async getBulkPricing(req, res) {
        try {
            const { gigId, tierId } = req.params;
            if (!gigId || !tierId) {
                return res.status(400).json({
                    message: "Both/One-of gigId and tierId are missing in the request parameters. Please provide both to fetch bulk pricing.",
                });
            }
            const result = await gig_service_1.GigService.getBulkPricing(gigId, tierId);
            return res.status(200).json({
                message: "Bulk pricing fetched successfully.",
                data: result,
            });
        }
        catch (error) {
            console.error("ERROR getting bulk pricing: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({
                message: "Something went wrong, trying to get bulk pricing bands.",
            });
        }
    }
    static async getFeaturedGigs(req, res) {
        try {
            const userId = req.userId;
        }
        catch (error) {
            console.error(new Date(), "-> [Gig Controller]: Failed to fetch top trending Gigs");
            return res.status(404).json({ message: "Top gigs not found" });
        }
    }
}
exports.GigController = GigController;
