"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Clock, Trash2, Edit, Target, AlertCircle } from "lucide-react"

interface PersonalTask {
  id: number
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  estimatedTime?: number
  completed: boolean
  createdAt: string
}

export function TaskManager() {
  const [tasks, setTasks] = useState<PersonalTask[]>([
    {
      id: 1,
      title: "Gym workout",
      description: "Full body workout session",
      category: "Health",
      priority: "medium",
      estimatedTime: 60,
      completed: false,
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      title: "Grocery shopping",
      description: "Weekly grocery run - need to buy ingredients for meal prep",
      category: "Personal",
      priority: "high",
      dueDate: "2024-01-14",
      estimatedTime: 45,
      completed: false,
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      title: "Call mom",
      category: "Personal",
      priority: "low",
      completed: true,
      createdAt: "2024-01-09",
    },
    {
      id: 4,
      title: "Dentist appointment",
      category: "Health",
      priority: "high",
      dueDate: "2024-01-16",
      estimatedTime: 90,
      completed: false,
      createdAt: "2024-01-10",
    },
  ])

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Personal",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
    estimatedTime: "",
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null)
  const [filter, setFilter] = useState("all")

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: PersonalTask = {
        id: Date.now(),
        title: newTask.title,
        description: newTask.description || undefined,
        category: newTask.category,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        estimatedTime: newTask.estimatedTime ? Number.parseInt(newTask.estimatedTime) : undefined,
        completed: false,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setTasks([...tasks, task])
      setNewTask({
        title: "",
        description: "",
        category: "Personal",
        priority: "medium",
        dueDate: "",
        estimatedTime: "",
      })
      setIsDialogOpen(false)
    }
  }

  const updateTask = () => {
    if (editingTask && newTask.title.trim()) {
      const updatedTask: PersonalTask = {
        ...editingTask,
        title: newTask.title,
        description: newTask.description || undefined,
        category: newTask.category,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
        estimatedTime: newTask.estimatedTime ? Number.parseInt(newTask.estimatedTime) : undefined,
      }
      setTasks(tasks.map((task) => (task.id === editingTask.id ? updatedTask : task)))
      setEditingTask(null)
      setNewTask({
        title: "",
        description: "",
        category: "Personal",
        priority: "medium",
        dueDate: "",
        estimatedTime: "",
      })
      setIsDialogOpen(false)
    }
  }

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const startEdit = (task: PersonalTask) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || "",
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate || "",
      estimatedTime: task.estimatedTime?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Health":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Personal":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Work":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "Academic":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-3 h-3" />
      case "medium":
        return <Target className="w-3 h-3" />
      case "low":
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    if (filter === "high-priority") return task.priority === "high" && !task.completed
    return true
  })

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high" && !t.completed).length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{taskStats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{taskStats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{taskStats.highPriority}</div>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Tasks</CardTitle>
              <CardDescription>Add personal tasks that AI will consider when creating your schedule</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setNewTask({
                      title: "",
                      description: "",
                      category: "Personal",
                      priority: "medium",
                      dueDate: "",
                      estimatedTime: "",
                    })
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? "Update your task details" : "Create a new personal task for your schedule"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Work">Work</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewTask({ ...newTask, priority: value })
                        }
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        placeholder="60"
                        value={newTask.estimatedTime}
                        onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingTask ? updateTask : addTask}>
                    {editingTask ? "Update Task" : "Add Task"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-2">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All ({taskStats.total})
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending ({taskStats.pending})
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
            >
              Completed ({taskStats.completed})
            </Button>
            <Button
              variant={filter === "high-priority" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("high-priority")}
            >
              High Priority ({taskStats.highPriority})
            </Button>
          </div>

          {/* Tasks list */}
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start justify-between p-4 border border-border rounded-lg transition-colors ${
                  task.completed ? "opacity-60 bg-muted/30" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-4 h-4 rounded border-border mt-1"
                  />
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</h4>
                    {task.description && (
                      <p className={`text-sm text-muted-foreground mt-1 ${task.completed ? "line-through" : ""}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedTime}m
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1">{task.priority}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(task)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {filter === "all"
                  ? "No personal tasks yet. Add some to help AI create a balanced schedule."
                  : `No ${filter.replace("-", " ")} tasks found.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
