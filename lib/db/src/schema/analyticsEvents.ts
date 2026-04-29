import { pgTable, serial, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id:        serial("id").primaryKey(),
    event:     varchar("event",      { length: 64  }).notNull(),
    userId:    varchar("user_id",    { length: 64  }).notNull(),
    sessionId: varchar("session_id", { length: 64  }).notNull(),
    metadata:  jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("ae_event_idx").on(t.event),
    index("ae_user_idx").on(t.userId),
    index("ae_created_idx").on(t.createdAt),
  ],
);

export type AnalyticsEvent     = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
