"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { Star, FileText, CheckCircle } from "lucide-react";

interface EvaluationForm {
  id: number;
  title: string;
  description: string;
  questions: EvaluationQuestion[];
}

interface EvaluationQuestion {
  id: number;
  question_text: string;
  question_type: "rating_5" | "text";
  required: boolean;
  order: number;
}

interface PendingEvaluation {
  id: number;
  course_section_id: number;
  evaluation_form_id: number;
  due_date: string;
  completed: boolean;
  course_section?: {
    id: number;
    course: {
      code: string;
      name: string;
    };
    section_number: string;
    instructor?: {
      user: {
        first_name: string;
        last_name: string;
      };
    };
  };
  evaluation_form?: EvaluationForm;
}

interface EvaluationResponse {
  question_id: number;
  rating?: number;
  text_response?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function StudentEvaluationsPage() {
  const { toast } = useToast();
  const [evaluations, setEvaluations] = useState<PendingEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null);
  const [responses, setResponses] = useState<Record<number, EvaluationResponse>>({});

  useEffect(() => {
    fetchPendingEvaluations();
  }, []);

  const fetchPendingEvaluations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/student/evaluations/pending`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch evaluations");
      const data = await response.json();
      setEvaluations(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending evaluations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEvaluationDialog = (evaluation: PendingEvaluation) => {
    setSelectedEvaluation(evaluation);
    const initialResponses: Record<number, EvaluationResponse> = {};
    evaluation.evaluation_form?.questions.forEach((question) => {
      initialResponses[question.id] = {
        question_id: question.id,
        rating: question.question_type === "rating_5" ? 0 : undefined,
        text_response: question.question_type === "text" ? "" : undefined,
      };
    });
    setResponses(initialResponses);
    setDialogOpen(true);
  };

  const handleRatingChange = (questionId: number, rating: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        rating,
      },
    }));
  };

  const handleTextChange = (questionId: number, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        text_response: text,
      },
    }));
  };

  const validateResponses = (): boolean => {
    if (!selectedEvaluation?.evaluation_form) return false;

    for (const question of selectedEvaluation.evaluation_form.questions) {
      if (question.required) {
        const response = responses[question.id];
        if (question.question_type === "rating_5" && (!response?.rating || response.rating === 0)) {
          toast({
            title: "Validation Error",
            description: `Please provide a rating for: ${question.question_text}`,
            variant: "destructive",
          });
          return false;
        }
        if (question.question_type === "text" && (!response?.text_response || !response.text_response.trim())) {
          toast({
            title: "Validation Error",
            description: `Please provide an answer for: ${question.question_text}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedEvaluation || !validateResponses()) return;

    setSubmitting(true);
    try {
      const responsesArray = Object.values(responses).map((response) => ({
        question_id: response.question_id,
        ...(response.rating && { rating: response.rating }),
        ...(response.text_response && { text_response: response.text_response }),
      }));

      const response = await fetch(`${API_BASE_URL}/evaluations/${selectedEvaluation.id}/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          responses: responsesArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit evaluation");
      }

      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      });

      setDialogOpen(false);
      setSelectedEvaluation(null);
      setResponses({});
      fetchPendingEvaluations();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit evaluation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStarRating = (questionId: number, currentRating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(questionId, star)}
            className="focus:outline-none transition-colors"
          >
            <Star
              className={`h-8 w-8 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating > 0 ? `${currentRating}/5` : "Not rated"}
        </span>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Course Evaluations</h1>
          <p className="text-muted-foreground">Complete evaluations for your courses</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">Loading evaluations...</div>
            </CardContent>
          </Card>
        ) : evaluations.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">No pending evaluations</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {evaluation.course_section?.course?.code || "N/A"}
                      </CardTitle>
                      <CardDescription>
                        Section {evaluation.course_section?.section_number || "N/A"}
                      </CardDescription>
                    </div>
                    <Badge variant={evaluation.completed ? "default" : "secondary"}>
                      {evaluation.completed ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{evaluation.course_section?.course?.name || "N/A"}</p>
                    <p className="text-muted-foreground">
                      Instructor:{" "}
                      {evaluation.course_section?.instructor?.user
                        ? `${evaluation.course_section.instructor.user.first_name} ${evaluation.course_section.instructor.user.last_name}`
                        : "N/A"}
                    </p>
                    <p className="text-muted-foreground">Due: {formatDate(evaluation.due_date)}</p>
                  </div>

                  {!evaluation.completed && (
                    <Button
                      onClick={() => openEvaluationDialog(evaluation)}
                      className="w-full"
                      variant="default"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Complete Evaluation
                    </Button>
                  )}

                  {evaluation.completed && (
                    <div className="flex items-center justify-center text-green-600 text-sm">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Submitted
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvaluation?.evaluation_form?.title || "Evaluation"}</DialogTitle>
            <DialogDescription>
              {selectedEvaluation?.evaluation_form?.description || ""}
            </DialogDescription>
          </DialogHeader>

          {selectedEvaluation && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-1 text-sm">
                <p>
                  <strong>Course:</strong> {selectedEvaluation.course_section?.course?.code || "N/A"} -{" "}
                  {selectedEvaluation.course_section?.course?.name || "N/A"}
                </p>
                <p>
                  <strong>Instructor:</strong>{" "}
                  {selectedEvaluation.course_section?.instructor?.user
                    ? `${selectedEvaluation.course_section.instructor.user.first_name} ${selectedEvaluation.course_section.instructor.user.last_name}`
                    : "N/A"}
                </p>
              </div>

              {selectedEvaluation.evaluation_form?.questions
                .sort((a, b) => a.order - b.order)
                .map((question) => (
                  <div key={question.id} className="space-y-3">
                    <Label>
                      {question.question_text}
                      {question.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {question.question_type === "rating_5" && (
                      <div>{renderStarRating(question.id, responses[question.id]?.rating || 0)}</div>
                    )}

                    {question.question_type === "text" && (
                      <Textarea
                        placeholder="Enter your response..."
                        value={responses[question.id]?.text_response || ""}
                        onChange={(e) => handleTextChange(question.id, e.target.value)}
                        rows={4}
                      />
                    )}
                  </div>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
