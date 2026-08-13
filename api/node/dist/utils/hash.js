"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashNin = hashNin;
const crypto_1 = __importDefault(require("crypto"));
function hashNin(nin) {
    const normalized = nin.replace(/\s+/g, "");
    return crypto_1.default.createHash("sha256").update(normalized).digest("hex");
}
