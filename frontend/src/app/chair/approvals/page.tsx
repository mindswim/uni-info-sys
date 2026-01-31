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

interface ApprovalRequest {
  id: number;
  type: string;
  status: string;
  notes: string | null;
  denial_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  requested_by: {
    id: number;
    user: { name: string; email: string };
  };
  approved_by: {
    id: number;
    user: { name: string };
  } | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

const statusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" /> Pending
        </Badge>
      );
    case "approved":
      return (
        <Badge className="gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" /> Approved
        </Badge>
      );
    case "denied":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> Denied
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const typeLabel = (type: string) => {
  switch (type) {
    case "section_offering":
      return "Section Offering";
    case "enrollment_override":
      return "Enrollment Override";
    default:
      return type;
  }
};

export default function ChairApprovalsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, [activeTab, statusFilter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (activeTab !== "all") {
        params.set("type", activeTab);
      }
      const res = await fetch(
        `${API_BASE_URL}/department-chair/approval-requests?${params}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      setRequests(data.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load approval requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: number) {
    setProcessing(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/approval-requests/${id}/approve`,
        { method: "POST", headers: getAuthHeaders() }
      );
      if (res.ok) {
        toast({ title: "Approved", description: "Request has been approved" });
        fetchRequests();
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
        description: "Failed to approve request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeny() {
    if (!selectedRequest || !denyReason.trim()) return;
    setProcessing(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/approval-requests/${selectedRequest.id}/deny`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ denial_reason: denyReason }),
        }
      );
      if (res.ok) {
        toast({ title: "Denied", description: "Request has been denied" });
        setDenyDialogOpen(false);
        setDenyReason("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message || "Failed to deny",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <AppShell>
      <PageShell title="Approval Queue" description="Review and approve section offerings and enrollment overrides">

        <div className="flex gap-2">
          {["pending", "approved", "denied"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="section_offering">
              Section Offerings
            </TabsTrigger>
            <TabsTrigger value="enrollment_override">
              Enrollment Overrides
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Requests"
                    : typeLabel(activeTab)}
                </CardTitle>
                <CardDescription>
                  {statusFilter === "pending"
                    ? "Requests awaiting your review"
                    : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      {statusFilter === "pending" && (
                        <TableHead>Actions</TableHead>
                      )}
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
                    ) : requests.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          No {statusFilter} requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{typeLabel(req.type)}</TableCell>
                          <TableCell>
                            {req.requested_by?.user?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {req.notes || req.denial_reason || "--"}
                          </TableCell>
                          <TableCell>
                            {new Date(req.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{statusBadge(req.status)}</TableCell>
                          {statusFilter === "pending" && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(req.id)}
                                  disabled={processing}
                                >
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
                                  Deny
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
            <DialogDescription>
              Provide a reason for denying this request
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Reason</Label>
            <Textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Explain why this request is being denied..."
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
              onClick={handleDeny}
              disabled={processing || !denyReason.trim()}
            >
              {processing ? "Denying..." : "Deny Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
