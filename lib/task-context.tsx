"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Task {
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
  source?: "manual" | "canvas"
  selectedForScheduling?: boolean
}

interface TaskContextType {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  toggleTaskSelection: (taskId: string) => void
  getSelectedTasks: () => Task[]
  getTasksForScheduling: () => Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt)
        }))
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error)
      }
    }

    // Load imported tasks from Canvas
    const importedTasks = localStorage.getItem('importedTasks')
    if (importedTasks) {
      try {
        const parsedImportedTasks = JSON.parse(importedTasks).map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt)
        }))
        
        // Merge imported tasks with existing tasks, avoiding duplicates
        setTasks(prevTasks => {
          const existingIds = new Set(prevTasks.map(t => t.id))
          const newImportedTasks = parsedImportedTasks.filter((t: Task) => !existingIds.has(t.id))
          return [...prevTasks, ...newImportedTasks]
        })
      } catch (error) {
        console.error('Failed to load imported tasks:', error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task])
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    )
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const toggleTaskSelection = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, selectedForScheduling: !task.selectedForScheduling }
          : task
      )
    )
  }

  const getSelectedTasks = () => {
    return tasks.filter(task => task.selectedForScheduling)
  }

  const getTasksForScheduling = () => {
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.selectedForScheduling
    )
  }

  return (
    <TaskContext.Provider value={{
      tasks,
      setTasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskSelection,
      getSelectedTasks,
      getTasksForScheduling
    }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
