"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/api-client";
import { Calendar, Clock } from "lucide-react";

interface Term {
  id: number;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
}

interface RegistrationTicket {
  id: number;
  student_id: number;
  term_id: number;
  priority_group: string;
  registration_start: string;
  registration_end: string;
  student?: {
    id: number;
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/api/v1";

export default function RegistrationTimeTicketsPage() {
  const { toast } = useToast();
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [tickets, setTickets] = useState<RegistrationTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [priorityGroup, setPriorityGroup] = useState<string>("honors");
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [endDateTime, setEndDateTime] = useState<string>("");

  useEffect(() => {
    fetchTerms();
  }, []);

  useEffect(() => {
    if (selectedTerm) {
      fetchTickets();
    }
  }, [selectedTerm]);

  const fetchTerms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/terms`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch terms");
      const data = await response.json();
      setTerms(data.data || []);
      if (data.data?.length > 0) {
        setSelectedTerm(data.data[0].id.toString());
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load terms",
        variant: "destructive",
      });
    }
  };

  const fetchTickets = async () => {
    if (!selectedTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/registration-time-tickets?term_id=${selectedTerm}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registration tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTerm || !priorityGroup || !startDateTime || !endDateTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch(`${API_BASE_URL}/registration-time-tickets/bulk-assign`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          term_id: parseInt(selectedTerm),
          priority_group: priorityGroup,
          registration_start: startDateTime,
          registration_end: endDateTime,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign tickets");

      const data = await response.json();

      toast({
        title: "Success",
        description: `Assigned tickets to ${data.count || 0} students`,
      });

      setPriorityGroup("honors");
      setStartDateTime("");
      setEndDateTime("");
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign registration tickets",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const formatDateTime = (datetime: string) => {
    return new Date(datetime).toLocaleString();
  };

  return (
    <AppShell>
      <PageShell title="Registration Time Tickets" description="Manage student registration time windows">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Assign Tickets</CardTitle>
            <CardDescription>Assign registration time windows to students by priority group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term-select">Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger id="term-select">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name} ({term.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority-group">Priority Group</Label>
                <Select value={priorityGroup} onValueChange={setPriorityGroup}>
                  <SelectTrigger id="priority-group">
                    <SelectValue placeholder="Select priority group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="honors">Honors Students</SelectItem>
                    <SelectItem value="seniors">Seniors</SelectItem>
                    <SelectItem value="juniors">Juniors</SelectItem>
                    <SelectItem value="sophomores">Sophomores</SelectItem>
                    <SelectItem value="freshmen">Freshmen</SelectItem>
                    <SelectItem value="athletes">Athletes</SelectItem>
                    <SelectItem value="veterans">Veterans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-datetime">Registration Start</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-datetime"
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-datetime">Registration End</Label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-datetime"
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleBulkAssign} disabled={assigning} className="w-full md:w-auto">
              <Clock className="mr-2 h-4 w-4" />
              {assigning ? "Assigning..." : "Assign Tickets"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Tickets</CardTitle>
            <CardDescription>View all registration time tickets for the selected term</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tickets assigned yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Priority Group</TableHead>
                    <TableHead>Registration Start</TableHead>
                    <TableHead>Registration End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.student_id}</TableCell>
                      <TableCell>
                        {ticket.student?.user
                          ? `${ticket.student.user.first_name} ${ticket.student.user.last_name}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="capitalize">{ticket.priority_group}</TableCell>
                      <TableCell>{formatDateTime(ticket.registration_start)}</TableCell>
                      <TableCell>{formatDateTime(ticket.registration_end)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </PageShell>
    </AppShell>
  );
}
