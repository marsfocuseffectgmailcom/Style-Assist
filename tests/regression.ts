import assert from 'node:assert/strict'
import { rankOutfits, type ScoredItem } from '../artifacts/stylist-app/src/lib/stylingEngine'
import { capturedToWardrobeItem } from '../artifacts/stylist-app/src/lib/capturedToWardrobe'
import { generateOutfits } from '../artifacts/stylist-app/src/lib/outfitGenerator'
import { parseRecognition, validatePhotos } from '../artifacts/api-server/src/services/clothingRecognition'
import { getEnabledMerchantAdapters } from '../artifacts/api-server/src/adapters/registry'
import { fetchShoppingRecommendations } from '../artifacts/stylist-app/src/lib/shopService'

const storage = new Map<string, string>()
Object.assign(globalThis, { localStorage: { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v) } })
let passed = 0
function check(name: string, f: () => void) { f(); console.log(`PASS ${name}`); passed++ }
function item(id: string, normCategory: ScoredItem['normCategory']): ScoredItem {
  return { id, name: `Black ${id}`, image: '', category: normCategory, normCategory, colors: ['black'], styleTags: ['casual'], seasonTags: ['all-season'], wearCount: 0, source: 'wardrobe', purchaseStatus: 'arrived' }
}
const pool = [...Array.from({ length: 8 }, (_, i) => item(`top-${i}`, 'top')), item('bottom-0', 'bottom'), item('bottom-1', 'bottom'), item('shoe-0', 'shoes'), item('shoe-1', 'shoes')]
check('pagination visits every suitable combination, including later wardrobe items, without repeats', () => {
  const seen = new Set<string>()
  for (let page = 0; page < 30; page++) {
    const batch = rankOutfits(pool, { maxResults: 3, minScore: 65, excludedSignatures: seen, dateStr: '2026-09-08' })
    if (!batch.length) break
    assert.ok(batch.length <= 3)
    for (const outfit of batch) {
      const key = outfit.items.map(i => i.id).sort().join('|')
      assert.ok(!seen.has(key)); seen.add(key)
      assert.ok(outfit.score >= 65)
    }
  }
  assert.equal(seen.size, 8 * 2 * 2)
  assert.ok([...seen].some(k => k.includes('top-7')))
  assert.equal(rankOutfits(pool, { excludedSignatures: seen, minScore: 65 }).length, 0)
})
check('changing only shoes or adding a layer remains a valid alternative', () => {
  const batch = rankOutfits([item('t', 'top'), item('b', 'bottom'), item('s1', 'shoes'), item('s2', 'shoes'), item('coat', 'outerwear')], { maxResults: 10 })
  assert.equal(batch.length, 4)
})
check('dress capture stays a dress through the production generator', () => {
  const dress = capturedToWardrobeItem({ id: 'dress', name: 'Black dress', category: 'Dress', image: '', colors: ['black'], styleTags: ['casual'], seasonTags: ['Autumn/Winter'], wearCount: 0 } as any)
  assert.equal(dress.category, 'Dress')
  assert.deepEqual(dress.seasonTags, ['autumn', 'winter'])
  const shoe = { ...dress, id: 'shoe' as any, name: 'Black shoes', category: 'Shoes' as const, seasonTags: ['all-season'] }
  const outfits = generateOutfits('2026-06-08', [dress, shoe], [])
  assert.equal(outfits.length, 1)
  assert.equal(outfits[0].items.length, 2)
})
check('incomplete wardrobe does not masquerade as a complete outfit', () => {
  assert.deepEqual(rankOutfits([item('t', 'top')], {}), [])
})
const result = { isClothing: true, category: 'Tops', garmentType: 'jersey', colour: 'blue', pattern: 'Solid', style: 'Sporty', season: 'All season', occasion: 'Sport', materialGuess: 'knitted appearance', materialFromLabel: '80% cotton, 20% polyester', labelText: '80% cotton, 20% polyester', brand: '', size: '', needsReview: false, notes: '' }
check('fabric composition is only kept with label evidence', () => {
  assert.equal(parseRecognition(result, false).materialFromLabel, '')
  assert.equal(parseRecognition({ ...result, labelText: '' }, true).materialFromLabel, '')
  assert.equal(parseRecognition(result, true).materialFromLabel, result.materialFromLabel)
})
check('uncertain category requires review; malformed model output is rejected', () => {
  assert.equal(parseRecognition({ ...result, category: null }, false).needsReview, true)
  assert.throws(() => parseRecognition({ ...result, category: 'Pants' }, false))
  assert.throws(() => parseRecognition({ ...result, colour: 12 }, false))
})
check('recognition accepts encoded photos and rejects URLs, missing front and large payloads', () => {
  assert.equal(validatePhotos({ front: 'data:image/jpeg;base64,YWJj' }).front, 'data:image/jpeg;base64,YWJj')
  for (const body of [{}, { front: 'http://localhost/private' }, { front: 'data:image/jpeg;base64,' + 'A'.repeat(3_000_000) }]) assert.throws(() => validatePhotos(body))
})
check('unconfigured merchants cannot return fake purchasable inventory', () => assert.deepEqual(getEnabledMerchantAdapters(), []))
assert.deepEqual(await fetchShoppingRecommendations(), { wardrobeGaps: [], recommendedProducts: [] })
console.log(`PASS shop has no sample recommendations\n${passed + 1} regression checks passed`)
