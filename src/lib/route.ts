import { useEffect, useState } from "react"

/** Tiny hash router: #/kid?variant=first. Hash routing works on GitHub Pages without a 404 fallback. */
export function useHashRoute() {
  const read = () => {
    let raw = window.location.hash.replace(/^#/, "") || "/"
    if (!raw.startsWith("/")) raw = "/" + raw // plain "#editor" works too (claude.ai artifacts only pass plain hashes)
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
