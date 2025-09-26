import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function VisitPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Visit Campus</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Experience Mindswim College firsthand. Join us for campus tours, information sessions,
            and special visit events throughout the year.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campus Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Student-led walking tours of our Washington Heights campus
                  </p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Monday-Friday: 10am & 2pm</li>
                    <li>• Saturday: 11am</li>
                    <li>• 90 minutes duration</li>
                  </ul>
                  <Button className="w-full" size="sm">Schedule Tour</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Information Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Learn about academics, admissions, and student life
                  </p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Admissions presentation</li>
                    <li>• Q&A with staff</li>
                    <li>• 60 minutes duration</li>
                  </ul>
                  <Button className="w-full" size="sm">Register</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Virtual Visit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Can't visit in person? Take our virtual tour
                  </p>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• 360° campus views</li>
                    <li>• Student testimonials</li>
                    <li>• Available 24/7</li>
                  </ul>
                  <Button className="w-full" size="sm" variant="outline">Start Virtual Tour</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Special Visit Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Open House</h4>
                    <p className="text-sm text-muted-foreground">
                      Full day programs with faculty meetings, tours, and student panels.
                      Held in October and April.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Overnight Visit</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay with current students and experience campus life firsthand.
                      Available for admitted students.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Questions? Contact the Visit Office
              </p>
              <p className="text-sm">
                Phone: (212) 650-6977 | Email: visit@mindswim.edu
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}