import { prisma } from "./src/infrastructure/db/prisma.client";

async function main() {
  const cats = await prisma.productCategory.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  console.log(cats.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    deleted: c.deleted,
    position: c.position,
  })));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
