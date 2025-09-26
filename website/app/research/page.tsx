import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ResearchPage() {
  return (
    <>
      <section className="bg-slate-900 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Research & Innovation</h1>
          <p className="text-xl text-slate-200 max-w-3xl">
            Pushing the boundaries of knowledge through groundbreaking research and innovation.
          </p>
        </div>
      </section>

      {/* Research Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">$125M</div>
                <p className="text-sm text-muted-foreground mt-2">Annual Research Funding</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">25</div>
                <p className="text-sm text-muted-foreground mt-2">Research Centers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">450+</div>
                <p className="text-sm text-muted-foreground mt-2">Active Research Projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <p className="text-sm text-muted-foreground mt-2">Student Researchers</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Centers */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Research Centers & Institutes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Center for Climate Science</CardTitle>
                <Badge className="w-fit">Environmental Science</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Advancing climate research and developing solutions for environmental challenges.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Climate modeling</li>
                  <li>• Renewable energy</li>
                  <li>• Urban sustainability</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Institute for Biomedical Engineering</CardTitle>
                <Badge className="w-fit">Health Sciences</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Pioneering medical technologies and therapeutic innovations.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Medical devices</li>
                  <li>• Tissue engineering</li>
                  <li>• Biomaterials</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Center for Artificial Intelligence</CardTitle>
                <Badge className="w-fit">Computer Science</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Developing next-generation AI technologies and applications.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Machine learning</li>
                  <li>• Computer vision</li>
                  <li>• Natural language processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Urban Studies Institute</CardTitle>
                <Badge className="w-fit">Social Sciences</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Researching urban challenges and developing policy solutions.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Urban planning</li>
                  <li>• Housing policy</li>
                  <li>• Transportation systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy Research Center</CardTitle>
                <Badge className="w-fit">Engineering</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Innovating sustainable energy solutions for the future.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Solar technology</li>
                  <li>• Energy storage</li>
                  <li>• Smart grid systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Center for Data Science</CardTitle>
                <Badge className="w-fit">Mathematics</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Harnessing big data for scientific discovery and innovation.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Data analytics</li>
                  <li>• Statistical modeling</li>
                  <li>• Predictive algorithms</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Student Research */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Undergraduate Research Opportunities</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Research Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Summer Research Fellowship</h4>
                      <p className="text-sm text-muted-foreground">
                        10-week intensive research experience with faculty mentorship and $5,000 stipend.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Academic Year Research</h4>
                      <p className="text-sm text-muted-foreground">
                        Part-time research positions during the semester with course credit options.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Honors Thesis Program</h4>
                      <p className="text-sm text-muted-foreground">
                        Year-long independent research project culminating in a thesis presentation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Research Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Hands-on Experience:</strong> Work with cutting-edge equipment and technologies
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Faculty Mentorship:</strong> One-on-one guidance from leading researchers
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Publication Opportunities:</strong> Co-author papers in peer-reviewed journals
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Conference Presentations:</strong> Present findings at national conferences
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <div>
                        <strong>Graduate School Prep:</strong> Strengthen applications for advanced degrees
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Breakthroughs */}
      <section className="bg-slate-50 py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">Recent Research Highlights</h2>
          <div className="space-y-6 max-w-4xl">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>New Solar Cell Technology Achieves Record Efficiency</CardTitle>
                    <CardDescription>Dr. Sarah Chen, Department of Physics</CardDescription>
                  </div>
                  <Badge>Energy</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Researchers have developed a new type of solar cell that achieves 35% efficiency,
                  significantly higher than current commercial panels. The breakthrough could make
                  solar energy more affordable and accessible worldwide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>AI Model Predicts Disease Outbreaks with 95% Accuracy</CardTitle>
                    <CardDescription>Dr. Michael Johnson, Computer Science</CardDescription>
                  </div>
                  <Badge>Health</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A new machine learning model developed by our researchers can predict disease
                  outbreaks up to 6 weeks in advance, providing crucial time for public health
                  interventions and resource allocation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Breakthrough in Carbon Capture Technology</CardTitle>
                    <CardDescription>Dr. Maria Rodriguez, Chemical Engineering</CardDescription>
                  </div>
                  <Badge>Environment</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Engineers have created a new material that can capture CO2 from the atmosphere
                  50% more efficiently than existing technologies, offering a promising solution
                  for combating climate change.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Research Community</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're an undergraduate looking for research experience or a graduate student
            pursuing advanced research, Mindswim College provides the resources and support you need.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">
              Explore Research Opportunities
            </Button>
            <Button size="lg" variant="outline">
              Contact Research Office
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}