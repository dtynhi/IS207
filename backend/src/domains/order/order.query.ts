import { z } from "zod";
import { extendBaseQueryParams } from "../../shared/query/extend-query.params";

export const orderQuerySchema = extendBaseQueryParams({
  status: z.enum(["pending_confirm", "ready_to_pick", "ready_to_ship", "delivered", "returned", "cancelled"]).optional(),
  assignedTo: z.string().trim().optional(),
});

export type OrderQueryParams = z.infer<typeof orderQuerySchema>;
