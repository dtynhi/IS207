import { prisma } from "./src/infrastructure/db/prisma.client";

async function main() {
  const deletedCategories = await prisma.productCategory.findMany({
    where: { deleted: true },
  });

  for (const category of deletedCategories) {
    const updatedSlug = category.slug.includes(category.id) ? category.slug : `${category.slug}-${category.id}`;
    await prisma.productCategory.update({
      where: { id: category.id },
      data: { slug: updatedSlug },
    });
    console.log(`Updated deleted slug for ${category.id}: ${updatedSlug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
