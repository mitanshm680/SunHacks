"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthenticated: () => void
}

export function AuthModal({ isOpen, onClose, onAuthenticated }: AuthModalProps) {
  const [step, setStep] = useState<"welcome" | "google" | "complete">("welcome")
  const [googleConnected, setGoogleConnected] = useState(false)

  const handleGoogleConnect = () => {
    // Simulate Google OAuth flow
    setTimeout(() => {
      setGoogleConnected(true)
      if (step === "google") {
        setStep("complete")
      }
    }, 1000)
  }

  const handleComplete = () => {
    onAuthenticated()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === "welcome" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Welcome to StudySync</DialogTitle>
              <DialogDescription className="text-center">
                Let's set up your smart study planner in just a few steps
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader className="text-center pb-3">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Connect Google Calendar</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-center text-sm">
                    Access your existing schedule and sync new study sessions
                  </CardDescription>
                </CardContent>
              </Card>
              <Button onClick={() => setStep("google")} className="w-full bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </>
        )}

        {step === "google" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Connect Google Calendar
              </DialogTitle>
              <DialogDescription>
                We'll access your calendar to find available time slots for studying
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What we'll access:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• View your calendar events</li>
                  <li>• Create new study session events</li>
                  <li>• Find available time slots</li>
                </ul>
              </div>
              <Button
                onClick={handleGoogleConnect}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={googleConnected}
              >
                {googleConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Connected to Google Calendar
                  </>
                ) : (
                  "Connect Google Calendar"
                )}
              </Button>
              {googleConnected && (
                <Button onClick={() => setStep("complete")} className="w-full" variant="outline">
                  Continue
                </Button>
              )}
            </div>
          </>
        )}

        {step === "complete" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">You're all set!</DialogTitle>
              <DialogDescription className="text-center">
                StudySync is ready to help you plan smarter study sessions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Google Calendar connected</span>
                </div>
              </div>
              <Button onClick={handleComplete} className="w-full bg-primary hover:bg-primary/90">
                Start Using StudySync
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
