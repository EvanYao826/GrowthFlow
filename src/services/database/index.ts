import Dexie, { type Table } from 'dexie'
import type { PlanTask } from '../../types/task'

export class GrowthFlowDatabase extends Dexie {
  planTasks!: Table<PlanTask, string>

  constructor(name = 'growthflow') {
    super(name)
    this.version(1).stores({
      planTasks: 'id, date, status, category, updatedAt',
    })
  }
}

export const database = new GrowthFlowDatabase()
