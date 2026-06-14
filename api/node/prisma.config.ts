// api/node/prisma.config.ts
import dotenv from "dotenv";
import path from "path";
import { defineConfig, env } from "prisma/config";

// Force dotenv to look at root dir
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"), 
  },
});