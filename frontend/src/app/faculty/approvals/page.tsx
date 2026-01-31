"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface ApprovalRequest {
  id: number;
  student_id: number;
  course_section_id: number;
  request_type: string;
  status: string;
  requested_at: string;
  notes?: string;
  student?: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  course_section?: {
    id: number;
    course: {
      code: string;
      name: string;
    };
    section_number: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function FacultyApprovalsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [denyNotes, setDenyNotes] = useState("");

  useEffect(() => {
    fetchApprovalRequests();
  }, []);

  const fetchApprovalRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approval-requests?status=pending`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch approval requests");
      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load approval requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approval-requests/${requestId}/approve`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve request");
      }

      toast({
        title: "Success",
        description: "Request approved successfully",
      });

      fetchApprovalRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const openDenyDialog = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDenyNotes("");
    setDenyDialogOpen(true);
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    if (!denyNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for denial",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/approval-requests/${selectedRequest.id}/deny`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          notes: denyNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to deny request");
      }

      toast({
        title: "Success",
        description: "Request denied successfully",
      });

      setDenyDialogOpen(false);
      setSelectedRequest(null);
      setDenyNotes("");
      fetchApprovalRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deny request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRequestTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      prerequisite_override: "secondary",
      credit_limit_override: "default",
      late_registration: "outline",
      waitlist_override: "default",
    };

    return (
      <Badge variant={variants[type] || "default"}>
        {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <AppShell>
      <PageShell title="Approval Requests" description="Review and process student enrollment approval requests">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Student requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No pending requests</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Request Type</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.student?.user
                              ? `${request.student.user.first_name} ${request.student.user.last_name}`
                              : "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.student?.user?.email || ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.course_section?.course?.code || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Section {request.course_section?.section_number || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRequestTypeBadge(request.request_type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(request.requested_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={processing}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDenyDialog(request)}
                            disabled={processing}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this request. This will be sent to the student.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p>
                  <strong>Student:</strong>{" "}
                  {selectedRequest.student?.user
                    ? `${selectedRequest.student.user.first_name} ${selectedRequest.student.user.last_name}`
                    : "N/A"}
                </p>
                <p>
                  <strong>Course:</strong> {selectedRequest.course_section?.course?.code || "N/A"}
                </p>
                <p>
                  <strong>Request Type:</strong>{" "}
                  {selectedRequest.request_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deny-notes">Reason for Denial</Label>
                <Textarea
                  id="deny-notes"
                  placeholder="Enter the reason for denying this request..."
                  value={denyNotes}
                  onChange={(e) => setDenyNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeny} disabled={processing}>
              {processing ? "Processing..." : "Deny Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PageShell>
    </AppShell>
  );
}
