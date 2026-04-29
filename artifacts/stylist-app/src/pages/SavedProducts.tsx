import { useState } from "react"
import { Heart, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { AppShell } from "../components/AppShell"
import { Card } from "../components/Card"
import { SectionHeader } from "../components/SectionHeader"
import { ProductCard } from "../components/ProductCard"
import { PrimaryButton } from "../components/PrimaryButton"
import { ProductDetailsModal } from "../components/ProductDetailsModal"
import { useSavedProducts } from "../hooks/useSavedProducts"
import type { RecommendedProduct } from "../lib/types"

export default function SavedProducts() {
  const {
    savedProducts,
    savedCount,
    clearSavedProducts,
  } = useSavedProducts()

  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(null)

  const hasSavedProducts = savedProducts.length > 0

  return (
    <AppShell>
      <header className="mb-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5">
            <Heart size={20} className="text-[#5F8F8A]" />
          </div>

          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.3px]">
              Saved Products
            </h1>
            <p className="text-sm text-[#AABBC0]">
              Your wishlist for smarter wardrobe upgrades
            </p>
          </div>
        </div>
      </header>

      <Card
        elevated
        className="bg-gradient-to-br from-[#1A2635] via-[#1A2635] to-[#2A3645]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold">Your Wishlist</h2>
            <p className="mt-2 text-sm leading-6 text-[#D0D8D5]">
              Save pieces that fit your style direction, wardrobe gaps, or future looks
            </p>
          </div>

          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#F2F4F5]">
            {savedCount} saved
          </div>
        </div>

        {hasSavedProducts ? (
          <div className="mt-4">
            <button
              onClick={clearSavedProducts}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#F2F4F5] transition hover:bg-white/10"
            >
              <Trash2 size={15} />
              Clear wishlist
            </button>
          </div>
        ) : null}
      </Card>

      <section className="mt-6">
        <SectionHeader title="Saved Items" />

        {hasSavedProducts ? (
          <div className="space-y-3">
            {savedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                sourceScreen="shop"
                showMerchantBadge
                badge={product.commissionEligible ? undefined : "Saved"}
                onProductClick={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Heart size={22} className="text-[#5F8F8A]" />
            </div>

            <h3 className="mt-4 text-[18px] font-semibold text-[#F2F4F5]">
              No saved products yet
            </h3>

            <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#AABBC0]">
              Save items from your recommendations to build your shortlist.
            </p>

            <div className="mt-5">
              <Link to="/shop">
                <PrimaryButton fullWidth={false} className="px-5">
                  Explore Products
                </PrimaryButton>
              </Link>
            </div>
          </Card>
        )}
      </section>

      {selectedProduct ? (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </AppShell>
  )
}
