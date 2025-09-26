import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AcademicsPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Academics</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Discover limitless opportunities across our schools and programs. Excellence in education,
            innovation in research, and success in your future career.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">6</div>
                <p className="text-sm text-muted-foreground mt-2">Schools & Divisions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">45+</div>
                <p className="text-sm text-muted-foreground mt-2">Departments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">200+</div>
                <p className="text-sm text-muted-foreground mt-2">Degree Programs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">16:1</div>
                <p className="text-sm text-muted-foreground mt-2">Student-Faculty Ratio</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Navigation Cards */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Explore Academics</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Schools & Faculties</CardTitle>
                <CardDescription>
                  Six distinguished schools offering diverse academic opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Architecture</li>
                  <li>• Engineering</li>
                  <li>• Liberal Arts & Sciences</li>
                  <li>• Education</li>
                  <li>• Public Affairs</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/academics/faculties">View All Schools</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Degree Programs</CardTitle>
                <CardDescription>
                  Undergraduate and graduate programs across all disciplines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• 56 Bachelor's degrees</li>
                  <li>• 78 Master's programs</li>
                  <li>• 21 Doctoral programs</li>
                  <li>• 15 Certificate programs</li>
                  <li>• Online & hybrid options</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/academics/programs">Browse Programs</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Academic Resources</CardTitle>
                <CardDescription>
                  Support services to help you succeed academically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Academic advising</li>
                  <li>• Tutoring centers</li>
                  <li>• Writing center</li>
                  <li>• Study abroad programs</li>
                  <li>• Career services</li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/academics/resources">Get Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Programs */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Programs</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Undergraduate Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Computer Science</span>
                    <Badge variant="outline">450 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Business Administration</span>
                    <Badge variant="outline">380 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Biomedical Engineering</span>
                    <Badge variant="outline">320 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Psychology</span>
                    <Badge variant="outline">290 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Architecture</span>
                    <Badge variant="outline">250 students</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Graduate Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MBA</span>
                    <Badge variant="outline">180 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MS Computer Science</span>
                    <Badge variant="outline">150 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Master of Public Health</span>
                    <Badge variant="outline">120 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MS Data Science</span>
                    <Badge variant="outline">110 students</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Master of Education</span>
                    <Badge variant="outline">95 students</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Academic Excellence */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Academic Excellence</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Honors Program</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Challenging curriculum for high-achieving students with special seminars,
                  research opportunities, and priority registration.
                </p>
                <Button variant="outline" size="sm">Learn More</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Study Abroad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Expand your horizons with semester or year-long programs in over 50 countries
                  around the world.
                </p>
                <Button variant="outline" size="sm">Explore Programs</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Internships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Gain real-world experience with internship opportunities at top companies
                  and organizations in NYC and beyond.
                </p>
                <Button variant="outline" size="sm">Find Internships</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Academic Calendar Preview */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Academic Calendar 2024-2025</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fall 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Classes Begin</span>
                    <strong>August 28</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Add/Drop Deadline</span>
                    <strong>September 10</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Midterm Exams</span>
                    <strong>October 14-18</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Thanksgiving Break</span>
                    <strong>November 27-29</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Exams</span>
                    <strong>December 16-20</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spring 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Classes Begin</span>
                    <strong>January 27</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Add/Drop Deadline</span>
                    <strong>February 7</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Spring Break</span>
                    <strong>March 17-21</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Exams</span>
                    <strong>May 12-16</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Commencement</span>
                    <strong>May 23</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <Link href="/academics/calendar">View Full Calendar</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Start Your Academic Journey</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            With world-class faculty, innovative programs, and endless opportunities,
            Mindswim College is where your academic dreams become reality.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="http://localhost:5174/apply">Apply Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link href="/academics/programs">Explore Programs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}