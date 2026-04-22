import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wardrobeItemsTable = pgTable("wardrobe_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  colour: text("colour").notNull(),
  season: text("season").notNull(),
  brand: text("brand"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWardrobeItemSchema = createInsertSchema(wardrobeItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWardrobeItem = z.infer<typeof insertWardrobeItemSchema>;
export type WardrobeItem = typeof wardrobeItemsTable.$inferSelect;
