"use client"

import { WidgetProps } from '@/lib/widgets/widget-registry'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const currentGrades = {
  gpa: 3.45,
  previousGpa: 3.32,
  credits: 45,
  courses: [
    { code: 'CS350', name: 'Introduction to AI', grade: 'A-', credits: 3 },
    { code: 'MATH201', name: 'Linear Algebra', grade: 'B+', credits: 4 },
    { code: 'PHYS150', name: 'Physics I', grade: 'A', credits: 4 },
    { code: 'ENG102', name: 'Academic Writing', grade: 'B', credits: 3 },
  ]
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0
}

export function GradesOverviewWidget({ size, isEditing }: WidgetProps) {
  const gpaChange = currentGrades.gpa - currentGrades.previousGpa
  const trend = gpaChange > 0 ? 'up' : gpaChange < 0 ? 'down' : 'same'

  // Compact view
  if (size.h <= 2) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current GPA</p>
            <p className="text-2xl font-bold">{currentGrades.gpa.toFixed(2)}</p>
          </div>
          <div className={`flex items-center gap-1 ${
            trend === 'up' ? 'text-green-500' :
            trend === 'down' ? 'text-red-500' :
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
             trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
             <Minus className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {gpaChange > 0 ? '+' : ''}{gpaChange.toFixed(2)}
            </span>
          </div>
        </div>
        {size.w >= 3 && (
          <div className="mt-2">
            <Progress value={(currentGrades.gpa / 4.0) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentGrades.credits} credits earned
            </p>
          </div>
        )}
      </div>
    )
  }

  // Full view
  return (
    <div className="p-4 space-y-4">
      {/* GPA Summary */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Cumulative GPA</p>
          <p className="text-3xl font-bold">{currentGrades.gpa.toFixed(2)}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={(currentGrades.gpa / 4.0) * 100} className="h-2 w-20" />
            <span className={`text-xs font-medium flex items-center gap-1 ${
              trend === 'up' ? 'text-green-500' :
              trend === 'down' ? 'text-red-500' :
              'text-muted-foreground'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
               trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
               <Minus className="h-3 w-3" />}
              {gpaChange > 0 ? '+' : ''}{gpaChange.toFixed(2)}
            </span>
          </div>
        </div>
        {size.w >= 4 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Credits</p>
            <p className="text-xl font-semibold">{currentGrades.credits}</p>
          </div>
        )}
      </div>

      {/* Recent Grades */}
      {size.h >= 3 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Recent Grades</p>
          <div className="space-y-1">
            {currentGrades.courses.slice(0, size.h >= 4 ? 4 : 2).map((course) => (
              <div key={course.code} className="flex items-center justify-between py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{course.code}</p>
                  {size.w >= 4 && (
                    <p className="text-xs text-muted-foreground truncate">{course.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    gradePoints[course.grade] >= 3.7 ? 'text-green-600' :
                    gradePoints[course.grade] >= 3.0 ? 'text-blue-600' :
                    gradePoints[course.grade] >= 2.0 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {course.grade}
                  </span>
                  {size.w >= 4 && (
                    <span className="text-xs text-muted-foreground">
                      ({course.credits} cr)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}