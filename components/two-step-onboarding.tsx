"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  HelpCircle,
} from "lucide-react"
import GoogleCalendarConnect from "./google-calendar-connect"

type Props = {
  onComplete?: () => void
  modal?: boolean
}

export default function TwoStepOnboarding({ onComplete, modal = false }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [canvasConnected, setCanvasConnected] = useState(false)
  const [icalUrl, setIcalUrl] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)
  const containerClass = modal ? "max-w-xl mx-auto" : "max-w-4xl mx-auto"
  
  // Mock assignments for demo
  const [assignments, setAssignments] = useState<any[]>([
    {
      id: "1",
      title: "CS 101 Assignment 3",
      course: "Computer Science 101",
      dueDate: new Date(2024, 11, 25, 23, 59),
      points: 100,
      status: "upcoming"
    },
    {
      id: "2", 
      title: "MATH 205 Quiz 4",
      course: "Calculus II",
      dueDate: new Date(2024, 11, 22, 14, 0),
      points: 50,
      status: "upcoming"
    }
  ])

  const handleGoogleConnect = () => {
    // No-op: we render the real Google connect component in the UI below.
  }

  const validateCanvasUrl = async (url: string) => {
    setIsValidating(true)
    setValidationError("")
    
    try {
      // Basic URL validation
      if (!url.includes('.ics') || !url.includes('canvas') || !url.includes('feeds/calendars')) {
        throw new Error("This doesn't look like a Canvas iCal URL. Please check the format.")
      }

      // Real validation: fetch parsed ICS from our server endpoint to avoid CORS
      const resp = await fetch(`/api/canvas-ics?url=${encodeURIComponent(url)}`)
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}))
        throw new Error(body?.error || `Failed to fetch iCal (status ${resp.status})`)
      }
      const data = await resp.json()

      // data is an array of events { id, title, start, end, description }
      const imported = (data || []).map((ev: any) => ({
        id: ev.id || `${ev.title}-${ev.start}`,
        title: ev.title || 'Untitled',
        course: ev.description ? undefined : undefined,
        dueDate: ev.start ? new Date(ev.start) : new Date(),
        points: undefined,
        status: 'upcoming',
        description: ev.description,
      }))

      // Save a normalized task payload to localStorage so TaskList can pick it up on next render
      try {
        const tasksForStorage = imported.map((it: any) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          dueDate: it.dueDate.toISOString(),
          priority: 'medium',
          status: 'todo',
          type: 'assignment',
          course: it.course,
          estimatedHours: undefined,
          completedHours: 0,
          tags: [],
          isStarred: false,
          createdAt: new Date().toISOString(),
          source: 'canvas',
        }))
        localStorage.setItem('importedTasks', JSON.stringify(tasksForStorage))
      } catch (e) {
        console.error('Failed to persist imported tasks:', e)
      }

      // Update preview immediately
      setAssignments(imported)
      setCanvasConnected(true)
      setValidationError("")
      
    } catch (error: any) {
      setValidationError(error.message)
      setCanvasConnected(false)
    }
    
    setIsValidating(false)
  }

  const handleCanvasSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (icalUrl.trim()) {
      validateCanvasUrl(icalUrl.trim())
    }
  }

  const handleFinishSetup = () => {
    // Navigate to main app
    if (onComplete) onComplete()
    else alert("Setup complete! Welcome to Smart Schedule Generator.")
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className={modal ? "p-4" : ""}>
      <div className={containerClass}>

        {/* Step 1: Google Calendar Connection */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Connect Google Calendar</CardTitle>
              <CardDescription className="text-lg">
                First, let's connect your Google Calendar to manage and create study sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!googleConnected ? (
                <div className="text-center space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">What this enables:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Create study sessions automatically</li>
                      <li>• Avoid scheduling conflicts</li>
                      <li>• Set reminders for important deadlines</li>
                      <li>• View your complete schedule in one place</li>
                    </ul>
                  </div>
                  <div className="flex justify-center">
                    <GoogleCalendarConnect
                      onConnected={() => {
                        setGoogleConnected(true)
                        // advance to Canvas step automatically after connect
                        setCurrentStep(2)
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-green-700">Google Calendar Connected!</h3>
                  <p className="text-gray-600">Great! Now let's connect your Canvas assignments.</p>
                  <Button 
                    onClick={() => setCurrentStep(2)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next: Connect Canvas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Canvas iCal Connection */}
        {currentStep === 2 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Connect Canvas Calendar</CardTitle>
              <CardDescription className="text-lg">
                Now let's import your assignments from Canvas using your iCal feed URL
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">This will import:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Assignment due dates</li>
                  <li>• Quiz and exam schedules</li>
                  <li>• Discussion post deadlines</li>
                  <li>• Project milestones</li>
                </ul>
              </div>

              {/* Instructions Toggle */}
              <div className="border rounded-lg p-4">
                <button
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="font-medium flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    How to find your Canvas iCal URL
                  </span>
                  <ArrowRight className={`w-4 h-4 transform transition-transform ${showInstructions ? 'rotate-90' : ''}`} />
                </button>
                
                {showInstructions && (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-2">Step 1: Open Canvas Calendar</p>
                      <p>Go to Canvas → Calendar → Look for "Calendar Feed" at the bottom right</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-2">Step 2: Copy the iCal URL</p>
                      <p>Click "Calendar Feed" and copy the URL that ends with ".ics"</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-2">Example URL format:</p>
                      <code className="text-xs bg-white p-1 rounded">
                        https://canvas.school.edu/feeds/calendars/user_ABC123.ics
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* URL Input Form */}
              <form onSubmit={handleCanvasSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="ical-url" className="text-base font-medium">Canvas iCal Feed URL</Label>
                  <Input
                    id="ical-url"
                    type="url"
                    placeholder="https://canvas.yourschool.edu/feeds/calendars/user_..."
                    value={icalUrl}
                    onChange={(e) => setIcalUrl(e.target.value)}
                    className="mt-2"
                    disabled={isValidating}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste your Canvas calendar feed URL here (must end with .ics)
                  </p>
                </div>

                {validationError && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{validationError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!icalUrl.trim() || isValidating}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    {isValidating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Connect Canvas
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {canvasConnected && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-700">Canvas Connected Successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mb-3">Found {assignments.length} upcoming assignments</p>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Continue to Preview
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview & Complete */}
        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Setup Complete!</CardTitle>
              <CardDescription className="text-lg">
                Here are your upcoming assignments. You're ready to start smart scheduling!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Upcoming Assignments</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {assignments
                    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                    .slice(0, 10)
                    .map((assignment) => {
                      const daysLeft = getDaysUntilDue(assignment.dueDate)
                      return (
                        <div key={assignment.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{assignment.title}</h4>
                              <p className="text-xs text-gray-600">{assignment.course}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>Due: {assignment.dueDate.toLocaleDateString()}</span>
                                {assignment.points && <span>{assignment.points} points</span>}
                                <Badge variant={daysLeft <= 2 ? "destructive" : daysLeft <= 7 ? "default" : "secondary"} className="text-xs">
                                  {daysLeft === 0 ? "Due today" : daysLeft === 1 ? "Due tomorrow" : `${daysLeft} days left`}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  onClick={handleFinishSetup}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Using Smart Schedule
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Modal wrapper so the onboarding can be shown inside a Dialog
export function TwoStepOnboardingModal({ onComplete, onClose }: { onComplete?: () => void; onClose?: () => void }) {
  return (
    <div className="p-4">
      <TwoStepOnboarding
        onComplete={() => {
          if (onComplete) onComplete()
          if (onClose) onClose()
        }}
        modal={true}
      />
    </div>
  )
}
