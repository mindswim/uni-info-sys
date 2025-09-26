import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trophy, Users, Building2, Calendar, Medal, Dumbbell } from "lucide-react"

const varsitySports = [
  { name: "Basketball", division: "Men's & Women's", season: "Winter" },
  { name: "Soccer", division: "Men's & Women's", season: "Fall" },
  { name: "Swimming & Diving", division: "Men's & Women's", season: "Winter" },
  { name: "Track & Field", division: "Men's & Women's", season: "Spring" },
  { name: "Tennis", division: "Men's & Women's", season: "Spring" },
  { name: "Volleyball", division: "Women's", season: "Fall" },
  { name: "Baseball", division: "Men's", season: "Spring" },
  { name: "Softball", division: "Women's", season: "Spring" },
]

const facilities = [
  {
    name: "Mindswim Athletic Center",
    building: "MAC",
    features: ["25m pool", "Basketball courts", "Fitness center", "Indoor track"],
    hours: "6am-11pm"
  },
  {
    name: "Thompson Stadium",
    building: "TS",
    features: ["Track & field", "Soccer field", "5,000 seats", "Press box"],
    hours: "Dawn to dusk"
  },
  {
    name: "Rivera Recreation Complex",
    building: "RRC",
    features: ["Rock climbing wall", "Dance studios", "Racquetball courts", "Yoga rooms"],
    hours: "7am-10pm"
  },
]

const intramurals = [
  "Flag Football", "3v3 Basketball", "Indoor Soccer", "Volleyball",
  "Dodgeball", "Ultimate Frisbee", "Badminton", "Table Tennis"
]

export default function AthleticsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Athletics & Recreation</h1>
            <p className="text-xl text-slate-200 mb-8">
              Home to 23 NCAA Division III teams, state-of-the-art facilities, and a thriving intramural program.
              Join the Mindswim Dolphins and make your mark in collegiate athletics.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/admissions/apply">Join Our Team</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white" asChild>
                <Link href="#facilities">Explore Facilities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-slate-50 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm text-muted-foreground">Varsity Teams</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">450+</div>
              <div className="text-sm text-muted-foreground">Student Athletes</div>
            </div>
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Athletic Complexes</div>
            </div>
            <div className="text-center">
              <Medal className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">87</div>
              <div className="text-sm text-muted-foreground">Championships</div>
            </div>
          </div>
        </div>
      </section>

      {/* Varsity Sports */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Varsity Athletics</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Compete at the highest level of Division III athletics. Our student-athletes excel both on the field and in the classroom.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {varsitySports.map((sport) => (
                <Card key={sport.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{sport.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{sport.division}</p>
                    <p className="text-sm font-medium">{sport.season} Season</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href="/athletics/roster">View Team Rosters</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Athletic Facilities</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Train and compete in our modern facilities, equipped with everything you need to reach your potential.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card key={facility.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Building {facility.building}</p>
                      </div>
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Features:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {facility.features.map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hours:</p>
                        <p className="text-sm text-muted-foreground">{facility.hours}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intramural Sports */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Intramural Sports</h2>
                <p className="text-muted-foreground mb-6">
                  Not on a varsity team? No problem! Our intramural program offers competitive and recreational
                  leagues for all skill levels. Form a team with friends or join as a free agent.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {intramurals.map((sport) => (
                    <div key={sport} className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <span className="text-sm">{sport}</span>
                    </div>
                  ))}
                </div>
                <Button asChild>
                  <Link href="http://localhost:5174">Register for Intramurals</Link>
                </Button>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Join 2,000+ Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">3 Seasons</p>
                    <p className="text-sm text-muted-foreground">Fall, Winter, Spring leagues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">15+ Sports</p>
                    <p className="text-sm text-muted-foreground">Traditional and unique offerings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Free</p>
                    <p className="text-sm text-muted-foreground">No registration fees for students</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recreation & Fitness */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Recreation & Fitness</h2>
            <p className="text-muted-foreground mb-8 max-w-3xl mx-auto">
              Stay healthy and active with our comprehensive fitness programs and facilities open to all students.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Fitness</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    50+ classes weekly including yoga, spinning, Zumba, and strength training
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/athletics/fitness-schedule">View Schedule</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Personal Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Certified trainers available for one-on-one sessions and customized programs
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/athletics/training">Book Session</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Outdoor Adventures</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Weekend trips for hiking, skiing, rock climbing, and kayaking
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/athletics/outdoor">Upcoming Trips</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Dolphins?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a recruited athlete or just love staying active, there's a place for you at Mindswim.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/admissions/apply">Apply Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
              <Link href="/admissions/visit">Visit Campus</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}