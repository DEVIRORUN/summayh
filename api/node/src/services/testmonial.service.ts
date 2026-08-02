import { prisma } from "../utils/prisma";

interface CreateTestimonialInput {
  sellerId: string;
  buyerId: string;
  reviewerTitle?: string;
  text: string;
  rating: number;
}

export class TestimonialService {
  static async createTestimonial(data: CreateTestimonialInput) {
    return await prisma.testimonial.create({
      data,
    });
  }

  static async getSellerTestimonials(userId: string) {
    console.log(new Date(), "-> [Testimonial]: Hit!");

    const seller = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
      },
    });

    if (!seller) {
      throw new Error("Seller Profile not found");
    }

    return await prisma.testimonial.findMany({
      where: { sellerId: seller.id },
      include: {
        buyer: {
          select: {
            name: true,
            email: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
