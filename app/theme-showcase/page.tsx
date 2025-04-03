import { AvolveThemeShowcase } from "@/components/ui/avolve-theme-showcase"

export default function ThemeShowcasePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Avolve Theme System</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This page demonstrates the Avolve conceptual framework color system and how to use it in your application.
      </p>
      <AvolveThemeShowcase />
    </div>
  )
}
