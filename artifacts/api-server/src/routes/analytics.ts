import { Router } from "express";
import { db } from "@workspace/db";
import { analyticsEvents } from "@workspace/db/schema";
import { sql, gte, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// ─── Seed helpers ──────────────────────────────────────────────────────────────
// Generates ~900 deterministic historical events across the last 30 days.
// Called once on first dashboard load when the table has < 10 rows.

type SeedRow = typeof analyticsEvents.$inferInsert;

function daysAgo(n: number, hh = 9, mm = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hh, mm, 0, 0);
  return d;
}

function generateSeed(): SeedRow[] {
  const rows: SeedRow[] = [];

  // 35 demo users, first seen between 30 and 2 days ago.
  // Deterministic: user N's first day = 30 - floor(N * 0.8).
  // Day-1 retention: users 1-24 return on their day+1 (69%).
  // Day-7 retention: users 1-12 return on their day+7 (34%).
  for (let u = 1; u <= 35; u++) {
    const uid      = `demo_${String(u).padStart(3, "0")}`;
    const firstDay = Math.min(30, Math.max(2, 30 - Math.floor(u * 0.8)));
    const sess0    = `s${u}_0`;

    // First open
    rows.push({ event: "app_open",      userId: uid, sessionId: sess0, createdAt: daysAgo(firstDay, 8, u % 60) });
    rows.push({ event: "outfit_viewed", userId: uid, sessionId: sess0, createdAt: daysAgo(firstDay, 8, u % 60 + 2) });
    if (u % 10 !== 0) {
      rows.push({ event: "outfit_accepted", userId: uid, sessionId: sess0, createdAt: daysAgo(firstDay, 8, u % 60 + 3) });
    }

    // Day 1 retention: users 1-24
    if (u <= 24 && firstDay >= 2) {
      const sess1 = `s${u}_1`;
      rows.push({ event: "app_open",      userId: uid, sessionId: sess1, createdAt: daysAgo(firstDay - 1, 9, u % 60) });
      rows.push({ event: "outfit_viewed", userId: uid, sessionId: sess1, createdAt: daysAgo(firstDay - 1, 9, u % 60 + 1) });
      if (u % 5 !== 0) {
        rows.push({ event: "outfit_accepted", userId: uid, sessionId: sess1, createdAt: daysAgo(firstDay - 1, 9, u % 60 + 2) });
      }
      if (u % 3 === 0) {
        rows.push({ event: "reshuffle_used", userId: uid, sessionId: sess1, createdAt: daysAgo(firstDay - 1, 9, u % 60 + 5) });
      }
    }

    // Day 7 retention: users 1-12
    if (u <= 12 && firstDay >= 8) {
      const sess7 = `s${u}_7`;
      rows.push({ event: "app_open",      userId: uid, sessionId: sess7, createdAt: daysAgo(firstDay - 7, 10, u % 60) });
      rows.push({ event: "outfit_viewed", userId: uid, sessionId: sess7, createdAt: daysAgo(firstDay - 7, 10, u % 60 + 2) });
      if (u % 4 !== 0) {
        rows.push({ event: "outfit_accepted", userId: uid, sessionId: sess7, createdAt: daysAgo(firstDay - 7, 10, u % 60 + 3) });
      }
    }

    // Mid-period activity (sprinkled opens over the past 2 weeks)
    for (let d = Math.min(firstDay - 2, 13); d >= 1; d -= 3) {
      if ((u + d) % 3 === 0) continue;
      const sessM = `s${u}_m${d}`;
      rows.push({ event: "app_open",      userId: uid, sessionId: sessM, createdAt: daysAgo(d, 11, (u * d) % 60) });
      rows.push({ event: "outfit_viewed", userId: uid, sessionId: sessM, createdAt: daysAgo(d, 11, (u * d) % 60 + 2) });
      if ((u + d) % 5 !== 0) {
        rows.push({ event: "outfit_accepted", userId: uid, sessionId: sessM, createdAt: daysAgo(d, 11, (u * d) % 60 + 3) });
      }
    }

    // item_added — first 22 users added an item early on
    if (u <= 22 && firstDay >= 3) {
      rows.push({ event: "item_added", userId: uid, sessionId: `s${u}_add`, createdAt: daysAgo(firstDay - 2, 14, u % 60) });
    }

    // purchase_suggestion_shown — every 4th user
    if (u % 4 === 0 && firstDay >= 4) {
      const sp = daysAgo(Math.min(firstDay - 3, 5), 15, u % 60);
      rows.push({ event: "purchase_suggestion_shown", userId: uid, sessionId: `s${u}_sp`, createdAt: sp });
      // purchase_clicked — every other of those
      if (u % 8 === 0) {
        rows.push({ event: "purchase_clicked", userId: uid, sessionId: `s${u}_sp`, createdAt: new Date(sp.getTime() + 8_000) });
      }
    }
  }

  return rows;
}

// ─── POST /api/analytics/event ────────────────────────────────────────────────

router.post("/analytics/event", async (req, res) => {
  const { event, userId, sessionId, metadata } = req.body as {
    event: string; userId: string; sessionId: string; metadata?: Record<string, unknown>;
  };

  if (!event || !userId || !sessionId) {
    res.status(400).json({ error: "event, userId, sessionId required" });
    return;
  }

  try {
    await db.insert(analyticsEvents).values({ event, userId, sessionId, metadata: metadata ?? null });
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to insert analytics event");
    res.status(500).json({ error: "internal" });
  }
});

