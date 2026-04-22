import { Router, type IRouter } from "express";
import { db, styleProfilesTable } from "@workspace/db";
import { UpsertProfileBody, GetProfileResponse, UpsertProfileResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/profile", async (_req, res): Promise<void> => {
  const [profile] = await db.select().from(styleProfilesTable).limit(1);

  if (!profile) {
    res.status(404).json({ error: "No profile found" });
    return;
  }

  res.json(GetProfileResponse.parse(profile));
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpsertProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(styleProfilesTable).limit(1);

  let profile;
  if (existing.length > 0) {
    const [updated] = await db
      .update(styleProfilesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .returning();
    profile = updated;
  } else {
    const [created] = await db
      .insert(styleProfilesTable)
      .values(parsed.data)
      .returning();
    profile = created;
  }

  res.json(UpsertProfileResponse.parse(profile));
});

export default router;
