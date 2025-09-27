"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Send as Sync,
  Clock,
  Trash2,
  RefreshCw,
  ExternalLink,
  Zap,
  Shield,
} from "lucide-react"
import { calendarSync } from "@/lib/calendar-sync"

interface StudySession {
  id: number
  title: string
  assignmentId?: number
  taskId?: number
  date: string
  time: string
  duration: number
  type: "study" | "task" | "break"
  priority: "low" | "medium" | "high"
  confidence: number
}

interface SyncManagerProps {
  sessions: StudySession[]
  approvedSessions: Set<number>
  onSyncComplete?: (syncedSessions: StudySession[]) => void
}

export function SyncManager({ sessions, approvedSessions, onSyncComplete }: SyncManagerProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStatus, setSyncStatus] = useState<Record<number, boolean>>({})
  const [lastSyncResult, setLastSyncResult] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [showSyncDialog, setShowSyncDialog] = useState(false)

  const approvedSessionsList = sessions.filter((session) => approvedSessions.has(session.id))

  useEffect(() => {
    checkConnection()
    loadSyncStatus()
  }, [sessions])

  const checkConnection = async () => {
    try {
      const connected = await calendarSync.checkConnection()
      setIsConnected(connected)
    } catch (error) {
      setIsConnected(false)
    }
  }

  const loadSyncStatus = async () => {
    if (sessions.length > 0) {
      try {
        const status = await calendarSync.getSyncStatus(sessions.map((s) => s.id))
        setSyncStatus(status)
      } catch (error) {
        console.error("Failed to load sync status:", error)
      }
    }
  }

  const handleSync = async () => {
    if (approvedSessionsList.length === 0) return

    setIsSyncing(true)
    setSyncProgress(0)
    setShowSyncDialog(true)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await calendarSync.batchSync(approvedSessionsList)

      clearInterval(progressInterval)
      setSyncProgress(100)

      setLastSyncResult(result)
      onSyncComplete?.(result.syncedSessions)

      // Update sync status
      const newStatus = { ...syncStatus }
      result.syncedSessions.forEach((session) => {
        newStatus[session.id] = true
      })
      setSyncStatus(newStatus)

      setTimeout(() => {
        setIsSyncing(false)
        if (result.success) {
          setShowSyncDialog(false)
        }
      }, 1000)
    } catch (error) {
      setIsSyncing(false)
      setLastSyncResult({
        success: false,
        syncedCount: 0,
        failedCount: approvedSessionsList.length,
        errors: [error.message],
        syncedSessions: [],
      })
    }
  }

  const handleRemoveSync = async (sessionIds: number[]) => {
    try {
      const result = await calendarSync.removeSessions(sessionIds)
      if (result.success) {
        const newStatus = { ...syncStatus }
        sessionIds.forEach((id) => {
          newStatus[id] = false
        })
        setSyncStatus(newStatus)
      }
    } catch (error) {
      console.error("Failed to remove synced sessions:", error)
    }
  }

  const getSyncedCount = () => {
    return Object.values(syncStatus).filter(Boolean).length
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Google Calendar Sync</CardTitle>
                <CardDescription>Manage your AI-generated study sessions in Google Calendar</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{approvedSessionsList.length}</div>
              <div className="text-sm text-muted-foreground">Approved Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{getSyncedCount()}</div>
              <div className="text-sm text-muted-foreground">Synced to Calendar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {approvedSessionsList.reduce((sum, s) => sum + s.duration, 0) / 60}h
              </div>
              <div className="text-sm text-muted-foreground">Total Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {lastSyncResult ? new Date(Date.now()).toLocaleDateString() : "Never"}
              </div>
              <div className="text-sm text-muted-foreground">Last Sync</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={checkConnection}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Connection
              </Button>
              <Button variant="outline" size="sm" onClick={loadSyncStatus}>
                <Sync className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleSync}
                    disabled={!isConnected || approvedSessionsList.length === 0 || isSyncing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSyncing ? (
                      <>
                        <Sync className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Sync {approvedSessionsList.length} Sessions
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Syncing to Google Calendar
                    </DialogTitle>
                    <DialogDescription>
                      {isSyncing
                        ? "Adding your approved study sessions to Google Calendar..."
                        : lastSyncResult?.success
                          ? "Successfully synced your study sessions!"
                          : "Sync completed with errors"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {isSyncing && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{syncProgress}%</span>
                        </div>
                        <Progress value={syncProgress} className="h-2" />
                      </div>
                    )}

                    {lastSyncResult && !isSyncing && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{lastSyncResult.syncedCount}</div>
                            <div className="text-sm text-muted-foreground">Synced</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-500">{lastSyncResult.failedCount}</div>
                            <div className="text-sm text-muted-foreground">Failed</div>
                          </div>
                        </div>

                        {lastSyncResult.errors.length > 0 && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                {lastSyncResult.errors.map((error: string, index: number) => (
                                  <div key={index} className="text-sm">
                                    {error}
                                  </div>
                                ))}
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}

                        {lastSyncResult.success && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            All sessions successfully added to your Google Calendar
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" asChild>
                <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Calendar
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Sync Status */}
      {approvedSessionsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Session Sync Status</CardTitle>
            <CardDescription>Track which study sessions have been synced to your Google Calendar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedSessionsList.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {session.type === "study" ? (
                        <Calendar className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-accent" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{session.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at {formatTime(session.time)} ({session.duration}m)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {syncStatus[session.id] ? (
                      <>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Synced
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSync([session.id])}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sync Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Sync Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Privacy & Security
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Events are marked as "StudySync AI Generated"</li>
                <li>• Only approved sessions are synced</li>
                <li>• You can remove synced events anytime</li>
                <li>• No personal data is stored externally</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Calendar Integration
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Automatic reminders (15 & 5 minutes before)</li>
                <li>• Study tips included in event descriptions</li>
                <li>• Color-coded by priority level</li>
                <li>• Conflicts are automatically avoided</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Issues */}
      {!isConnected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Google Calendar connection lost. Please reconnect to sync your study sessions.</span>
              <Button variant="outline" size="sm" onClick={checkConnection}>
                Reconnect
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
