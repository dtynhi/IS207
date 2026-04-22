import { ensureDefaultSeedData, getSeedSummary, overwriteDefaultSeedData } from "../src/infrastructure/db/default-seed";
import { prisma } from "../src/infrastructure/db/prisma.client";

async function main() {
  const isForce = process.argv.includes("--force") || process.argv.includes("-f");
  const result = isForce ? await overwriteDefaultSeedData() : await ensureDefaultSeedData();

  if (result.seeded) {
    console.log("[prisma:seed] da nap du lieu mac dinh thanh cong");
  } else {
    console.log("[prisma:seed] bo qua seed mac dinh vi db da co du lieu");
  }

  console.log("[prisma:seed] thong tin seed:", getSeedSummary());
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("[prisma:seed] that bai:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
