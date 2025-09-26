import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function FinancialAidPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Financial Aid & Scholarships</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            We're committed to making education affordable. Over 75% of our students receive financial assistance.
          </p>
        </div>
      </section>

      {/* Cost of Attendance */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">2024-2025 Cost of Attendance</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>In-State Students</CardTitle>
                <CardDescription>New York Residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tuition & Fees</span>
                    <strong>$7,340</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Room & Board</span>
                    <strong>$14,988</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Books & Supplies</span>
                    <strong>$1,364</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Expenses</span>
                    <strong>$3,502</strong>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Annual Cost</span>
                      <span>$27,194</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Out-of-State Students</CardTitle>
                <CardDescription>Non-Residents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tuition & Fees</span>
                    <strong>$15,020</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Room & Board</span>
                    <strong>$14,988</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Books & Supplies</span>
                    <strong>$1,364</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Expenses</span>
                    <strong>$3,502</strong>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Annual Cost</span>
                      <span>$34,874</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Types of Aid */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Types of Financial Aid</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Grants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Free money based on financial need. No repayment required.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Federal Pell Grant</li>
                  <li>• NYS TAP Grant</li>
                  <li>• SEOG Grant</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scholarships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Merit and need-based awards. No repayment required.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Presidential Scholars</li>
                  <li>• Dean's Excellence</li>
                  <li>• Department Awards</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work-Study</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Part-time employment on campus. Earn while you learn.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• 10-20 hours/week</li>
                  <li>• Flexible schedule</li>
                  <li>• Career experience</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Loans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Federal loans with low interest rates. Repayment after graduation.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Subsidized Loans</li>
                  <li>• Unsubsidized Loans</li>
                  <li>• Parent PLUS Loans</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Merit Scholarships</h2>
          <div className="space-y-6 max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Presidential Scholarship</CardTitle>
                    <CardDescription>Full tuition coverage for exceptional students</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">$7,340/year</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• GPA: 3.8 or higher</li>
                      <li>• SAT: 1450+ or ACT: 32+</li>
                      <li>• Strong leadership experience</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Full tuition coverage</li>
                      <li>• Priority registration</li>
                      <li>• Research opportunities</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Dean's Excellence Award</CardTitle>
                    <CardDescription>Recognition for academic achievement</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">$5,000/year</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• GPA: 3.5 or higher</li>
                      <li>• SAT: 1350+ or ACT: 29+</li>
                      <li>• Community service</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• $5,000 annual award</li>
                      <li>• Renewable for 4 years</li>
                      <li>• Honors program eligibility</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Diversity Leadership Scholarship</CardTitle>
                    <CardDescription>Supporting diverse perspectives and backgrounds</CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-800">$3,000/year</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• GPA: 3.0 or higher</li>
                      <li>• Demonstrated leadership</li>
                      <li>• Diversity statement</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• $3,000 annual award</li>
                      <li>• Mentorship program</li>
                      <li>• Leadership development</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">How to Apply for Aid</h2>
          <div className="max-w-3xl space-y-6">
            <div className="flex gap-4">
              <Badge className="mt-1">1</Badge>
              <div>
                <h3 className="font-semibold mb-2">Complete the FAFSA</h3>
                <p className="text-muted-foreground">
                  File the Free Application for Federal Student Aid (FAFSA) at studentaid.gov.
                  Our school code is 002688.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">2</Badge>
              <div>
                <h3 className="font-semibold mb-2">Apply for TAP (NY Residents)</h3>
                <p className="text-muted-foreground">
                  New York residents should also apply for the Tuition Assistance Program (TAP)
                  at hesc.ny.gov.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">3</Badge>
              <div>
                <h3 className="font-semibold mb-2">Submit Additional Documents</h3>
                <p className="text-muted-foreground">
                  Provide any requested verification documents to complete your financial aid file.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">4</Badge>
              <div>
                <h3 className="font-semibold mb-2">Review Your Award Letter</h3>
                <p className="text-muted-foreground">
                  Once processed, you'll receive an award letter detailing your financial aid package.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Important Deadlines</h2>
          <Card className="max-w-2xl">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>FAFSA Priority Deadline</span>
                  <strong>February 15</strong>
                </div>
                <div className="flex justify-between">
                  <span>TAP Application Deadline</span>
                  <strong>May 1</strong>
                </div>
                <div className="flex justify-between">
                  <span>Merit Scholarship Consideration</span>
                  <strong>February 1</strong>
                </div>
                <div className="flex justify-between">
                  <span>Financial Aid Award Notifications Begin</span>
                  <strong>March 15</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Our financial aid counselors are here to help you navigate the process and find the best options for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="http://localhost:5174/apply">Apply for Aid</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent">
              Contact Financial Aid Office
            </Button>
          </div>
          <div className="mt-8 text-sm">
            <p>Office of Financial Aid</p>
            <p>Phone: (212) 650-5819 | Email: finaid@mindswim.edu</p>
            <p>Office Hours: Monday-Friday, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </section>
    </>
  )
}