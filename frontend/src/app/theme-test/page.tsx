"use client"

import { useTheme } from "@/providers/theme-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ThemeTestPage() {
  const { variant, setVariant } = useTheme()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold">Theme Test Page</h1>
      <p className="text-lg">Current theme: <strong>{variant}</strong></p>

      <div className="flex gap-4">
        <Button onClick={() => setVariant("default")}>Default</Button>
        <Button onClick={() => setVariant("classic-university")}>Classic University</Button>
        <Button onClick={() => setVariant("modern-tech")}>Modern Tech</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Typography Test</CardTitle>
            <CardDescription>Testing font sizes and line heights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <p>Regular paragraph text to test base font size.</p>
            <p className="text-sm">Small text size</p>
            <p className="text-xs">Extra small text</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spacing Test</CardTitle>
            <CardDescription>Testing padding and gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                Padding 4 test
              </div>
              <div className="p-6 bg-muted rounded-md">
                Padding 6 test
              </div>
              <div className="flex gap-4">
                <div className="p-4 bg-primary/10 rounded-md">Gap 4</div>
                <div className="p-4 bg-primary/10 rounded-md">Gap 4</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Border Radius Test</CardTitle>
            <CardDescription>Testing corner rounding</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-md">Rounded MD</div>
            <div className="p-4 bg-primary/10 rounded-lg">Rounded LG</div>
            <div className="p-4 bg-primary/10 rounded-xl">Rounded XL</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shadow Test</CardTitle>
            <CardDescription>Testing shadow depths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background shadow-sm rounded-md">Shadow SM</div>
            <div className="p-4 bg-background shadow-md rounded-md">Shadow MD</div>
            <div className="p-4 bg-background shadow-lg rounded-md">Shadow LG</div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Theme Characteristics</h3>
        {variant === "default" && (
          <div>
            <p><strong>Default (shadcn):</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Standard spacing and sizing</li>
              <li>Neutral grays, balanced feel</li>
              <li>Modern, clean aesthetic</li>
            </ul>
          </div>
        )}
        {variant === "classic-university" && (
          <div>
            <p><strong>Classic University:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>50% more generous spacing - prestigious feel</li>
              <li>Larger text (18px base) - easier to read</li>
              <li>Minimal radius (4px) - sharp, formal corners</li>
              <li>Subtle shadows - professional depth</li>
              <li>Slower transitions (200-550ms) - deliberate</li>
            </ul>
          </div>
        )}
        {variant === "modern-tech" && (
          <div>
            <p><strong>Modern Tech:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Compact spacing (14px) - information dense</li>
              <li>Smaller text (15px base) - fit more content</li>
              <li>Very rounded (12px) - playful, friendly</li>
              <li>Dramatic purple-tinted shadows</li>
              <li>Fast transitions (100-350ms) - snappy</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}