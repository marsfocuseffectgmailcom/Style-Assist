import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Check, Camera, ImageIcon } from "lucide-react"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { wardrobeItems } from "../lib/mockData"
import { generateMonthPlan } from "../lib/outfitGenerator"
import { track } from "../hooks/useAnalytics"

// ─── Style chips ─────────────────────────────────────────────────────────────

const STYLE_CHIPS = [
  { id: "minimal", label: "Minimal" },
  { id: "casual", label: "Casual" },
  { id: "classic", label: "Classic" },
  { id: "smart", label: "Smart" },
  { id: "street", label: "Street" },
  { id: "edgy", label: "Edgy" },
]

// ─── Item categories ─────────────────────────────────────────────────────────

const CATEGORIES = ["Top", "Bottom", "Shoes", "Bag"]

// ─── Analysis messages (one per second) ──────────────────────────────────────

const ANALYSIS_MSGS = [
  "Looking at what you've got…",
  "Finding what works best…",
  "Your first outfit is ready.",
]

// ─── First outfit data ───────────────────────────────────────────────────────

const FIRST_OUTFIT = {
  name: "Clean & Classic",
  photos: [
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=75",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=75",
  ],
  reasons: {
    Top:       "Your top anchors the look. Everything else is kept clean and timeless.",
    Bottom:    "The trousers do the work here. Everything else stays calm.",
    Shoes:     "Shoes set the tone. This outfit builds quietly around yours.",
    Bag:       "The bag pulls it together. Clean, considered, confident.",
    _default:  "A sharp pairing built around what you already own. Ready for anything.",
  } as Record<string, string>,
}

// ─── Step type ───────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
//          splash  value  style  add   cat  analyse  outfit  confirm

// ─── Animation variants ───────────────────────────────────────────────────────

