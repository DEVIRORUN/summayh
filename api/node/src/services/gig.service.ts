// TALKING TO PRISMA and some shii

import { prisma } from "../utils/prisma";
import { TierLabel } from "../../generated/prisma"

interface TierInput {
    customName?: string;
    description: string;
    price: number;
    deliveryDays: number;
    revisionCount: number;
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

export class GigService {
    /**
     * For creation of gig + all 3 mandatory tiers (Basic, Standard, Premium)
     * Linking to prisma db
     */

    static async initiateGigCreation(
        title: string,
        description: string,
        tags: string[],
        categoryId: string,
        userId: string,
        tiers: GigTiersInput,
        requirementTemplates?: RequirementTemplateInput[] // Optional
    ): Promise<any> {
        try {
            const newGig = await prisma.$transaction(async (tx) => {
                const gig = await tx.gig.create({
                    data: {
                        title,
                        description,
                        tags,
                        seller: {
                            connect: { userId: userId }
                        },
                        category: {
                            connect: { id: categoryId }
                        }
                    }
                });

                await tx.gigTier.createMany({
                    data: [
                        {
                            gigId: gig.id,
                            label: TierLabel.BASIC,
                            customName: tiers.basic.customName || "BASIC",
                            description: tiers.basic.description,
                            price: tiers.basic.price,
                            deliveryDays: tiers.basic.deliveryDays,
                            revisionCount: tiers.basic.revisionCount
                        },
                        {
                            gigId: gig.id,
                            label: TierLabel.STANDARD,
                            customName: tiers.standard.customName || "STANDARD",
                            description: tiers.standard.description,
                            price: tiers.standard.price,
                            deliveryDays: tiers.standard.deliveryDays,
                            revisionCount: tiers.standard.revisionCount
                        },
                        {
                            gigId: gig.id,
                            label: TierLabel.PREMIUM,
                            customName: tiers.premium.customName || "PREMIUM",
                            description: tiers.premium.description,
                            price: tiers.premium.price,
                            deliveryDays: tiers.premium.deliveryDays,
                            revisionCount: tiers.premium.revisionCount
                        },
                    ]
                });

                // We only create requiremnets templates if sller provided them
                if (requirementTemplates && requirementTemplates.length > 0) {
                    await tx.gigRequirementTemplate.createMany({
                        data: requirementTemplates.map((rt, index) => ({
                            gigId: gig.id,
                            question: rt.question,
                            inputType: rt.inputType,
                            options: rt.options ?? [],
                            isRequired: rt.isRequired,
                            order: rt.order ?? index // fallback to array order
                        }))
                    });
                }

                // Return the gig with its tiers attached, so the controller
                // doesn't need a second round-trip query
                return tx.gig.findUnique({
                    where: { id: gig.id },
                    include: { 
                        tiers: true,
                        requirementTemplates: {
                            orderBy: { order: "asc" }
                        }
                    }
                });
            });
           

            return newGig;
       } catch(error) {
            console.error("Error in GigService.initiateGigCreation:", error);
            throw error; 
        }
    }
    static async readGigData( userId: string, gigId: string): Promise<any> {
        try {
            const mainGig = await prisma.gig.findUnique({
                where: { id: gigId},
                include: {
                    tiers: {
                        include: {
                            quantityPricing: true
                        }
                    }
                }
            });

            if (!mainGig) throw new Error("Gig not found.");
            if (mainGig.state !== "ACTIVE") {
                const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
                if (!sellerProfile || sellerProfile.id !== mainGig.sellerId) {
                    throw new Error("You don't permission to view this draft");
                }
            }
            return mainGig;
       } catch(error) {
            console.error("Error in GigService.readGigData:", error);
            throw error; 
        }
    }

