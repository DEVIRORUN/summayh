"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = handlePrismaError;
// src/utils/prismaErrorHandler.ts
const prisma_1 = require("../../generated/prisma"); // adjust path if your generated client lives elsewhere
/**
 * Maps known Prisma error codes to clean HTTP responses.
 * Returns true if it handled the error (so caller knows not to fall through to a generic 500).
 */
function handlePrismaError(error, res) {
    if (error instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2025": {
                // Record required for a relation/operation was not found
                // meta.modelName tells you which model Prisma was looking in
                const modelName = error.meta?.modelName || "Record";
                res.status(404).json({
                    message: `${modelName} not found. Please check the provided id(s) and try again.`
                });
                return true;
            }
            case "P2002": {
                // Unique constraint violation
                const target = error.meta?.target || "field";
                res.status(409).json({
                    message: `A record with this ${Array.isArray(target) ? target.join(", ") : target} already exists.`
                });
                return true;
            }
            case "P2003": {
                // Foreign key constraint failed
                const field = error.meta?.field_name || "related record";
                res.status(400).json({
                    message: `Invalid reference: ${field} does not point to an existing record.`
                });
                return true;
            }
            case "P2014": {
                // Required relation violation
                res.status(400).json({
                    message: "This action would violate a required relationship between records."
                });
                return true;
            }
            default: {
                // Unmapped known Prisma error - still don't leak internals
                console.error(`Unhandled Prisma error code: ${error.code}`, error);
                res.status(400).json({
                    message: "A database error occurred while processing your request."
                });
                return true;
            }
        }
    }
    if (error instanceof prisma_1.Prisma.PrismaClientValidationError) {
        // Schema/shape mismatch - usually a bug in our own code, not user input
        console.error("Prisma validation error:", error.message);
        res.status(400).json({
            message: "Invalid data format sent to the database."
        });
        return true;
    }
    // Not a Prisma error - let the caller handle it (e.g. generic 500)
    return false;
}
