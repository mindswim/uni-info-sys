import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProgramsPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Degree Programs</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Choose from over 200 degree programs at undergraduate and graduate levels.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Browse Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our comprehensive program catalog includes bachelor's, master's, and doctoral degrees
                  across all disciplines. Use the filters to find programs that match your interests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}