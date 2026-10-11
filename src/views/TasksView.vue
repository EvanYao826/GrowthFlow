<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Check, ListTodo, Pencil, Plus, Trash2, X } from 'lucide-vue-next'
import BaseButton from '../components/ui/BaseButton.vue'
import TaskForm from '../components/tasks/TaskForm.vue'
import { taskService } from '../services/tasks'
import { taskStatuses, type PlanTask, type TaskDraft, type TaskStatus } from '../types/task'

const tasks = ref<PlanTask[]>([])
const loading = ref(true)
const loadFailed = ref(false)
const saving = ref(false)
const busyId = ref<string | null>(null)
const quickTitle = ref('')
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const formInitial = ref<TaskDraft>(emptyDraft())
const formKey = ref(0)
const formRef = ref<InstanceType<typeof TaskForm> | null>(null)
const dialogRef = ref<HTMLDialogElement | null>(null)
const returnFocusId = ref('create-details')
const inlineId = ref<string | null>(null)
const inlineDraft = ref<TaskDraft | null>(null)
const inlineOriginal = ref<TaskDraft | null>(null)
const inlineDiscardPrompt = ref(false)
const detailDiscardPrompt = ref(false)
const confirmingDeleteId = ref<string | null>(null)
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
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function emptyDraft(): TaskDraft {
  return {
    date: localDate(), title: '', description: '', category: 'other', priority: 'medium',
    minimumRequirement: '', plannedMinutes: undefined, actualMinutes: undefined, note: '',
  }
}

