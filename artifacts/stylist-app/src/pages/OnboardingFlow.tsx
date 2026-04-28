import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Check } from "lucide-react"
import { useTimelineOutfits } from "../hooks/useTimelineOutfits"
import { useIncomingItems } from "../hooks/useIncomingItems"
import { wardrobeItems } from "../lib/mockData"
import { generateMonthPlan } from "../lib/outfitGenerator"

const STYLE_CHIPS = [
  { id: "minimal", label: "Minimal" },
  { id: "casual", label: "Casual" },
  { id: "feminine", label: "Feminine" },
  { id: "edgy", label: "Edgy" },
  { id: "classic", label: "Classic" },
  { id: "street", label: "Street" },
  { id: "smart", label: "Smart" },
  { id: "sporty", label: "Sporty" },
]

const EVENT_CHIPS = [
  { id: "work", label: "Work" },
  { id: "weekends", label: "Weekends" },
  { id: "date-night", label: "Date nights" },
  { id: "parties", label: "Parties" },
  { id: "travel", label: "Travel" },
  { id: "events", label: "Events" },
]

const PREVIEW_DAYS = [
  {
    day: "Mon",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Clean & Classic",
    badge: "High match",
    badgeColor: "#4ECFA8",
    badgeBg: "rgba(78,207,168,0.12)",
  },
  {
    day: "Tue",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Weekend Edit",
    badge: "Safe",
    badgeColor: "#C8A96A",
    badgeBg: "rgba(200,169,106,0.12)",
  },
  {
    day: "Wed",
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Quiet Luxury",
    badge: "High match",
    badgeColor: "#4ECFA8",
    badgeBg: "rgba(78,207,168,0.12)",
  },
  {
    day: "Thu",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Effortless Neutral",
    badge: "Safe",
    badgeColor: "#C8A96A",
    badgeBg: "rgba(200,169,106,0.12)",
  },
  {
    day: "Fri",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Smart Casual",
    badge: "High match",
    badgeColor: "#4ECFA8",
    badgeBg: "rgba(78,207,168,0.12)",
  },
  {
    day: "Sat",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1506629905607-f0e6a0f5d4f8?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Tonal Moment",
    badge: "Bold pick",
    badgeColor: "#FF7A5C",
    badgeBg: "rgba(255,122,92,0.12)",
  },
  {
    day: "Sun",
    images: [
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=60",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=60",
    ],
    label: "Off-Duty Chic",
    badge: "Safe",
    badgeColor: "#C8A96A",
    badgeBg: "rgba(200,169,106,0.12)",
  },
]

