import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ApplyPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">How to Apply</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Join our diverse community of scholars. Start your application journey today.
          </p>
        </div>
      </section>

      {/* Application Types */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Choose Your Application Path</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Undergraduate Application</CardTitle>
                <CardDescription>For first-year and transfer students</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• First-year students (high school seniors)</li>
                  <li>• Transfer students (from other colleges)</li>
                  <li>• International students</li>
                  <li>• Returning/readmit students</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="http://localhost:5174/apply">Start Undergraduate Application</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Graduate Application</CardTitle>
                <CardDescription>For master's and doctoral programs</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-4">
                  <li>• Master's degree programs</li>
                  <li>• Doctoral programs</li>
                  <li>• Graduate certificates</li>
                  <li>• Professional programs</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="http://localhost:5174/apply">Start Graduate Application</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Application Process</h2>
          <div className="max-w-3xl space-y-6">
            <div className="flex gap-4">
              <Badge className="mt-1">Step 1</Badge>
              <div>
                <h3 className="font-semibold mb-2">Create Your Account</h3>
                <p className="text-muted-foreground">
                  Begin by creating an account in our application portal. You'll be able to save your progress
                  and return anytime.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">Step 2</Badge>
              <div>
                <h3 className="font-semibold mb-2">Complete Application Form</h3>
                <p className="text-muted-foreground">
                  Fill out personal information, academic history, and program preferences. Choose up to 3 programs
                  in order of preference.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">Step 3</Badge>
              <div>
                <h3 className="font-semibold mb-2">Submit Required Documents</h3>
                <p className="text-muted-foreground">
                  Upload transcripts, test scores (SAT/ACT for undergrad, GRE/GMAT for graduate), letters of
                  recommendation, and personal statement.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">Step 4</Badge>
              <div>
                <h3 className="font-semibold mb-2">Pay Application Fee</h3>
                <p className="text-muted-foreground">
                  Submit the $65 application fee (fee waivers available for eligible students).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">Step 5</Badge>
              <div>
                <h3 className="font-semibold mb-2">Track Your Application</h3>
                <p className="text-muted-foreground">
                  Monitor your application status, submit additional materials if requested, and receive your
                  admission decision online.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Application Requirements</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <div>
              <h3 className="text-xl font-semibold mb-4">Undergraduate Requirements</h3>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>GPA:</strong> Minimum 3.0 (B average)
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>SAT/ACT:</strong> Optional for 2025 admission
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>High School Courses:</strong> 4 years English, 3 years Math, 3 years Science, 3 years Social Studies
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Letters:</strong> 2 recommendation letters
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Essay:</strong> 500-650 word personal statement
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Graduate Requirements</h3>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Degree:</strong> Bachelor's from accredited institution
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>GPA:</strong> Minimum 3.0 in major
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Tests:</strong> GRE/GMAT (program specific)
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Letters:</strong> 3 academic/professional references
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Statement:</strong> Statement of purpose (750-1000 words)
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Important Deadlines</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Fall 2025 Admission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Early Decision</span>
                    <strong>November 1, 2024</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Decision</span>
                    <strong>February 1, 2025</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Students</span>
                    <strong>March 15, 2025</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Graduate Programs</span>
                    <strong>December 15, 2024</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spring 2026 Admission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>All Undergraduates</span>
                    <strong>November 1, 2025</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Graduate Programs</span>
                    <strong>October 1, 2025</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>International Students</span>
                    <strong>September 1, 2025</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your application today and take the first step toward your future at Mindswim College.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="http://localhost:5174/apply">Start Application</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/admissions/visit">Schedule a Visit</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}