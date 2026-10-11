import 'fake-indexeddb/auto'
import { afterEach, expect, test } from 'vitest'
import { GrowthFlowDatabase } from './database'
import { TaskService } from './tasks'
import type { TaskDraft } from '../types/task'

const db = new GrowthFlowDatabase(`growthflow-test-${crypto.randomUUID()}`)
const service = new TaskService(db)

afterEach(async () => {
  await db.planTasks.clear()
})

function draft(date: string, title: string): TaskDraft {
  return {
    date, title, description: '', category: 'study', priority: 'medium',
    minimumRequirement: '', note: '',
  }
}

test('tasks on different dates remain separate through edits and status changes', async () => {
  const first = await service.create(draft('2026-10-11', '阅读'))
  const second = await service.create(draft('2026-10-12', '运动'))

  await service.update(first.id, draft('2026-10-11', '阅读 20 分钟'))
  await service.setStatus(second.id, 'completed')

  const tasks = await service.list()
  expect(tasks).toHaveLength(2)
  expect(tasks.find((task) => task.id === first.id)).toMatchObject({ date: '2026-10-11', title: '阅读 20 分钟', status: 'not-started' })
  expect(tasks.find((task) => task.id === second.id)).toMatchObject({ date: '2026-10-12', title: '运动', status: 'completed' })

  await service.remove(first.id)
  expect(await service.list()).toMatchObject([{ id: second.id }])
})

test('rejects invalid dates and empty titles before writing', async () => {
  await expect(service.create(draft('2026-02-30', '无效日期'))).rejects.toThrow('有效的任务日期')
  await expect(service.create(draft('2026-10-11', '   '))).rejects.toThrow('任务名称')
  expect(await service.list()).toHaveLength(0)
})

test('tasks remain available after reopening the database', async () => {
  const name = `growthflow-reopen-${crypto.randomUUID()}`
  const firstConnection = new GrowthFlowDatabase(name)
  const created = await new TaskService(firstConnection).create(draft('2026-10-11', '保留任务'))
  firstConnection.close()

  const secondConnection = new GrowthFlowDatabase(name)
  expect(await new TaskService(secondConnection).list()).toMatchObject([{ id: created.id, title: '保留任务' }])
  await secondConnection.delete()
})
