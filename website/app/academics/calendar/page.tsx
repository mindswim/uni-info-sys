import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Academic Calendar</h1>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto">
            Important dates and deadlines for the 2024-2025 academic year.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Fall 2024</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Classes Begin: August 28</li>
                  <li>Add/Drop Deadline: September 10</li>
                  <li>Fall Break: October 14-15</li>
                  <li>Thanksgiving Break: November 27-29</li>
                  <li>Final Exams: December 16-20</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spring 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Classes Begin: January 27</li>
                  <li>Add/Drop Deadline: February 7</li>
                  <li>Spring Break: March 17-21</li>
                  <li>Final Exams: May 12-16</li>
                  <li>Commencement: May 23</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}