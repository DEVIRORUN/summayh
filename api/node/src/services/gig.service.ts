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
interface BulkPricingBand {
    quantity: number;
    totalPrice: number;
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
       try {
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
       } catch(error: any) {
            console.error("Error in GigService.updateGigData:", error);
            throw error;
       }
    }
    static async deleteGig(userId: string, gigId: string): Promise<any> {
        try {
            // Validation is gig creator the current user who wanna deletes it?
            const gig = await prisma.gig.findUnique({
                where: { id: gigId }, 
                include: { seller: true }
            });

            if (!gig) {
                console.error(`This gig with id: ${gigId} doesn't exist in db`);
                throw new Error("This gig doesn't Exist bro");
            }
            // Validation is gig creator the current user who wanna deletes it?
            const sellerProfile = await prisma.sellerProfile.findUnique({
                where: { userId: userId } 
            });
            if(!sellerProfile) { 
                throw new Error("Seller profile not found. Only registered sellers can modify gigs.");
            }
            if(sellerProfile.id !== gig.sellerId) {
                throw new Error("You can delete this gig as you're not the creator!!!")
            }
            return await prisma.gig.update({
                where: { id: gigId },
                data: { state: "INACTIVE" }
            });
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
    static async getAllGigsBySeller(
        userId: string,
        page: number = 1,
        limit: number = 15
    ): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const gigs = await prisma.gig.findMany({
                where: { seller: { userId } },
                skip: skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    tiers: {
                        include: { quantityPricing: true }
                    },
                    seller: {
                        select: { userId: true, sellerUsername: true, rating: true, totalReviews: true }
                    }
                }
            });

            // Count the num of Gigs provided
            const totalGigs = await prisma.gig.count({ where: { seller: { userId } } });
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
            console.error("ERROR fetching MULTIPLE gigs by seller bro: ", error)
            throw error;
        }
    }
    static async addBulkingPricing(
        gigId: string,
        tierId: string,
        userId: string,
        bands: BulkPricingBand[]
    ): Promise<any> {
        try {
            // Validate that the gig belongs to the user
            const gig = await prisma.gig.findUnique({
                where: { id: gigId },
                include: {
                    seller: true,
                    tiers: { where: { id: tierId }, }
                }
            });
            if (!gig) {
                throw new Error("Gig not found");
            }
            if (gig.seller.userId !== userId) {
                throw new Error("Unauthorized. You can only edit your own gigs.");
            }
            if (gig.tiers.length === 0) throw new Error("Tier not found on this gig.");

            const tier  = gig.tiers[0];
            
            // 2. Validate each band
            for (const band of bands) {
                if (!Number.isInteger(band.quantity) || band.quantity < 2) {
                    throw new Error(`Invalid quantity ${band.quantity} - bulk pricing must be for 2 or more units.`)
                }
                if (band.totalPrice <= 0) {
                    throw new Error(`Invalid totalPrice for quantity ${band.quantity} - must be greater than 0.`);
                }
                // Sanity check: bulk price should be less than quantity x unit price
                // (otherwise why offer it - its's not actually a discount)
                const unitTotal = tier.price * band.quantity;
                if (band.totalPrice >= unitTotal) {
                    throw new Error(
                        `Quantity ${band.quantity}: totalPrice (₦${band.totalPrice}) must be less than ` +
                        `${band.quantity} x unit price (₦${unitTotal}). Bulk price should offer a discount`
                    );
                    
                }
            }

            // 3. Check for suplicate quantities within the submitted bands
            const quantities = bands.map(b => b.quantity);
            const uniqueQuantities = new Set(quantities);
            if (uniqueQuantities.size !== quantities.length) {
                throw new Error("Duplicate quantities is in your submission - each quantity must appear only once");
            }

            // 4. Upsert each band - update if quantity already exists, create if new
            // This lets sellers call this andpoint multiple ties without duplicating rows
            const results = await prisma.$transaction(
                bands.map(band => 
                    prisma.tierQuantityPrice.upsert({
                        where: {
                            gigTierId_quantity: {
                                gigTierId: tierId,
                                quantity: band.quantity
                            }
                        },
                        update: { totalPrice: band.totalPrice },
                        create: {
                            gigTierId: tierId,
                            quantity: band.quantity,
                            totalPrice: band.totalPrice,
                            discountPercentage: Math.round(((tier.price * band.quantity) - band.totalPrice)/tier.price * band.quantity)
                        }
                    })
                )
            );

            return {
                label: tier.label,
                tierId,
                gigId,
                bandsAdded: results.length,
                pricing: results
            }
        } catch(error: any) {
            console.error("ERROR adding BULK PRICING:", error);
            throw error;
        }
    }
    static async getBulkPricing(gigId: string, tierId: string): Promise<any> {
        try {
            const tier = await prisma.gigTier.findUnique({ where: { id: tierId} });

            if (!tier) {
                console.error(`Tier with id ${tierId} not found for gig ${gigId}`)
            }

            const bulkPricing = await prisma.tierQuantityPrice.findMany({
                where: { gigTierId: tierId }
            })

            return {
                data: bulkPricing,
                meta: {
                    label: tier?.label,
                    tierId,
                    gigId,
                    totalBands: Math.ceil(bulkPricing.length),
                    tier: tier
                }
            }
        } catch(error: any) {
            console.error("ERROR fetching BULK PRICING: ", error)
            throw error;
        }
    }
}