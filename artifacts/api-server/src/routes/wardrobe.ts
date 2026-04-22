import { Router, type IRouter } from "express";
import { db, wardrobeItemsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateWardrobeItemBody,
  UpdateWardrobeItemBody,
  UpdateWardrobeItemParams,
  DeleteWardrobeItemParams,
  ListWardrobeItemsResponse,
  UpdateWardrobeItemResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wardrobe/stats", async (_req, res): Promise<void> => {
  const items = await db.select().from(wardrobeItemsTable);

  const byCategory: Record<string, number> = {};
  const bySeason: Record<string, number> = {};

  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    bySeason[item.season] = (bySeason[item.season] ?? 0) + 1;
  }

  res.json({ totalItems: items.length, byCategory, bySeason });
});

router.get("/wardrobe", async (_req, res): Promise<void> => {
  const items = await db.select().from(wardrobeItemsTable).orderBy(wardrobeItemsTable.createdAt);
  res.json(ListWardrobeItemsResponse.parse(items));
});

router.post("/wardrobe", async (req, res): Promise<void> => {
  const parsed = CreateWardrobeItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db.insert(wardrobeItemsTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.patch("/wardrobe/:id", async (req, res): Promise<void> => {
  const params = UpdateWardrobeItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateWardrobeItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(wardrobeItemsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(wardrobeItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Wardrobe item not found" });
    return;
  }

  res.json(UpdateWardrobeItemResponse.parse(item));
});

router.delete("/wardrobe/:id", async (req, res): Promise<void> => {
  const params = DeleteWardrobeItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(wardrobeItemsTable)
    .where(eq(wardrobeItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Wardrobe item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
