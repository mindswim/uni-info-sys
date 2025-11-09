"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/layouts"
import { Calendar, Plus, Search, CalendarCheck, CalendarClock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { adminService } from "@/services"
import type { Term } from "@/types/api-types"

export function TermsTab() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true)
        const data = await adminService.getAllTerms()
        setTerms(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load terms')
      } finally {
        setLoading(false)
      }
    }

    fetchTerms()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate stats
  const totalTerms = terms.length
  const currentTerm = terms.find(t => t.is_current)
  const upcomingTerms = terms.filter(t => new Date(t.start_date) > new Date() && !t.is_current).length
  const pastTerms = terms.filter(t => new Date(t.end_date) < new Date()).length

  // Filter terms by search
  const filteredTerms = terms.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.semester?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.academic_year?.toString().includes(searchTerm)
  )

  // Sort terms by start date (most recent first)
  const sortedTerms = [...filteredTerms].sort((a, b) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Term Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Terms"
          value={totalTerms.toString()}
          description="All academic terms"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Current Term"
          value={currentTerm ? "1" : "0"}
          description={currentTerm?.name || "No active term"}
          icon={<CalendarCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Upcoming"
          value={upcomingTerms.toString()}
          description="Future terms"
          icon={<CalendarClock className="h-4 w-4" />}
        />
        <StatCard
          title="Past Terms"
          value={pastTerms.toString()}
          description="Completed terms"
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Term
        </Button>
      </div>

      {/* Terms List */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Terms ({filteredTerms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTerms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No terms found
            </p>
          ) : (
            <div className="space-y-2">
              {sortedTerms.map((term) => {
                const isActive = term.is_current
                const isUpcoming = new Date(term.start_date) > new Date()
                const isPast = new Date(term.end_date) < new Date()

                return (
                  <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{term.name}</p>
                        {isActive && <Badge className="bg-green-600">Current</Badge>}
                        {isUpcoming && !isActive && <Badge variant="secondary">Upcoming</Badge>}
                        {isPast && <Badge variant="outline">Past</Badge>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-2">
                        <div>
                          <p className="font-medium">Academic Year</p>
                          <p>{term.academic_year}</p>
                        </div>
                        <div>
                          <p className="font-medium">Semester</p>
                          <p>{term.semester}</p>
                        </div>
                        <div>
                          <p className="font-medium">Term Duration</p>
                          <p>{formatDate(term.start_date)} - {formatDate(term.end_date)}</p>
                        </div>
                        {term.registration_start && term.registration_end && (
                          <div>
                            <p className="font-medium">Registration</p>
                            <p>{formatDate(term.registration_start)} - {formatDate(term.registration_end)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
