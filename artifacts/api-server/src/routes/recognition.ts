import { Router } from "express";
import { recognitionPrompt, recognitionSchema, parseRecognition, validatePhotos } from "../services/clothingRecognition";

const router = Router();
// Basic abuse protection; authenticated per-user limits are still required for public launch.
const requests = new Map<string, { count: number; expires: number }>();
let active = 0;
router.post("/wardrobe/recognize", async (req, res) => {
  let photos: ReturnType<typeof validatePhotos>;
  try { photos = validatePhotos(req.body); }
  catch (error) { res.status(400).json({ error: (error as Error).message }); return; }
  const now = Date.now();
  for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
  const key = req.ip || "unknown";
  const usage = requests.get(key) || { count: 0, expires: now + 60_000 };
  if (usage.count >= 10 || active >= 4) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Photo recognition is busy. Please try again in a minute." }); return;
  }
  requests.set(key, { ...usage, count: usage.count + 1 });
  active++;
  try {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "high" } }> = [];
    for (const [label, url] of Object.entries(photos)) {
      if (!url || !["front", "back", "tag"].includes(label)) continue;
      content.push({ type: "text", text: `${label} photo:` }, { type: "image_url", image_url: { url, detail: "high" } });
    }
    const response = await openai.chat.completions.create({
      model: process.env.CLOTHING_VISION_MODEL || "gpt-5.4",
      messages: [{ role: "system", content: recognitionPrompt }, { role: "user", content }],
      response_format: { type: "json_schema", json_schema: { name: "clothing_recognition", strict: true, schema: recognitionSchema } },
      max_completion_tokens: 2500,
    }, { timeout: 45_000, maxRetries: 0 });
    const message = response.choices[0];
    if (message?.finish_reason !== "stop" || message.message.refusal || !message.message.content) throw new Error("Incomplete recognition");
    res.json(parseRecognition(JSON.parse(message.message.content), Boolean(photos.tag)));
  } catch {
    // Do not log photographs, label contents, provider payloads or credentials.
    res.status(503).json({ error: "We couldn't analyse this photo. Try again or enter the details yourself." });
  } finally { active--; }
});
export default router;
