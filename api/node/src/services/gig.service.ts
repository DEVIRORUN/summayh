// TALKING TO PRISMA and some shii

import { prisma } from "../utils/prisma";

export class GigService {
    /**
     * For creation of gig
     * Linking to prisma db
     */

    static async initiateGigCreation(
        title: string,
        description: string,
        basePrice: number,
        categoryId: string,
        sellerId: string
    ): Promise<any> {
        try {
            const newgig = await prisma.gig.create({
                data: {
                    title,
                    description,
                    basePrice,
                    seller: {
                        connect: { id: sellerId }
                    },
                    category: {
                        connect: { id: categoryId }
                    }
                }
            });

            return newgig;
       } catch(error) {
            console.error("Error in GigService.initiateGigCreation:", error);
            throw error; 
        }
    }
}