import { useState, useCallback } from "react"

export type Plan = "free" | "pro"

const SUBSCRIPTION_KEY = "drape-subscription"
const GENERATES_KEY    = "drape-daily-generates"
const FREE_DAILY_LIMIT = 3

interface GenerateLog {
  date:  string
  count: number
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function readGenerateLog(): GenerateLog {
  try {
    const raw = localStorage.getItem(GENERATES_KEY)
    if (!raw) return { date: todayStr(), count: 0 }
    const parsed = JSON.parse(raw) as GenerateLog
    if (parsed.date !== todayStr()) return { date: todayStr(), count: 0 }
    return parsed
  } catch {
    return { date: todayStr(), count: 0 }
  }
}

function writeGenerateLog(log: GenerateLog) {
  localStorage.setItem(GENERATES_KEY, JSON.stringify(log))
}

export function readPlan(): Plan {
  return (localStorage.getItem(SUBSCRIPTION_KEY) as Plan) ?? "free"
}

export function useSubscription() {
  const [plan, setPlanState] = useState<Plan>(() => readPlan())
  const [generateLog, setGenerateLog] = useState<GenerateLog>(() => readGenerateLog())

  const isPro          = plan === "pro"
  const generatesUsed  = generateLog.date === todayStr() ? generateLog.count : 0
  const generatesLeft  = isPro ? Infinity : Math.max(0, FREE_DAILY_LIMIT - generatesUsed)
  const canGenerate    = isPro || generatesUsed < FREE_DAILY_LIMIT

  const recordGenerate = useCallback(() => {
    if (isPro) return
    const log = readGenerateLog()
    const updated = { date: todayStr(), count: log.count + 1 }
    writeGenerateLog(updated)
    setGenerateLog(updated)
  }, [isPro])

  const upgradeToPro = useCallback(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, "pro")
    setPlanState("pro")
  }, [])

  const downgradeToFree = useCallback(() => {
    localStorage.setItem(SUBSCRIPTION_KEY, "free")
    setPlanState("free")
  }, [])

  return { plan, isPro, generatesUsed, generatesLeft, canGenerate, recordGenerate, upgradeToPro, downgradeToFree }
}
