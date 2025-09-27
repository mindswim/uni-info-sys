"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"
export type ThemeVariant =
  | "default"
  | "classic-university"
  | "modern-tech"
  | "warm-professional"
  | "forest-green"
  | "high-contrast"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultVariant?: ThemeVariant
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  variant: ThemeVariant
  setTheme: (theme: Theme) => void
  setVariant: (variant: ThemeVariant) => void
  resolvedTheme: "light" | "dark"
}

const initialState: ThemeProviderState = {
  theme: "system",
  variant: "default",
  setTheme: () => null,
  setVariant: () => null,
  resolvedTheme: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultVariant = "default",
  storageKey = "university-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme
    return (localStorage.getItem(`${storageKey}-mode`) as Theme) || defaultTheme
  })
  const [variant, setVariant] = useState<ThemeVariant>(() => {
    if (typeof window === "undefined") return defaultVariant
    return (localStorage.getItem(`${storageKey}-variant`) as ThemeVariant) || defaultVariant
  })
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("light", "dark")
    root.removeAttribute("data-theme")

    // Apply theme mode
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme)
    }

    // Apply theme variant
    if (variant !== "default") {
      root.setAttribute("data-theme", variant)
    }

    // Save to localStorage
    localStorage.setItem(`${storageKey}-mode`, theme)
    localStorage.setItem(`${storageKey}-variant`, variant)
  }, [theme, variant, storageKey])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? "dark" : "light"
      const root = window.document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const value = {
    theme,
    variant,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
    setVariant: (variant: ThemeVariant) => {
      setVariant(variant)
    },
    resolvedTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}