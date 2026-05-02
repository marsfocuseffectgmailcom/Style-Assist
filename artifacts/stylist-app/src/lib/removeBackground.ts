/**
 * Client-side background removal using canvas flood-fill edge detection.
 * Samples the four corners to determine the background colour, then uses
 * a tolerance-based flood fill to erase pixels that match it, producing a
 * transparent PNG data-URL.
 */

const TOLERANCE = 40   // colour distance threshold (0–255)
const PADDING   = 2    // extra erosion passes to clean fringing

function colourDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function sampleCornerColour(data: Uint8ClampedArray, w: number, h: number) {
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ]
  let r = 0, g = 0, b = 0
  for (const [cx, cy] of corners) {
    const idx = (cy * w + cx) * 4
    r += data[idx]; g += data[idx + 1]; b += data[idx + 2]
  }
  return [r / 4, g / 4, b / 4]
}

function floodFill(
  data: Uint8ClampedArray,
  visited: Uint8Array,
  w: number,
  h: number,
  startX: number,
  startY: number,
  bgR: number,
  bgG: number,
  bgB: number,
) {
  const stack: number[] = [startY * w + startX]
  while (stack.length) {
    const pos = stack.pop()!
    if (visited[pos]) continue
    visited[pos] = 1
    const idx = pos * 4
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    if (colourDist(r, g, b, bgR, bgG, bgB) > TOLERANCE) continue
    // mark transparent
    data[idx + 3] = 0
    const x = pos % w, y = Math.floor(pos / w)
    if (x > 0)     stack.push(pos - 1)
    if (x < w - 1) stack.push(pos + 1)
    if (y > 0)     stack.push(pos - w)
    if (y < h - 1) stack.push(pos + w)
  }
}

function erodeEdges(data: Uint8ClampedArray, w: number, h: number, passes: number) {
  for (let p = 0; p < passes; p++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4
        if (data[idx + 3] === 0) continue
        const neighbours = [
          data[((y - 1) * w + x) * 4 + 3],
          data[((y + 1) * w + x) * 4 + 3],
          data[(y * w + x - 1) * 4 + 3],
          data[(y * w + x + 1) * 4 + 3],
        ]
        if (neighbours.some((a) => a === 0)) {
          // semi-transparent edge pixel — fade it
          data[idx + 3] = Math.max(0, data[idx + 3] - 80)
        }
      }
    }
  }
}

/**
 * Removes the background from a dataURL (jpeg/png) image.
 * Returns a PNG dataURL with transparent background, or the original if it fails.
 */
export async function removeBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      img.onload = () => {
        try {
          const MAX = 600
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
          const w = Math.round(img.width * ratio)
          const h = Math.round(img.height * ratio)

          const canvas = document.createElement("canvas")
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext("2d")!
          ctx.drawImage(img, 0, 0, w, h)

          const imageData = ctx.getImageData(0, 0, w, h)
          const { data } = imageData
          const visited = new Uint8Array(w * h)

          const [bgR, bgG, bgB] = sampleCornerColour(data, w, h)

          // flood-fill from all four corners
          floodFill(data, visited, w, h, 0,     0,     bgR, bgG, bgB)
          floodFill(data, visited, w, h, w - 1, 0,     bgR, bgG, bgB)
          floodFill(data, visited, w, h, 0,     h - 1, bgR, bgG, bgB)
          floodFill(data, visited, w, h, w - 1, h - 1, bgR, bgG, bgB)

          erodeEdges(data, w, h, PADDING)

          ctx.putImageData(imageData, 0, 0)
          resolve(canvas.toDataURL("image/png"))
        } catch {
          resolve(dataUrl)
        }
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    } catch {
      resolve(dataUrl)
    }
  })
}
