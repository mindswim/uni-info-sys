import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DepartmentsPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Academic Departments</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Explore our departments across six schools, each offering unique programs and research opportunities.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <p className="text-center text-muted-foreground mb-8">
            Browse departments by school or search for specific programs.
          </p>
          <div className="text-center">
            <Link href="/academics/faculties" className="text-primary hover:underline">
              View Schools & Faculties →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}