"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const prisma_1 = require("../utils/prisma");
class CategoryService {
    static async getTrendingCategories(limit = 15) {
        try {
            console.log(new Date(), "-> [Category Service]: Hit");
            const trendingCategories = await prisma_1.prisma.order.groupBy({
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
        }
        catch (error) {
            console.error("ERROR fetching TOP Categories bro:", error);
            throw error;
        }
    }
    static async getCategoryTree() {
        try {
            const categories = await prisma_1.prisma.category.findMany({
                where: { parentId: null }, // main top-levels
                include: {
                    children: {
                        orderBy: { name: "asc" }
                    }
                },
                orderBy: { name: "asc" }
            });
            return categories;
        }
        catch (err) {
            // throw new Error("Failed to load category tree. Please try again later.")
            throw err;
        }
    }
}
exports.CategoryService = CategoryService;