type Step = 0 | 1 | 2 | 3 | 4

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
}

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const navigate = useNavigate()
  const { bulkFill } = useTimelineOutfits()
  const { items: incomingItems } = useIncomingItems()

  const [step, setStep] = useState<Step>(0)
  const [dir, setDir] = useState(1)
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set())
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [genDone, setGenDone] = useState(false)
  const [visibleDays, setVisibleDays] = useState(0)

  function advance(to: Step) {
    setDir(1)
    setStep(to)
  }

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => advance(1), 2600)
      return () => clearTimeout(t)
    }
  }, [step])

  useEffect(() => {
    if (step === 1) {
      setVisibleDays(0)
      const timers: ReturnType<typeof setTimeout>[] = []
      PREVIEW_DAYS.forEach((_, i) => {
        timers.push(setTimeout(() => setVisibleDays(i + 1), 300 + i * 260))
      })
      return () => timers.forEach(clearTimeout)
    }
  }, [step])

  useEffect(() => {
    if (step === 4) {
      setGenDone(false)
      const existing = new Set<string>()
      const outfits = generateMonthPlan(wardrobeItems, incomingItems, existing).slice(0, 7)
      const t1 = setTimeout(() => {
        bulkFill(outfits)
        setGenDone(true)
      }, 1500)
      const t2 = setTimeout(() => {
        navigate("/timeline")
        onComplete()
      }, 2600)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [step])

  function toggleStyle(id: string) {
    setSelectedStyles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  function toggleEvent(id: string) {
    setSelectedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0A0C10]">
      <AnimatePresence mode="wait" custom={dir}>
        {step === 0 && (
          <motion.div
            key="splash"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.15, 1] }}
            className="flex h-full flex-col items-center justify-center px-8 text-center"
            onClick={() => advance(1)}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FF4D8D] to-[#FF7A5C] shadow-[0_0_40px_rgba(255,77,141,0.4)]"
            >
              <Sparkles size={36} className="text-white" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mb-2 text-[13px] font-semibold uppercase tracking-[0.15em] text-[#FF4D8D]"
            >
              Style Assist
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="text-[38px] font-bold leading-[1.1] tracking-[-1px] text-[#F6F3EE]"
            >
              Your outfits,
              <br />
              <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] bg-clip-text text-transparent">
                already planned.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-4 text-[15px] leading-relaxed text-[#6F7788]"
            >
              Plan weeks ahead using your wardrobe and incoming deliveries.
              Never wonder what to wear again.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-12 flex gap-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 0 ? "w-6 bg-[#FF4D8D]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="preview"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.15, 1] }}
            className="flex h-full flex-col overflow-hidden"
            onClick={() => advance(2)}
          >
            <div className="flex-shrink-0 px-6 pb-4 pt-12">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#FF4D8D]"
              >
                Here&apos;s your week
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[28px] font-bold tracking-[-0.5px] text-[#F6F3EE]"
              >
                Outfits planned,
                <br />zero effort.
              </motion.h2>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <div className="space-y-2.5">
                {PREVIEW_DAYS.map((day, i) => (
                  <AnimatePresence key={day.day}>
                    {i < visibleDays && (
                      <motion.div
                        initial={{ opacity: 0, x: 24, scale: 0.97 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-[#151922] p-2.5"
                      >
                        <div className="grid h-[48px] w-[48px] shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-[11px] bg-[#1A1F2B]">
                          {day.images.map((src, j) => (
                            <img
                              key={j}
                              src={src}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ))}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6F7788]">
                              {day.day}
                            </span>
                            <span
                              className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                              style={{ color: day.badgeColor, backgroundColor: day.badgeBg }}
                            >
                              {day.badge}
                            </span>
                          </div>
                          <p className="truncate text-[13px] font-semibold text-[#F6F3EE]">
                            {day.label}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleDays >= 3 ? 1 : 0 }}
              className="flex-shrink-0 px-6 pb-10 text-center"
            >
              <p className="text-[13px] text-[#4A5167]">Tap anywhere to continue</p>
            </motion.div>

            <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 1 ? "w-6 bg-[#FF4D8D]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="style"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.15, 1] }}
            className="flex h-full flex-col px-6 pt-14"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#FF4D8D]"
            >
              Step 1 of 2
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-2 text-[30px] font-bold tracking-[-0.5px] text-[#F6F3EE]"
            >
              What&apos;s your style?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-7 text-[15px] text-[#6F7788]"
            >
              Pick up to 3 — tap to select
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
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
                    className={`relative flex h-[58px] items-center justify-center rounded-[18px] border text-[15px] font-semibold transition ${
                      active
                        ? "border-[#FF4D8D]/50 bg-gradient-to-br from-[#FF4D8D]/15 to-[#FF7A5C]/10 text-[#F6F3EE]"
                        : "border-white/10 bg-[#151922] text-[#A8AFBE]"
                    }`}
                  >
                    {chip.label}
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D8D]"
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
                  className="mb-10 w-full rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.30)] transition active:scale-[0.97]"
                >
                  Next →
                </motion.button>
              )}
            </AnimatePresence>

            <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 2 ? "w-6 bg-[#FF4D8D]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="events"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.15, 1] }}
            className="flex h-full flex-col px-6 pt-14"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#FF4D8D]"
            >
              Step 2 of 2
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mb-2 text-[30px] font-bold tracking-[-0.5px] text-[#F6F3EE]"
            >
              What do you
              <br />dress for?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-7 text-[15px] text-[#6F7788]"
            >
              Pick up to 3 — tap to select
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              {EVENT_CHIPS.map((chip) => {
                const active = selectedEvents.has(chip.id)
                return (
                  <motion.button
                    key={chip.id}
                    onClick={() => toggleEvent(chip.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex h-[58px] items-center justify-center rounded-[18px] border text-[15px] font-semibold transition ${
                      active
                        ? "border-[#FF4D8D]/50 bg-gradient-to-br from-[#FF4D8D]/15 to-[#FF7A5C]/10 text-[#F6F3EE]"
                        : "border-white/10 bg-[#151922] text-[#A8AFBE]"
                    }`}
                  >
                    {chip.label}
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4D8D]"
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
              {selectedEvents.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={() => advance(4)}
                  className="mb-10 w-full rounded-[20px] bg-gradient-to-r from-[#FF4D8D] to-[#FF7A5C] py-4 text-[16px] font-semibold text-white shadow-[0_4px_20px_rgba(255,77,141,0.30)] transition active:scale-[0.97]"
                >
                  Build My Week →
                </motion.button>
              )}
            </AnimatePresence>

            <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === 3 ? "w-6 bg-[#FF4D8D]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="generate"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.32, 0, 0.15, 1] }}
            className="flex h-full flex-col items-center justify-center px-8 text-center"
          >
            <motion.div
              animate={genDone ? { scale: [1, 1.12, 1] } : { scale: [1, 1.04, 1] }}
              transition={{ repeat: genDone ? 0 : Infinity, duration: 1.8, ease: "easeInOut" }}
              className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full transition-colors duration-500 ${
                genDone
                  ? "bg-[#4ECFA8]/20"
                  : "bg-gradient-to-br from-[#FF4D8D]/20 to-[#FF7A5C]/20"
              }`}
            >
              {genDone ? (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check size={40} className="text-[#4ECFA8]" />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                >
                  <Sparkles size={40} className="text-[#FF4D8D]" />
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {!genDone ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <h2 className="text-[26px] font-bold tracking-[-0.5px] text-[#F6F3EE]">
                    Building your
                    <br />first week…
                  </h2>
                  <p className="mt-3 text-[15px] text-[#6F7788]">
                    Finding your best combinations
                  </p>
                  <div className="mt-6 flex justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.2,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                        className="h-2 w-2 rounded-full bg-[#FF4D8D]"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-[26px] font-bold tracking-[-0.5px] text-[#F6F3EE]">
                    Your week
                    <br />is ready.
                  </h2>
                  <p className="mt-3 text-[15px] text-[#6F7788]">
                    7 outfits planned — opening your timeline
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
