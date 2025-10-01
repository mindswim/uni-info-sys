"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export function TranscriptsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Official Transcripts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Request and download official transcripts for your records.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Unofficial Transcript
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Request Official Transcript
              </Button>
            </div>
          </div>
          {/* TODO: Transcript viewer, request history */}
        </CardContent>
      </Card>
    </div>
  )
}
