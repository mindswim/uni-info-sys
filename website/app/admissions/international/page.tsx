import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function InternationalPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">International Students</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Join our diverse community with students from over 150 countries. We provide comprehensive
            support for your educational journey in the United States.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle>Application Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• TOEFL/IELTS scores required</li>
                    <li>• Transcript evaluation</li>
                    <li>• Financial documentation</li>
                    <li>• Visa support (F-1/J-1)</li>
                    <li>• International transfer credits accepted</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• International Student Services Office</li>
                    <li>• English language support</li>
                    <li>• Cultural adjustment programs</li>
                    <li>• Immigration advising</li>
                    <li>• International student orientation</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" asChild className="mr-4">
                <Link href="/admissions/apply">Apply Now</Link>
              </Button>
              <Button size="lg" variant="outline">
                Contact International Admissions
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}