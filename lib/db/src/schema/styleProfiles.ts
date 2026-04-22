import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const styleProfilesTable = pgTable("style_profiles", {
  id: serial("id").primaryKey(),
  gender: text("gender").notNull(),
  height: text("height").notNull(),
  topSize: text("top_size").notNull(),
  bottomSize: text("bottom_size").notNull(),
  shoeSize: text("shoe_size").notNull(),
  preferredFabrics: text("preferred_fabrics"),
  avoidItems: text("avoid_items"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStyleProfileSchema = createInsertSchema(styleProfilesTable).omit({ id: true, updatedAt: true });
export type InsertStyleProfile = z.infer<typeof insertStyleProfileSchema>;
export type StyleProfile = typeof styleProfilesTable.$inferSelect;