const fade = {
  enter:  { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit:   { opacity: 0, y: -6 },
}

const fadeTrans = { duration: 0.32, ease: [0.32, 0, 0.15, 1] as const }

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const navigate                          = useNavigate()
  const { bulkFill }                      = useTimelineOutfits()
  const { items: incomingItems }          = useIncomingItems()

  const [step,           setStep]         = useState<Step>(0)
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [itemImage,      setItemImage]    = useState<string | null>(null)
  const [category,       setCategory]    = useState<string | null>(null)
  const [analysisMsg,    setAnalysisMsg]  = useState(0)

  const fileInputRef   = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  function advance(to: Step) {
    setStep(to)
  }

  function toggleStyle(id: string) {
    setSelectedStyles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  // ── Step 0: splash auto-advance ────────────────────────────────────────────
  useEffect(() => {
    if (step !== 0) return
    const t = setTimeout(() => advance(1), 3000)
    return () => clearTimeout(t)
  }, [step])

  // ── Step 5: analyse auto-advance ──────────────────────────────────────────
  useEffect(() => {
    if (step !== 5) return
    // Fill timeline silently in the background
    const existing = new Set<string>()
    const outfits  = generateMonthPlan(wardrobeItems, incomingItems, existing).slice(0, 7)
    bulkFill(outfits)

    const t1 = setTimeout(() => setAnalysisMsg(1), 1000)
    const t2 = setTimeout(() => setAnalysisMsg(2), 2200)
    const t3 = setTimeout(() => advance(6),        3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [step])

  // ── Step 7: confirmation auto-navigate ────────────────────────────────────
  useEffect(() => {
    if (step !== 7) return
    const t = setTimeout(() => {
      track("onboarding_completed", {
        styles:   [...selectedStyles],
        category: category ?? "none",
      })
      navigate("/")
      onComplete()
    }, 1600)
    return () => clearTimeout(t)
  }, [step])

  // ── File input handler ────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setItemImage(url)
    advance(4)
  }

  function skipAddItem() {
    setItemImage(FIRST_OUTFIT.photos[0]) // use placeholder
    advance(4)
  }

  // ── Reason copy for first outfit ──────────────────────────────────────────
  const outfitReason = category
    ? (FIRST_OUTFIT.reasons[category] ?? FIRST_OUTFIT.reasons._default)
    : FIRST_OUTFIT.reasons._default

  // ── Step dots (steps 1-3 only) ────────────────────────────────────────────
  function StepDots({ active }: { active: number }) {
    return (
      <div className="flex justify-center gap-2 pb-8 pt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-[#3F6F73]" : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#141E2A]">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <AnimatePresence mode="wait">

        {/* ── Step 0: Splash ──────────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div
            key="splash"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col items-center justify-center px-8 text-center"
            onClick={() => advance(1)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#3F6F73] to-[#7FA9A3] shadow-[0_0_40px_rgba(63,111,115,0.4)]"
            >
              <Sparkles size={36} className="text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-[13px] font-semibold uppercase tracking-[0.15em] text-[#3F6F73]"
            >
              Style Assist
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[36px] font-extrabold leading-[40px] tracking-[-0.04em] text-[#F5F5F5]"
            >
              Your wardrobe,
              <br />
              <span className="bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] bg-clip-text text-transparent">
                sorted.
              </span>
            </motion.h1>
          </motion.div>
        )}

        {/* ── Step 1: Value prop ───────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div
            key="value"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col px-6 pt-20"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3F6F73]"
            >
              1 of 3
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-4 text-[34px] font-extrabold leading-[38px] tracking-[-0.04em] text-[#F5F5F5]"
            >
              Stop guessing
              <br />what to wear.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="text-[17px] leading-[26px] text-[#7B9BAA]"
            >
              We plan every outfit from what you already own. Sharp looks, zero effort, every day.
            </motion.p>

            <div className="flex-1" />

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              onClick={() => advance(2)}
              className="mb-10 flex h-14 w-full items-center justify-center rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
            >
              Get started
            </motion.button>

            <StepDots active={0} />
          </motion.div>
        )}

        {/* ── Step 2: Style pick ───────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div
            key="style"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col px-6 pt-20"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3F6F73]"
            >
              2 of 3
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-2 text-[34px] font-extrabold leading-[38px] tracking-[-0.04em] text-[#F5F5F5]"
            >
              Your style?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14 }}
              className="mb-6 text-[15px] text-[#6B8490]"
            >
              Pick up to 3
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              {STYLE_CHIPS.map((chip) => {
                const active = selectedStyles.has(chip.id)
                return (
                  <motion.button
                    key={chip.id}
                    onClick={() => toggleStyle(chip.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex h-[56px] items-center justify-center rounded-[16px] border text-[15px] font-semibold transition-colors ${
                      active
                        ? "border-[#3F6F73]/50 bg-gradient-to-br from-[#3F6F73]/15 to-[#7FA9A3]/10 text-[#F2F4F5]"
                        : "border-white/10 bg-[#2A3645] text-[#AABBC0]"
                    }`}
                  >
                    {chip.label}
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#3F6F73]"
                      >
                        <Check size={11} className="text-white" />
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </motion.div>

            <div className="flex-1" />

            <AnimatePresence>
              {selectedStyles.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={() => advance(3)}
                  className="mb-10 flex h-14 w-full items-center justify-center rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
                >
                  Continue
                </motion.button>
              )}
            </AnimatePresence>

            <StepDots active={1} />
          </motion.div>
        )}

        {/* ── Step 3: Add item ─────────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div
            key="add-item"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col px-6 pt-20"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3F6F73]"
            >
              3 of 3
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-2 text-[34px] font-extrabold leading-[38px] tracking-[-0.04em] text-[#F5F5F5]"
            >
              Add your
              <br />first item.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.14 }}
              className="mb-10 text-[17px] leading-[26px] text-[#7B9BAA]"
            >
              We'll build your first outfit around it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="space-y-3"
            >
              {/* Camera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full items-center gap-4 rounded-[18px] bg-[#3F6F73] px-5 py-4 text-left transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <Camera size={20} className="text-white" />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-white">Take a photo</p>
                  <p className="text-[12px] text-white/60">Open your camera</p>
                </div>
              </button>

              {/* Library */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-4 rounded-[18px] border border-white/10 bg-[#2A3645] px-5 py-4 text-left transition-[transform] duration-[160ms] active:scale-[0.97]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8">
                  <ImageIcon size={20} className="text-[#AABBC0]" />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-[#F2F4F5]">Choose from library</p>
                  <p className="text-[12px] text-[#6B8490]">Pick an existing photo</p>
                </div>
              </button>
            </motion.div>

            <div className="flex-1" />

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={skipAddItem}
              className="mb-10 text-center text-[13px] text-[#4D6A78] underline-offset-2 transition-opacity active:opacity-60"
            >
              Skip for now
            </motion.button>

            <StepDots active={2} />
          </motion.div>
        )}

        {/* ── Step 4: Category pick ────────────────────────────────────────── */}
        {step === 4 && (
          <motion.div
            key="category"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col"
          >
            {/* Item image preview (top half) */}
            <div className="relative h-[42%] w-full overflow-hidden bg-[#1A2535]">
              {itemImage && (
                <img
                  src={itemImage}
                  alt="Your item"
                  className="h-full w-full object-cover"
                  style={{ filter: "brightness(0.85)" }}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#141E2A] to-transparent" />
            </div>

            {/* Category selection */}
            <div className="flex flex-1 flex-col px-6 pt-6">
              <h2 className="mb-1 text-[26px] font-extrabold leading-[30px] tracking-[-0.03em] text-[#F5F5F5]">
                What is this?
              </h2>
              <p className="mb-6 text-[14px] text-[#6B8490]">Tap to continue</p>

              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setCategory(cat)
                      advance(5)
                    }}
                    className="flex h-[56px] items-center justify-center rounded-[16px] border border-white/10 bg-[#2A3645] text-[15px] font-semibold text-[#F2F4F5] transition-colors active:bg-[#3F6F73]/20"
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 5: Analyse ──────────────────────────────────────────────── */}
        {step === 5 && (
          <motion.div
            key="analyse"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col items-center justify-center px-8 text-center"
          >
            {/* Pulsing ring */}
            <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.15, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-[#3F6F73]"
              />
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
                className="absolute inset-2 rounded-full bg-[#3F6F73]"
              />
              <Sparkles size={28} className="relative text-[#7FA9A3]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={analysisMsg}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-[20px] font-bold tracking-[-0.02em] text-[#F2F4F5]"
              >
                {ANALYSIS_MSGS[analysisMsg]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Step 6: First outfit ─────────────────────────────────────────── */}
        {step === 6 && (
          <motion.div
            key="outfit"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col px-5 pt-14 pb-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#3F6F73]"
            >
              Your first outfit
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-5 text-[28px] font-extrabold leading-[32px] tracking-[-0.03em] text-[#F5F5F5]"
            >
              {FIRST_OUTFIT.name}
            </motion.h2>

            {/* 2×2 photo grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.14, duration: 0.4 }}
              className="mb-5 grid aspect-square w-full grid-cols-2 gap-1.5 overflow-hidden rounded-[20px]"
            >
              {FIRST_OUTFIT.photos.map((src, i) => (
                <div key={i} className="overflow-hidden bg-[#1A2535]">
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </motion.div>

            {/* Reason */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.26 }}
              className="mb-5 text-[15px] leading-[23px] text-[#7B9BAA]"
            >
              {outfitReason}
            </motion.p>

            <div className="flex-1" />

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              onClick={() => advance(7)}
              className="flex h-14 w-full items-center justify-center rounded-[18px] bg-[#3F6F73] text-base font-bold tracking-[-0.01em] text-white shadow-[0_8px_20px_rgba(63,111,115,0.24)] transition-[transform] duration-[160ms] active:scale-[0.97]"
            >
              Wear this
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 7: Confirmation ─────────────────────────────────────────── */}
        {step === 7 && (
          <motion.div
            key="confirm"
            variants={fade} initial="enter" animate="center" exit="exit"
            transition={fadeTrans}
            className="flex h-full flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-[#3F6F73]/15"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check size={36} strokeWidth={2.5} className="text-[#3F6F73]" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 text-[40px] font-extrabold tracking-[-0.04em] text-[#F5F5F5]"
            >
              You're set.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="text-[17px] leading-[26px] text-[#7B9BAA]"
            >
              Your week is planned and ready.
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
