"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Brain, CheckCircle, ArrowRight, Sparkles } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: (userData: any) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [connections, setConnections] = useState({
    googleCalendar: false,
    canvas: false,
  })

  const handleGoogleConnect = () => {
    // Simulate Google Calendar connection
    setConnections((prev) => ({ ...prev, googleCalendar: true }))
  }

  const handleCanvasConnect = () => {
    // Simulate Canvas connection
    setConnections((prev) => ({ ...prev, canvas: true }))
  }

  const handleComplete = () => {
    onComplete({
      name: "Student",
      connections,
    })
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center pulse-glow">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StudySync
              </h1>
            </div>
            <h2 className="text-5xl font-bold text-balance mb-6">
              Your AI-Powered
              <br />
              <span className="text-primary">Study Companion</span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto mb-8">
              Automatically sync your assignments from Canvas, find free time in your Google Calendar, and let AI create
              the perfect study schedule for academic success.
            </p>
            <Button onClick={() => setStep(1)} size="lg" className="text-lg px-8 py-6 rounded-xl">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Integration</CardTitle>
                <CardDescription>
                  Connects with Google Calendar and Canvas to automatically import your schedule and assignments
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>AI Scheduling</CardTitle>
                <CardDescription>
                  Intelligent algorithms find optimal study times based on your free slots and assignment deadlines
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 hover:border-chart-3/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle>One-Tap Sync</CardTitle>
                <CardDescription>
                  Review AI suggestions and sync approved study sessions back to your Google Calendar instantly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Connect Your Accounts</h2>
          <p className="text-muted-foreground">
            We need access to your calendar and assignments to create your personalized study plan
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <Card
            className={`border-2 transition-colors ${connections.googleCalendar ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Google Calendar</CardTitle>
                    <CardDescription>Access your calendar to find free time slots</CardDescription>
                  </div>
                </div>
                {connections.googleCalendar ? (
                  <Badge variant="default" className="bg-primary">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button onClick={handleGoogleConnect} variant="outline">
                    Connect
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card
            className={`border-2 transition-colors ${connections.canvas ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Canvas LMS</CardTitle>
                    <CardDescription>Import assignments and due dates automatically</CardDescription>
                  </div>
                </div>
                {connections.canvas ? (
                  <Badge variant="default" className="bg-primary">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Button onClick={handleCanvasConnect} variant="outline">
                    Connect
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Button
            onClick={handleComplete}
            disabled={!connections.googleCalendar || !connections.canvas}
            size="lg"
            className="px-8"
          >
            {connections.googleCalendar && connections.canvas ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Start Planning
              </>
            ) : (
              "Connect Both Accounts"
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            We don't replace your existing tools - we just help you plan better
          </p>
        </div>
      </div>
    </div>
  )
}