function draftFromTask(task: PlanTask): TaskDraft {
  return {
    date: task.date, title: task.title, description: task.description, category: task.category,
    priority: task.priority, minimumRequirement: task.minimumRequirement,
    plannedMinutes: task.plannedMinutes, actualMinutes: task.actualMinutes, note: task.note,
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

async function createQuickTask() {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  noticeMessage.value = ''
  try {
    await taskService.create({ ...emptyDraft(), title: quickTitle.value })
    quickTitle.value = ''
    if (await loadTasks()) noticeMessage.value = '任务已保存到本机。'
  } catch (error) {
    errorMessage.value = `保存失败，输入仍保留：${getError(error)}`
  } finally {
    saving.value = false
  }
}

function discardInlineIfAllowed(): boolean {
  if (!inlineId.value || !inlineDraft.value || !inlineOriginal.value) return true
  if (JSON.stringify(inlineDraft.value) !== JSON.stringify(inlineOriginal.value)) {
    inlineDiscardPrompt.value = true
    return false
  }
  inlineId.value = null
  inlineDraft.value = null
  inlineOriginal.value = null
  inlineDiscardPrompt.value = false
  return true
}

function forceDiscardInline() {
  const id = inlineId.value
  inlineId.value = null
  inlineDraft.value = null
  inlineOriginal.value = null
  inlineDiscardPrompt.value = false
  nextTick(() => document.getElementById(`edit-task-${id}`)?.focus())
}

function startInlineEdit(task: PlanTask) {
  if (!discardInlineIfAllowed()) return
  const draft = draftFromTask(task)
  inlineId.value = task.id
  inlineDraft.value = { ...draft }
  inlineOriginal.value = draft
  inlineDiscardPrompt.value = false
  errorMessage.value = ''
  nextTick(() => document.getElementById(`inline-title-${task.id}`)?.focus())
}

function cancelInline() {
  const id = inlineId.value
  if (!discardInlineIfAllowed()) return
  nextTick(() => document.getElementById(`edit-task-${id}`)?.focus())
}

async function saveInline(task: PlanTask) {
  if (!inlineDraft.value || busyId.value) return
  busyId.value = task.id
  inlineDiscardPrompt.value = false
  errorMessage.value = ''
  noticeMessage.value = ''
  try {
    await taskService.update(task.id, inlineDraft.value)
    inlineId.value = null
    inlineDraft.value = null
    inlineOriginal.value = null
    inlineDiscardPrompt.value = false
    if (await loadTasks()) noticeMessage.value = '任务修改已保存。'
    await nextTick()
    document.getElementById(`edit-task-${task.id}`)?.focus()
  } catch (error) {
    errorMessage.value = `保存失败，修改仍保留：${getError(error)}`
  } finally {
    busyId.value = null
  }
}

function openDetails(task: PlanTask | null) {
  if (!discardInlineIfAllowed()) return
  editingId.value = task?.id ?? null
  formInitial.value = task ? draftFromTask(task) : emptyDraft()
  formKey.value += 1
  detailDiscardPrompt.value = false
  returnFocusId.value = task ? `details-task-${task.id}` : 'create-details'
  errorMessage.value = ''
  noticeMessage.value = ''
  formOpen.value = true
}

function closeDetails() {
  if (saving.value) return
  if (formRef.value?.hasChanges) {
    detailDiscardPrompt.value = true
    return
  }
  formOpen.value = false
}

function forceCloseDetails() {
  detailDiscardPrompt.value = false
  formOpen.value = false
}

watch(formOpen, async (open) => {
  await nextTick()
  if (open) {
    dialogRef.value?.showModal()
    dialogRef.value?.querySelector<HTMLInputElement>('#task-title')?.focus()
  } else {
    document.getElementById(returnFocusId.value)?.focus()
  }
})

async function saveDetails(draft: TaskDraft) {
  saving.value = true
  detailDiscardPrompt.value = false
  errorMessage.value = ''
  try {
    if (editingId.value) await taskService.update(editingId.value, draft)
    else await taskService.create(draft)
    const message = editingId.value ? '任务已更新。' : '任务已创建。'
    if (await loadTasks()) noticeMessage.value = message
    detailDiscardPrompt.value = false
    formOpen.value = false
  } catch (error) {
    errorMessage.value = `保存失败，内容仍保留：${getError(error)}`
  } finally {
    saving.value = false
  }
}

async function changeStatus(task: PlanTask, event: Event) {
  const target = event.target
  if (!(target instanceof HTMLSelectElement)) return
  const next = target.value
  if (!taskStatuses.some((status) => status === next) || next === task.status) return
  busyId.value = task.id
  errorMessage.value = ''
  noticeMessage.value = ''
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
  noticeMessage.value = ''
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
  busyId.value = task.id
  errorMessage.value = ''
  noticeMessage.value = ''
  try {
    await taskService.remove(task.id)
    confirmingDeleteId.value = null
    if (await loadTasks()) noticeMessage.value = '任务已删除。'
  } catch (error) {
    errorMessage.value = `删除任务失败：${getError(error)}`
  } finally {
    busyId.value = null
  }
}

onMounted(loadTasks)

onBeforeRouteLeave(() => {
  const inlineChanged = inlineDraft.value && inlineOriginal.value
    && JSON.stringify(inlineDraft.value) !== JSON.stringify(inlineOriginal.value)
  if ((quickTitle.value.trim() || inlineChanged || formRef.value?.hasChanges)
    && !window.confirm('还有未保存的任务内容，确定离开吗？')) return false
})
</script>

<template>
  <div class="tasks-page">
    <header class="tasks-heading">
      <div>
        <p class="section-kicker">本地任务管理</p>
        <h1>所有任务</h1>
        <p>在这里管理不同日期的任务。数据只保存在当前浏览器中；备份与恢复将在后续阶段提供。</p>
      </div>
      <BaseButton id="create-details" variant="secondary" @click="openDetails(null)"><Plus :size="17" aria-hidden="true" /> 详细创建</BaseButton>
    </header>

    <form class="task-quick-form" @submit.prevent="createQuickTask">
      <label class="form-label" for="quick-task-title">今天想推进什么？</label>
      <div class="task-quick-row">
        <input id="quick-task-title" v-model="quickTitle" class="form-input" type="text" maxlength="120" required placeholder="输入任务名称，按回车保存到今天" />
        <BaseButton variant="primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '添加任务' }}</BaseButton>
      </div>
      <p>只填名称即可创建；日期、类别和其他细节可稍后补充。</p>
    </form>

    <p v-if="errorMessage" class="task-feedback task-feedback--error" role="alert">{{ errorMessage }}</p>
    <p v-if="noticeMessage" class="task-feedback task-feedback--success" role="status">{{ noticeMessage }}</p>

    <div v-if="loading" class="tasks-empty">正在读取本地任务…</div>
    <div v-else-if="loadFailed" class="tasks-empty">
      <h2>任务暂时无法读取</h2>
      <p>检查浏览器的存储权限或可用空间，然后重试。</p>
      <BaseButton variant="secondary" @click="loadTasks">重新读取</BaseButton>
    </div>
    <div v-else-if="tasks.length === 0" class="tasks-empty">
      <ListTodo :size="30" :stroke-width="1.5" aria-hidden="true" />
      <h2>还没有任务</h2>
      <p>在上方输入第一件想做的事。</p>
    </div>
    <div v-else class="task-list">
      <article v-for="task in tasks" :key="task.id" class="task-item">
        <div v-if="inlineId === task.id && inlineDraft" class="task-inline-editor">
          <div class="form-field"><label class="form-label" :for="`inline-title-${task.id}`">任务名称</label><input :id="`inline-title-${task.id}`" v-model="inlineDraft.title" class="form-input" maxlength="120" /></div>
          <div class="task-inline-secondary">
            <div class="form-field"><label class="form-label" :for="`inline-date-${task.id}`">日期</label><input :id="`inline-date-${task.id}`" v-model="inlineDraft.date" class="form-input" type="date" /></div>
            <div class="form-field"><label class="form-label" :for="`inline-category-${task.id}`">类别</label><select :id="`inline-category-${task.id}`" v-model="inlineDraft.category" class="form-select"><option value="work">工作</option><option value="study">学习</option><option value="exercise">运动</option><option value="creation">创作</option><option value="life">生活</option><option value="other">其他</option></select></div>
          </div>
          <div class="task-inline-actions"><BaseButton variant="secondary" @click="cancelInline">取消</BaseButton><BaseButton variant="primary" :disabled="busyId !== null" @click="saveInline(task)">保存修改</BaseButton></div>
          <div v-if="inlineDiscardPrompt" class="task-discard-prompt" role="alert"><span>修改尚未保存，确定放弃吗？</span><BaseButton variant="secondary" @click="inlineDiscardPrompt = false">继续编辑</BaseButton><BaseButton variant="ghost" @click="forceDiscardInline">放弃修改</BaseButton></div>
        </div>
        <div v-else class="task-item-main">
          <div class="task-item-meta"><time :datetime="task.date">{{ task.date }}</time><span>{{ categoryNames[task.category] }}</span><span>{{ priorityNames[task.priority] }}</span></div>
          <h2>{{ task.title }}</h2>
          <p v-if="task.description">{{ task.description }}</p>
          <p v-if="task.minimumRequirement" class="task-minimum">最低完成标准：{{ task.minimumRequirement }}</p>
          <p v-if="task.plannedMinutes !== undefined || task.actualMinutes !== undefined" class="task-minutes"><span v-if="task.plannedMinutes !== undefined">计划 {{ task.plannedMinutes }} 分钟</span><span v-if="task.actualMinutes !== undefined">实际 {{ task.actualMinutes }} 分钟</span></p>
          <p v-if="task.note" class="task-note">备注：{{ task.note }}</p>
        </div>
        <div class="task-item-actions">
          <label class="task-status-label" :for="`status-${task.id}`">状态</label>
          <select :id="`status-${task.id}`" class="form-select task-status-select" :value="task.status" :disabled="busyId !== null" @change="changeStatus(task, $event)"><option v-for="status in taskStatuses" :key="status" :value="status">{{ statusNames[status] }}</option></select>
          <div class="task-action-buttons">
            <button v-if="task.status !== 'completed'" class="task-action" type="button" :disabled="busyId !== null" :aria-label="`完成任务：${task.title}`" title="完成任务" @click="completeTask(task)"><Check :size="17" aria-hidden="true" /></button>
            <button :id="`edit-task-${task.id}`" class="task-action" type="button" :disabled="busyId !== null" :aria-label="`原地编辑任务：${task.title}`" title="原地编辑" @click="startInlineEdit(task)"><Pencil :size="16" aria-hidden="true" /></button>
            <button :id="`details-task-${task.id}`" class="task-action task-action--text" type="button" :disabled="busyId !== null" :aria-label="`编辑完整详情：${task.title}`" @click="openDetails(task)">详情</button>
            <button class="task-action task-action--danger" type="button" :disabled="busyId !== null" :aria-label="`删除任务：${task.title}`" title="删除任务" @click="confirmingDeleteId = task.id"><Trash2 :size="16" aria-hidden="true" /></button>
          </div>
        </div>
        <div v-if="confirmingDeleteId === task.id" class="task-delete-confirm">
          <span>删除“{{ task.title }}”？此操作无法撤销。</span>
          <BaseButton variant="secondary" @click="confirmingDeleteId = null">取消</BaseButton>
          <button class="task-delete-button" type="button" :disabled="busyId !== null" @click="deleteTask(task)">确认删除</button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <dialog v-if="formOpen" ref="dialogRef" class="task-dialog" @cancel.prevent="closeDetails">
        <div class="task-dialog-header"><span>{{ editingId ? '任务详情' : '详细创建任务' }}</span><button class="task-dialog-close" type="button" aria-label="关闭详情" @click="closeDetails"><X :size="20" aria-hidden="true" /></button></div>
        <p v-if="errorMessage" class="task-feedback task-feedback--error task-dialog-error" role="alert">{{ errorMessage }}</p>
        <div v-if="detailDiscardPrompt" class="task-discard-prompt task-dialog-prompt" role="alert"><span>内容尚未保存，确定关闭吗？</span><BaseButton variant="secondary" @click="detailDiscardPrompt = false">继续编辑</BaseButton><BaseButton variant="ghost" @click="forceCloseDetails">放弃修改</BaseButton></div>
        <TaskForm ref="formRef" :key="formKey" :initial="formInitial" :is-editing="editingId !== null" :saving="saving" @submit="saveDetails" @cancel="closeDetails" />
      </dialog>
    </Teleport>
  </div>
</template>
