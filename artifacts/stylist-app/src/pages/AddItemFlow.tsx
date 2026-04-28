import { useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft, Camera, Upload, Check, ChevronRight,
  Sparkles, Sun, Info, Tag, RotateCcw,
} from "lucide-react"
import { AppShell } from "../components/AppShell"
import { useWardrobeCapture, compressImage } from "../hooks/useWardrobeCapture"
import type { CapturedItem, FitType, ItemStatus, WeatherTag } from "../hooks/useWardrobeCapture"

// ─── Design tokens (matching existing system) ─────────────────────────────────

const TOKEN = {
  card:    "#1A1F2B",
  elevated:"#151922",
  border:  "rgba(255,255,255,0.08)",
  pink:    "#FF4D8D",
  coral:   "#FF7A5C",
  gold:    "#C8A96A",
  teal:    "#4ECFA8",
  text:    "#F6F3EE",
  sub:     "#A8AFBE",
  muted:   "#6F7788",
}

// ─── AI simulation pools ──────────────────────────────────────────────────────

const AI_CATEGORIES = ["Tops", "Bottoms", "Shoes", "Outerwear", "Dress"] as const
const AI_COLOURS    = ["black", "white", "cream", "navy", "grey", "camel", "brown", "beige", "olive", "red", "blue"]
const AI_PATTERNS   = ["Solid", "Striped", "Check", "Floral", "Print", "Textured", "Plain"]
const AI_STYLES     = ["Casual", "Professional", "Elegant", "Sporty", "Smart casual"]
const AI_MATERIALS  = ["Cotton", "Linen", "Polyester", "Wool", "Silk", "Denim", "Leather", "Knit"]
const AI_SEASONS    = ["All season", "Summer", "Autumn/Winter", "Spring/Summer"]
const AI_OCCASIONS  = ["Casual", "Work", "Evening", "Weekend", "Sport", "Formal"]

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function simulateDetection() {
  return {
    category:      pickRandom(AI_CATEGORIES),
    colour:        pickRandom(AI_COLOURS),
    pattern:       pickRandom(AI_PATTERNS),
    style:         pickRandom(AI_STYLES),
    materialGuess: pickRandom(AI_MATERIALS),
    season:        pickRandom(AI_SEASONS),
    occasion:      pickRandom(AI_OCCASIONS),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "tips" | "capture" | "analyzing" | "review" | "done"

type Photos = {
  front: { file: File; url: string } | null
  back:  { file: File; url: string } | null
  tag:   { file: File; url: string } | null
}

type Detected = ReturnType<typeof simulateDetection>

type ManualFields = {
  name:    string
  brand:   string
  size:    string
  fit:     FitType | ""
  material:string
  weather: WeatherTag[]
  status:  ItemStatus
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepHeader({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-1 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all"
          style={{ backgroundColor: i < step ? TOKEN.pink : "rgba(255,255,255,0.12)" }}
        />
      ))}
    </div>
  )
}