    static async updateGigData(
        gigId: string,
        userId: string,
        title?: string,
        description?: string,
        tags?: string[],
        categoryId?: string,
        tiers?: Partial<GigTiersInput>
    ): Promise<any> {
        console.log("DEBUG LOOKUP -> gigId:", gigId, "userId:", userId);
        // EXTRA validation
         const sellerProfile = await prisma.sellerProfile.findFirst({
            where: { userId: userId }
         });

         if(!sellerProfile) { // how do i add teh not here as in if sellerId is not equals to gig.sellerId, here??
            throw new Error("Seller profile not found. Only registered sellers can modify gigs.");
         }

         const gig = await prisma.gig.findUnique({
            where: { id: gigId }
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
                    data: updatedData
                });
            }
            
            // Loop through tiers using ENTRIES to get both key and values
            if(tiers !== undefined && tiers !== null){
                for (const [labelKey, tierData] of Object.entries(tiers)) {

                    if(!tierData) continue;
                
                    const tierLabel =  labelKey.toUpperCase() as TierLabel;

                    await tx.gigTier.upsert({
                        where: {
                            gigId_label: {
                                gigId: gigId,
                                label: tierLabel
                            }
                        },
                        update: {
                            ...(tierData.customName != undefined && {customName: tierData.customName}),
                            ...(tierData.price !== undefined && { price: tierData.price }),
                            ...(tierData.description !== undefined && { description: tierData.description }),
                            ...(tierData.deliveryDays !== undefined && { delieveryDays: tierData.deliveryDays }),
                            ...(tierData.revisionCount !== undefined && { revisionCount: tierData.revisionCount })
                        },
                        create: {
                            gigId: gigId,
                            label: tierLabel,
                            description: tierData.description || "",
                            price: tierData.price || 0,
                            deliveryDays: tierData.deliveryDays || 1,
                            revisionCount: tierData.revisionCount || 0,
                        }
                    });
                }
            }

            // Return final updated gig complete with its updated tiers
            return await tx.gig.findUnique({
                where: { id: gigId },
                include: {
                    tiers: {
                        include: {
                            quantityPricing: true
                        }
                    }
                }
            });
         });
    }

    static async deleteGig(userId: string, gigId: string): Promise<any> {
        try {
            // Validation is gig creator the current user who wanna deletes it?
            const gig = await prisma.gig.findUnique({
                where: { id: gigId } // How do i use cascade so teh gigTier also deletes and teh bulk one too
            });

            if (!gig) {
                console.error(`This gig with id: ${gigId} doesn't exist in db`);
                throw new Error("This gig doesn't Exist bro");
            }
             // Validation is gig creator the current user who wanna deletes it?
            const sellerProfile = await prisma.sellerProfile.findUnique({
                where: { userId: userId } // How do i use cascade so teh gigTier also deletes and teh bulk one too
            });

             if(!sellerProfile) { 
                throw new Error("Seller profile not found. Only registered sellers can modify gigs.");
            }

            if(sellerProfile.id !== gig.sellerId) {
                throw new Error("You can delete this gig as you're not teh creator!!!")
            }
            return await prisma.gig.delete({
                where: { id: gigId }
            })
         } catch(error) {
            console.error("Error in GigService.initiateGigCreation:", error);
            throw error; 
        }
    }

    static async listGigs(
        userId: string,
        page: number = 1,
        limit: number  =30,
        categoryId?:string
    ): Promise<any> {
        try {
            
            const skip = (page - 1) * limit;

            // basic filter (only ACTIVE GIGS)
            const whereClause: any = { state: "ACTIVE" };
            if(categoryId) {
                whereClause.categoryId = categoryId;
            }

            // Then we fect many gigs with relational pricing data // 2. Single database trip to fetch exactly what we need
            const gigs = await prisma.gig.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" }, // Default chronological order for now
                include: {
                    tiers: {
                        include: { quantityPricing: true }
                    },
                    seller: {
                        select: { userId: true, rating: true, totalReviews: true }
                    }
                }
            });
            /// count the toal for frontend pagination math
            const totalGigs = await prisma.gig.count({ where: whereClause });

            return {
                data: gigs,
                meta: {
                    total: totalGigs,
                    page,
                    limit,
                    totalPages: Math.ceil(totalGigs / limit)
                }
            }
        } catch(error: any) {
            console.error("ERROR fetching MULTIPLE gigs bro:", error);
            throw error;
        }
    }
}