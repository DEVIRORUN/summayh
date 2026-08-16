// TALKING TO PRISMA and some shii

import { prisma } from "../utils/prisma";
import { TierLabel } from "../../generated/prisma";
import { connect } from "http2";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../utils/r2Client";
import { randomUUID } from "crypto";

interface TierInput {
  customName?: string;
  description: string;
  price: number;
  deliveryDays?: number;
  revisionCount?: number;
  sessionLengthMin?: number;
  breakLengthMin?: number;
  totalSessions?: number;
}
interface GigTiersInput {
  basic: TierInput;
  standard: TierInput;
  premium: TierInput;
}
interface RequirementTemplateInput {
  question: string;
  inputType: "FREE_TEXT" | "MULTIPLE_CHOICE" | "FILE_UPLOAD" | "YES_NO";
  options?: string[];
  isRequired: boolean;
  order?: number;
}
interface BulkPricingBand {
  quantity: number;
  totalPrice: number;
}

interface GigFAQInput {
  question: string;
  answer: string;
  order?: number;
}

interface GigFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  deliveryTime?: number;
}

interface GigUpsertInput {
  title: string;
  category: string;
  tags: string[];
  description: string;
  status?: string;
  tiers: GigTiersInput[];
  gallery: string[]
}


export class GigService {
  /**
   * For creation of gig + all 3 mandatory tiers (Basic, Standard, Premium)
   * Linking to prisma db
   */
  static async createDraftGig(
    title: string,
    categoryId: string,
    tags: string[],
    userId: string,
    deliveryMode: "DIGITAL" | "LIVE" = "DIGITAL",
  ): Promise<any> {
    try {
      console.log(new Date(), "-> [GIG DRAFT CREATION]: Hit!!!");
      // Confirm User is a seller
      const seller = await prisma.sellerProfile.findUnique({
        where: { userId },
      });
      if (!seller) {
        throw new Error("Seller not found.");
      }

      const draftGig = await prisma.gig.create({
        data: {
          title,
          tags,
          state: "DRAFT",
          deliveryMode,
          seller: {
            connect: { id: seller.id },
          },
          category: {
            connect: { id: categoryId },
          },
        },
      });

      console.log(new Date(), "-> [GIG DRAFT CREATION]: Draft Gig created!!!");
      return draftGig;
    } catch (err: any) {
      throw err;
    }
  }
  static async addDescToDraft(
    gigId: string,
    description: string,
    faqs: GigFAQInput[],
    sellerId: string,
  ): Promise<any> {
    try {
      console.log(new Date(), "-> [ADD DESC TO DRAFT]: Hit!!!");
      // We get the existing Gig
      const descGig = await prisma.$transaction(async (tx) => {
        const newGig = await tx.gig.update({
          where: { id: gigId, sellerId },
          data: {
            description,
          },
        });

        // But before adding FAQs, we delete em
        await tx.gigFAQ.deleteMany({ where: { gigId } });

        // then create
        if (faqs && faqs.length > 0) {
          await tx.gigFAQ.createMany({
            data: faqs.map((faq, index) => ({
              gigId,
              question: faq.question,
              answer: faq.answer,
              order: faq.order ?? index,
            })),
          });
        }

        return newGig;
      });

      console.log(new Date(), "-> [ADD DESC TO DRAFT]: Draft Gig created!!!");
      return descGig;
    } catch (err: any) {
      throw err;
    }
  }
  static async addTiersToGig(
    gigId: string,
    tiers: GigTiersInput,
    sellerId: string,
  ): Promise<any> {
    try {
      console.log(new Date(), "-> [ADD TIERS TO DRAFT]: Hit!!!");
      const tierGig = await prisma.$transaction(async (tx) => {
        const newGig = await tx.gig.findFirst({
          where: { id: gigId, sellerId },
        });

        if (!newGig) {
          throw new Error(
            "Gig not found or you don't have permissino to edit it.",
          );
        }

        await tx.gigTier.deleteMany({ where: { gigId } });

        const isLive = newGig.deliveryMode === "LIVE";

        const buildTierData = (label: TierLabel, tier: any) => ({
            gigId,
            label,
            customName: tier.customName || label,
            description: tier.description,
            price: tier.price,
            deliveryDays: isLive ? 0 : tier.deliveryDays,
            revisionCount: isLive ? 0 : tier.revisionCount,
            sessionLengthMin: isLive ? tier.sessionLengthMin : null,
            breakLengthMin: isLive ? tier.breakLengthMin : null,
            totalSessions: isLive ? tier.totalSessions : null,
        })

        await tx.gigTier.createMany({
          data: [
            buildTierData(TierLabel.BASIC, tiers.basic),
            buildTierData(TierLabel.STANDARD, tiers.standard),
            buildTierData(TierLabel.PREMIUM, tiers.premium),
          ],
        });

        console.log(new Date(), "-> [ADD TIERS TO DRAFT]: Draft Gig created!!!");
        return newGig;
      });
      return tierGig;
    } catch (err: any) {
      throw err;
    }
  }
  static async generateUploadUrl(
    gigId: string,
    sellerId: string,
    fileType: string,
    slot: "image" | "video",
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
      console.log(new Date(), "-> [GET UPLOAD URL GIG]: Hit!!!");
      console.log("R2_PUBLIC_URL =", process.env.R2_PUBLIC_URL);
    const gig = await prisma.gig.findFirst({
      where: { id: gigId, sellerId },
    });

    if (!gig) {
      throw new Error(
        "Gig not found or you don't have access/permissoon to edit this gig.",
      );
    }

    // Now we build a unique key (path) for this file inside the bucket
    const extension = fileType.split("/")[1]; // "png", "mp4"
    const key = `gigs/${gigId}/${slot}-${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // This gon make URL valid for 5 mins, plenty of time for browser to upload Gig vid (i mean max is 50mb)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

    // Now the URL FE/DB would display and store
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    console.log("publicUrl", publicUrl);

    return { uploadUrl, publicUrl };
  }
  static async saveGalleryToGig(
    gigId: string,
    sellerId: string,
    images: string[], // 1-3 URLs
    video: string | null, // 0 or 1 URL
  ): Promise<any> {
    try {
      console.log(new Date(), "-> [SAVE GALLERY TO GIG]: Hit!!!");

      // First we find the gig in matter and update in one line transacion not neccesarily needed
      const gig = await prisma.gig.update({
        where: { id: gigId, sellerId },
        data: {
          images,
          video,
          coverImage: images?.[0] // Next tiem this coverImage alwways gets its pic
        },
      }); // so with these from the types from schema no stress needed, the work is done

      console.log(
        new Date(),
        "-> [SAVE GALLERY TO GIG]: SUccesfully Saved to Gallery!!!",
      );
      return gig;
    } catch (err: any) {
      throw err;
    }
  }
  static async publishGig(gigId: string, sellerId: string): Promise<any> {
    try {
      // Needs transactin here for sure
      const publishGig = await prisma.$transaction(async (tx) => {
        const rookieExpiredAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
        const gig = await tx.gig.findFirst({
          where: { id: gigId, sellerId },
          include: {
            seller: true,
            tiers: true,
          },
        });

        if (!gig) {
          throw new Error(
            "Gig not found or you are not allowed ot edit this Gig",
          );
        }
        if (!gig?.description)
          throw new Error("Description is required before publishing.");
        if (gig.tiers.length < 3)
          throw new Error("All pricing are required before publishing.");
        if (gig.images.length < 1)
          throw new Error("At least one image is required before publishing.");

        const isLive = gig.deliveryMode === "LIVE";

        if (isLive) {
          const invalidTier = gig.tiers.find(
            (t) => !t.sessionLengthMin || !t.totalSessions,
          )
          if (invalidTier) {
            throw new Error("All tiers must have session length and total sessions set before publishing");
          }

          const availabilityCount = await tx.sellerAvailability.count({
            where: { sellerId: gig.sellerId }
          });
          if (availabilityCount === 0) {
            throw new Error("Please set your availability before publishing a live gig")
          }
        }

        const updatedGig = await tx.gig.update({
          where: { id: gigId, sellerId },
          include: {
            seller: true,
            tiers: true,
            category: true,
          },
          data: {
            state: "ACTIVE",
            isRookiePeriod: true,
            rookieExpiredAt,
          },
        });

        return updatedGig;
      });
      return publishGig;
    } catch (err: any) {
      throw err;
    }
  }

  static async addQuestionsToGig(
    gigId: string,
    sellerId: string,
    requirementTemplates?: RequirementTemplateInput[],
  ): Promise<any> {
    try {
      console.log(new Date(), "-> [ADD QUESTIONS TO DRAFT]: Hit!!!");
      const questionGig = await prisma.$transaction(async (tx) => {
        const newGig = await tx.gig.findFirst({
          where: { id: gigId, sellerId },
        });

        if (!newGig) {
          throw new Error(
            "Gig not found, You don't have permission to edit it.",
          );
        }

        await tx.gigRequirementTemplate.deleteMany({ where: { gigId } });

        if (requirementTemplates && requirementTemplates.length > 0) {
          await tx.gigRequirementTemplate.createMany({
            data: requirementTemplates.map((rt, index) => ({
              gigId,
              question: rt.question,
              inputType: rt.inputType,
              options: rt.options ?? [],
              isRequired: rt.isRequired,
              order: rt.order ?? index, // will build components in FE to automatically render the Templates section based n inputType
            })),
          });
        }

        return newGig;
      });

      console.log(
        new Date(),
        "-> [ADD QUESTIONS TO DRAFT]: Draft Gig created!!!",
      );
      return questionGig;
    } catch (err: any) {
      throw err;
    }
  }
  // static async initiateGigCreation(
  //   title: string,
  //   description: string,
  //   tags: string[],
  //   categoryId: string,
  //   userId: string,
  //   tiers: GigTiersInput,
  //   requirementTemplates?: RequirementTemplateInput[], // Optional
  // ): Promise<any> {
  //   try {
  //     const newGig = await prisma.$transaction(async (tx) => {
  //       const rookieExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 3 days form now()

  //       const gig = await tx.gig.create({
  //         data: {
  //           title,
  //           description,
  //           tags,
  //           rookieExpiredAt: rookieExpiry,
  //           seller: {
  //             connect: { userId: userId },
  //           },
  //           category: {
  //             connect: { id: categoryId },
  //           },
  //         },
  //       });

  //       await tx.gigStats.create({
  //         data: { gigId: gig.id },
  //       });

  //       await tx.gigTier.createMany({
  //         data: [
  //           {
  //             gigId: gig.id,
  //             label: TierLabel.BASIC,
  //             customName: tiers.basic.customName || "BASIC",
  //             description: tiers.basic.description,
  //             price: tiers.basic.price,
  //             deliveryDays: 0,
  //             revisionCount: tiers.basic.revisionCount,
  //           },
  //           {
  //             gigId: gig.id,
  //             label: TierLabel.STANDARD,
  //             customName: tiers.standard.customName || "STANDARD",
  //             description: tiers.standard.description,
  //             price: tiers.standard.price,
  //             deliveryDays: tiers.standard.deliveryDays,
  //             revisionCount: tiers.standard.revisionCount,
  //           },
  //           {
  //             gigId: gig.id,
  //             label: TierLabel.PREMIUM,
  //             customName: tiers.premium.customName || "PREMIUM",
  //             description: tiers.premium.description,
  //             price: tiers.premium.price,
  //             deliveryDays: tiers.premium.deliveryDays,
  //             revisionCount: tiers.premium.revisionCount,
  //           },
  //         ],
  //       });

  //       // We only create requiremnets templates if sller provided them
  //       if (requirementTemplates && requirementTemplates.length > 0) {
  //         await tx.gigRequirementTemplate.createMany({
  //           data: requirementTemplates.map((rt, index) => ({
  //             gigId: gig.id,
  //             question: rt.question,
  //             inputType: rt.inputType,
  //             options: rt.options ?? [],
  //             isRequired: rt.isRequired,
  //             order: rt.order ?? index, // fallback to array order
  //           })),
  //         });
  //       }

  //       // Return the gig with its tiers attached, so the controller
  //       // doesn't need a second round-trip query
  //       return tx.gig.findUnique({
  //         where: { id: gig.id },
  //         include: {
  //           tiers: true,
  //           seller: {
  //             select: { isPro: true },
  //           },
  //           requirementTemplates: {
  //             orderBy: { order: "asc" },
  //           },
  //           // stats: true // well i don't think stats is upposed ot be here at initation of the Gig
  //         },
  //       });
  //     });

  //     return newGig;
  //   } catch (error) {
  //     console.error("Error in GigService.initiateGigCreation:", error);
  //     throw error;
  //   }
  // }
  static async readGigData(userId: string | undefined, gigId: string): Promise<any> {
    try {
      console.log(new Date(), "-> [Gig Service read]: Hit!");

      const mainGig = await prisma.gig.findUnique({
        where: { id: gigId },
        include: {
          category: true,
          tiers: { include: { quantityPricing: true } },
          seller: true,
        },
      });

      if (!mainGig) throw new Error("Gig not found.");

      const isOwner = userId && mainGig.seller.userId === userId;

      if (mainGig.state !== "ACTIVE" && !isOwner) {
        throw new Error("Gig not found."); // don't leak draft existence to non-owners
      }

      return mainGig;
    } catch (error) {
      console.error("Error in GigService.readGigData:", error);
      throw error;
    }
  }
  // static async upsertGig(
  //   sellerId: string, 
  //   gigId?: string | undefined,
  //   gigData: GigUpsertInput
  // ): Promise<any> {
  //   try {
  //     console.log(new Date(), "-> [UPSERT GIG]: Hit!!!");

  //     const { title, category, tags, description, status, tiers, gallery } = gigData;

  //     const baseData = {
  //       title, 
  //       categoryId: category,
  //       tags,
  //       description,
  //       status: status ?? "DRAFT",
  //     };

  //     if (gigId) {
  //       const existing = await prisma.gig.findUnique({ where: { id: gigId } });
  //       if(!existing) throw new Error("Gig not found");
  //       if (existing.sellerId !== sellerId) throw new Error("Not your gig. Go fidn yours");

  //       return prisma.$transaction(async (tx) => {
  //         const updated = await tx.gig.update({
  //           where: { id: gigId },
  //           data: baseData,
  //         });

  //         await tx.gigTier.deleteMany({ where: { id: gigId } });
  //         await tx.gigTier.createMany({
  //           data: tiers.map((t) => ({ ...t, gigId }))
  //         });

  //         await tx.gig
  //       })
  //     }
  //   }
  // }
  static async updateGigData(
    gigId: string,
    userId: string,
    title?: string,
    description?: string,
    tags?: string[],
    categoryId?: string,
    tiers?: Partial<GigTiersInput>,
  ): Promise<any> {
    try {
      console.log("DEBUG LOOKUP -> gigId:", gigId, "userId:", userId);
      // EXTRA validation
      const sellerProfile = await prisma.sellerProfile.findFirst({
        where: { userId: userId },
      });

      if (!sellerProfile) {
        // how do i add the not here as in if sellerId is not equals to gig.sellerId, here??
        throw new Error(
          "Seller profile not found. Only registered sellers can modify gigs.",
        );
      }

      const gig = await prisma.gig.findUnique({
        where: { id: gigId },
      });

      if (!gig) {
        throw new Error("Gig not found.");
      }

      // 3. SECURE VERIFICATION: Check if the gig's sellerId matches this user's seller profile ID
      if (sellerProfile.id !== gig.sellerId) {
        throw new Error("You can't modify this Gig as you didn't create it.");
      }

      // Perform the update safely
      return await prisma.$transaction(async (tx) => {
        // Dynamic build for update object for main fields

        const updatedData: any = {};
        if (title !== undefined) updatedData.title = title;
        if (description !== undefined) updatedData.description = description;
        if (tags !== undefined) updatedData.tags = tags;
        if (categoryId !== undefined) updatedData.categoryId = categoryId;

        // Only call update if there's actually a main gig field to change brr
        if (Object.keys(updatedData).length > 0) {
          await tx.gig.update({
            where: { id: gigId },
            data: updatedData,
          });
        }

        // Loop through tiers using ENTRIES to get both key and values
        if (tiers !== undefined && tiers !== null) {
          for (const [labelKey, tierData] of Object.entries(tiers)) {
            if (!tierData) continue;

            const tierLabel = labelKey.toUpperCase() as TierLabel;

            await tx.gigTier.upsert({
              where: {
                gigId_label: {
                  gigId: gigId,
                  label: tierLabel,
                },
              },
              update: {
                ...(tierData.customName != undefined && {
                  customName: tierData.customName,
                }),
                ...(tierData.price !== undefined && { price: tierData.price }),
                ...(tierData.description !== undefined && {
                  description: tierData.description,
                }),
                ...(tierData.deliveryDays !== undefined && {
                  deliveryDays: tierData.deliveryDays,
                }),
                ...(tierData.revisionCount !== undefined && {
                  revisionCount: tierData.revisionCount,
                }),
              },
              create: {
                gigId: gigId,
                label: tierLabel,
                description: tierData.description || "",
                price: tierData.price || 0,
                deliveryDays: tierData.deliveryDays || 1,
                revisionCount: tierData.revisionCount || 0,
              },
            });
          }
        }

        // Return final updated gig complete with its updated tiers
        return await tx.gig.findUnique({
          where: { id: gigId },
          include: {
            seller: {
              select: { isPro: true },
            },
            tiers: {
              include: {
                quantityPricing: true,
              },
            },
          },
        });
      });
    } catch (error: any) {
      console.error("Error in GigService.updateGigData:", error);
      throw error;
    }
  }
  static async deleteGig(userId: string, gigId: string): Promise<any> {
    try {
      // Validation is gig creator the current user who wanna deletes it?
      const gig = await prisma.gig.findUnique({
        where: { id: gigId },
        include: { seller: true },
      });

      if (!gig) {
        console.error(`This gig with id: ${gigId} doesn't exist in db`);
        throw new Error("This gig doesn't Exist bro");
      }
      // Validation is gig creator the current user who wanna deletes it?
      const sellerProfile = await prisma.sellerProfile.findUnique({
        where: { userId: userId },
      });
      if (!sellerProfile) {
        throw new Error(
          "Seller profile not found. Only registered sellers can modify gigs.",
        );
      }
      if (sellerProfile.id !== gig.sellerId) {
        throw new Error("You can delete this gig as you're not the creator!!!");
      }
      return await prisma.gig.update({
        where: { id: gigId },
        data: { state: "INACTIVE" },
      });
    } catch (error) {
      console.error("Error in GigService.initiateGigCreation:", error);
      throw error;
    }
  }
  static async listGigs(
    userId: string | undefined,
    page: number,
    limit: number,
    filters: GigFilters
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const where: any = { isActive: true };

      if (filters.category) {
        where.OR = [
          { category: { is: { slug: filters.category } } },
          { categoryId: filters.category }
        ]
      }

      if (filters.search) {
        const searchCondition = [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ]
        
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: searchCondition },
          ];
          delete where.OR;
        } else {
          where.OR = searchCondition;
        }
      }


      if (filters.rating) {
        where.avgRating = { gte: filters.rating }
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.deliveryTime !== undefined) {
        where.tiers = {
          some: {
            ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
              ? {
                price: {
                  ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
                  ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
                },
              }
              : {}),
              ...(filters.deliveryTime !== undefined
                ? { deliveryDays: { lte: filters.deliveryTime } }
                : {}),
          },
        };
      }

      const [gigs, total] = await Promise.all([
        await prisma.gig.findMany({
          where,
          skip: skip,
          take: limit,
          orderBy: { createdAt: "desc" }, // Default chronological order for now
          include: {
            tiers: {
              include: { quantityPricing: true },
            },
            seller: {
              select: { 
                id: true, 
                sellerUsername: true,
                avatar: true,
                isPro: true,
                user: {
                  select: {
                    name: true
                  }
                },
                rating: true, 
                totalReviews: true 
              },
            },
          },
        }),
        prisma.gig.count({ where }),
      ]);

      return {
        data: gigs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("ERROR fetching MULTIPLE gigs bro:", error);
      throw error;
    }
  }
  static async getAllGigsBySeller(
    userId: string,
    page: number = 1,
    limit: number = 15,
  ): Promise<any> {
    try {
      console.error("MULTIPLE gigs for seller bro: HIT!!!!");
      const skip = (page - 1) * limit;

      const gigs = await prisma.gig.findMany({
        where: { seller: { userId } },
        skip: skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          tiers: {
            include: { quantityPricing: true },
          },
          seller: {
            select: {
              userId: true,
              sellerUsername: true,
              rating: true,
              totalReviews: true,
            },
          },
        },
      });

      // Count the num of Gigs provided
      const totalGigs = await prisma.gig.count({
        where: { seller: { userId } },
      });

      console.error("MULTIPLE gigs for seller bro: SUCCESSFUL!!!!");
      return {
        data: gigs,
        meta: {
          total: totalGigs,
          page,
          limit,
          totalPages: Math.ceil(totalGigs / limit),
        },
      };
    } catch (error: any) {
      console.error("ERROR fetching MULTIPLE gigs by seller bro: ", error);
      throw error;
    }
  }
  static async addBulkingPricing(
    gigId: string,
    tierId: string,
    userId: string,
    bands: BulkPricingBand[],
  ): Promise<any> {
    try {
      // Validate that the gig belongs to the user
      const gig = await prisma.gig.findUnique({
        where: { id: gigId },
        include: {
          seller: true,
          tiers: { where: { id: tierId } },
        },
      });
      if (!gig) {
        throw new Error("Gig not found");
      }
      if (gig.seller.userId !== userId) {
        throw new Error("Unauthorized. You can only edit your own gigs.");
      }
      if (gig.tiers.length === 0)
        throw new Error("Tier not found on this gig.");

      const tier = gig.tiers[0];

      // 2. Validate each band
      for (const band of bands) {
        if (!Number.isInteger(band.quantity) || band.quantity < 2) {
          throw new Error(
            `Invalid quantity ${band.quantity} - bulk pricing must be for 2 or more units.`,
          );
        }
        if (band.totalPrice <= 0) {
          throw new Error(
            `Invalid totalPrice for quantity ${band.quantity} - must be greater than 0.`,
          );
        }
        // Sanity check: bulk price should be less than quantity x unit price
        // (otherwise why offer it - its's not actually a discount)
        const unitTotal = tier.price * band.quantity;
        if (band.totalPrice >= unitTotal) {
          throw new Error(
            `Quantity ${band.quantity}: totalPrice (₦${band.totalPrice}) must be less than ` +
              `${band.quantity} x unit price (₦${unitTotal}). Bulk price should offer a discount`,
          );
        }
      }

      // 3. Check for suplicate quantities within the submitted bands
      const quantities = bands.map((b) => b.quantity);
      const uniqueQuantities = new Set(quantities);
      if (uniqueQuantities.size !== quantities.length) {
        throw new Error(
          "Duplicate quantities is in your submission - each quantity must appear only once",
        );
      }

      // 4. Upsert each band - update if quantity already exists, create if new
      // This lets sellers call this andpoint multiple ties without duplicating rows
      const results = await prisma.$transaction(
        bands.map((band) =>
          prisma.tierQuantityPrice.upsert({
            where: {
              gigTierId_quantity: {
                gigTierId: tierId,
                quantity: band.quantity,
              },
            },
            update: { totalPrice: band.totalPrice },
            create: {
              gigTierId: tierId,
              quantity: band.quantity,
              totalPrice: band.totalPrice,
              discountPercentage: Math.round(
                ((tier.price * band.quantity - band.totalPrice) / tier.price) *
                  band.quantity,
              ),
            },
          }),
        ),
      );

      return {
        label: tier.label,
        tierId,
        gigId,
        bandsAdded: results.length,
        pricing: results,
      };
    } catch (error: any) {
      console.error("ERROR adding BULK PRICING:", error);
      throw error;
    }
  }
  static async getBulkPricing(gigId: string, tierId: string): Promise<any> {
    try {
      const tier = await prisma.gigTier.findUnique({ where: { id: tierId } });

      if (!tier) {
        console.error(`Tier with id ${tierId} not found for gig ${gigId}`);
      }

      const bulkPricing = await prisma.tierQuantityPrice.findMany({
        where: { gigTierId: tierId },
      });

      return {
        data: bulkPricing,
        meta: {
          label: tier?.label,
          tierId,
          gigId,
          totalBands: Math.ceil(bulkPricing.length),
          tier: tier,
        },
      };
    } catch (error: any) {
      console.error("ERROR fetching BULK PRICING: ", error);
      throw error;
    }
  }
}
