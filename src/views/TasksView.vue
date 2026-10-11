<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Check, ListTodo, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import BaseButton from '../components/ui/BaseButton.vue'
import TaskForm from '../components/tasks/TaskForm.vue'
import { taskService } from '../services/tasks'
import { taskStatuses, type PlanTask, type TaskDraft, type TaskStatus } from '../types/task'

const tasks = ref<PlanTask[]>([])
const loading = ref(true)
const loadFailed = ref(false)
const saving = ref(false)
const busyId = ref<string | null>(null)
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const formInitial = ref<TaskDraft>(emptyDraft())
const formKey = ref(0)
const errorMessage = ref('')
const noticeMessage = ref('')

const categoryNames: Record<PlanTask['category'], string> = {
  work: '工作', study: '学习', exercise: '运动', creation: '创作', life: '生活', other: '其他',
}
const priorityNames: Record<PlanTask['priority'], string> = { high: '高优先级', medium: '普通', low: '低优先级' }
const statusNames: Record<TaskStatus, string> = {
  'not-started': '未开始', 'in-progress': '进行中', completed: '已完成', skipped: '已跳过',
}

function localDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function emptyDraft(): TaskDraft {
  return {
    date: localDate(), title: '', description: '', category: 'other', priority: 'medium',
    minimumRequirement: '', plannedMinutes: undefined, actualMinutes: undefined, note: '',
  }
}

function getError(error: unknown): string {
  return error instanceof Error ? error.message : '本地数据库操作失败，请检查浏览器存储权限和空间。'
}

async function loadTasks(): Promise<boolean> {
  loading.value = true
  try {
    tasks.value = await taskService.list()
    loadFailed.value = false
    errorMessage.value = ''
    return true
  } catch (error) {
    tasks.value = []
    loadFailed.value = true
    errorMessage.value = `读取任务失败：${getError(error)}`
    return false
  } finally {
    loading.value = false
  }
}

function startCreate() {
  editingId.value = null
  formInitial.value = emptyDraft()
  formKey.value += 1
  formOpen.value = true
  errorMessage.value = ''
  noticeMessage.value = ''
}

function startEdit(task: PlanTask) {
  editingId.value = task.id
  formInitial.value = {
    date: task.date, title: task.title, description: task.description, category: task.category,
    priority: task.priority, minimumRequirement: task.minimumRequirement,
    plannedMinutes: task.plannedMinutes, actualMinutes: task.actualMinutes, note: task.note,
  }
  formKey.value += 1
  formOpen.value = true
  errorMessage.value = ''
  noticeMessage.value = ''
}

async function saveTask(draft: TaskDraft) {
  saving.value = true
  errorMessage.value = ''
  try {
    if (editingId.value) await taskService.update(editingId.value, draft)
    else await taskService.create(draft)
    const message = editingId.value ? '任务已更新。' : '任务已创建。'
    const loaded = await loadTasks()
    formOpen.value = false
    editingId.value = null
    if (loaded) noticeMessage.value = message
  } catch (error) {
    errorMessage.value = `保存任务失败：${getError(error)}`
  } finally {
    saving.value = false
  }
}

async function changeStatus(task: PlanTask, event: Event) {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  const next = target.value
  if (!taskStatuses.some((status) => status === next)) return
  if (next === task.status) return
  busyId.value = task.id
  errorMessage.value = ''
  try {
    await taskService.setStatus(task.id, next as TaskStatus)
    if (await loadTasks()) noticeMessage.value = '任务状态已更新。'
  } catch (error) {
    target.value = task.status
    errorMessage.value = `更新状态失败：${getError(error)}`
  } finally {
    busyId.value = null
  }
}

async function completeTask(task: PlanTask) {
  busyId.value = task.id
  errorMessage.value = ''
  try {
    await taskService.setStatus(task.id, 'completed')
    if (await loadTasks()) noticeMessage.value = '任务已完成。'
  } catch (error) {
    errorMessage.value = `完成任务失败：${getError(error)}`
  } finally {
    busyId.value = null
  }
}

