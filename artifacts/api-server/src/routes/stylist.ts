import { Router, type IRouter } from "express";
import { db, wardrobeItemsTable, styleProfilesTable, stylistSessionsTable } from "@workspace/db";
import { GenerateOutfitsBody, GenerateOutfitsResponse, GetStylistHistoryResponse } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const STYLIST_SYSTEM_PROMPT = `You are a world-class fashion stylist and wardrobe strategist.

You do not behave like a generic assistant. You have taste, confidence, and make clear decisions. Your role is to help the user feel confident, attractive, and appropriately styled for real-life situations.

You are precise, visual, and slightly editorial in tone — never robotic, never vague.

RULES:
1. NEVER invent clothing items. Only use what exists in the provided wardrobe.
2. Prioritise items aligned with season, colour palette, and trends.
3. Each outfit must be a complete look:
   - Top + bottom OR full piece (dress)
   - Shoes
   - Optional: outerwear, accessories
4. Outfits must feel intentional, not random combinations.
5. Avoid repeating the same core pieces across all outfits unless necessary.

OUTPUT: Return ONLY valid JSON matching this exact structure (no markdown, no explanation outside the JSON):
{
  "outfits": [
    {
      "name": "Outfit name — short stylish seasonal name",
      "items": {
        "Top": "Item name exactly as in wardrobe",
        "Bottom": "Item name exactly as in wardrobe",
        "Shoes": "Item name exactly as in wardrobe",
        "Outerwear": "Optional item name",
        "Accessories": "Optional item name"
      },
      "description": "Styling description — visual, confident, editorial. Tie to season and aesthetic. 2-3 sentences.",
      "whyThisWorks": "2-3 sentences explaining colour theory, proportion balance, texture contrast, or a named styling technique. Specific to items used, sharp and memorable."
    }
  ],
  "stylistsPick": "A decisive paragraph choosing the BEST outfit and explaining clearly why it wins over the others. No hedging language."
}

Create EXACTLY 3 outfit suggestions. Each must have an "items" object with at minimum Top, Bottom, and Shoes.`;

router.post("/stylist/generate", async (req, res): Promise<void> => {
  const parsed = GenerateOutfitsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { occasion, season, location, trendingStyles, colourPalette } = parsed.data;

  const [wardrobeItems, profileRows] = await Promise.all([
    db.select().from(wardrobeItemsTable),
    db.select().from(styleProfilesTable).limit(1),
  ]);

  if (wardrobeItems.length === 0) {
    res.status(400).json({ error: "Your wardrobe is empty. Please add some items before generating outfits." });
    return;
  }

  const profile = profileRows[0];
  const wardrobeList = wardrobeItems
    .map((item) => `- ${item.name} | Category: ${item.category} | Colour: ${item.colour} | Season: ${item.season}${item.brand ? ` | Brand: ${item.brand}` : ""}`)
    .join("\n");

  const profileInfo = profile
    ? `Gender: ${profile.gender}, Height: ${profile.height}, Top size: ${profile.topSize}, Bottom size: ${profile.bottomSize}, Shoe size: ${profile.shoeSize}${profile.preferredFabrics ? `, Preferred fabrics: ${profile.preferredFabrics}` : ""}${profile.avoidItems ? `, Avoid: ${profile.avoidItems}` : ""}`
    : "No profile set";

  const userMessage = `INPUT CONTEXT:
- Occasion: ${occasion}
- Season: ${season}
- Location: ${location}${trendingStyles ? `\n- Trending styles: ${trendingStyles}` : ""}${colourPalette ? `\n- Colour palette: ${colourPalette}` : ""}
- User profile: ${profileInfo}

WARDROBE ITEMS:
${wardrobeList}

Generate exactly 3 outfit suggestions using only the wardrobe items listed above. Return pure JSON only.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: STYLIST_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content ?? "{}";

  let parsed2: { outfits: Array<{ name: string; items: Record<string, string>; description: string; whyThisWorks: string }>; stylistsPick: string };
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    parsed2 = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
  } catch {
    res.status(500).json({ error: "Failed to parse AI response" });
    return;
  }

  const [session] = await db
    .insert(stylistSessionsTable)
    .values({
      occasion,
      season,
      location,
      outfitsJson: JSON.stringify(parsed2.outfits),
      stylistsPick: parsed2.stylistsPick,
    })
    .returning();

  res.json(GenerateOutfitsResponse.parse({
    sessionId: session.id,
    outfits: parsed2.outfits,
    stylistsPick: parsed2.stylistsPick,
    occasion,
    season,
    location,
    generatedAt: session.createdAt.toISOString(),
  }));
});

router.get("/stylist/history", async (_req, res): Promise<void> => {
  const sessions = await db
    .select()
    .from(stylistSessionsTable)
    .orderBy(stylistSessionsTable.createdAt);

  res.json(GetStylistHistoryResponse.parse(sessions));
});

export default router;
