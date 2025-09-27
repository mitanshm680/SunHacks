import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, BookOpen } from "lucide-react"

interface Assignment {
  id: number
  title: string
  course: string
  dueDate: string
  priority: "low" | "medium" | "high"
  estimatedHours: number
  completed: boolean
}

interface AssignmentsListProps {
  assignments: Assignment[]
}

export function AssignmentsList({ assignments }: AssignmentsListProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    return `Due in ${diffDays} days`
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{assignment.title}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{assignment.course}</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(assignment.dueDate)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {assignment.estimatedHours}h estimated
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
