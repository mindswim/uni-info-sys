"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";

interface FacultyMember {
  id: number;
  name: string;
  email: string;
  job_title: string;
  current_sections: number;
  advisee_count: number;
}

interface FacultyPerformance {
  id: number;
  name: string;
  email: string;
  job_title: string;
  sections_taught: number;
  total_enrolled: number;
  avg_enrollment: number;
  avg_evaluation_score: number | null;
  grade_distribution: Record<string, number>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function ChairFacultyPage() {
  const { toast } = useToast();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [performance, setPerformance] = useState<FacultyPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [facultyRes, perfRes] = await Promise.all([
        fetch(`${API_BASE_URL}/department-chair/faculty`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/department-chair/faculty-performance`, {
          headers: getAuthHeaders(),
        }),
      ]);
      const facultyData = await facultyRes.json();
      const perfData = await perfRes.json();
      setFaculty(facultyData.data || []);
      setPerformance(perfData.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load faculty data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const topGrades = (dist: Record<string, number>) => {
    const entries = Object.entries(dist).sort(([, a], [, b]) => b - a);
    return entries.slice(0, 3);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Department Faculty
          </h1>
          <p className="text-muted-foreground">
            Faculty members, teaching loads, and performance metrics
          </p>
        </div>

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <CardTitle>Faculty List</CardTitle>
                <CardDescription>
                  Current teaching and advising assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Advisees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : faculty.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No faculty found
                        </TableCell>
                      </TableRow>
                    ) : (
                      faculty.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">
                            {f.name}
                          </TableCell>
                          <TableCell>{f.email}</TableCell>
                          <TableCell>{f.job_title || "--"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {f.current_sections}
                            </Badge>
                          </TableCell>
                          <TableCell>{f.advisee_count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Performance</CardTitle>
                <CardDescription>
                  Teaching metrics, enrollment data, and evaluation scores for
                  the current term
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sections</TableHead>
                      <TableHead>Total Enrolled</TableHead>
                      <TableHead>Avg Enrollment</TableHead>
                      <TableHead>Eval Score</TableHead>
                      <TableHead>Top Grades</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : performance.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No performance data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      performance.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div className="font-medium">{p.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {p.job_title || "Faculty"}
                            </div>
                          </TableCell>
                          <TableCell>{p.sections_taught}</TableCell>
                          <TableCell>{p.total_enrolled}</TableCell>
                          <TableCell>{p.avg_enrollment}</TableCell>
                          <TableCell>
                            {p.avg_evaluation_score !== null ? (
                              <Badge
                                variant={
                                  p.avg_evaluation_score >= 4
                                    ? "default"
                                    : p.avg_evaluation_score >= 3
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {p.avg_evaluation_score}/5
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {topGrades(p.grade_distribution).map(
                                ([grade, count]) => (
                                  <Badge
                                    key={grade}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {grade}: {count}
                                  </Badge>
                                )
                              )}
                              {Object.keys(p.grade_distribution).length ===
                                0 && (
                                <span className="text-muted-foreground text-sm">
                                  No grades
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
