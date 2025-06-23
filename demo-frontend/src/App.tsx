import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronRight, ChevronLeft, User, CheckCircle2, Circle, Lock, Menu } from 'lucide-react'

// Demo user personas
const demoUsers = [
  {
    id: 'maria',
    name: 'Maria Rodriguez',
    role: 'Student',
    email: 'maria.rodriguez@email.com',
    avatar: '🇲🇽',
    color: 'bg-blue-500'
  },
  {
    id: 'david',
    name: 'David Park',
    role: 'Student', 
    email: 'david.park@email.com',
    avatar: '🇰🇷',
    color: 'bg-green-500'
  },
  {
    id: 'sophie',
    name: 'Sophie Turner',
    role: 'Student',
    email: 'sophie.turner@email.com', 
    avatar: '🇺🇸',
    color: 'bg-purple-500'
  },
  {
    id: 'admin',
    name: 'Dr. Elizabeth Harper',
    role: 'Administrator',
    email: 'e.harper@university.edu',
    avatar: '👩‍🎓',
    color: 'bg-orange-500'
  }
]

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentUser, setCurrentUser] = useState('admin')
  const [completedSteps, setCompletedSteps] = useState(new Set([1])) // Step 1 is always completed
  const totalSteps = 8

  const demoSteps = [
    { id: 1, title: "Welcome", description: "Introduction to the University Admissions System", allowedUsers: ['admin'] },
    { id: 2, title: "Maria Applies", description: "International student from Mexico submits application", allowedUsers: ['maria'] },
    { id: 3, title: "Admin Reviews", description: "Administrator reviews pending applications", allowedUsers: ['admin'] },
    { id: 4, title: "Accept Application", description: "Maria's application is accepted", allowedUsers: ['admin'] },
    { id: 5, title: "Course Enrollment", description: "Maria selects her courses", allowedUsers: ['maria'] },
    { id: 6, title: "Capacity Limits", description: "Sophie encounters a full course", allowedUsers: ['sophie'] },
    { id: 7, title: "Waitlist Management", description: "Automatic waitlist promotion", allowedUsers: ['admin'] },
    { id: 8, title: "Summary", description: "System overview and architecture", allowedUsers: ['admin'] }
  ]

  const currentStepData = demoSteps[currentStep - 1]
  const progressValue = (currentStep / totalSteps) * 100
  const selectedUser = demoUsers.find(user => user.id === currentUser)!

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber <= Math.max(...completedSteps) + 1) {
      setCurrentStep(stepNumber)
      // Mark this step as completed when visited
      setCompletedSteps(prev => new Set([...prev, stepNumber]))
    }
  }

  const handleNext = () => {
    const nextStep = Math.min(totalSteps, currentStep + 1)
    setCurrentStep(nextStep)
    setCompletedSteps(prev => new Set([...prev, nextStep]))
  }

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1))
  }

  const handleUserChange = (userId: string) => {
    setCurrentUser(userId)
    // Auto-navigate to appropriate step for the selected user
    const userSteps = demoSteps.filter(step => step.allowedUsers.includes(userId))
    if (userSteps.length > 0) {
      const firstUserStep = userSteps[0].id
      setCurrentStep(firstUserStep)
      setCompletedSteps(prev => new Set([...prev, firstUserStep]))
    }
  }

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.has(stepNumber)) return 'completed'
    if (stepNumber <= Math.max(...completedSteps) + 1) return 'available'
    return 'locked'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Improved Layout & Responsive */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center min-w-0">
              <h1 className="text-lg lg:text-xl font-semibold truncate">
                University Admissions Demo
              </h1>
            </div>
            
            {/* Center: Step Indicator - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-sm">
              <div className="bg-muted/50 rounded-full px-4 py-2">
                <span className="text-sm font-medium">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
            </div>

            {/* Right: User Switcher */}
            <div className="flex items-center gap-2 lg:gap-4 min-w-0">
              {/* Mobile step indicator */}
              <div className="md:hidden bg-muted/50 rounded-full px-3 py-1">
                <span className="text-xs font-medium">
                  {currentStep}/{totalSteps}
                </span>
              </div>
              
              <Select value={currentUser} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[140px] sm:w-[180px] lg:w-[200px]">
                  <SelectValue>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className={`${selectedUser.color} text-white text-xs`}>
                          {selectedUser.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-left">
                          {selectedUser.name.split(' ')[0]} {/* Show first name only on mobile */}
                          <span className="hidden sm:inline"> {selectedUser.name.split(' ')[1]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground hidden lg:block">
                          {selectedUser.role}
                        </div>
                      </div>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {demoUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={`${user.color} text-white text-xs`}>
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Progress Bar - Responsive */}
      <div className="w-full px-4 lg:px-6 py-3 border-b">
        <div className="container mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Progress value={progressValue} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {completedSteps.size}/{totalSteps} completed
            </span>
          </div>
          
          {/* Clickable Step Progress - Responsive */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {demoSteps.map((step, index) => {
              const status = getStepStatus(step.id)
              const isClickable = status !== 'locked'
              
              return (
                <button
                  key={step.id}
                  onClick={() => isClickable && handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={`flex-1 min-w-[60px] sm:min-w-[80px] p-2 rounded-md text-xs transition-colors ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : status === 'completed'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : status === 'available'
                      ? 'bg-muted hover:bg-muted/80'
                      : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {status === 'completed' && step.id !== currentStep && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {status === 'available' && (
                      <Circle className="h-3 w-3" />
                    )}
                    {status === 'locked' && (
                      <Lock className="h-3 w-3" />
                    )}
                    <span className="font-medium">{step.id}</span>
                  </div>
                  <div className="truncate">{step.title}</div>
                </button>
              )
            })}
          </div>
          
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg font-medium">{currentStepData.title}</h2>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Story Panel */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card rounded-lg border p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${selectedUser.color} text-white`}>
                    {selectedUser.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-xl lg:text-2xl font-semibold">
                    {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground text-sm lg:text-base">
                    Viewing as: {selectedUser.name} ({selectedUser.role})
                  </p>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                Step content will be displayed here...
              </p>
            </div>
          </div>
        </div>

        {/* API Activity Sidebar - Responsive */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l bg-muted/30">
          <div className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold mb-4">API Activity</h3>
            <div className="space-y-3">
              <div className="bg-background rounded-md border p-4">
                <p className="text-sm text-muted-foreground">
                  API calls will appear here...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer - Responsive */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
              size="sm"
              className="sm:size-default"
            >
              <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            
            <div className="flex gap-1 sm:gap-2">
              {demoSteps.map((_, index) => {
                const stepNum = index + 1
                const status = getStepStatus(stepNum)
                
                return (
                  <button
                    key={index}
                    className={`h-2 w-2 sm:h-2 sm:w-2 rounded-full transition-colors ${
                      stepNum === currentStep 
                        ? 'bg-primary' 
                        : status === 'completed'
                        ? 'bg-green-500' 
                        : status === 'available'
                        ? 'bg-muted-foreground/50'
                        : 'bg-muted-foreground/20'
                    }`}
                    onClick={() => getStepStatus(stepNum) !== 'locked' && handleStepClick(stepNum)}
                    disabled={status === 'locked'}
                  />
                )
              })}
            </div>

            <Button 
              onClick={handleNext}
              disabled={currentStep === totalSteps}
              size="sm"
              className="sm:size-default"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
