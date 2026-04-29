import { ArrowLeft, SendHorizonal, CheckCircle2 } from "lucide-react"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { OutfitCard } from "../components/OutfitCard"
import { outfitCards } from "../lib/mockData"

export default function Stylist() {
  return (
    <AppShell>
      <header className="mb-5 flex items-center justify-between pt-4">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-[#F2F4F5]">
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-[18px] font-semibold">AI Stylist</h1>

        <div className="h-10 w-10" />
      </header>

      <div className="mb-4 inline-flex rounded-[16px] border border-white/10 bg-[#2A3645] px-4 py-3 text-sm text-[#F2F4F5]">
        I have a lunch meeting tomorrow
      </div>

      <p className="mb-4 text-sm text-[#AABBC0]">
        Here are 3 outfits I&apos;ve picked for you
      </p>

      <section className="mb-5 flex gap-3 overflow-x-auto pb-1">
        {outfitCards.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            title={outfit.title}
            subtitle={outfit.subtitle}
            image={outfit.image}
            selected={outfit.selected}
          />
        ))}
      </section>

      <Card>
        <h2 className="text-[18px] font-semibold">
          Why Outfit 2 is the best choice
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#AABBC0]">
          The tonal combination creates a clean, confident look that feels
          polished yet approachable. The structured blazer adds authority, while
          the soft knit keeps it comfortable for lunch meetings
        </p>

        <div className="my-4 h-px bg-white/10" />

        <h3 className="mb-3 text-sm font-semibold text-[#F2F4F5]">
          Why This Works
        </h3>

        <div className="space-y-3">
          {["Tonal dressing", "Proportion balance", "Texture contrast"].map(
            (item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-[#C8A96A]" />
                <span className="text-sm text-[#F2F4F5]">{item}</span>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card className="mt-5">
        <h3 className="text-[16px] font-semibold">Stylist&apos;s Pick</h3>
        <p className="mt-2 text-sm leading-6 text-[#AABBC0]">
          Outfit 2 wins because it feels the most intentional for a lunch
          meeting. It balances polish and softness, which makes it more flexible
          and more persuasive than the other two options
        </p>
      </Card>

      <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-white/10 bg-[#2A3645] px-4 py-3">
        <input
          type="text"
          placeholder="Ask your stylist..."
          className="flex-1 bg-transparent text-sm text-[#F2F4F5] outline-none placeholder:text-[#6B8490]"
        />
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#3F6F73] to-[#7FA9A3] text-white shadow-[0_8px_24px_rgba(63,111,115,0.28)]">
          <SendHorizonal size={16} />
        </button>
      </div>
    </AppShell>
  )
}
