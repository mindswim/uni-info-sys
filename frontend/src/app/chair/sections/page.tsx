"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";

interface Section {
  id: number;
  course_code: string;
  course_name: string;
  section_number: string;
  instructor: string;
  instructor_id: number | null;
  enrolled_count: number;
  capacity: number;
}

interface FacultyMember {
  id: number;
  name: string;
  email: string;
  job_title: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function ChairSectionsPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposalNotes, setProposalNotes] = useState("");
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [sectionsRes, facultyRes] = await Promise.all([
        fetch(`${API_BASE_URL}/department-chair/sections`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/department-chair/faculty`, {
          headers: getAuthHeaders(),
        }),
      ]);
      const sectionsData = await sectionsRes.json();
      const facultyData = await facultyRes.json();
      setSections(sectionsData.data || []);
      setFaculty(facultyData.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load section data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignInstructor(
    sectionId: number,
    instructorId: string
  ) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/sections/${sectionId}/assign-instructor`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ instructor_id: parseInt(instructorId) }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Instructor assigned", description: data.message });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to assign instructor",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to assign instructor",
        variant: "destructive",
      });
    }
  }

  async function handleSubmitProposal() {
    if (!selectedSection) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/department-chair/approval-requests`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            type: "section_offering",
            requestable_type: "course_section",
            requestable_id: selectedSection.id,
            notes: proposalNotes,
            metadata: {
              course_code: selectedSection.course_code,
              course_name: selectedSection.course_name,
            },
          }),
        }
      );
      if (res.ok) {
        toast({
          title: "Proposal submitted",
          description: "Section offering request has been submitted for review",
        });
        setProposalOpen(false);
        setProposalNotes("");
        setSelectedSection(null);
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.message || "Failed to submit proposal",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit proposal",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Department Sections
          </h1>
          <p className="text-muted-foreground">
            Manage course sections, assign instructors, and propose new
            offerings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Overview</CardTitle>
            <CardDescription>
              Enrollment counts, instructor assignments, and section proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
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
                ) : sections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No sections found for this term
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell>
                        <div className="font-medium">
                          {section.course_code}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {section.course_name}
                        </div>
                      </TableCell>
                      <TableCell>{section.section_number}</TableCell>
                      <TableCell>
                        <Select
                          value={section.instructor_id?.toString() || ""}
                          onValueChange={(val) =>
                            handleAssignInstructor(section.id, val)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={section.instructor || "TBA"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {faculty.map((f) => (
                              <SelectItem key={f.id} value={f.id.toString()}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            section.enrolled_count >= section.capacity
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {section.enrolled_count}
                        </Badge>
                      </TableCell>
                      <TableCell>{section.capacity}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSection(section);
                            setProposalOpen(true);
                          }}
                        >
                          Propose Offering
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={proposalOpen} onOpenChange={setProposalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose Section Offering</DialogTitle>
            <DialogDescription>
              Submit a request to offer {selectedSection?.course_code}{" "}
              {selectedSection?.section_number} next term
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Justification</Label>
              <Textarea
                value={proposalNotes}
                onChange={(e) => setProposalNotes(e.target.value)}
                placeholder="Explain why this section should be offered..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
