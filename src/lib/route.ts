import { useEffect, useState } from "react"

/** Tiny hash router: #/kid?variant=first. Hash routing works on GitHub Pages without a 404 fallback. */
export function useHashRoute() {
  const read = () => {
    const raw = window.location.hash.replace(/^#/, "") || "/"
    const [path, qs = ""] = raw.split("?")
    return { path, params: new URLSearchParams(qs) }
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return route
}
