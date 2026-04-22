import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stylistSessionsTable = pgTable("stylist_sessions", {
  id: serial("id").primaryKey(),
  occasion: text("occasion").notNull(),
  season: text("season").notNull(),
  location: text("location").notNull(),
  outfitsJson: text("outfits_json").notNull(),
  stylistsPick: text("stylists_pick").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStylistSessionSchema = createInsertSchema(stylistSessionsTable).omit({ id: true, createdAt: true });
export type InsertStylistSession = z.infer<typeof insertStylistSessionSchema>;
export type StylistSession = typeof stylistSessionsTable.$inferSelect;