function PillSelector<T extends string>({
  options, value, onChange, multi,
}: {
  options: readonly T[]
  value: T | T[] | ""
  onChange: (v: T) => void
  multi?: boolean
}) {
  const selected = multi
    ? (value as T[])
    : value === "" ? [] : [value as T]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition active:scale-[0.96]"
            style={{
              borderColor: active ? TOKEN.pink : TOKEN.border,
              backgroundColor: active ? `rgba(255,77,141,0.12)` : "rgba(255,255,255,0.04)",
              color: active ? TOKEN.pink : TOKEN.sub,
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function FieldRow({
  label, children, hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#5A6275]">{label}</p>
        {hint && <span className="text-[10px] text-[#4A5265]">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function TextInput({
  value, onChange, placeholder, required,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-[14px] border border-white/8 bg-white/5 px-4 py-3 text-[14px] text-[#F6F3EE] placeholder-[#5A6275] outline-none transition focus:border-[#FF4D8D]/40 focus:bg-[#FF4D8D]/4"
    />
  )
}

// ─── Photo slot ───────────────────────────────────────────────────────────────

function PhotoSlot({
  label, sublabel, required, photo, onCapture,
}: {
  label: string
  sublabel: string
  required?: boolean
  photo: { url: string } | null
  onCapture: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
    e.target.value = ""
  }

  return (
    <div className="flex-1">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="relative flex h-[130px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[20px] border transition active:scale-[0.97]"
        style={{
          borderColor: photo ? `rgba(78,207,168,0.35)` : TOKEN.border,
          backgroundColor: photo ? "rgba(78,207,168,0.06)" : "rgba(255,255,255,0.03)",
        }}
      >
        {photo ? (
          <>
            <img src={photo.url} alt={label} className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#4ECFA8]/20">
              <Check size={16} className="text-[#4ECFA8]" />
            </div>
            <p className="relative text-[11px] font-semibold text-[#4ECFA8]">Retake</p>
          </>
        ) : (
          <>
            <Camera size={22} style={{ color: TOKEN.muted }} />
            <div className="text-center">
              <p className="text-[12px] font-semibold" style={{ color: TOKEN.sub }}>{label}</p>
              <p className="text-[10px]" style={{ color: TOKEN.muted }}>{sublabel}</p>
            </div>
            {required && (
              <span className="absolute right-2 top-2 rounded-full bg-[#FF4D8D]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#FF4D8D]">
                Required
              </span>
            )}
          </>
        )}
      </button>
    </div>
  )
}

// ─── STEP: Tips ───────────────────────────────────────────────────────────────

const TIPS = [
  {
    icon: "☀️",
    title: "Use natural light",
    body: "Lay the item flat near a window. Avoid direct sunlight to prevent harsh shadows.",
  },
  {
    icon: "📸",
    title: "Front and back photos",
    body: "Take one photo from the front and one from the back. Both help our system understand the piece.",
  },
  {
    icon: "🧹",
    title: "Clean, flat surface",
    body: "No hangers, no hands. Place the item on a neutral, uncluttered surface.",
  },
  {
    icon: "🏷",
    title: "Photograph the tag",
    body: "An optional tag photo helps detect size, material, and care instructions more accurately.",
  },
]

function TipsStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <p className="mb-1 text-[12px] font-semibold uppercase tracking-widest" style={{ color: TOKEN.gold }}>
          Before you start
        </p>
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.4px]">Photo tips</h2>
        <p className="mt-1.5 text-[14px]" style={{ color: TOKEN.sub }}>
          Better photos mean better results from our AI.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="flex items-start gap-4 rounded-[20px] border border-white/6 p-4"
            style={{ backgroundColor: TOKEN.elevated }}
          >
            <span className="mt-0.5 shrink-0 text-[22px] leading-none">{tip.icon}</span>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: TOKEN.text }}>{tip.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed" style={{ color: TOKEN.sub }}>{tip.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={onNext}
          className="flex w-full items-center justify-center gap-2 rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97]"
          style={{ background: `linear-gradient(to right, ${TOKEN.pink}, ${TOKEN.coral})`, boxShadow: "0 4px 20px rgba(255,77,141,0.28)" }}
        >
          Got it — add a piece <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ─── STEP: Capture ────────────────────────────────────────────────────────────

function CaptureStep({
  photos, setPhotos, onNext,
}: {
  photos: Photos
  setPhotos: (p: Photos) => void
  onNext: () => void
}) {
  async function handleCapture(slot: keyof Photos, file: File) {
    const url = URL.createObjectURL(file)
    setPhotos({ ...photos, [slot]: { file, url } })
  }

  const canContinue = photos.front !== null

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-[-0.3px]">Add photos</h2>
        <p className="mt-1 text-[13px]" style={{ color: TOKEN.sub }}>
          Front photo is required. Back and tag are optional but help our AI.
        </p>
      </div>

      {/* Front + Back slots */}
      <div className="mb-3 flex gap-3">
        <PhotoSlot
          label="Front"
          sublabel="Required"
          required
          photo={photos.front}
          onCapture={(f) => handleCapture("front", f)}
        />
        <PhotoSlot
          label="Back"
          sublabel="Optional"
          photo={photos.back}
          onCapture={(f) => handleCapture("back", f)}
        />
      </div>

      {/* Tag slot — full width, shorter */}
      <div
        className="mb-3 overflow-hidden rounded-[20px] border"
        style={{ borderColor: photos.tag ? "rgba(78,207,168,0.35)" : TOKEN.border, backgroundColor: photos.tag ? "rgba(78,207,168,0.06)" : "rgba(255,255,255,0.03)" }}
      >
        <input
          type="file"
          id="tag-input"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleCapture("tag", f)
            e.target.value = ""
          }}
        />
        <label
          htmlFor="tag-input"
          className="flex cursor-pointer items-center gap-4 px-4 py-3.5"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
            style={{ backgroundColor: photos.tag ? "rgba(78,207,168,0.15)" : "rgba(255,255,255,0.06)" }}
          >
            {photos.tag ? (
              <Check size={18} className="text-[#4ECFA8]" />
            ) : (
              <Tag size={18} style={{ color: TOKEN.muted }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: photos.tag ? "#4ECFA8" : TOKEN.sub }}>
              {photos.tag ? "Tag photo added" : "Tag / care label"}
            </p>
            <p className="text-[11px]" style={{ color: TOKEN.muted }}>
              Helps detect size, material &amp; brand
            </p>
          </div>
          {photos.tag && (
            <img src={photos.tag.url} alt="Tag" className="h-10 w-10 rounded-[10px] object-cover" />
          )}
          {!photos.tag && (
            <span className="text-[11px] font-medium" style={{ color: TOKEN.muted }}>Optional</span>
          )}
        </label>
      </div>

      {/* Upload tip */}
      <div
        className="mb-5 flex items-start gap-2.5 rounded-[14px] px-3.5 py-2.5"
        style={{ backgroundColor: "rgba(200,169,106,0.08)", border: "1px solid rgba(200,169,106,0.15)" }}
      >
        <Upload size={13} className="mt-0.5 shrink-0" style={{ color: TOKEN.gold }} />
        <p className="text-[12px] leading-relaxed" style={{ color: TOKEN.gold }}>
          No camera? Tap any slot to select from your photo library instead.
        </p>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="w-full rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-40"
          style={{ background: `linear-gradient(to right, ${TOKEN.pink}, ${TOKEN.coral})`, boxShadow: "0 4px 20px rgba(255,77,141,0.28)" }}
        >
          Analyse photos
        </button>
        {!canContinue && (
          <p className="mt-2 text-center text-[12px]" style={{ color: TOKEN.muted }}>
            Add a front photo to continue
          </p>
        )}
      </div>
    </div>
  )
}

// ─── STEP: Analyzing ─────────────────────────────────────────────────────────

function AnalyzingStep() {
  const dots = ["Reading your photo", "Detecting item type", "Analysing colours", "Checking patterns"]
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,77,141,0.18), rgba(255,122,92,0.06))" }}
      >
        <Sparkles size={36} style={{ color: TOKEN.pink }} />
      </motion.div>

      <h2 className="mb-2 text-[22px] font-bold tracking-[-0.3px]">Reading your photo…</h2>
      <p className="mb-8 text-[14px]" style={{ color: TOKEN.sub }}>
        Our AI is analysing your clothing item
      </p>

      <div className="w-full max-w-[260px] space-y-3">
        {dots.map((label, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ delay: i * 0.35 + 0.2, repeat: Infinity, duration: 1.2 }}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: TOKEN.pink }}
            />
            <span className="text-[13px]" style={{ color: TOKEN.sub }}>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP: Review & edit ──────────────────────────────────────────────────────

const CATEGORIES: CapturedItem["category"][] = ["Tops", "Bottoms", "Shoes", "Outerwear", "Dress"]
const FIT_OPTIONS: FitType[]   = ["Slim", "Regular", "Relaxed", "Oversized"]
const WEATHER_OPTIONS: WeatherTag[] = ["All weather", "Hot", "Mild", "Cold"]
const STATUS_OPTIONS: ItemStatus[]  = ["Clean", "In wash", "On loan"]
const SEASON_OPTIONS = ["All season", "Summer", "Autumn/Winter", "Spring/Summer"] as const
const OCCASION_OPTIONS = ["Casual", "Work", "Evening", "Weekend", "Sport", "Formal"] as const
const PATTERN_OPTIONS = ["Solid", "Striped", "Check", "Floral", "Print", "Textured"] as const
const STYLE_OPTIONS   = ["Casual", "Professional", "Elegant", "Sporty", "Smart casual"] as const
const COLOUR_OPTIONS  = ["black","white","cream","navy","grey","camel","brown","beige","olive","red","blue","pink","green","yellow","orange","purple"] as const

function ReviewStep({
  detected, manual, setDetected, setManual, onSave, saving,
}: {
  detected: Detected
  manual: ManualFields
  setDetected: (d: Detected) => void
  setManual: (m: ManualFields) => void
  onSave: () => void
  saving: boolean
}) {
  const canSave = manual.name.trim().length > 0

  function toggleWeather(w: WeatherTag) {
    const next = manual.weather.includes(w)
      ? manual.weather.filter((x) => x !== w)
      : [...manual.weather, w]
    setManual({ ...manual, weather: next })
  }

  return (
    <div className="flex flex-col">
      {/* AI Detected section */}
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={13} style={{ color: TOKEN.pink }} />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: TOKEN.pink }}>
          AI Detected — tap to edit
        </p>
      </div>

      <div
        className="mb-5 space-y-4 rounded-[22px] border p-4"
        style={{ borderColor: "rgba(255,77,141,0.15)", backgroundColor: "rgba(255,77,141,0.04)" }}
      >
        <FieldRow label="Category">
          <PillSelector
            options={CATEGORIES}
            value={detected.category as CapturedItem["category"]}
            onChange={(v) => setDetected({ ...detected, category: v })}
          />
        </FieldRow>

        <FieldRow label="Colour">
          <PillSelector
            options={COLOUR_OPTIONS}
            value={detected.colour as typeof COLOUR_OPTIONS[number]}
            onChange={(v) => setDetected({ ...detected, colour: v })}
          />
        </FieldRow>

        <FieldRow label="Pattern">
          <PillSelector
            options={PATTERN_OPTIONS}
            value={detected.pattern as typeof PATTERN_OPTIONS[number]}
            onChange={(v) => setDetected({ ...detected, pattern: v })}
          />
        </FieldRow>

        <FieldRow label="Style">
          <PillSelector
            options={STYLE_OPTIONS}
            value={detected.style as typeof STYLE_OPTIONS[number]}
            onChange={(v) => setDetected({ ...detected, style: v })}
          />
        </FieldRow>

        <FieldRow label="Material" hint="(AI guess — confirm below)">
          <div className="flex flex-wrap gap-2">
            {["Cotton","Linen","Polyester","Wool","Silk","Denim","Leather","Knit"].map((m) => {
              const active = detected.materialGuess === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDetected({ ...detected, materialGuess: m })}
                  className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition active:scale-[0.96]"
                  style={{
                    borderColor: active ? TOKEN.gold : TOKEN.border,
                    backgroundColor: active ? "rgba(200,169,106,0.12)" : "rgba(255,255,255,0.04)",
                    color: active ? TOKEN.gold : TOKEN.sub,
                  }}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </FieldRow>

        <FieldRow label="Season">
          <PillSelector
            options={SEASON_OPTIONS}
            value={detected.season as typeof SEASON_OPTIONS[number]}
            onChange={(v) => setDetected({ ...detected, season: v })}
          />
        </FieldRow>

        <FieldRow label="Occasion">
          <PillSelector
            options={OCCASION_OPTIONS}
            value={detected.occasion as typeof OCCASION_OPTIONS[number]}
            onChange={(v) => setDetected({ ...detected, occasion: v })}
          />
        </FieldRow>
      </div>

      {/* Manual fields section */}
      <div className="mb-1 flex items-center gap-2">
        <Info size={13} style={{ color: TOKEN.gold }} />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: TOKEN.gold }}>
          About this piece
        </p>
      </div>

      <div
        className="mb-5 space-y-4 rounded-[22px] border p-4"
        style={{ borderColor: "rgba(200,169,106,0.15)", backgroundColor: "rgba(200,169,106,0.03)" }}
      >
        <FieldRow label="Item name *">
          <TextInput
            value={manual.name}
            onChange={(v) => setManual({ ...manual, name: v })}
            placeholder="e.g. Black wool blazer"
            required
          />
        </FieldRow>

        <FieldRow label="Brand" hint="(optional)">
          <TextInput
            value={manual.brand}
            onChange={(v) => setManual({ ...manual, brand: v })}
            placeholder="e.g. Country Road, Zara, Uniqlo"
          />
        </FieldRow>

        <FieldRow label="Size" hint="(optional)">
          <TextInput
            value={manual.size}
            onChange={(v) => setManual({ ...manual, size: v })}
            placeholder="e.g. S, M, 10, 32W"
          />
        </FieldRow>

        <FieldRow label="Fit">
          <PillSelector
            options={FIT_OPTIONS}
            value={manual.fit}
            onChange={(v) => setManual({ ...manual, fit: v })}
          />
        </FieldRow>

        <FieldRow label="Material" hint="(confirm or override AI guess)">
          <TextInput
            value={manual.material}
            onChange={(v) => setManual({ ...manual, material: v })}
            placeholder={`AI detected: ${detected.materialGuess}`}
          />
        </FieldRow>

        <FieldRow label="Weather suitability">
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((w) => {
              const active = manual.weather.includes(w)
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWeather(w)}
                  className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition active:scale-[0.96]"
                  style={{
                    borderColor: active ? TOKEN.teal : TOKEN.border,
                    backgroundColor: active ? "rgba(78,207,168,0.12)" : "rgba(255,255,255,0.04)",
                    color: active ? TOKEN.teal : TOKEN.sub,
                  }}
                >
                  {w}
                </button>
              )
            })}
          </div>
        </FieldRow>

        <FieldRow label="Availability">
          <PillSelector
            options={STATUS_OPTIONS}
            value={manual.status}
            onChange={(v) => setManual({ ...manual, status: v })}
          />
        </FieldRow>
      </div>

      <button
        onClick={onSave}
        disabled={!canSave || saving}
        className="w-full rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97] disabled:opacity-50"
        style={{ background: `linear-gradient(to right, ${TOKEN.pink}, ${TOKEN.coral})`, boxShadow: "0 4px 20px rgba(255,77,141,0.26)" }}
      >
        {saving ? "Saving…" : "Save to wardrobe"}
      </button>
    </div>
  )
}

