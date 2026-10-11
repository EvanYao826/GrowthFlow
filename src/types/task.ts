export const taskCategories = ['work', 'study', 'exercise', 'creation', 'life', 'other'] as const
export type TaskCategory = typeof taskCategories[number]

export const taskPriorities = ['high', 'medium', 'low'] as const
export type TaskPriority = typeof taskPriorities[number]

export const taskStatuses = ['not-started', 'in-progress', 'completed', 'skipped'] as const
export type TaskStatus = typeof taskStatuses[number]

export interface PlanTask {
  id: string
  date: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  minimumRequirement: string
  plannedMinutes?: number
  status: TaskStatus
  actualMinutes?: number
  note: string
  createdAt: number
  updatedAt: number
}

export type TaskDraft = Pick<PlanTask,
  'date' | 'title' | 'description' | 'category' | 'priority' |
  'minimumRequirement' | 'plannedMinutes' | 'actualMinutes' | 'note'
>
