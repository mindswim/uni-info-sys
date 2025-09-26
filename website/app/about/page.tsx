import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">About Mindswim College</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Founded in 1847, Mindswim College has been at the forefront of higher education,
            innovation, and social mobility for over 175 years.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Mindswim College provides a quality and affordable education that enables students
              to develop the knowledge, skills, and convictions to thrive in a changing world,
              contribute to the common good, and transform lives.
            </p>

            <div className="grid gap-6 md:grid-cols-3 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Excellence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Committed to academic rigor and intellectual growth across all disciplines.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diversity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Celebrating diverse perspectives and fostering an inclusive community.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Innovation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Driving breakthrough research and creative solutions to global challenges.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Our History</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex gap-4">
              <Badge className="mt-1">1847</Badge>
              <div>
                <h3 className="font-semibold mb-1">Foundation</h3>
                <p className="text-muted-foreground">
                  Established as the Free Academy, the first institution of free public higher education in the United States.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">1907</Badge>
              <div>
                <h3 className="font-semibold mb-1">College Status</h3>
                <p className="text-muted-foreground">
                  Became the College of the City of New York, expanding academic programs and research.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">1961</Badge>
              <div>
                <h3 className="font-semibold mb-1">University System</h3>
                <p className="text-muted-foreground">
                  Joined the newly formed State University system.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="mt-1">Today</Badge>
              <div>
                <h3 className="font-semibold mb-1">Leading Institution</h3>
                <p className="text-muted-foreground">
                  Serving over 16,000 students with 200+ academic programs and world-class research facilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Leadership</h2>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Dr. Sarah Chen</CardTitle>
                <CardDescription>President</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Leading Mindswim College's strategic vision and academic excellence since 2017.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dr. Michael Johnson</CardTitle>
                <CardDescription>Provost</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Overseeing academic affairs and faculty development initiatives.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dr. Maria Rodriguez</CardTitle>
                <CardDescription>VP of Enrollment</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Managing admissions, financial aid, and student success programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}