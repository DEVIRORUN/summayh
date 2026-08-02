import { Response, Request } from "express";
import { CategoryService } from "../services/category.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export class CategoryController {
  static async getTrendingGigs(req: Request, res: Response): Promise<any> {
    try {
      const limit = 15;

      const results = await CategoryService.getTrendingCategories(limit);

      console.log(new Date(), "-> [Category Service]: Successfully fetched");
      return res.status(201).json({
        message: "Fetched top Categories succesfully",
        results,
      });
    } catch (error: any) {
      console.error(
        new Date(),
        "-> [Category Controller]: Failed to fetch top trending Categories",
      );
      return res.status(404).json({ message: "Top Categories not found" });
    }
  }
  static async getCategoryTree(req: Request, res: Response): Promise<any> {
    try {
      const categories = await CategoryService.getCategoryTree();

      return res.status(200).json({
        message: "Categories fetched succesfully.",
        data: categories
      });
    } catch(error: any) {
      console.log("ERROR FETCHING CATEGORIES: ", error);
      const handled = handlePrismaError(error, res);
      if (handled) return;
      return res.status(500).json({ message: "Failed to fetch categories." })
    }
  }
}
