import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GraduatePage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Graduate Admissions</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Advance your career with master's and doctoral programs designed for academic excellence
            and professional growth.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Master's Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    78 programs across all disciplines
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• 1-2 year programs</li>
                    <li>• Full and part-time options</li>
                    <li>• Research opportunities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doctoral Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    21 PhD programs in select fields
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Full funding available</li>
                    <li>• Research assistantships</li>
                    <li>• Teaching opportunities</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Professional Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Career-focused advanced degrees
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• MBA</li>
                    <li>• MPA</li>
                    <li>• MSW</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/admissions/apply">Start Your Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}