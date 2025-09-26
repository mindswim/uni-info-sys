'use client'

import { useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  MessageSquare, Plus, Search, Filter, Lock, Shield,
  Calendar, Clock, User, Tag, FileText, Download,
  Edit, Trash2, Eye, EyeOff, AlertCircle, Info,
  ChevronDown, ChevronRight
} from 'lucide-react'

export default function StudentNotesPage() {
  const [selectedStudent, setSelectedStudent] = useState('')
  const [showNewNote, setShowNewNote] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expandedNotes, setExpandedNotes] = useState<number[]>([])

  const notes = [
    {
      id: 1,
      student: 'Sarah Johnson',
      studentId: 'S00123450',
      date: '2024-12-26',
      time: '2:30 PM',
      type: 'academic',
      category: 'Course Planning',
      subject: 'Spring 2025 Course Selection',
      content: 'Discussed course selection for spring semester. Student interested in taking CS 420 (AI) and CS 430 (Networks). Recommended balancing workload with easier elective. Student concerned about prerequisites for CS 420.',
      followUp: 'Check prerequisites and provide override if needed',
      visibility: 'advisor-only',
      attachments: 0,
      tags: ['course-planning', 'spring-2025']
    },
    {
      id: 2,
      student: 'David Park',
      studentId: 'S00123456',
      date: '2024-12-22',
      time: '10:00 AM',
      type: 'intervention',
      category: 'Academic Warning',
      subject: 'GPA Below 2.0 - Action Plan',
      content: 'Met with student regarding academic warning status. Current GPA: 1.8. Student acknowledging difficulties with time management and study habits. Personal issues affecting performance. Created action plan: 1) Weekly check-ins, 2) Tutoring for CS and Math courses, 3) Time management workshop, 4) Consider reduced course load.',
      followUp: 'Schedule weekly check-in for next Monday',
      visibility: 'advisor-only',
      attachments: 1,
      tags: ['academic-warning', 'intervention', 'action-plan']
    },
    {
      id: 3,
      student: 'Emily Rodriguez',
      studentId: 'S00123452',
      date: '2024-12-20',
      time: '3:00 PM',
      type: 'career',
      category: 'Career Counseling',
      subject: 'Summer Internship Planning',
      content: 'Discussed summer internship opportunities. Student interested in biotech companies. Reviewed resume and suggested improvements. Provided list of companies recruiting on campus. Student will attend career fair in February.',
      followUp: 'Review updated resume before career fair',
      visibility: 'shared',
      attachments: 2,
      tags: ['career', 'internship', 'resume']
    },
    {
      id: 4,
      student: 'Michael Chen',
      studentId: 'S00123451',
      date: '2024-12-18',
      time: '11:30 AM',
      type: 'academic',
      category: 'Graduation Planning',
      subject: 'Degree Audit Review',
      content: 'Reviewed degree audit for May 2025 graduation. All requirements on track. Need 12 credits in final semester. Discussed post-graduation plans - student accepted to MBA program at State University starting Fall 2025.',
      followUp: 'Submit graduation application by January deadline',
      visibility: 'shared',
      attachments: 0,
      tags: ['graduation', 'degree-audit']
    },
    {
      id: 5,
      student: 'Jennifer Lee',
      studentId: 'S00123789',
      date: '2024-12-15',
      time: '1:00 PM',
      type: 'personal',
      category: 'Personal Support',
      subject: 'Mental Health Referral',
      content: 'CONFIDENTIAL: Student disclosed anxiety affecting academic performance. Provided resources and referral to counseling center. Student receptive to support. Discussed academic accommodations if needed.',
      followUp: 'Check in after first counseling appointment',
      visibility: 'advisor-only',
      attachments: 0,
      tags: ['mental-health', 'confidential', 'referral']
    }
  ]

  const noteCategories = [
    { value: 'course-planning', label: 'Course Planning' },
    { value: 'academic-warning', label: 'Academic Warning' },
    { value: 'career-counseling', label: 'Career Counseling' },
    { value: 'graduation-planning', label: 'Graduation Planning' },
    { value: 'personal-support', label: 'Personal Support' },
    { value: 'financial-aid', label: 'Financial Aid' },
    { value: 'registration', label: 'Registration Issues' },
    { value: 'general-advising', label: 'General Advising' }
  ]

  const stats = {
    totalNotes: 247,
    thisMonth: 42,
    pendingFollowUp: 18,
    confidential: 31
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800'
      case 'intervention': return 'bg-red-100 text-red-800'
      case 'career': return 'bg-purple-100 text-purple-800'
      case 'personal': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleNoteExpansion = (noteId: number) => {
    setExpandedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    )
  }

  const breadcrumbs = [
    { label: 'Advisor Dashboard', href: '/advisor-dashboard' },
    { label: 'Student Notes' }
  ]

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              Student Advising Notes
            </h1>
            <p className="text-muted-foreground">
              FERPA-compliant advising documentation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Notes
            </Button>
            <Dialog open={showNewNote} onOpenChange={setShowNewNote}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Advising Note</DialogTitle>
                  <DialogDescription>
                    Document your interaction with a student
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student">Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Johnson (S00123450)</SelectItem>
                          <SelectItem value="michael">Michael Chen (S00123451)</SelectItem>
                          <SelectItem value="emily">Emily Rodriguez (S00123452)</SelectItem>
                          <SelectItem value="david">David Park (S00123456)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {noteCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief subject of the meeting" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Document the discussion, decisions made, and any recommendations..."
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="followup">Follow-Up Actions</Label>
                    <Textarea
                      id="followup"
                      placeholder="Any required follow-up actions or next steps..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" placeholder="e.g., spring-2025, course-planning, override" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Visibility</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="advisor-only" name="visibility" defaultChecked />
                          <Label htmlFor="advisor-only" className="flex items-center gap-2 font-normal">
                            <Shield className="h-4 w-4" />
                            Advisor Only - Not visible to student
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="radio" id="shared" name="visibility" />
                          <Label htmlFor="shared" className="flex items-center gap-2 font-normal">
                            <Users className="h-4 w-4" />
                            Shared - Visible to student and other advisors
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="confidential" />
                      <Label htmlFor="confidential" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Mark as confidential (restricts access further)
                      </Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewNote(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowNewNote(false)}>
                    Save Note
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* FERPA Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>FERPA Protected:</strong> All advising notes are protected under the Family Educational
            Rights and Privacy Act. Only authorized personnel have access to these records. Students can
            only view notes marked as "Shared".
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotes}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">December 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Follow-Up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingFollowUp}</div>
              <p className="text-xs text-muted-foreground">Action required</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confidential</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.confidential}</div>
              <p className="text-xs text-muted-foreground">Restricted access</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="followup">
              Follow-Up Required
              <Badge className="ml-2" variant="secondary">{stats.pendingFollowUp}</Badge>
            </TabsTrigger>
            <TabsTrigger value="confidential">Confidential</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student, subject, or content..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="michael">Michael Chen</SelectItem>
                      <SelectItem value="emily">Emily Rodriguez</SelectItem>
                      <SelectItem value="david">David Park</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="intervention">Intervention</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {note.student.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{note.student}</p>
                            <span className="text-sm text-muted-foreground">({note.studentId})</span>
                            <Badge className={getTypeColor(note.type)}>
                              {note.type}
                            </Badge>
                            {note.visibility === 'advisor-only' && (
                              <Badge variant="secondary" className="gap-1">
                                <EyeOff className="h-3 w-3" />
                                Advisor Only
                              </Badge>
                            )}
                            {note.content.includes('CONFIDENTIAL') && (
                              <Badge variant="destructive" className="gap-1">
                                <Lock className="h-3 w-3" />
                                Confidential
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {note.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {note.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {note.category}
                            </span>
                            {note.attachments > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {note.attachments} attachment{note.attachments > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{note.subject}</p>
                      <p className={`text-sm text-muted-foreground mt-2 ${
                        !expandedNotes.includes(note.id) ? 'line-clamp-2' : ''
                      }`}>
                        {note.content}
                      </p>
                      {note.content.length > 150 && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-1"
                          onClick={() => toggleNoteExpansion(note.id)}
                        >
                          {expandedNotes.includes(note.id) ? (
                            <>Show Less <ChevronDown className="h-3 w-3 ml-1" /></>
                          ) : (
                            <>Show More <ChevronRight className="h-3 w-3 ml-1" /></>
                          )}
                        </Button>
                      )}
                    </div>
                    {note.followUp && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Follow-Up:</strong> {note.followUp}
                        </AlertDescription>
                      </Alert>
                    )}
                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notes</CardTitle>
                <CardDescription>Notes from the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Showing notes from the last week...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Follow-Up Required</CardTitle>
                <CardDescription>Notes with pending action items</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {stats.pendingFollowUp} notes require follow-up action...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confidential" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Confidential Notes</CardTitle>
                <CardDescription>Restricted access notes</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <Lock className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    These notes contain sensitive information and have restricted access.
                    Do not share or discuss outside of authorized personnel.
                  </AlertDescription>
                </Alert>
                <p className="text-muted-foreground">
                  {stats.confidential} confidential notes...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}