// ─── STEP: Done ───────────────────────────────────────────────────────────────

function DoneStep({
  name, photo, onGoToWardrobe, onAddAnother,
}: {
  name: string
  photo: string | null
  onGoToWardrobe: () => void
  onAddAnother: () => void
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      {photo && (
        <div className="mb-5 h-[200px] w-[160px] overflow-hidden rounded-[24px] border border-white/8">
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #4ECFA8, #2DB890)" }}
      >
        <Check size={28} className="text-white" />
      </motion.div>

      <h2 className="mb-1 text-[22px] font-bold tracking-[-0.3px]">Added to wardrobe</h2>
      <p className="mb-8 text-[14px]" style={{ color: TOKEN.sub }}>
        <span className="font-semibold" style={{ color: TOKEN.text }}>{name}</span> is ready for styling
      </p>

      <button
        onClick={onGoToWardrobe}
        className="mb-3 w-full rounded-[20px] py-4 text-[15px] font-semibold text-white transition active:scale-[0.97]"
        style={{ background: `linear-gradient(to right, ${TOKEN.pink}, ${TOKEN.coral})`, boxShadow: "0 4px 20px rgba(255,77,141,0.28)" }}
      >
        View wardrobe
      </button>

      <button
        onClick={onAddAnother}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/5 py-3.5 text-[14px] font-semibold transition active:scale-[0.97]"
        style={{ color: TOKEN.sub }}
      >
        <RotateCcw size={14} />
        Add another piece
      </button>
    </div>
  )
}

// ─── Main flow ────────────────────────────────────────────────────────────────

const PHASE_STEP: Record<Phase, number> = {
  tips: 1, capture: 2, analyzing: 3, review: 3, done: 4,
}

const PHASE_TITLE: Partial<Record<Phase, string>> = {
  capture:  "Photos",
  analyzing: "Analysing",
  review:   "Review",
  done:     "Done",
}

export default function AddItemFlow() {
  const navigate = useNavigate()
  const { addItem } = useWardrobeCapture()

  const [phase, setPhase] = useState<Phase>("tips")
  const [photos, setPhotos]       = useState<Photos>({ front: null, back: null, tag: null })
  const [detected, setDetected]   = useState<Detected | null>(null)
  const [saving, setSaving]       = useState(false)
  const [savedPhoto, setSavedPhoto] = useState<string | null>(null)

  const [manual, setManual] = useState<ManualFields>({
    name: "", brand: "", size: "", fit: "", material: "", weather: ["All weather"], status: "Clean",
  })

  // ── Phase transitions ───────────────────────────────────────────────────────

  function goCapture() { setPhase("capture") }

  async function goAnalyzing() {
    setPhase("analyzing")
    // 1.5s simulated AI analysis
    await new Promise((r) => setTimeout(r, 1600))
    const det = simulateDetection()
    setDetected(det)
    setPhase("review")
  }

  async function handleSave() {
    if (!detected) return
    setSaving(true)

    let frontUrl = ""
    if (photos.front?.file) {
      frontUrl = await compressImage(photos.front.file)
    }
    let backUrl: string | undefined
    if (photos.back?.file) {
      backUrl = await compressImage(photos.back.file)
    }
    let tagUrl: string | undefined
    if (photos.tag?.file) {
      tagUrl = await compressImage(photos.tag.file, 300)
    }

    const categoryMap: Record<string, CapturedItem["category"]> = {
      Tops: "Tops", Bottoms: "Bottoms", Shoes: "Shoes", Outerwear: "Outerwear", Dress: "Dress",
    }

    const item: CapturedItem = {
      id:       `captured-${Date.now()}`,
      name:     manual.name.trim(),
      category: categoryMap[detected.category] ?? "Tops",
      image:    frontUrl || photos.front?.url || "",
      backPhoto: backUrl,
      tagPhoto:  tagUrl,
      colors:   [detected.colour],
      styleTags: [detected.style.toLowerCase(), detected.occasion.toLowerCase()],
      seasonTags: detected.season === "All season" ? ["all-season"] : [detected.season.toLowerCase()],
      wearCount: 0,
      aiCategory:     detected.category,
      aiColour:       detected.colour,
      aiPattern:      detected.pattern,
      aiStyle:        detected.style,
      aiMaterialGuess:detected.materialGuess,
      aiSeason:       detected.season,
      aiOccasion:     detected.occasion,
      brand:    manual.brand.trim() || undefined,
      size:     manual.size.trim()  || undefined,
      fit:      manual.fit          || undefined,
      material: manual.material.trim() || detected.materialGuess,
      weatherSuitability: manual.weather,
      status:   manual.status,
      addedAt:  new Date().toISOString(),
    }

    addItem(item)
    setSavedPhoto(frontUrl || photos.front?.url || null)
    setSaving(false)
    setPhase("done")
  }

  function handleAddAnother() {
    setPhotos({ front: null, back: null, tag: null })
    setDetected(null)
    setManual({ name: "", brand: "", size: "", fit: "", material: "", weather: ["All weather"], status: "Clean" })
    setSavedPhoto(null)
    setPhase("tips")
  }

  // ── Back navigation ─────────────────────────────────────────────────────────

  function handleBack() {
    if (phase === "tips")     return navigate(-1)
    if (phase === "capture")  return setPhase("tips")
    if (phase === "review")   return setPhase("capture")
    navigate(-1)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const showHeader = phase !== "analyzing" && phase !== "done"

  return (
    <AppShell>
      {/* Header */}
      {showHeader && (
        <header className="mb-5 flex items-center gap-3 pt-4">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 transition hover:bg-white/10"
            aria-label="Back"
            style={{ color: TOKEN.sub }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            {phase !== "tips" && (
              <StepHeader step={PHASE_STEP[phase]} total={4} />
            )}
            {PHASE_TITLE[phase] && (
              <p className="mt-1 text-[12px]" style={{ color: TOKEN.muted }}>
                Step {PHASE_STEP[phase]} of 4 — {PHASE_TITLE[phase]}
              </p>
            )}
          </div>
        </header>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={phase === "analyzing" || phase === "done" ? "flex min-h-[60vh] flex-col" : ""}
        >
          {phase === "tips" && <TipsStep onNext={goCapture} />}

          {phase === "capture" && (
            <CaptureStep photos={photos} setPhotos={setPhotos} onNext={goAnalyzing} />
          )}

          {phase === "analyzing" && <AnalyzingStep />}

          {phase === "review" && detected && (
            <ReviewStep
              detected={detected}
              manual={manual}
              setDetected={setDetected}
              setManual={setManual}
              onSave={handleSave}
              saving={saving}
            />
          )}

          {phase === "done" && (
            <DoneStep
              name={manual.name}
              photo={savedPhoto}
              onGoToWardrobe={() => navigate("/wardrobe")}
              onAddAnother={handleAddAnother}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
