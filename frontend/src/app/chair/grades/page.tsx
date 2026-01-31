"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface GradeChangeRequest {
  id: number;
  old_grade: string;
  new_grade: string;
  reason: string;
  status: string;
  denial_reason: string | null;
  created_at: string;
  enrollment: {
    id: number;
    student: { id: number; user: { name: string } };
    course_section: {
      id: number;
      course: { course_code: string; name: string };
    };
  };
  requested_by: { name: string } | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function ChairGradeReportsPage() {
  const { toast } = useToast();
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [gradeChanges, setGradeChanges] = useState<GradeChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<GradeChangeRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [distRes, changesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/department-chair/grade-distribution`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/department-chair/grade-change-requests`, {
          headers: getAuthHeaders(),
        }),
      ]);
      const distData = await distRes.json();
      const changesData = await changesRes.json();
      setDistribution(distData.data || {});
      setGradeChanges(changesData.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load grade data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApproveGradeChange(id: number) {
    setProcessing(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/grade-change-requests/${id}/approve`,
        { method: "POST", headers: getAuthHeaders() }
      );
      if (res.ok) {
        toast({
          title: "Approved",
          description: "Grade change has been approved",
        });
        fetchData();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message || "Failed to approve",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve grade change",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDenyGradeChange() {
    if (!selectedRequest || !denyReason.trim()) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/grade-change-requests/${selectedRequest.id}/deny`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ denial_reason: denyReason }),
        }
      );
      if (res.ok) {
        toast({
          title: "Denied",
          description: "Grade change has been denied",
        });
        setDenyDialogOpen(false);
        setDenyReason("");
        setSelectedRequest(null);
        fetchData();
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to deny grade change",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  const gradeOrder = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "D-",
    "F",
    "W",
    "I",
    "P",
    "NP",
  ];
  const sortedGrades = gradeOrder.filter((g) => g in distribution);
  const totalGraded = Object.values(distribution).reduce(
    (sum, n) => sum + n,
    0
  );

  const pendingChanges = gradeChanges.filter((r) => r.status === "pending");
  const resolvedChanges = gradeChanges.filter((r) => r.status !== "pending");

  return (
    <AppShell>
      <PageShell title="Grade Reports" description="Grade distribution and grade change request management">

        <Tabs defaultValue="distribution">
          <TabsList>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="changes">
              Grade Changes
              {pendingChanges.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingChanges.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Aggregated grade data for the current term ({totalGraded}{" "}
                  total grades)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : sortedGrades.length === 0 ? (
                  <p className="text-muted-foreground">
                    No grade data available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedGrades.map((grade) => {
                      const count = distribution[grade];
                      const pct =
                        totalGraded > 0
                          ? Math.round((count / totalGraded) * 100)
                          : 0;
                      return (
                        <div key={grade} className="flex items-center gap-3">
                          <span className="w-8 font-mono font-medium">
                            {grade}
                          </span>
                          <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full bg-primary rounded"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-16 text-sm text-right text-muted-foreground">
                            {count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes">
            <Card>
              <CardHeader>
                <CardTitle>Pending Grade Change Requests</CardTitle>
                <CardDescription>
                  Review grade changes submitted by faculty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Old Grade</TableHead>
                      <TableHead>New Grade</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingChanges.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          No pending grade change requests
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingChanges.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            {req.enrollment?.student?.user?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {req.enrollment?.course_section?.course
                              ?.course_code || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{req.old_grade}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{req.new_grade}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {req.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApproveGradeChange(req.id)
                                }
                                disabled={processing}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setDenyDialogOpen(true);
                                }}
                                disabled={processing}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Deny
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {resolvedChanges.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Resolved Requests
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resolvedChanges.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>
                              {req.enrollment?.student?.user?.name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {req.enrollment?.course_section?.course
                                ?.course_code || "N/A"}
                            </TableCell>
                            <TableCell>
                              {req.old_grade} → {req.new_grade}
                            </TableCell>
                            <TableCell>
                              {req.status === "approved" ? (
                                <Badge className="bg-green-600">
                                  Approved
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Denied</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Grade Change</DialogTitle>
            <DialogDescription>
              Provide a reason for denying this grade change request
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Explain why this grade change is being denied..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDenyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDenyGradeChange}
              disabled={processing || !denyReason.trim()}
            >
              {processing ? "Denying..." : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
