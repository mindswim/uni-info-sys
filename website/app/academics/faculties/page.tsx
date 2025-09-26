import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const faculties = [
  {
    name: "Rivera School of Architecture & Design",
    dean: "Dr. Isabella Martinez",
    founded: "1995",
    students: "1,000+",
    description: "A leading institution for architecture, urban design, and landscape architecture education.",
    departments: ["Architecture", "Urban Design", "Landscape Architecture", "Urban Planning"],
    programs: {
      undergraduate: ["B.Arch Architecture", "BS Architecture"],
      graduate: ["M.Arch", "MS Architecture", "MS Urban Planning", "MLA Landscape Architecture"]
    }
  },
  {
    name: "Thompson School for Public Affairs",
    dean: "Dr. James Thompson",
    founded: "2008",
    students: "2,500+",
    description: "Preparing the next generation of public servants and global leaders.",
    departments: ["Political Science", "International Relations", "Economics", "Sociology", "Anthropology"],
    programs: {
      undergraduate: ["BA Political Science", "BA International Studies", "BA Economics", "BA Public Policy"],
      graduate: ["MPA Public Administration", "MA International Relations", "MA Economics"]
    }
  },
  {
    name: "School of Education",
    dean: "Dr. Patricia Williams",
    founded: "1993",
    students: "1,800+",
    description: "Excellence in teacher preparation and educational leadership for over a century.",
    departments: ["Elementary Education", "Secondary Education", "Special Education", "Educational Leadership"],
    programs: {
      undergraduate: ["BA Childhood Education", "BA Adolescent Education", "BA Special Education"],
      graduate: ["MS Education", "MS Bilingual Education", "MS Educational Leadership", "MS School Counseling"]
    }
  },
  {
    name: "Chen School of Engineering & Technology",
    dean: "Dr. Wei Chen",
    founded: "1998",
    students: "3,200+",
    description: "A premier engineering school driving innovation in technology and research.",
    departments: ["Biomedical Engineering", "Chemical Engineering", "Civil Engineering", "Computer Science", "Electrical Engineering", "Mechanical Engineering"],
    programs: {
      undergraduate: ["BE Biomedical", "BE Chemical", "BE Civil", "BS Computer Science", "BE Electrical", "BE Mechanical"],
      graduate: ["MS/PhD in all engineering disciplines", "MS Computer Science", "MS Data Science"]
    }
  },
  {
    name: "Division of Humanities and the Arts",
    dean: "Dr. Robert Anderson",
    founded: "1991",
    students: "4,500+",
    description: "The heart of liberal arts education, fostering creativity and critical thinking.",
    departments: ["English", "History", "Philosophy", "Art", "Music", "Theatre", "Modern Languages"],
    programs: {
      undergraduate: ["BA English", "BA History", "BA Philosophy", "BFA Art", "BA Music", "BA Theatre", "BA Languages"],
      graduate: ["MA English", "MA History", "MFA Creative Writing", "MFA Studio Art"]
    }
  },
  {
    name: "Division of Science",
    dean: "Dr. Emily Foster",
    founded: "1991",
    students: "3,800+",
    description: "Advancing scientific knowledge through cutting-edge research and education.",
    departments: ["Biology", "Chemistry", "Earth Sciences", "Mathematics", "Physics", "Psychology"],
    programs: {
      undergraduate: ["BS Biology", "BS Chemistry", "BS Earth Science", "BS Mathematics", "BS Physics", "BA Psychology"],
      graduate: ["MS/PhD Biology", "MS/PhD Chemistry", "MS/PhD Physics", "MS Mathematics", "MA/PhD Psychology"]
    }
  }
]

export default function FacultiesPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Schools & Faculties</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Six distinguished schools and divisions offering world-class education across disciplines.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="space-y-8">
            {faculties.map((faculty) => (
              <Card key={faculty.name} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{faculty.name}</CardTitle>
                      <CardDescription className="mt-2">{faculty.description}</CardDescription>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Dean: {faculty.dean}</p>
                      <p>Founded: {faculty.founded}</p>
                      <p>Students: {faculty.students}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Departments</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {faculty.departments.map((dept) => (
                          <li key={dept}>{dept}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Programs Offered</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Undergraduate</h4>
                          <ul className="mt-1 text-sm text-muted-foreground">
                            {faculty.programs.undergraduate.map((prog) => (
                              <li key={prog}>• {prog}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Graduate</h4>
                          <ul className="mt-1 text-sm text-muted-foreground">
                            {faculty.programs.graduate.map((prog) => (
                              <li key={prog}>• {prog}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/academics/departments">View Departments</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/academics/programs">Browse Programs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}