import app from "./app";
import { autoCompleteDeliveredOrders } from "./domains/order/order.service";
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

  const runAutoComplete = async () => {
    try {
      await autoCompleteDeliveredOrders();
    } catch (error) {
      console.error("[backend] auto-complete orders failed:", error);
    }
  };

  runAutoComplete();
  setInterval(runAutoComplete, 60 * 60 * 1000);
};

bootstrap().catch((error) => {
  console.error("[backend] khoi dong that bai:", error);
  process.exit(1);
});
