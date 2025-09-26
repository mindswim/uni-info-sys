import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HousingPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Housing & Dining</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Live and dine on campus for the complete college experience. Our residence halls and dining
            facilities create a vibrant community atmosphere.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Residence Halls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  12 residence halls housing over 4,000 students
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Traditional, suite, and apartment styles</li>
                  <li>• Learning communities by major/interest</li>
                  <li>• 24/7 security and support</li>
                  <li>• Study lounges and common areas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dining Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Multiple dining options across campus
                </p>
                <ul className="text-sm space-y-1">
                  <li>• 5 dining halls</li>
                  <li>• 10+ retail locations</li>
                  <li>• Flexible meal plans</li>
                  <li>• Special dietary accommodations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}