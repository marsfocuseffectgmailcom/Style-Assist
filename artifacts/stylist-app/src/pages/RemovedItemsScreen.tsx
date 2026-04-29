import { ArrowLeft, RotateCcw, Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { AppShell } from "../components/AppShell"
import { useWardrobeRemoval } from "../hooks/useWardrobeRemoval"

export default function RemovedItemsScreen() {
  const navigate = useNavigate()
  const { removed, restore } = useWardrobeRemoval()

  const softRemoved = removed.filter((r) => !r.permanent)
  const permanently = removed.filter((r) => r.permanent)

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric", month: "short", year: "numeric",
    })
  }

  return (
    <AppShell>
      <header className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[#A8B0B8]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold leading-[26px] tracking-[-0.02em] text-[#F5F5F5]">
            Removed Items
          </h1>
          <p className="text-[12px] leading-[16px] font-medium text-[#6B8490]">
            {softRemoved.length} item{softRemoved.length !== 1 ? "s" : ""} removed · restore anytime
          </p>
        </div>
      </header>

      {softRemoved.length === 0 && permanently.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-[15px] font-medium text-[#A8B0B8]">Nothing removed yet</p>
          <p className="mt-1 text-[13px] text-[#5E7580]">
            Items you remove from your wardrobe will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* ── Restorable items ── */}
          {softRemoved.length > 0 && (
            <section className="mb-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                Removed — can restore
              </p>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {softRemoved.map((record, i) => (
                    <motion.div
                      key={record.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ delay: i * 0.04, duration: 0.18 }}
                      className="flex items-center gap-3 rounded-[18px] border border-white/6 bg-[#2A3645] p-3"
                    >
                      {/* Thumbnail */}
                      <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] bg-[#243140]">
                        {record.image ? (
                          <img
                            src={record.image}
                            alt={record.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Camera size={16} className="text-[#2E4055]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-[#F5F5F5]">
                          {record.name}
                        </p>
                        <p className="text-[11px] text-[#5E7580]">
                          {record.category} · removed {formatDate(record.removedAt)}
                        </p>
                      </div>

                      {/* Restore button */}
                      <button
                        onClick={() => restore(record.id)}
                        className="flex h-[44px] items-center gap-1.5 rounded-full border border-[#3F6F73]/30 bg-[#3F6F73]/10 px-3.5 text-[12px] font-bold text-[#3F6F73]"
                        aria-label={`Restore ${record.name}`}
                      >
                        <RotateCcw size={13} />
                        Restore
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* ── Permanently deleted ── */}
          {permanently.length > 0 && (
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#5E7580]">
                Permanently deleted
              </p>
              <div className="space-y-2">
                {permanently.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 rounded-[18px] border border-white/4 bg-white/2 p-3 opacity-50"
                  >
                    <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px] bg-[#243140]">
                      {record.image ? (
                        <img
                          src={record.image}
                          alt={record.name}
                          className="h-full w-full object-cover grayscale"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Camera size={16} className="text-[#2E4055]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-[#A8B0B8]">
                        {record.name}
                      </p>
                      <p className="text-[11px] text-[#5E7580]">
                        {record.category} · deleted {formatDate(record.removedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-[#4D6A78]">
                Permanently deleted items cannot be restored, but they're kept here so saved outfits remain intact.
              </p>
            </section>
          )}
        </>
      )}
    </AppShell>
  )
}
