import { Link } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { useWardrobeCapture } from "../hooks/useWardrobeCapture"

export default function Shop() {
  const { items } = useWardrobeCapture()
  const count = (category: string) => items.filter(i => i.category === category).length
  const gaps: string[] = []
  if (!count("Shoes")) gaps.push("Add a pair of shoes to complete your outfits.")
  if (!count("Dress")) {
    if (!count("Tops")) gaps.push("Add a top or a dress to start building complete looks.")
    if (!count("Bottoms")) gaps.push("Add trousers, a skirt or a dress to complete your looks.")
  }
  return <AppShell>
    <header className="pt-4 mb-6"><h1 className="text-2xl font-semibold">More from your wardrobe</h1>
      <p className="mt-2 text-sm text-[#AABBC0]">Start with what you own.</p></header>
    <section className="rounded-2xl bg-white/5 p-5 space-y-3">
      <h2 className="font-semibold">Your wardrobe</h2>
      {gaps.length ? gaps.map(gap => <p className="text-sm" key={gap}>{gap}</p>) :
        <p className="text-sm">You have the categories needed for complete outfits. Another top, bottom or pair of shoes may add variety; suitability depends on its colour, style and the occasion.</p>}
      <Link className="block underline text-sm" to="/wardrobe/add">Add clothes you already own</Link>
    </section>
    <section className="mt-5 rounded-2xl bg-white/5 p-5">
      <h2 className="font-semibold">Retailer recommendations are coming</h2>
      <p className="mt-2 text-sm text-[#AABBC0]">Amazon, SHEIN, Temu and ASOS product recommendations are not available yet. No live prices or stock have been connected.</p>
    </section>
    <Link className="mt-6 block underline text-sm" to="/timeline">Back to outfits</Link>
  </AppShell>
}
