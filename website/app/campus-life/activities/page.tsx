import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Users, Calendar, Award, Music, Palette, Code, BookOpen, Globe } from "lucide-react"

const organizationCategories = [
  {
    title: "Academic & Professional",
    icon: BookOpen,
    count: 45,
    examples: ["Pre-Med Society", "Engineering Club", "Business Association", "Debate Team"],
    description: "Connect with peers in your field and build professional skills"
  },
  {
    title: "Cultural & International",
    icon: Globe,
    count: 38,
    examples: ["International Student Union", "Latino Heritage Club", "Asian Student Association", "African Diaspora Society"],
    description: "Celebrate diversity and share cultural traditions"
  },
  {
    title: "Arts & Performance",
    icon: Music,
    count: 32,
    examples: ["A Cappella Groups", "Theater Company", "Dance Teams", "Film Society"],
    description: "Express creativity through performance and visual arts"
  },
  {
    title: "Technology & Innovation",
    icon: Code,
    count: 28,
    examples: ["Robotics Club", "Hackathon Team", "Game Development", "AI Research Group"],
    description: "Build, code, and innovate with cutting-edge technology"
  },
  {
    title: "Service & Advocacy",
    icon: Award,
    count: 35,
    examples: ["Community Service Corps", "Environmental Action", "Social Justice Coalition", "Tutoring Programs"],
    description: "Make a difference on campus and in the community"
  },
  {
    title: "Recreation & Hobbies",
    icon: Palette,
    count: 42,
    examples: ["Photography Club", "Chess Club", "Outdoor Adventure", "Board Game Society"],
    description: "Pursue interests and hobbies with like-minded students"
  },
]

const featuredEvents = [
  {
    title: "Spring Activities Fair",
    date: "February 15, 2025",
    time: "12:00 PM - 4:00 PM",
    location: "Student Center Plaza",
    description: "Meet representatives from 100+ student organizations"
  },
  {
    title: "Cultural Festival",
    date: "March 22, 2025",
    time: "5:00 PM - 10:00 PM",
    location: "Thompson Quad",
    description: "Food, performances, and exhibits from around the world"
  },
  {
    title: "Leadership Summit",
    date: "April 5, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Rivera Conference Center",
    description: "Workshops and networking for student leaders"
  },
]

const studentGovernment = [
  {
    title: "Student Government Association",
    description: "Represent the student body and shape campus policies",
    positions: "President, Senators, Class Representatives"
  },
  {
    title: "Residence Hall Council",
    description: "Improve residential life and plan hall activities",
    positions: "Floor Representatives, Hall Presidents"
  },
  {
    title: "Academic Senate",
    description: "Collaborate with faculty on academic matters",
    positions: "Student Representatives for each school"
  },
]

export default function ActivitiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Student Activities & Organizations</h1>
            <p className="text-xl text-slate-200 mb-8">
              Join our vibrant community of 200+ student organizations. Find your passion,
              develop leadership skills, and create lifelong friendships.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="http://localhost:5174">Browse Organizations</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white" asChild>
                <Link href="#start-club">Start a Club</Link>
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
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">200+</div>
              <div className="text-sm text-muted-foreground">Student Organizations</div>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Events Per Year</div>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">85%</div>
              <div className="text-sm text-muted-foreground">Student Participation</div>
            </div>
            <div className="text-center">
              <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">Countries Represented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Organization Categories */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Find Your Community</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Explore organizations by category and discover groups that match your interests and goals.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizationCategories.map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Icon className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-primary">{category.count} clubs</span>
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="space-y-1">
                        {category.examples.slice(0, 3).map((example) => (
                          <p key={example} className="text-sm">• {example}</p>
                        ))}
                        <Button size="sm" variant="link" className="p-0 h-auto" asChild>
                          <Link href="http://localhost:5174/organizations">View all {category.count} organizations →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Student Government */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Student Leadership</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Make your voice heard and shape the future of Mindswim through student government.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {studentGovernment.map((org) => (
                <Card key={org.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{org.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {org.description}
                    </p>
                    <p className="text-sm font-medium">Open Positions:</p>
                    <p className="text-sm text-muted-foreground">{org.positions}</p>
                    <Button size="sm" variant="outline" className="mt-4" asChild>
                      <Link href="http://localhost:5174/elections">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredEvents.map((event) => (
                <Card key={event.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm font-medium">{event.date}</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <Button size="sm" variant="outline" className="mt-4 w-full" asChild>
                      <Link href="http://localhost:5174/events">Register</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button asChild>
                <Link href="http://localhost:5174/events">View All Events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Start a Club */}
      <section id="start-club" className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Start Your Own Organization</h2>
                <p className="text-muted-foreground mb-6">
                  Have an idea for a new club or organization? We'll help you get started with funding,
                  meeting space, and promotional support.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">Requirements:</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Minimum 10 interested members</li>
                      <li>• Faculty or staff advisor</li>
                      <li>• Constitution and mission statement</li>
                      <li>• Attend new organization training</li>
                    </ul>
                  </div>
                  <Button asChild>
                    <Link href="http://localhost:5174/start-organization">Start Application</Link>
                  </Button>
                </div>
              </div>
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">Organization Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">Funding</p>
                    <p className="text-sm text-muted-foreground">Up to $5,000 per semester</p>
                  </div>
                  <div>
                    <p className="font-semibold">Meeting Space</p>
                    <p className="text-sm text-muted-foreground">Reserve rooms in Student Center</p>
                  </div>
                  <div>
                    <p className="font-semibold">Marketing</p>
                    <p className="text-sm text-muted-foreground">Campus-wide promotional support</p>
                  </div>
                  <div>
                    <p className="font-semibold">Training</p>
                    <p className="text-sm text-muted-foreground">Leadership development programs</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Connected</h2>
            <p className="text-muted-foreground mb-6">
              Get weekly updates about events, activities, and opportunities to get involved.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}