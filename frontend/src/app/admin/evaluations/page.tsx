"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { Plus, Trash2, FileText, MoveUp, MoveDown } from "lucide-react";

interface EvaluationForm {
  id: number;
  title: string;
  description: string;
  active: boolean;
  created_at: string;
  questions?: EvaluationQuestion[];
}

interface EvaluationQuestion {
  id?: number;
  question_text: string;
  question_type: "rating_5" | "text";
  required: boolean;
  order: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function AdminEvaluationsPage() {
  const { toast } = useToast();
  const [forms, setForms] = useState<EvaluationForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);

  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"rating_5" | "text">("rating_5");
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);

  useEffect(() => {
    fetchEvaluationForms();
  }, []);

  const fetchEvaluationForms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/evaluation-forms`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch evaluation forms");
      const data = await response.json();
      setForms(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load evaluation forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormTitle("");
    setFormDescription("");
    setQuestions([]);
    setNewQuestionText("");
    setNewQuestionType("rating_5");
    setNewQuestionRequired(true);
    setDialogOpen(true);
  };

  const addQuestion = () => {
    if (!newQuestionText.trim()) {
      toast({
        title: "Validation Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: EvaluationQuestion = {
      question_text: newQuestionText,
      question_type: newQuestionType,
      required: newQuestionRequired,
      order: questions.length + 1,
    };

    setQuestions([...questions, newQuestion]);
    setNewQuestionText("");
    setNewQuestionType("rating_5");
    setNewQuestionRequired(true);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const reorderedQuestions = updatedQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    setQuestions(reorderedQuestions);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];

    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    setQuestions(reorderedQuestions);
  };

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Form title is required",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/evaluation-forms`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          questions: questions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create evaluation form");
      }

      toast({
        title: "Success",
        description: "Evaluation form created successfully",
      });

      setDialogOpen(false);
      fetchEvaluationForms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create evaluation form",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AppShell>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Evaluation Forms</h1>
            <p className="text-muted-foreground">Manage course evaluation forms and questions</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Evaluation Forms</CardTitle>
            <CardDescription>View and manage evaluation forms</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading forms...</div>
            ) : forms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No evaluation forms created yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.title}</TableCell>
                      <TableCell className="max-w-md truncate">{form.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{form.questions?.length || 0} questions</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={form.active ? "default" : "secondary"}>
                          {form.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(form.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Evaluation Form</DialogTitle>
            <DialogDescription>Create a new course evaluation form with custom questions</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="form-title">Form Title</Label>
              <Input
                id="form-title"
                placeholder="e.g., End of Term Course Evaluation"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description">Description</Label>
              <Textarea
                id="form-description"
                placeholder="Describe the purpose of this evaluation..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Questions</h3>

              {questions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {questions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{question.question_text}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {question.question_type === "rating_5" ? "5-Star Rating" : "Text Response"} •{" "}
                          {question.required ? "Required" : "Optional"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(index, "up")}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(index, "down")}
                          disabled={index === questions.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium">Add Question</h4>

                <div className="space-y-2">
                  <Label htmlFor="question-text">Question Text</Label>
                  <Input
                    id="question-text"
                    placeholder="Enter the question..."
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Question Type</Label>
                    <Select value={newQuestionType} onValueChange={(value: "rating_5" | "text") => setNewQuestionType(value)}>
                      <SelectTrigger id="question-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating_5">5-Star Rating</SelectItem>
                        <SelectItem value="text">Text Response</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="question-required">Required</Label>
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        id="question-required"
                        checked={newQuestionRequired}
                        onCheckedChange={setNewQuestionRequired}
                      />
                      <span className="text-sm">{newQuestionRequired ? "Required" : "Optional"}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={addQuestion} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreateForm} disabled={creating}>
              <FileText className="mr-2 h-4 w-4" />
              {creating ? "Creating..." : "Create Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
