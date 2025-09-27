"use client"

import { useState } from "react"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { Dashboard } from "@/components/dashboard"

export default function HomePage() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [user, setUser] = useState<any>(null)

  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onComplete={(userData) => {
          setUser(userData)
          setIsOnboarded(true)
        }}
      />
    )
  }

  return <Dashboard user={user} />
}
