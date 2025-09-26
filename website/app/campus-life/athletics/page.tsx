import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AthleticsPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Athletics & Recreation</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Stay active with NCAA Division III athletics, intramural sports, and state-of-the-art fitness facilities.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Varsity Sports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  23 NCAA Division III teams competing at the highest level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recreation Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  50,000 sq ft facility with gym, pool, rock climbing, and more
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}