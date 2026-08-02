import { prisma } from "../utils/prisma";

export class CategoryService {
  static async getTrendingCategories(limit: number = 15): Promise<any> {
    try {
      console.log(new Date(), "-> [Category Service]: Hit");
      const trendingCategories = await prisma.order.groupBy({
        by: ["categoryId"],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          status: "COMPLETED",
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: limit,
      });

      return trendingCategories;
    } catch (error: any) {
      console.error("ERROR fetching TOP Categories bro:", error);
      throw error;
    }
  }
  static async getCategoryTree(): Promise<any> {
    try {
      const categories = await prisma.category.findMany({
        where: { parentId: null }, // main top-levels
        include: {
          children: {
            orderBy: { name: "asc" }
          }
        },
          orderBy: { name: "asc" }
      });

      return categories;
    } catch(err: any) {
      // throw new Error("Failed to load category tree. Please try again later.")
      throw err;
    }
  }
}
