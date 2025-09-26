import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CampusLifePage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Campus Life</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Experience vibrant campus life with endless opportunities to learn, grow, and connect.
          </p>
        </div>
      </section>

      {/* Overview Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">200+</div>
                <p className="text-sm text-muted-foreground mt-2">Student Organizations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">23</div>
                <p className="text-sm text-muted-foreground mt-2">Division III Sports</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">12</div>
                <p className="text-sm text-muted-foreground mt-2">Residence Halls</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <p className="text-sm text-muted-foreground mt-2">Annual Events</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Housing */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Housing & Dining</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <div>
              <h3 className="text-xl font-semibold mb-4">Residence Life</h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    Live on campus and immerse yourself in college life. Our residence halls offer
                    comfortable living spaces and vibrant communities.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• Traditional, suite, and apartment-style options</li>
                    <li>• Learning communities and themed housing</li>
                    <li>• 24/7 security and support staff</li>
                    <li>• Study lounges and recreation areas</li>
                    <li>• High-speed internet and cable TV</li>
                    <li>• Laundry facilities in every building</li>
                  </ul>
                  <Button className="mt-4" variant="outline" size="sm">
                    Explore Housing Options
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Dining Services</h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    Enjoy diverse dining options across campus with meal plans designed to fit
                    your lifestyle and dietary needs.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>• 5 dining halls and 10+ retail locations</li>
                    <li>• Vegetarian, vegan, and halal options</li>
                    <li>• Allergen-free dining stations</li>
                    <li>• Late-night dining options</li>
                    <li>• Meal plan flexibility</li>
                    <li>• Sustainability initiatives</li>
                  </ul>
                  <Button className="mt-4" variant="outline" size="sm">
                    View Dining Options
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Student Organizations */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Get Involved</h2>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            With over 200 student organizations, there's something for everyone at Mindswim College.
            Find your passion and build lasting friendships.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic & Professional</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pre-Med Society</li>
                  <li>• Engineering Club</li>
                  <li>• Business Leaders</li>
                  <li>• Debate Team</li>
                  <li>• Model UN</li>
                  <li>• Research Groups</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Arts & Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Theater Company</li>
                  <li>• Dance Groups</li>
                  <li>• A Cappella Groups</li>
                  <li>• Art Society</li>
                  <li>• Film Club</li>
                  <li>• Literary Magazine</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service & Leadership</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Student Government</li>
                  <li>• Volunteer Corps</li>
                  <li>• Sustainability Club</li>
                  <li>• Peer Mentors</li>
                  <li>• Community Service</li>
                  <li>• Social Justice Groups</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Athletics */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Athletics & Recreation</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <Card>
              <CardHeader>
                <CardTitle>Varsity Athletics</CardTitle>
                <CardDescription>NCAA Division III Competition</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Compete at the highest level of Division III athletics as a Mindswim Beaver.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Men's Sports:</strong>
                    <ul className="mt-1 text-muted-foreground">
                      <li>• Basketball</li>
                      <li>• Soccer</li>
                      <li>• Baseball</li>
                      <li>• Track & Field</li>
                      <li>• Cross Country</li>
                      <li>• Tennis</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Women's Sports:</strong>
                    <ul className="mt-1 text-muted-foreground">
                      <li>• Basketball</li>
                      <li>• Soccer</li>
                      <li>• Volleyball</li>
                      <li>• Track & Field</li>
                      <li>• Cross Country</li>
                      <li>• Tennis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recreation & Fitness</CardTitle>
                <CardDescription>Stay Active and Healthy</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our state-of-the-art fitness center and recreational programs help you stay healthy and active.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• 50,000 sq ft fitness center</li>
                  <li>• Indoor swimming pool</li>
                  <li>• Rock climbing wall</li>
                  <li>• Intramural sports leagues</li>
                  <li>• Group fitness classes</li>
                  <li>• Personal training services</li>
                  <li>• Outdoor adventure programs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Health & Wellness */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Health & Wellness</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive medical care right on campus.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Primary care</li>
                  <li>• Mental health counseling</li>
                  <li>• Health education</li>
                  <li>• Immunizations</li>
                  <li>• Emergency care</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Counseling Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Supporting your mental health and well-being.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Individual counseling</li>
                  <li>• Group therapy</li>
                  <li>• Crisis support</li>
                  <li>• Stress management</li>
                  <li>• Wellness workshops</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campus Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Your safety is our top priority.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 24/7 campus security</li>
                  <li>• Emergency blue lights</li>
                  <li>• Safe walk service</li>
                  <li>• Emergency alerts</li>
                  <li>• Safety education</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Campus Life</h2>
          <p className="mb-8 max-w-2xl mx-auto">
            The best way to experience Mindswim College is to visit us. Schedule a campus tour
            and see what life as a Beaver is all about.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/admissions/visit">Schedule a Visit</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent">
              Virtual Tour
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}