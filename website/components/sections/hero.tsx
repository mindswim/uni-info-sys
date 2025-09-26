import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to Mindswim College
          </h1>
          <p className="mb-8 text-lg text-slate-200 sm:text-xl">
            Discover your potential at New York's premier public university.
            Join a diverse community of scholars, researchers, and innovators
            shaping the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="http://localhost:5174/apply">Apply Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20" asChild>
              <Link href="/academics/programs">Explore Programs</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white hover:bg-white/20" asChild>
              <Link href="/admissions/visit">Visit Campus</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}