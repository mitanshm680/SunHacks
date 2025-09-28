"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Brain, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"

interface WelcomeTourProps {
  onComplete: () => void
}

export function WelcomeTour({ onComplete }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Welcome to StudySync!",
      description: "Your AI-powered study companion that makes scheduling effortless",
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
              <Brain className="h-10 w-10 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground">
              StudySync intelligently analyzes your schedule and creates optimal study sessions in your free time.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Smart Calendar Integration",
      description: "Connect your Google Calendar for seamless scheduling",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Google Calendar</h4>
              <p className="text-sm text-muted-foreground">Sync your existing events and find free time</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI-Powered Scheduling",
      description: "Let AI find the perfect study times based on your availability",
      icon: <Brain className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Analyzes your free time slots</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Considers assignment deadlines</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Suggests optimal study sessions</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Start planning smarter with your AI study companion",
      icon: <CheckCircle2 className="h-8 w-8 text-app-blue" />,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-app-blue rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-app-black" />
            </div>
            <p className="text-muted-foreground mb-4">
              You're ready to experience smarter studying with AI-powered scheduling!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Smart Scheduling
              </Badge>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                Calendar Sync
              </Badge>
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                AI Insights
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">{currentStepData.icon}</div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStepData.content}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {!isLastStep ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-primary hover:bg-primary/90">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onComplete}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Get Started
                  <Sparkles className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
