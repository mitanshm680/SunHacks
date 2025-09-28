"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Clock,
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  AlertCircle,
  Brain,
  Edit,
  Trash2,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  type: "assignment" | "personal" | "study"
  course?: string
  estimatedHours?: number
  completedHours?: number
  tags: string[]
  isStarred: boolean
  createdAt: Date
  source?: "canvas" | "manual"
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Calculus Problem Set 5",
    description: "Complete problems 1-20 from Chapter 5, focusing on integration techniques",
    dueDate: new Date(2024, 11, 20, 23, 59),
    priority: "high",
    status: "todo",
    type: "assignment",
    course: "MATH 101",
    estimatedHours: 3,
    completedHours: 0,
    tags: ["math", "calculus", "integration"],
    isStarred: true,
    createdAt: new Date(2024, 11, 10),
    source: "canvas",
  },
  {
    id: "2",
    title: "Physics Lab Report",
    description: "Write lab report for pendulum experiment",
    dueDate: new Date(2024, 11, 18, 17, 0),
    priority: "medium",
    status: "in-progress",
    type: "assignment",
    course: "PHYS 201",
    estimatedHours: 4,
    completedHours: 2,
    tags: ["physics", "lab", "report"],
    isStarred: false,
    createdAt: new Date(2024, 11, 8),
    source: "canvas",
  },
  {
    id: "3",
    title: "Review Chemistry Notes",
    description: "Go through chapters 8-10 for upcoming midterm",
    dueDate: new Date(2024, 11, 22, 12, 0),
    priority: "medium",
    status: "todo",
    type: "study",
    course: "CHEM 101",
    estimatedHours: 2,
    completedHours: 0,
    tags: ["chemistry", "review", "midterm"],
    isStarred: false,
    createdAt: new Date(2024, 11, 12),
    source: "manual",
  },
  {
    id: "4",
    title: "Gym Workout Plan",
    description: "Create a weekly workout schedule",
    dueDate: new Date(2024, 11, 16, 18, 0),
    priority: "low",
    status: "completed",
    type: "personal",
    estimatedHours: 1,
    completedHours: 1,
    tags: ["fitness", "planning"],
    isStarred: false,
    createdAt: new Date(2024, 11, 5),
    source: "manual",
  },
]

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filter, setFilter] = useState<"all" | "todo" | "in-progress" | "completed">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created">("dueDate")

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  const getTypeIcon = (type: Task["type"]) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="h-4 w-4" />
      case "study":
        return <Brain className="h-4 w-4" />
      case "personal":
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-600 fill-blue-600/20" />
      case "todo":
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return "text-red-600"
    if (daysUntilDue <= 1) return "text-red-500"
    if (daysUntilDue <= 3) return "text-yellow-600"
    return "text-muted-foreground"
  }

  const filteredTasks = tasks
    .filter((task) => {
      if (filter !== "all" && task.status !== filter) return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return a.dueDate.getTime() - b.dueDate.getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const newStatus = task.status === "completed" ? "todo" : task.status === "todo" ? "in-progress" : "completed"
          return {
            ...task,
            status: newStatus,
            completedHours: newStatus === "completed" ? task.estimatedHours || 0 : task.completedHours,
          }
        }
        return task
      }),
    )
  }

  const toggleStar = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, isStarred: !task.isStarred } : task)))
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === "completed").length
    const inProgress = tasks.filter((t) => t.status === "in-progress").length
    const overdue = tasks.filter((t) => t.status !== "completed" && getDaysUntilDue(t.dueDate) < 0).length

    return { total, completed, inProgress, overdue }
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Circle className="h-5 w-5 text-blue-600 fill-blue-600/20" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Controls */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks & Assignments</CardTitle>
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>Create a new task or assignment to track</DialogDescription>
                </DialogHeader>
                <AddTaskForm
                  onClose={() => setIsAddTaskOpen(false)}
                  onAdd={(task) => setTasks((prev) => [...prev, task])}
                />
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const daysUntilDue = getDaysUntilDue(task.dueDate)
          const progress = task.estimatedHours ? ((task.completedHours || 0) / task.estimatedHours) * 100 : 0

          return (
            <Card
              key={task.id}
              className={cn(
                "border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer hover:shadow-md transition-all",
                task.status === "completed" && "opacity-75",
              )}
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleTaskStatus(task.id)
                    }}
                    className="mt-1"
                  >
                    {getStatusIcon(task.status)}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(task.type)}
                          <h3
                            className={cn(
                              "font-medium truncate",
                              task.status === "completed" && "line-through text-muted-foreground",
                            )}
                          >
                            {task.title}
                          </h3>
                          {task.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        {task.course && <p className="text-sm text-muted-foreground mb-1">{task.course}</p>}
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("text-xs", getPriorityColor(task.priority))}>{task.priority}</Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.source === "canvas" && (
                            <Badge variant="outline" className="text-xs">
                              Canvas
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={cn("text-sm", getUrgencyColor(daysUntilDue))}>
                            {daysUntilDue < 0
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : daysUntilDue === 0
                                ? "Due today"
                                : daysUntilDue === 1
                                  ? "Due tomorrow"
                                  : `${daysUntilDue} days left`}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {task.dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        {task.estimatedHours && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {task.completedHours || 0}h / {task.estimatedHours}h
                              </span>
                            </div>
                            <Progress value={progress} className="h-1 w-20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(task.id)
                      }}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          task.isStarred ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredTasks.length === 0 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search or filters" : "Get started by adding your first task"}
              </p>
              <Button onClick={() => setIsAddTaskOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
            setSelectedTask(null)
          }}
          onDelete={(taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId))
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

