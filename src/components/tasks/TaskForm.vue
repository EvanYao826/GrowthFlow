<script setup lang="ts">
import { computed, reactive } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import type { TaskDraft } from '../../types/task'

const props = defineProps<{
  initial: TaskDraft
  isEditing: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  submit: [draft: TaskDraft]
  cancel: []
}>()

const draft = reactive<TaskDraft>({ ...props.initial })
const hasChanges = computed(() => JSON.stringify(draft) !== JSON.stringify(props.initial))
defineExpose({ hasChanges })

function setMinutes(field: 'plannedMinutes' | 'actualMinutes', event: Event) {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    draft[field] = target.value === '' ? undefined : Number(target.value)
  }
}
</script>

<template>
  <form class="task-form" @submit.prevent="emit('submit', { ...draft })">
    <div class="task-form-heading">
      <h2>{{ isEditing ? '编辑任务' : '新建任务' }}</h2>
      <p>名称和日期为必填项，其余信息可以稍后补充。</p>
    </div>

    <div class="task-form-grid">
      <div class="form-field">
        <label class="form-label" for="task-date">日期 *</label>
        <input id="task-date" v-model="draft.date" class="form-input" type="date" required />
      </div>
      <div class="form-field task-field-wide">
        <label class="form-label" for="task-title">任务名称 *</label>
        <input id="task-title" v-model="draft.title" class="form-input" type="text" maxlength="120" required placeholder="例如：阅读 30 分钟" />
      </div>
      <div class="form-field">
        <label class="form-label" for="task-category">类别</label>
        <select id="task-category" v-model="draft.category" class="form-select">
          <option value="work">工作</option><option value="study">学习</option><option value="exercise">运动</option>
          <option value="creation">创作</option><option value="life">生活</option><option value="other">其他</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label" for="task-priority">优先级</label>
        <select id="task-priority" v-model="draft.priority" class="form-select">
          <option value="medium">普通</option><option value="high">高</option><option value="low">低</option>
        </select>
      </div>
      <div class="form-field">
        <label class="form-label" for="task-planned-minutes">计划时长（分钟）</label>
        <input id="task-planned-minutes" class="form-input" type="number" min="0" max="1440" step="1" :value="draft.plannedMinutes" @input="setMinutes('plannedMinutes', $event)" />
      </div>
      <div class="form-field">
        <label class="form-label" for="task-actual-minutes">实际时长（分钟）</label>
        <input id="task-actual-minutes" class="form-input" type="number" min="0" max="1440" step="1" :value="draft.actualMinutes" @input="setMinutes('actualMinutes', $event)" />
      </div>
      <div class="form-field task-field-full">
        <label class="form-label" for="task-description">描述</label>
        <textarea id="task-description" v-model="draft.description" class="form-textarea" maxlength="2000" rows="2" placeholder="补充任务内容"></textarea>
      </div>
      <div class="form-field task-field-full">
        <label class="form-label" for="task-minimum">最低完成标准</label>
        <input id="task-minimum" v-model="draft.minimumRequirement" class="form-input" type="text" maxlength="500" placeholder="例如：至少读 10 页" />
      </div>
      <div class="form-field task-field-full">
        <label class="form-label" for="task-note">备注</label>
        <textarea id="task-note" v-model="draft.note" class="form-textarea" maxlength="2000" rows="2" placeholder="记录与任务相关的想法"></textarea>
      </div>
    </div>

    <div class="task-form-actions">
      <BaseButton variant="secondary" :disabled="saving" @click="emit('cancel')">取消</BaseButton>
      <BaseButton variant="primary" type="submit" :disabled="saving">{{ saving ? '保存中…' : '保存任务' }}</BaseButton>
    </div>
  </form>
</template>
