import { PrismaClient } from "@prisma/client";
import { triggerSeedUpdate } from "./sync-seed";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

prisma.$use(async (params, next) => {
  const result = await next(params);
  
  const modelsToWatch = ["Product", "ProductCategory", "User"];
  const actionsToWatch = ["create", "update", "delete", "upsert", "createMany", "updateMany", "deleteMany"];
  
  if (params.model && modelsToWatch.includes(params.model) && actionsToWatch.includes(params.action)) {
    triggerSeedUpdate();
  }
  
  return result;
});

