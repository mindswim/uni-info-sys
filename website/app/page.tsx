import { HeroSection } from "@/components/sections/hero"
import { StatsSection } from "@/components/sections/stats"
import { SchoolsGrid } from "@/components/sections/schools-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <SchoolsGrid />

      {/* Quick Links Section */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Quick Links</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apply Now</CardTitle>
                <CardDescription>Start your journey at Mindswim College</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="http://localhost:5174/apply">Begin Application</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Aid</CardTitle>
                <CardDescription>Explore scholarship and funding options</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/financial-aid">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visit Campus</CardTitle>
                <CardDescription>Schedule a tour or information session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admissions/visit">Schedule Visit</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Calendar</CardTitle>
                <CardDescription>Important dates and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/academics/calendar">View Calendar</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Latest News</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground">December 15, 2024</div>
                <CardTitle className="text-lg">
                  Engineering Students Win National Robotics Competition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Team from Grove School of Engineering takes first place in the prestigious
                  National Collegiate Robotics Championship.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground">December 10, 2024</div>
                <CardTitle className="text-lg">
                  New Research Center for Climate Science Opens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  State-of-the-art facility will advance climate research and provide
                  opportunities for student involvement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm text-muted-foreground">December 5, 2024</div>
                <CardTitle className="text-lg">
                  Record Number of Applications for Fall 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Mindswim College receives over 50,000 applications for undergraduate
                  admission, marking a 15% increase.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Join Our Community?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Take the first step toward your future at Mindswim College. Apply today and
            become part of our diverse, innovative community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="http://localhost:5174/apply">Apply Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent" asChild>
              <Link href="/admissions/apply">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}