async function deleteTask(task: PlanTask) {
  if (!window.confirm(`确定删除“${task.title}”吗？此操作无法撤销。`)) return
  busyId.value = task.id
  errorMessage.value = ''
  try {
    await taskService.remove(task.id)
    if (await loadTasks()) noticeMessage.value = '任务已删除。'
  } catch (error) {
    errorMessage.value = `删除任务失败：${getError(error)}`
  } finally {
    busyId.value = null
  }
}

onMounted(loadTasks)
</script>

<template>
  <div class="tasks-page">
    <header class="tasks-heading">
      <div>
        <p class="section-kicker">本地任务管理</p>
        <h1>所有任务</h1>
        <p>在这里管理不同日期的任务。数据只保存在当前浏览器中；备份与恢复将在后续阶段提供。</p>
      </div>
      <BaseButton variant="primary" @click="startCreate"><Plus :size="17" aria-hidden="true" /> 新建任务</BaseButton>
    </header>

    <p v-if="errorMessage" class="task-feedback task-feedback--error" role="alert">{{ errorMessage }}</p>
    <p v-if="noticeMessage" class="task-feedback task-feedback--success" role="status">{{ noticeMessage }}</p>

    <TaskForm v-if="formOpen" :key="formKey" :initial="formInitial" :is-editing="editingId !== null" :saving="saving" @submit="saveTask" @cancel="formOpen = false" />

    <div v-if="loading" class="tasks-empty">正在读取本地任务…</div>
    <div v-else-if="loadFailed" class="tasks-empty">
      <h2>任务暂时无法读取</h2>
      <p>检查浏览器的存储权限或可用空间，然后重试。</p>
      <BaseButton variant="secondary" @click="loadTasks">重新读取</BaseButton>
    </div>
    <div v-else-if="tasks.length === 0" class="tasks-empty">
      <ListTodo :size="30" :stroke-width="1.5" aria-hidden="true" />
      <h2>还没有任务</h2>
      <p>点击“新建任务”添加第一条计划。</p>
    </div>
    <div v-else class="task-list">
      <article v-for="task in tasks" :key="task.id" class="task-item">
        <div class="task-item-main">
          <div class="task-item-meta"><time :datetime="task.date">{{ task.date }}</time><span>{{ categoryNames[task.category] }}</span><span>{{ priorityNames[task.priority] }}</span></div>
          <h2>{{ task.title }}</h2>
          <p v-if="task.description">{{ task.description }}</p>
          <p v-if="task.minimumRequirement" class="task-minimum">最低完成标准：{{ task.minimumRequirement }}</p>
          <p v-if="task.plannedMinutes !== undefined || task.actualMinutes !== undefined" class="task-minutes">
            <span v-if="task.plannedMinutes !== undefined">计划 {{ task.plannedMinutes }} 分钟</span>
            <span v-if="task.actualMinutes !== undefined">实际 {{ task.actualMinutes }} 分钟</span>
          </p>
          <p v-if="task.note" class="task-note">备注：{{ task.note }}</p>
        </div>
        <div class="task-item-actions">
          <label class="task-status-label" :for="`status-${task.id}`">状态</label>
          <select :id="`status-${task.id}`" class="form-select task-status-select" :value="task.status" :disabled="busyId !== null" @change="changeStatus(task, $event)">
            <option v-for="status in taskStatuses" :key="status" :value="status">{{ statusNames[status] }}</option>
          </select>
          <div class="task-action-buttons">
            <button v-if="task.status !== 'completed'" class="task-action" type="button" :disabled="busyId !== null" :aria-label="`完成任务：${task.title}`" title="完成任务" @click="completeTask(task)"><Check :size="17" aria-hidden="true" /></button>
            <button class="task-action" type="button" :disabled="busyId !== null" :aria-label="`编辑任务：${task.title}`" title="编辑任务" @click="startEdit(task)"><Pencil :size="16" aria-hidden="true" /></button>
            <button class="task-action task-action--danger" type="button" :disabled="busyId !== null" :aria-label="`删除任务：${task.title}`" title="删除任务" @click="deleteTask(task)"><Trash2 :size="16" aria-hidden="true" /></button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
