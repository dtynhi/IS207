import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../../../../shared/response/response";
import { getGeneralSetting, upsertGeneralSetting } from "../../setting.service";

const router = Router();

router.get("/admin/settings/general", async (_req, res, next) => {
  try {
    const setting = await getGeneralSetting();
    return sendSuccess(res, setting);
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/settings/general", async (req, res, next) => {
  try {
    const payload = z
      .object({
        websiteName: z.string().min(1),
        logo: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        copyright: z.string().optional(),
      })
      .parse(req.body);

    const setting = await upsertGeneralSetting(payload);
    return sendSuccess(res, setting);
  } catch (error) {
    next(error);
  }
});

export default router;
