import { Navigate } from "react-router-dom"

// Use the real wardrobe engine rather than the original static demo cards.
export default function Stylist() {
  const date = new Date()
  const localDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
  return <Navigate replace to={`/timeline/generate/${localDate}`} />
}