function AddTaskForm({ onClose, onAdd }: { onClose: () => void; onAdd: (task: Task) => void }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    dueTime: "",
    priority: "medium" as Task["priority"],
    type: "personal" as Task["type"],
    course: "",
    estimatedHours: "",
    tags: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime || "23:59"}`)

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || undefined,
      dueDate: dueDateTime,
      priority: formData.priority,
      status: "todo",
      type: formData.type,
      course: formData.course || undefined,
      estimatedHours: formData.estimatedHours ? Number.parseInt(formData.estimatedHours) : undefined,
      completedHours: 0,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isStarred: false,
      createdAt: new Date(),
      source: "manual",
    }

    onAdd(newTask)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueTime">Due Time</Label>
          <Input
            id="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Task["priority"]) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: Task["type"]) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="study">Study</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            placeholder="e.g., MATH 101"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., math, homework, urgent"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
          Add Task
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}

function TaskDetailModal({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const progress = task.estimatedHours ? ((task.completedHours || 0) / task.estimatedHours) * 100 : 0

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <Card className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] z-50 border-border/50 bg-card/95 backdrop-blur-sm shadow-xl overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                {task.type === "assignment" && <BookOpen className="h-5 w-5 text-primary" />}
                {task.type === "study" && <Brain className="h-5 w-5 text-primary" />}
                {task.type === "personal" && <Clock className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {task.course && <p className="text-sm text-muted-foreground">{task.course}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Due Date</h4>
              <p className="text-sm text-muted-foreground">
                {task.dueDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p
                className={cn(
                  "text-xs",
                  daysUntilDue < 0 ? "text-red-600" : daysUntilDue <= 1 ? "text-yellow-600" : "text-muted-foreground",
                )}
              >
                {daysUntilDue < 0
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : daysUntilDue === 0
                    ? "Due today"
                    : `${daysUntilDue} days left`}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <Badge
                className={cn(
                  task.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : task.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800",
                )}
              >
                {task.status.replace("-", " ")}
              </Badge>
            </div>
          </div>

          {task.estimatedHours && (
            <div>
              <h4 className="text-sm font-medium mb-2">Progress</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    {task.completedHours || 0}h / {task.estimatedHours}h
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          )}

          {task.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
              Schedule Study Time
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
