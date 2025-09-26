import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UndergraduatePage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Undergraduate Admissions</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Begin your journey at Mindswim College. We welcome first-year and transfer students
            ready to excel in their chosen fields.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>First-Year Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  High school seniors and recent graduates applying for their first bachelor's degree.
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>• Common Application accepted</li>
                  <li>• SAT/ACT optional</li>
                  <li>• Early Decision available</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admissions/apply">Apply as First-Year</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transfer Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Students with college credits from other institutions seeking to complete their degree.
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>• Credit evaluation provided</li>
                  <li>• Fall and Spring admission</li>
                  <li>• Transfer scholarships available</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admissions/apply">Apply as Transfer</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}