"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Brain, BookOpen, Clock } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import TwoStepOnboarding, { TwoStepOnboardingModal } from '@/components/two-step-onboarding'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardView } from "@/components/dashboard-view"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (isAuthenticated) {
    return <DashboardView />
  }

  return (
    <div className="min-h-screen clean-bg">
      <header className="border-b border-border/30 glass-effect">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Plz_Use_It</h1>
                <p className="text-xs text-muted-foreground">AI Study Planner</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="mb-6">
            <img 
              src="/mascot.png" 
              alt="Plz_Use_It Mascot" 
              className="w-32 h-32 mx-auto mb-4"
            />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-4">
            Smart Study
            <span className="text-primary"> Scheduling</span>
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-xl mx-auto mb-6">
            AI finds perfect study times in your calendar and helps you plan your assignments automatically.
          </p>
          <Button
            size="lg"
            onClick={() => setShowOnboarding(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
          >
            Start Planning
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="glass-effect">
            <CardHeader className="text-center pb-2">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">Calendar Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">Connects with Google Calendar</CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="text-center pb-2">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">Organize your assignments</CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="text-center pb-2">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">AI Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">Smart study session planning</CardDescription>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="text-center pb-2">
              <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">Time Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">Healthy study-life balance</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-3">
                <span className="text-lg font-bold text-primary">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-1">Connect</h4>
              <p className="text-muted-foreground text-sm">Link Google Calendar</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-3">
                <span className="text-lg font-bold text-primary">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-1">Analyze</h4>
              <p className="text-muted-foreground text-sm">AI finds optimal study times</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-3">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-1">Schedule</h4>
              <p className="text-muted-foreground text-sm">Approve and sync sessions</p>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Get Started — Connect calendars</DialogTitle>
          </DialogHeader>
          <TwoStepOnboardingModal
            onComplete={() => {
              setIsAuthenticated(true)
              setShowOnboarding(false)
            }}
            onClose={() => setShowOnboarding(false)}
          />
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={() => {
          setIsAuthenticated(true)
          setShowAuthModal(false)
        }}
      />
    </div>
  )
}