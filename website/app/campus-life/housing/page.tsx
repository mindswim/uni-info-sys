import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Home, Users, Wifi, BookOpen, Utensils, Coffee, Clock, Shield, MapPin, DollarSign } from "lucide-react"

// Aligns with database buildings table
const residenceHalls = [
  {
    name: "Thompson Hall",
    code: "TH",
    type: "Traditional",
    capacity: 400,
    yearLevel: "First-Year",
    features: ["Single and double rooms", "Community bathrooms", "Study lounges", "Laundry facilities"],
    rate: "$4,200/semester",
    available: true
  },
  {
    name: "Rivera Commons",
    code: "RC",
    type: "Suite-Style",
    capacity: 320,
    yearLevel: "Sophomore",
    features: ["4-person suites", "Private bathrooms", "Common room", "Kitchenette"],
    rate: "$4,800/semester",
    available: true
  },
  {
    name: "Chen Towers",
    code: "CT",
    type: "Apartment",
    capacity: 280,
    yearLevel: "Upper-Class",
    features: ["Full kitchen", "Living room", "1-2 bedrooms", "In-unit laundry"],
    rate: "$5,400/semester",
    available: false
  },
  {
    name: "Washington Heights Hall",
    code: "WH",
    type: "Traditional",
    capacity: 450,
    yearLevel: "First-Year",
    features: ["Learning communities", "24/7 quiet floors", "Music practice rooms", "Maker space"],
    rate: "$4,200/semester",
    available: true
  },
  {
    name: "Innovation Village",
    code: "IV",
    type: "Suite-Style",
    capacity: 360,
    yearLevel: "All Years",
    features: ["Entrepreneurship focus", "Collaboration spaces", "Tech lounges", "Startup incubator"],
    rate: "$5,000/semester",
    available: true
  },
  {
    name: "Graduate Housing Complex",
    code: "GH",
    type: "Apartment",
    capacity: 200,
    yearLevel: "Graduate",
    features: ["Studio and 1-bedroom", "Full amenities", "Parking included", "Pet-friendly"],
    rate: "$900/month",
    available: true
  },
]

const diningLocations = [
  {
    name: "Main Dining Commons",
    building: "Student Center",
    type: "All-You-Care-To-Eat",
    hours: "7am - 9pm",
    features: ["9 food stations", "Vegan/vegetarian", "Allergen-free zone", "Made-to-order"]
  },
  {
    name: "Rivera Marketplace",
    building: "Rivera Hall",
    type: "Food Court",
    hours: "8am - 11pm",
    features: ["6 restaurants", "Grab-and-go", "Late night", "Meal exchange"]
  },
  {
    name: "Chen Café",
    building: "Engineering Building",
    type: "Coffee & Bakery",
    hours: "7am - 8pm",
    features: ["Starbucks", "Fresh pastries", "Study space", "Outdoor seating"]
  },
  {
    name: "Thompson Grill",
    building: "Thompson Union",
    type: "Restaurant",
    hours: "11am - 10pm",
    features: ["Burgers & wings", "Sports viewing", "Group seating", "Online ordering"]
  },
  {
    name: "Mindswim Market",
    building: "Campus Center",
    type: "Convenience Store",
    hours: "24/7",
    features: ["Groceries", "Snacks", "Personal items", "Meal plan accepted"]
  },
]

const mealPlans = [
  {
    name: "Unlimited Plus",
    meals: "Unlimited",
    points: "$500",
    cost: "$2,850/semester",
    best: "On-campus residents",
    popular: true
  },
  {
    name: "Block 225",
    meals: "225 meals",
    points: "$300",
    cost: "$2,450/semester",
    best: "Regular schedule"
  },
  {
    name: "Block 150",
    meals: "150 meals",
    points: "$400",
    cost: "$2,100/semester",
    best: "Apartment residents"
  },
  {
    name: "Commuter 50",
    meals: "50 meals",
    points: "$200",
    cost: "$750/semester",
    best: "Commuter students"
  },
]

const learningCommunities = [
  { name: "STEM Scholars", hall: "Chen Towers", description: "For science, technology, engineering, and math majors" },
  { name: "Global Citizens", hall: "Rivera Commons", description: "International students and global studies" },
  { name: "Creative Arts", hall: "Washington Heights Hall", description: "Artists, musicians, and performers" },
  { name: "Honors Program", hall: "Thompson Hall", description: "High-achieving students across all majors" },
  { name: "Wellness Living", hall: "Innovation Village", description: "Health-conscious and substance-free lifestyle" },
]

