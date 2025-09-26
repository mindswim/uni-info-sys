import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ActivitiesPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Student Activities</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Get involved! With over 200 student organizations, there's something for everyone at Mindswim.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-muted-foreground">
              From academic clubs to cultural organizations, find your community and pursue your passions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}