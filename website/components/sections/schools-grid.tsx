import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const schools = [
  {
    name: "Spitzer School of Architecture",
    description: "Design, urban planning, and landscape architecture",
    programs: "5 undergraduate, 7 graduate",
    href: "/academics/faculties/architecture",
  },
  {
    name: "Colin Powell School",
    description: "Public policy, international relations, and civic engagement",
    programs: "8 undergraduate, 5 graduate",
    href: "/academics/faculties/colin-powell",
  },
  {
    name: "School of Education",
    description: "Teacher preparation and educational leadership",
    programs: "6 undergraduate, 9 graduate",
    href: "/academics/faculties/education",
  },
  {
    name: "Grove School of Engineering",
    description: "Engineering disciplines and computer science",
    programs: "10 undergraduate, 12 graduate",
    href: "/academics/faculties/engineering",
  },
  {
    name: "Division of Humanities & Arts",
    description: "Liberal arts, languages, and creative disciplines",
    programs: "15 undergraduate, 8 graduate",
    href: "/academics/faculties/humanities",
  },
  {
    name: "Division of Science",
    description: "Natural sciences, mathematics, and research",
    programs: "12 undergraduate, 10 graduate",
    href: "/academics/faculties/science",
  },
]

export function SchoolsGrid() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Schools & Divisions</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore our diverse academic divisions, each offering unique programs
            and opportunities for intellectual growth.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {schools.map((school) => (
            <Link key={school.name} href={school.href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {school.description}
                  </p>
                  <p className="text-sm font-medium">{school.programs}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}