import { ShoppingBag } from "lucide-react"
import { useMemo, useState } from "react"
import { AppShell } from "../components/AppShell"
import { PrimaryButton } from "../components/PrimaryButton"
import { Card } from "../components/Card"
import { SectionHeader } from "../components/SectionHeader"
import { ProductCard } from "../components/ProductCard"
import { WardrobeGapCard } from "../components/WardrobeGapCard"
import { CategoryPill } from "../components/CategoryPill"
import { ProductDetailsModal } from "../components/ProductDetailsModal"
import { useShopRecommendations } from "../hooks/useShopRecommendations"
import { useProductsByGap } from "../hooks/useProductsByGap"
import type { Merchant, RecommendedProduct, WardrobeGap } from "../lib/types"

const merchantFilters: Array<Merchant | "All"> = [
  "All",
  "Amazon",
  "SHEIN",
  "Temu",
  "ASOS",
]

export default function Shop() {
  const [merchant, setMerchant] = useState<Merchant | "All">("All")
  const [selectedGap, setSelectedGap] = useState<WardrobeGap | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null)

  const {
    wardrobeGaps,
    recommendedProducts,
    loading,
    error,
  } = useShopRecommendations()

  const {
    products: gapProducts,
    loading: gapLoading,
    error: gapError,
  } = useProductsByGap({
    gap: selectedGap,
    merchants: merchant === "All" ? undefined : [merchant],
    limitPerMerchant: 4,
    enabled: Boolean(selectedGap),
  })

  const visibleProducts = useMemo(() => {
    const baseProducts = selectedGap ? gapProducts : recommendedProducts

    if (merchant === "All") return baseProducts

    return baseProducts.filter((product) => product.merchant === merchant)
  }, [selectedGap, gapProducts, recommendedProducts, merchant])

  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
            <ShoppingBag size={20} className="text-[#C8A96A]" />
          </div>
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.3px]">Shop</h1>
            <p className="text-sm text-[#AABBC0]">
              Items that unlock more from what you own
            </p>
          </div>
        </div>
      </header>

      <Card
        elevated
        className="bg-gradient-to-br from-[#1E3040] via-[#1F2A37] to-[#2A3645]"
      >
        <h2 className="text-[18px] font-semibold">What's missing</h2>
        <p className="mt-2 text-sm leading-6 text-[#D0D8D5]">
          Buy what unlocks more. Not what adds clutter.
        </p>

        <div className="mt-4">
          <PrimaryButton fullWidth={false} className="px-4">
            Start 7-Day Free Trial
          </PrimaryButton>
        </div>
      </Card>

      <section className="mt-6">
        <SectionHeader title="Retailers" />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {merchantFilters.map((filter) => (
            <CategoryPill
              key={filter}
              active={merchant === filter}
              onClick={() => setMerchant(filter)}
            >
              {filter}
            </CategoryPill>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader title="Gaps to fill" />
        <div className="space-y-3">
          {loading ? (
            <Card>Looking at your wardrobe...</Card>
          ) : error ? (
            <Card>{error}</Card>
          ) : (
            wardrobeGaps.map((gap) => (
              <WardrobeGapCard
                key={gap.id}
                gap={gap}
                onShop={() => setSelectedGap(gap)}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6">
        <SectionHeader
          title={selectedGap ? "Options for this gap" : "Suggested picks"}
          actionLabel={selectedGap ? "Clear filter" : undefined}
          onActionClick={selectedGap ? () => setSelectedGap(null) : undefined}
        />

        <div className="space-y-3">
          {gapLoading ? (
            <Card>Finding options...</Card>
          ) : gapError ? (
            <Card>{gapError}</Card>
          ) : visibleProducts.length === 0 ? (
            <Card>Nothing found</Card>
          ) : (
            visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sourceScreen={selectedGap ? "gap-analysis" : "shop"}
                onProductClick={(p) => setSelectedProduct(p)}
              />
            ))
          )}
        </div>
      </section>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </AppShell>
  )
}
