import { Response, Request, response } from "express";
import { GigService } from "../services/gig.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { RequirementInputType } from "../../generated/prisma";
import { GigStatsService } from "../services/gigStats.service";
import { prisma } from "../utils/prisma";

export class GigController {
  static async createDraftGig(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
      const { title, tags, categoryId, deliveryMode } = req.body;

      if (!title || !categoryId) {
        return res.status(400).json({
          message:
            "Please type in title and select category form the options above.",
        });
      }

      if (!Array.isArray(tags) || tags.length > 5) {
        return res.status(400).json({
          message: "Pleas emakwe sure to choose at most 5 tags!!!",
        });
      }

      const draftGig = await GigService.createDraftGig(
        title,
        categoryId,
        tags,
        userId,
        deliveryMode,
      );

      return res.status(201).json({
        message: "Gig draft creation succesfull",
        data: { id: draftGig.id }, // You said i shoudl return only id, maybe only when user wanst to go backto this page-1 to chaneg some details we'll fey=tch them details, that's another endpoint though
      });
    } catch (error: any) {
      console.log("GIG DRAFT FAILED");
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to create the draft gig." });
    }
  }
  static async addDescToGig(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).sellerId;
      const { description, faqs } = req.body;
      const { gigId } = req.params;

      console.log("DEBUG - gigId:", gigId, "sellerId:", sellerId);

      if (!description) {
        return res.status(400).json({ message: "Description is required." });
      }

      if (faqs !== undefined && !Array.isArray(faqs)) {
        return res.status(400).json({ message: "FAQs must be an array." });
      }

      const descGig = await GigService.addDescToDraft(
        gigId as string,
        description,
        faqs,
        sellerId,
      );

      return res.status(201).json({
        message: "Succesfully added desc and faq",
        data: descGig,
      });
    } catch (error: any) {
      console.log("DESC ADD TO DRAFT FAILED");
      console.error(error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to add draft+faq to the draft gig." });
    }
  }
  static async addTierToGig(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).sellerId;
      const { tiers } = req.body;
      const { gigId } = req.params;

      if (!tiers || typeof tiers != "object") {
        return res
          .status(400)
          .json({
            message:
              "tier must be present containing basic, standard, and premium.",
          });
      }

      const requiredTierKeys = ["basic", "standard", "premium"] as const;
      const missingTiers = requiredTierKeys.filter((key) => !tiers[key]);

      if (missingTiers.length > 0) {
        return res.status(400).json({
          message: `Missing required tier(s): ${missingTiers.join(", ")}, All three tiers are mandatory.`,
        });
      }

      // NEVER TRUST CLIENT, fetch gig to know validRoute for deliveryMode
      const gig = await prisma.gig.findFirst({
        where: { id: gigId as string, sellerId },
        select: { deliveryMode:true }
      });

      if (!gig) {
        return res.status(404).json({ message: "Gig not found or you don't have permission to edit it." })
      }

      const isLive = gig.deliveryMode === "LIVE";

      for (const key of requiredTierKeys) {
        const tier = tiers[key];
        const tierError: string[] = [];

        if (!tier.description) tierError.push("DESCRIPTION: No description");
        if (typeof tier.price != "number" || tier.price <= 500)
          tierError.push("PRICE: (must be higer than 500 naira)");

        if (isLive) {
          if (typeof tier.sessionLengthMin != "number" || tier.sessionLengthMin <= 0)
            tierError.push("SESSION LENGTH: must be positive");
          if (typeof tier.totalSessions != "number" || tier.totalSessions <= 0)
            tierError.push("TOTAL SESSION: must be positive");
          if (typeof tier.breakLengthMin != "number" || tier.breakLengthMin < 0)
            tierError.push("BREAK LENGTH: must be 0 or more");
        } else {
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

      const tierGig = await GigService.addTiersToGig(
        gigId as string,
        tiers,
        sellerId,
      );

      return res.status(201).json({
        message: "Succesfully added tiers",
        data: tierGig,
      });
    } catch (error: any) {
      console.log("TIER ADD TO DRAFT FAILED");
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to add draft tier to the draft gig." });
    }
  }
  static async addQuestionsToGig(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).sellerId;
      const { requirementTemplates } = req.body;
      const { gigId } = req.params;

      if (
        requirementTemplates !== undefined &&
        !Array.isArray(requirementTemplates)
      ) {
        return res
          .status(400)
          .json({ message: "requirementTemplates must be present." });
      }

      const questionGig = await GigService.addQuestionsToGig(
        gigId as string,
        sellerId,
        requirementTemplates,
      );

      return res.status(201).json({
        message: "Succesfully added requirementTemplates",
        data: questionGig,
      });
    } catch (error: any) {
      console.log("TEMPLATES ADD TO DRAFT FAILED");
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({
          message: "Failed to add draft requirementTemplates to the draft gig.",
        });
    }
  }
  static async getUploadUrl(req: Request, res: Response): Promise<any> {
    try {
      console.log("[GET UPLAOD URL]: HIT!!!");
      const sellerId = (req as any).sellerId;
      const { gigId } = req.params;
      const { fileType, slot } = req.body;

      console.log("[REQ BODY]:", req.body);
      console.log("[SELLER ID]:", (req as any).sellerId);

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

      const { uploadUrl, publicUrl } = await GigService.generateUploadUrl(
        gigId as string,
        sellerId,
        fileType,
        slot,
      );
console.log("[GET UPLAOD URL]: SUCCESSFUL!!!");
      return res.status(200).json({
        message: "Upload URL generated",
        data: { uploadUrl, publicUrl },
      });
    } catch (error: any) {
      console.log("UPLOAD URL GENERATION FAILED");
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to generate upload URL." });
    }
  }
  static async saveGalleryToGig(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).sellerId;
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

      const galleryData = await GigService.saveGalleryToGig(
        gigId as string,
        sellerId,
        images,
        video,
      );

      return res.status(200).json({
        message: "galley succesfully saved to gig",
        data: galleryData,
      });
    } catch (error: any) {
      console.log("SAVING GALLERY TO GIG WENT WRONG");
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to save gallery to gig." });
    }
  }
  static async publishGig(req: Request, res: Response): Promise<any> {
    try {
      const sellerId = (req as any).sellerId;
      const { gigId } = req.params;

      const publishGig = await GigService.publishGig(gigId as string, sellerId);

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
        }).catch((err) =>
          console.error("Failed to trigger gig embedding: ", err),
        );
      }

      console.log(new Date(), "-> [Publish Gig]: Successfully created the gig");
      return res.status(200).json({
        message: "Gig creation succesful",
        data: publishGig,
      });
    } catch (error: any) {
      console.error("ERROR PUBLISHING GIG bro: ", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
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
  static async updateGig(req: Request, res: Response): Promise<any> {
    try {
      const { title, description, tags, categoryId, tiers, gigId } = req.body;
      const userId = (req as any).userId;

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
            message:
              "tiers must be an object containing basic, standard, or premium updates.",
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

          const currentTier = tier as any;
          const tierError: string[] = [];

          // Validations only trigger if the property is explicitly defined
          if (
            currentTier.description !== undefined &&
            !currentTier.description
          ) {
            tierError.push("description cannot be empty.");
          }
          if (
            currentTier.price !== undefined &&
            (typeof currentTier.price !== "number" || currentTier.price <= 500)
          ) {
            tierError.push("price must be a number higher than 500 naira");
          }
          if (
            currentTier.deliveryDays !== undefined &&
            (typeof currentTier.deliveryDays !== "number" ||
              currentTier.deliveryDays <= 0)
          ) {
            tierError.push("deliveryDays must be a positive number");
          }
          if (
            currentTier.revisionCount !== undefined &&
            (typeof currentTier.revisionCount !== "number" ||
              currentTier.revisionCount < 0)
          ) {
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
      const updatedGig = await GigService.updateGigData(
        gigId,
        userId,
        title,
        description,
        tags,
        categoryId,
        tiers,
      );

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
        }).catch((err) =>
          console.error(
            new Date(),
            "-> [Update Gig]: Failed to trigger gig embedding: ",
            err,
          ),
        );
      }

      return res.status(200).json({
        // Changed status code to 200 since it's an update, not a creation (201)
        message: "Gig update successful",
        data: updatedGig,
      });
    } catch (error: any) {
      console.error("ERROR UPDATING GIG bro: ", error);
      // Catch custom errors thrown from the service layer
      if (
        error.message === "Seller profile not found." ||
        error.message.includes("You can't modify this Gig")
      ) {
        return res.status(403).json({ message: error.message });
      }
      const handled = handlePrismaError(error, res);
      if (handled) return;

      return res
        .status(500)
        .json({ message: "Failed to update gig. Please try again." });
    }
  }
  static async readGig(req: Request, res: Response): Promise<any> {
    try {
      const { gigId } = req.params; // from URL params instead so non signed in can also see
      const userId = (req as any).userId;

      if (!gigId) {
        return res.status(400).json({
          message:
            "Bro input the gigId plaese, let's test this stuff real quick now",
        });
      }

      const gigData = await GigService.readGigData(userId, gigId as string);

      // GigStatsService.recordClick(gigId as string).catch(err =>
      //     console.error("Failed to record gig click: ", err)
      // );

      // 3. Fire the stats tracking safely afterward
      console.log(new Date(), "-> [Gig Controller]: Recording click");
      try {
        await GigStatsService.recordClick(gigId as string);
      } catch (err) {
        console.error("Failed to record gig click: ", err);
      }

      console.log(new Date(), "-> [Gig Controller read]: Hit!");
      return res.status(200).json({
        message: "We got the data bro",
        data: gigData,
      });
    } catch (error: any) {
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
      const category = (req.query.category || req.query.categoryId) as string;
      const search = req.query.search as string;  

      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const rating = req.query.rating ? parseFloat(req.query.rating as string) : undefined;
      const deliveryTime = req.query.deliveryTime ? parseInt(req.query.deliveryTime as string, 10) : undefined;

      const userId = (req as any).userId;

      const filters = {
        category,
        search,
        minPrice,
        maxPrice,
        rating,
        deliveryTime,
      };

      const gigs = await GigService.listGigs(userId, page, limit, filters);

      // Fire-and-forget impression tracking for every gig returned in this page
      const gigIds = gigs?.data?.map((g: any) => g.id) ?? [];
      if (gigIds.length) {
        GigStatsService.recordImpressions(gigIds).catch((err) =>
          console.error("Failed to record gig impression: ", err),
        );
      }

      return res.status(200).json({
        message: "The fecth was succesfull. ^^",
        data: gigs,
      });
    } catch (error: any) {
      console.error("ERROR FETCHING MULTIPLE GIGS bro: ", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({
          message: "Failed to get gigs bro, you can't get them gigs huh",
        });
    }
  }
  static async getAllGigsBySeller(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;

      const gigs = await GigService.getAllGigsBySeller(userId, page, limit);

      // console.log(gigs);
      return res.status(200).json({
        message: "Fetched all gigs by seller successfully.",
        ...gigs,
      });
    } catch (error: any) {
      console.error("ERROR FETCHING MULTIPLE GIGS by seller bro: ", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res
        .status(500)
        .json({ message: "Failed to get gigs by seller!!!" });
    }
  }
  static async deleteGig(req: Request, res: Response): Promise<any> {
    try {
      const { gigId } = req.body;
      const userId = (req as any).userId;

      if (!gigId) {
        return res.status(400).json({
          message: "input some shii in there bro!!! OH MY GOD!!!",
        });
      }
      const deletedGig = await GigService.deleteGig(userId, gigId);

      return res.status(200).json({
        message: "Successfully deleted the gig from db",
        data: deletedGig,
      });
    } catch (error: any) {
      console.error("Failed to delete the gig bro", error);
      if (
        error.message?.includes("Unauthorized") ||
        error.message?.includes("not found")
      ) {
        return res
          .status(error.message.includes("Unauthorized") ? 403 : 404)
          .json({ message: error.message });
      }
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({
        message: "Failed to delete the gig",
      });
    }
  }
  static async searchGigs(req: Request, res: Response): Promise<any> {
    try {
      console.log(new Date(), "-> [Gig Controller]: GIG SEARCH Hit");

      // Extract cleanly from POST body OR GET query params
      const query = ((req.body?.query || req.query?.q || "") as string).trim();
      const budgetMax = req.body?.budgetMax ?? (req.query?.budgetMax ? Number(req.query.budgetMax) : undefined); // Because it is a number we ise ??
      const location = (req.body?.location || req.query?.location) as string | undefined;
      const gigType = (req.body?.gigType || req.query?.gigType) as string | undefined;
      const category = (req.body?.category || req.query?.category) as string | undefined;

      if (!category && (!query || query.length < 3)) {
        return res
          .status(400)
          .json({ message: "Search query must be at least 3 characters." });
      }

      // Send to FastAPI agentic search
      console.log(
        `[Gig Controller]: Sent to fast api`,
        query,
        budgetMax,
        location,
        gigType,
        category,
      );

      const fastApiResponse = await fetch(
        `${process.env.FASTAPI_URL}/api/search/gigs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, budgetMax, location, gigType, category }),
        },
      );

      if (!fastApiResponse.ok) {
        const errorText = await fastApiResponse.text().catch(() => "");
        
        console.error("[Gig Controller]: FastAPI Search Error ->", errorText);

        return res.status(fastApiResponse.status).json({
          message: "Agentic search service unavailable.",
        });
      }

      const data = await fastApiResponse.json();

      // Fire-and-forget impression tracking for every gig returned in this page
      const gigIds = data?.results?.map((g: any) => g.id) ?? [];
      if (gigIds.length) {
        GigStatsService.recordImpressions(gigIds).catch((err) =>
          console.error("Failed to record gig impression: ", err),
        );
      }

      console.log("FOUND GIGS, agentic search");
      return res.status(200).json({
        message: "Search Complete",
        ...data,
      });
    } catch (error: any) {
      console.error("ERROR SEARCHING FOR GIGS, agentic search", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({
        message: "Umm, Can't find gigs bro, Please try again.",
      });
    }
  }
  static async getZeroResultQueries(req: Request, res: Response): Promise<any> {
    try {
      console.log(new Date(), "-> [Gig Controller]: ZERO QUERY Hit");
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        prisma.zeroResultQuery.findMany({
          orderBy: { searchCount: "desc" },
          skip,
          take: limit,
        }),
        prisma.zeroResultQuery.count(),
      ]);

      console.log("FOUND GIGS, agentic search");
      return res.status(200).json({
        message: "Zero result queries fetched",
        results,
        total,
        page,
        limit
      });
    } catch (error: any) {
      console.error("ERROR FETCHING ZERO QUERY, agentic search", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({
        message: "Couldn't fetch zero-result queries.",
      });
    }
  }
  static async addBulkPricing(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
      const { gigId, tierId }: any = req.params;
      const { bands } = req.body;

      if (!Array.isArray(bands) || bands.length === 0) {
        return res.status(400).json({
          message:
            "bands must be a non-empty array of { quantity, totalPrice } objects.",
        });
      }
      if (bands.length > 10) {
        return res.status(400).json({
          message: "Maximum 10 bulk pricing bands per tier.",
        });
      }

      const result = await GigService.addBulkingPricing(
        gigId,
        tierId,
        userId,
        bands,
      );

      return res.status(200).json({
        message: "Bulk pricing updated succesfully.",
        data: result,
      });
    } catch (err: any) {
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
      const handled = handlePrismaError(err, res);
      if (handled) return;
      return res.status(500).json({
        message: "Something went wrong, trying to add bands",
      });
    }
  }
  static async getBulkPricing(req: Request, res: Response): Promise<any> {
    try {
      const { gigId, tierId } = req.params;

      if (!gigId || !tierId) {
        return res.status(400).json({
          message:
            "Both/One-of gigId and tierId are missing in the request parameters. Please provide both to fetch bulk pricing.",
        });
      }

      const result = await GigService.getBulkPricing(
        gigId as string,
        tierId as string,
      );

      return res.status(200).json({
        message: "Bulk pricing fetched successfully.",
        data: result,
      });
    } catch (error: any) {
      console.error("ERROR getting bulk pricing: ", error);

      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({
        message: "Something went wrong, trying to get bulk pricing bands.",
      });
    }
  }
  static async getFeaturedGigs(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).userId;
    } catch (error: any) {
      console.error(
        new Date(),
        "-> [Gig Controller]: Failed to fetch top trending Gigs",
      );
      return res.status(404).json({ message: "Top gigs not found" });
    }
  }
}