// ─── GET /api/analytics/dashboard ────────────────────────────────────────────

router.get("/analytics/dashboard", async (req, res) => {
  try {
    // Auto-seed if table is empty
    const [{ n }] = await db
      .select({ n: count() })
      .from(analyticsEvents);

    if (Number(n) < 10) {
      logger.info("Seeding analytics_events with demo data");
      const rows = generateSeed();
      // batch insert in chunks of 200
      for (let i = 0; i < rows.length; i += 200) {
        await db.insert(analyticsEvents).values(rows.slice(i, i + 200));
      }
    }

    // ── Day-1 retention ──────────────────────────────────────────────────────
    const d1 = await db.execute<{ total: string; returned: string }>(sql`
      WITH cohort AS (
        SELECT user_id, MIN(created_at)::date AS first_date
        FROM analytics_events
        WHERE event = 'app_open'
        GROUP BY user_id
        HAVING MIN(created_at)::date <= CURRENT_DATE - 2
      ),
      retained AS (
        SELECT DISTINCT c.user_id
        FROM cohort c
        JOIN analytics_events e
          ON e.user_id = c.user_id
         AND e.created_at::date = c.first_date + 1
      )
      SELECT COUNT(*)::text AS total,
             (SELECT COUNT(*)::text FROM retained) AS returned
      FROM cohort
    `);

    const d1Total    = Number(d1.rows[0]?.total    ?? 0);
    const d1Returned = Number(d1.rows[0]?.returned ?? 0);
    const day1Retention = d1Total > 0 ? Math.round((d1Returned / d1Total) * 100) : 0;

    // ── Day-7 retention ──────────────────────────────────────────────────────
    const d7 = await db.execute<{ total: string; returned: string }>(sql`
      WITH cohort AS (
        SELECT user_id, MIN(created_at)::date AS first_date
        FROM analytics_events
        WHERE event = 'app_open'
        GROUP BY user_id
        HAVING MIN(created_at)::date <= CURRENT_DATE - 8
      ),
      retained AS (
        SELECT DISTINCT c.user_id
        FROM cohort c
        JOIN analytics_events e
          ON e.user_id = c.user_id
         AND e.created_at::date BETWEEN c.first_date + 7 AND c.first_date + 8
      )
      SELECT COUNT(*)::text AS total,
             (SELECT COUNT(*)::text FROM retained) AS returned
      FROM cohort
    `);

    const d7Total    = Number(d7.rows[0]?.total    ?? 0);
    const d7Returned = Number(d7.rows[0]?.returned ?? 0);
    const day7Retention = d7Total > 0 ? Math.round((d7Returned / d7Total) * 100) : 0;

    // ── DAU (last 24 h) ───────────────────────────────────────────────────────
    const [dauRow] = await db
      .select({ n: count() })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, new Date(Date.now() - 86_400_000)));
    const dau = Number(dauRow?.n ?? 0);

    // ── Outfit acceptance rate ────────────────────────────────────────────────
    const acceptRate = await db.execute<{ viewed: string; accepted: string }>(sql`
      SELECT
        COUNT(*) FILTER (WHERE event = 'outfit_viewed')   ::text AS viewed,
        COUNT(*) FILTER (WHERE event = 'outfit_accepted') ::text AS accepted
      FROM analytics_events
      WHERE event IN ('outfit_viewed', 'outfit_accepted')
    `);
    const viewed   = Number(acceptRate.rows[0]?.viewed   ?? 0);
    const accepted = Number(acceptRate.rows[0]?.accepted ?? 0);
    const outfitAcceptanceRate = viewed > 0 ? Math.round((accepted / viewed) * 100) : 0;

    // ── Daily active users — last 14 days ─────────────────────────────────────
    const dauHistory = await db.execute<{ date: string; dau: string }>(sql`
      SELECT
        created_at::date::text AS date,
        COUNT(DISTINCT user_id)::text AS dau
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE - 14
      GROUP BY created_at::date
      ORDER BY date
    `);

    // ── Event counts (totals) ─────────────────────────────────────────────────
    const eventCounts = await db.execute<{ event: string; n: string }>(sql`
      SELECT event, COUNT(*)::text AS n
      FROM analytics_events
      GROUP BY event
      ORDER BY n DESC
    `);

    // ── Recent events ─────────────────────────────────────────────────────────
    const recent = await db.execute<{
      event: string; user_id: string; created_at: string; metadata: unknown;
    }>(sql`
      SELECT event, user_id, created_at, metadata
      FROM analytics_events
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      day1Retention,
      day7Retention,
      dau,
      outfitAcceptanceRate,
      cohortSizes: { d1: d1Total, d7: d7Total },
      dauHistory: dauHistory.rows.map((r) => ({ date: r.date, dau: Number(r.dau) })),
      eventCounts: eventCounts.rows.map((r) => ({ event: r.event, n: Number(r.n) })),
      recentEvents: recent.rows,
      totalEvents: Number(n),
    });
  } catch (err) {
    req.log.error({ err }, "Analytics dashboard error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
