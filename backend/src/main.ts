import app from "./app";
import { ensureDefaultSeedData, getSeedSummary } from "./infrastructure/db/default-seed";

const port = Number(process.env.PORT || 4000);

const bootstrap = async () => {
  const seedResult = await ensureDefaultSeedData();

  app.listen(port, () => {
    console.log(`[backend] listening on http://localhost:${port}`);
    if (seedResult.seeded) {
      console.log("[backend] da nap du lieu mac dinh tieng Viet vao PostgreSQL");
    } else {
      console.log("[backend] bo qua seed mac dinh vi db da co du lieu");
    }
    console.log("[backend] thong tin seed:", getSeedSummary());
  });
};

bootstrap().catch((error) => {
  console.error("[backend] khoi dong that bai:", error);
  process.exit(1);
});
