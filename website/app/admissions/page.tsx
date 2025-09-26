import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AdmissionsPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Admissions</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Your journey to Mindswim College starts here. We're looking for students who will
            contribute to our vibrant community and thrive in our academic environment.
          </p>
        </div>
      </section>

      {/* Admissions Overview */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">50,000+</div>
                <p className="text-sm text-muted-foreground mt-2">Applications Received</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">18%</div>
                <p className="text-sm text-muted-foreground mt-2">Acceptance Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">3.7</div>
                <p className="text-sm text-muted-foreground mt-2">Average GPA</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">1380</div>
                <p className="text-sm text-muted-foreground mt-2">Average SAT Score</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Admission Pathways</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>First-Year Students</CardTitle>
                <CardDescription>
                  High school seniors and recent graduates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Common Application accepted</li>
                  <li>• SAT/ACT optional for 2025</li>
                  <li>• Early Decision available</li>
                  <li>• Merit scholarships offered</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admissions/undergraduate">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Transfer Students</CardTitle>
                <CardDescription>
                  Students from other colleges and universities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• Credit evaluation provided</li>
                  <li>• Fall and Spring admission</li>
                  <li>• Transfer scholarships</li>
                  <li>• Dedicated transfer advisor</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admissions/transfer">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Graduate Students</CardTitle>
                <CardDescription>
                  Master's and doctoral degree seekers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                  <li>• 78 master's programs</li>
                  <li>• 21 doctoral programs</li>
                  <li>• Research assistantships</li>
                  <li>• Professional development</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/admissions/graduate">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Resources & Information</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">How to Apply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Step-by-step application guide and requirements
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/apply">Application Guide</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Financial Aid</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Scholarships, grants, and financial assistance
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/financial-aid">Aid & Scholarships</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Visit Campus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tours, information sessions, and open houses
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/visit">Schedule Visit</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">International</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Information for international applicants
                </p>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/international">International Info</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Timeline */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Application Timeline</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge className="mt-1">Aug - Oct</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prepare Your Application</h3>
                  <p className="text-sm text-muted-foreground">
                    Research programs, prepare documents, write essays, request recommendations.
                    Attend virtual information sessions and campus tours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge className="mt-1">Nov 1</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Early Decision Deadline</h3>
                  <p className="text-sm text-muted-foreground">
                    Submit your application for Early Decision if Mindswim is your first choice.
                    Binding commitment if accepted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge className="mt-1">Feb 1</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Regular Decision Deadline</h3>
                  <p className="text-sm text-muted-foreground">
                    Final deadline for regular undergraduate applications. Merit scholarship
                    consideration included.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge className="mt-1">Mar 15</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Admission Decisions Released</h3>
                  <p className="text-sm text-muted-foreground">
                    Regular decision notifications sent. Financial aid packages included
                    with admission offers.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Badge className="mt-1">May 1</Badge>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Enrollment Deposit Deadline</h3>
                  <p className="text-sm text-muted-foreground">
                    Confirm your enrollment by submitting your deposit. Housing applications open.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mindswim */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Mindswim?</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Learn from renowned faculty, engage in cutting-edge research, and choose from
                  200+ programs across 6 schools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">NYC Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access unparalleled internships, cultural experiences, and career opportunities
                  in the heart of New York City.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Diverse Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join students from 150+ countries and all 50 states in a vibrant, inclusive
                  campus community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Affordable Education</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  75% of students receive financial aid. Competitive tuition rates and generous
                  scholarship programs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Career Success</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  93% job placement rate within 6 months of graduation. Strong alumni network
                  of 200,000+ professionals.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Student Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive support services including advising, tutoring, career counseling,
                  and wellness programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Take the Next Step</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="font-semibold mb-2">Request Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get our viewbook and learn more about Mindswim College
                </p>
                <Button variant="outline" className="w-full">Request Info</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🏛️</div>
                <h3 className="font-semibold mb-2">Visit Campus</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule a tour or attend an information session
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admissions/visit">Schedule Visit</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="font-semibold mb-2">Connect with Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with admissions counselors and current students
                </p>
                <Button variant="outline" className="w-full">Start Chat</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            Join thousands of students who have chosen Mindswim College as their pathway to success.
            Start your application today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="http://localhost:5174/apply">Start Application</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link href="/admissions/apply">Application Guide</Link>
            </Button>
          </div>
          <div className="mt-8 text-sm">
            <p>Office of Admissions</p>
            <p>Phone: (212) 650-6977 | Email: admissions@mindswim.edu</p>
            <p>Office Hours: Monday-Friday, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </section>
    </>
  )
}