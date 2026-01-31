'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, Plus, Search, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { getAuthHeaders } from '@/lib/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/api/v1';

interface Course {
  id: number;
  code: string;
  name: string;
  credit_hours: number;
  description?: string;
}

interface PlannedCourse {
  id: number;
  term_id: number;
  course_id: number;
  status: 'planned' | 'registered' | 'completed' | 'dropped';
  course: Course;
}

interface Term {
  id: number;
  name: string;
  type: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

interface ValidationIssue {
  type: 'warning' | 'error';
  message: string;
}

export default function AcademicPlannerPage() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [plannedCourses, setPlannedCourses] = useState<PlannedCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    validatePlan();
  }, [plannedCourses]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      const [termsRes, plannedRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/terms`, { headers }),
        fetch(`${API_BASE_URL}/academic-plans/me`, { headers }),
        fetch(`${API_BASE_URL}/courses`, { headers }),
      ]);

      const termsData = await termsRes.json();
      const plannedData = await plannedRes.json();
      const coursesData = await coursesRes.json();

      setTerms(termsData.data || []);
      setPlannedCourses(plannedData.data || []);
      setAvailableCourses(coursesData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePlan = () => {
    const issues: ValidationIssue[] = [];

    terms.forEach(term => {
      const termCourses = plannedCourses.filter(pc => pc.term_id === term.id);
      const totalCredits = termCourses.reduce((sum, pc) => sum + pc.course.credit_hours, 0);

      if (totalCredits > 18) {
        issues.push({
          type: 'error',
          message: `${term.name}: ${totalCredits} credit hours exceeds maximum of 18`
        });
      } else if (totalCredits > 15) {
        issues.push({
          type: 'warning',
          message: `${term.name}: ${totalCredits} credit hours is heavy (15+ credits)`
        });
      } else if (totalCredits < 12 && termCourses.length > 0) {
        issues.push({
          type: 'warning',
          message: `${term.name}: ${totalCredits} credit hours is below full-time status (12 credits)`
        });
      }
    });

    setValidationIssues(issues);
  };

  const addCourseToTerm = async (courseId: number, termId: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic-plans`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term_id: termId,
          course_id: courseId,
          status: 'planned',
        }),
      });

      if (response.ok) {
        await fetchData();
        setSearchDialogOpen(false);
        setSearchQuery('');
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const removeCourseFromPlan = async (plannedCourseId: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic-plans/${plannedCourseId}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error removing course:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'registered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'dropped':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredCourses = availableCourses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading academic planner...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageShell title="Academic Planner" description="Plan your course schedule across multiple terms">

        {validationIssues.length > 0 && (
          <div className="space-y-2">
            {validationIssues.map((issue, index) => (
              <Alert
                key={index}
                variant={issue.type === 'error' ? 'destructive' : 'default'}
              >
                {issue.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {issue.type === 'error' ? 'Validation Error' : 'Warning'}
                </AlertTitle>
                <AlertDescription>{issue.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {terms.map(term => {
            const termCourses = plannedCourses.filter(pc => pc.term_id === term.id);
            const totalCredits = termCourses.reduce((sum, pc) => sum + pc.course.credit_hours, 0);

            return (
              <Card key={term.id} className={term.is_current ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{term.name}</span>
                    {term.is_current && (
                      <Badge variant="default">Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(term.start_date).toLocaleDateString()}
                    </div>
                    <div className="mt-1">
                      Total Credits: <span className="font-semibold">{totalCredits}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {termCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No courses planned</p>
                  ) : (
                    termCourses.map(pc => (
                      <div
                        key={pc.id}
                        className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{pc.course.code}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {pc.course.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeCourseFromPlan(pc.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getStatusColor(pc.status)}>
                            {pc.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {pc.course.credit_hours} credits
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  <Dialog
                    open={searchDialogOpen && selectedTermId === term.id}
                    onOpenChange={(open) => {
                      setSearchDialogOpen(open);
                      if (open) {
                        setSelectedTermId(term.id);
                      } else {
                        setSelectedTermId(null);
                        setSearchQuery('');
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedTermId(term.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Add Course to {term.name}</DialogTitle>
                        <DialogDescription>
                          Search and select a course to add to your academic plan
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by course code or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>

                        <div className="border rounded-lg max-h-96 overflow-y-auto">
                          {filteredCourses.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                              No courses found
                            </p>
                          ) : (
                            <div className="divide-y">
                              {filteredCourses.map(course => {
                                const alreadyPlanned = plannedCourses.some(
                                  pc => pc.course_id === course.id && pc.term_id === term.id
                                );

                                return (
                                  <div
                                    key={course.id}
                                    className="p-4 hover:bg-accent/50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium">{course.code}</p>
                                          <Badge variant="secondary">
                                            {course.credit_hours} credits
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {course.name}
                                        </p>
                                        {course.description && (
                                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                            {course.description}
                                          </p>
                                        )}
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() => addCourseToTerm(course.id, term.id)}
                                        disabled={alreadyPlanned}
                                      >
                                        {alreadyPlanned ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Added
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchDialogOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </PageShell>
    </AppShell>
  );
}
