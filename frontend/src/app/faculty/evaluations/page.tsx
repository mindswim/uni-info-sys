"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { Star, MessageSquare, Users, BarChart3 } from "lucide-react";

interface CourseSection {
  id: number;
  course: {
    code: string;
    name: string;
  };
  section_number: string;
  term: {
    name: string;
  };
}

interface EvaluationQuestion {
  id: number;
  question_text: string;
  question_type: "rating_5" | "text";
}

interface QuestionResult {
  question: EvaluationQuestion;
  average_rating?: number;
  response_count: number;
  text_responses?: string[];
}

interface EvaluationResults {
  course_section: CourseSection;
  total_responses: number;
  total_students: number;
  response_rate: number;
  question_results: QuestionResult[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function FacultyEvaluationsPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [results, setResults] = useState<EvaluationResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourseSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchEvaluationResults();
    }
  }, [selectedSection]);

  const fetchCourseSections = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculty/course-sections`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch course sections");
      const data = await response.json();
      setSections(data.data || []);
      if (data.data?.length > 0) {
        setSelectedSection(data.data[0].id.toString());
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course sections",
        variant: "destructive",
      });
    }
  };

  const fetchEvaluationResults = async () => {
    if (!selectedSection) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/course-sections/${selectedSection}/evaluation-results`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch evaluation results");
      const data = await response.json();
      setResults(data.data || null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load evaluation results",
        variant: "destructive",
      });
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(2)}</span>
      </div>
    );
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AppShell>
      <PageShell title="Course Evaluation Results" description="View aggregated student feedback for your courses">
        <Card>
          <CardHeader>
            <CardTitle>Select Course Section</CardTitle>
            <CardDescription>Choose a course section to view evaluation results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="section-select">Course Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger id="section-select">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      {section.course.code} - Section {section.section_number} ({section.term.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Loading evaluation results...</div>
            </CardContent>
          </Card>
        ) : !results ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                No evaluation results available for this section
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.total_responses}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {results.total_students} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getResponseRateColor(results.response_rate)}`}>
                    {results.response_rate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {results.response_rate >= 70 ? "Excellent" : results.response_rate >= 50 ? "Good" : "Low"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Course</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.course_section.course.code}</div>
                  <p className="text-xs text-muted-foreground">
                    Section {results.course_section.section_number}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Question Results</CardTitle>
                <CardDescription>Aggregated responses for each evaluation question</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {results.question_results.map((questionResult, index) => (
                  <div key={questionResult.question.id}>
                    {index > 0 && <Separator className="my-4" />}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{questionResult.question.question_text}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {questionResult.question.question_type === "rating_5" ? "Rating" : "Text"}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {questionResult.response_count} responses
                            </span>
                          </div>
                        </div>
                      </div>

                      {questionResult.question.question_type === "rating_5" && questionResult.average_rating && (
                        <div className="pl-4">
                          {renderStarRating(questionResult.average_rating)}
                        </div>
                      )}

                      {questionResult.question.question_type === "text" && questionResult.text_responses && (
                        <div className="pl-4 space-y-2">
                          {questionResult.text_responses.length > 0 ? (
                            <div className="space-y-2">
                              {questionResult.text_responses.map((response, idx) => (
                                <div key={idx} className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm">{response}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No text responses</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {results.question_results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No question results available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </PageShell>
    </AppShell>
  );
}
