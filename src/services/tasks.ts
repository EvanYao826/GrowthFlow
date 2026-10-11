import { database, type GrowthFlowDatabase } from './database'
import {
  taskCategories, taskPriorities, taskStatuses,
  type PlanTask, type TaskDraft, type TaskStatus,
} from '../types/task'

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
}

function validMinutes(value: number | undefined): boolean {
  return value === undefined || (Number.isInteger(value) && value >= 0 && value <= 1440)
}

export function validateTaskDraft(draft: TaskDraft): TaskDraft {
  const title = draft.title.trim()
  if (!validDate(draft.date)) throw new Error('请选择有效的任务日期。')
  if (!title || title.length > 120) throw new Error('任务名称须为 1–120 个字符。')
  if (!taskCategories.includes(draft.category)) throw new Error('请选择有效的任务类别。')
  if (!taskPriorities.includes(draft.priority)) throw new Error('请选择有效的优先级。')
  if (!validMinutes(draft.plannedMinutes) || !validMinutes(draft.actualMinutes)) {
    throw new Error('时长须为 0–1440 之间的整数分钟。')
  }
  if (draft.description.length > 2000 || draft.minimumRequirement.length > 500 || draft.note.length > 2000) {
    throw new Error('描述、最低完成标准或备注过长。')
  }
  return {
    ...draft,
    title,
    description: draft.description.trim(),
    minimumRequirement: draft.minimumRequirement.trim(),
    note: draft.note.trim(),
  }
}

export class TaskService {
  constructor(private readonly db: GrowthFlowDatabase = database) {}

  async list(): Promise<PlanTask[]> {
    const tasks = await this.db.planTasks.toArray()
    return tasks.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
  }

  async create(draft: TaskDraft): Promise<PlanTask> {
    const clean = validateTaskDraft(draft)
    const now = Date.now()
    const task: PlanTask = {
      ...clean,
      id: crypto.randomUUID(),
      status: 'not-started',
      createdAt: now,
      updatedAt: now,
    }
    await this.db.planTasks.add(task)
    return task
  }

  async update(id: string, draft: TaskDraft): Promise<PlanTask> {
    const clean = validateTaskDraft(draft)
    return this.db.transaction('rw', this.db.planTasks, async () => {
      const previous = await this.db.planTasks.get(id)
      if (!previous) throw new Error('任务不存在，可能已被删除。')
      const task = { ...previous, ...clean, updatedAt: Date.now() }
      await this.db.planTasks.put(task)
      return task
    })
  }

  async setStatus(id: string, status: TaskStatus): Promise<PlanTask> {
    if (!taskStatuses.includes(status)) throw new Error('无效的任务状态。')
    return this.db.transaction('rw', this.db.planTasks, async () => {
      const previous = await this.db.planTasks.get(id)
      if (!previous) throw new Error('任务不存在，可能已被删除。')
      const task = { ...previous, status, updatedAt: Date.now() }
      await this.db.planTasks.put(task)
      return task
    })
  }

  async remove(id: string): Promise<void> {
    await this.db.planTasks.delete(id)
  }
}

export const taskService = new TaskService()
