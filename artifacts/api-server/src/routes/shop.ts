import { Router } from "express"

const router = Router()

router.get("/recommendations", async (_req, res) => {
  res.json({ wardrobeGaps: [], recommendedProducts: [] })
})

export default router
