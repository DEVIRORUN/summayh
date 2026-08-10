"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const category_service_1 = require("../services/category.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class CategoryController {
    static async getTrendingGigs(req, res) {
        try {
            const limit = 15;
            const results = await category_service_1.CategoryService.getTrendingCategories(limit);
            console.log(new Date(), "-> [Category Service]: Successfully fetched");
            return res.status(201).json({
                message: "Fetched top Categories succesfully",
                results,
            });
        }
        catch (error) {
            console.error(new Date(), "-> [Category Controller]: Failed to fetch top trending Categories");
            return res.status(404).json({ message: "Top Categories not found" });
        }
    }
    static async getCategoryTree(req, res) {
        try {
            const categories = await category_service_1.CategoryService.getCategoryTree();
            return res.status(200).json({
                message: "Categories fetched succesfully.",
                data: categories
            });
        }
        catch (error) {
            console.log("ERROR FETCHING CATEGORIES: ", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Failed to fetch categories." });
        }
    }
}
exports.CategoryController = CategoryController;
