"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEduEmail = void 0;
const schools_json_1 = __importDefault(require("../../../frontend/src/data/schools.json"));
const ALL_SCHOOLS = [...schools_json_1.default.edu_ng, ...schools_json_1.default.sch_ng];
const ALLOWED_SCHOOL_DOMAINS = new Set(ALL_SCHOOLS.map((s) => s.value.toLowerCase()));
const isValidEduEmail = (email) => {
    if (!email || !email.includes("@"))
        return false;
    const domain = email.split("@")[1].toLowerCase();
    return ALLOWED_SCHOOL_DOMAINS.has(domain);
};
exports.isValidEduEmail = isValidEduEmail;