export default function HousingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Housing & Dining</h1>
            <p className="text-xl text-slate-200 mb-8">
              Make Mindswim your home. Our residence halls and dining facilities create a supportive
              community where you'll thrive academically and socially.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="http://localhost:5174/housing">Apply for Housing</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white" asChild>
                <Link href="/admissions/visit">Schedule a Tour</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-slate-50 border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <Home className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Residence Halls</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">4,000+</div>
              <div className="text-sm text-muted-foreground">Residents</div>
            </div>
            <div className="text-center">
              <Utensils className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Dining Halls</div>
            </div>
            <div className="text-center">
              <Coffee className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm text-muted-foreground">Food Locations</div>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* Residence Halls */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Residence Halls</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              Choose from traditional, suite-style, or apartment living. All halls include Wi-Fi, laundry,
              study spaces, and 24/7 support from Resident Advisors.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {residenceHalls.map((hall) => (
                <Card key={hall.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <CardTitle className="text-lg">{hall.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Building {hall.code}</p>
                      </div>
                      {hall.available ? (
                        <Badge variant="default" className="bg-green-500">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Waitlist</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{hall.type}</Badge>
                      <Badge variant="outline">{hall.yearLevel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Features:</p>
                        <ul className="text-sm text-muted-foreground space-y-0.5">
                          {hall.features.slice(0, 3).map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <div>
                          <p className="text-sm font-medium">{hall.rate}</p>
                          <p className="text-xs text-muted-foreground">{hall.capacity} residents</p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="http://localhost:5174/housing/apply">Apply</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Communities */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Living-Learning Communities</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join a community of students who share your interests and academic goals.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningCommunities.map((community) => (
                <Card key={community.name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{community.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{community.hall}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{community.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="http://localhost:5174/housing/communities">Learn More About Communities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Campus Dining</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
              From all-you-care-to-eat dining halls to late-night snacks, we've got you covered with
              fresh, diverse, and healthy options.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {diningLocations.map((location) => (
                <Card key={location.name}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{location.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{location.building}</p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Badge variant="secondary" className="w-fit">{location.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Hours: {location.hours}</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {location.features.map((feature) => (
                        <li key={feature}>• {feature}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Meal Plans */}
            <div className="bg-slate-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Meal Plans</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealPlans.map((plan) => (
                  <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
                    {plan.popular && (
                      <div className="bg-primary text-white text-center py-1 text-xs font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold">{plan.cost}</p>
                        <div className="space-y-1 text-sm">
                          <p>{plan.meals}</p>
                          <p>{plan.points} dining dollars</p>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                          Best for: {plan.best}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button asChild>
                  <Link href="http://localhost:5174/dining/plans">Compare All Plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Selection Process */}
      <section className="py-16 bg-slate-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Room Selection Process</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold mb-1">Submit Housing Application</h3>
                  <p className="text-sm text-muted-foreground">Complete online application and pay $200 deposit by May 1</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold mb-1">Complete Roommate Survey</h3>
                  <p className="text-sm text-muted-foreground">Match with compatible roommates based on lifestyle preferences</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold mb-1">Receive Selection Time</h3>
                  <p className="text-sm text-muted-foreground">Priority based on class year and application date</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold mb-1">Select Your Room</h3>
                  <p className="text-sm text-muted-foreground">Choose from available rooms during your selection window</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <h3 className="font-semibold mb-1">Move In!</h3>
                  <p className="text-sm text-muted-foreground">Arrive during orientation week and meet your new community</p>
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <Link href="http://localhost:5174/housing/apply">Start Your Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-3">Housing & Residential Life</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Student Center, Room 210</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Monday-Friday, 9am-5pm</span>
                      </div>
                      <p>Phone: (212) 555-4000</p>
                      <p>Email: housing@mindswim.edu</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Dining Services</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Main Dining Commons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Monday-Friday, 8am-6pm</span>
                      </div>
                      <p>Phone: (212) 555-4100</p>
                      <p>Email: dining@mindswim.edu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}