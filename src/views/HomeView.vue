<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Compass, Layers3, LockKeyhole, NotebookPen } from 'lucide-vue-next'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseSelect from '../components/ui/BaseSelect.vue'
import { useTheme, type ThemeMode } from '../composables/useTheme'

const { mode, storageError } = useTheme()
const themeOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
] as const

const selectedTheme = computed<string>({
  get: () => mode.value,
  set: (value) => {
    if (themeOptions.some((option) => option.value === value)) mode.value = value as ThemeMode
  },
})

function resetTheme() {
  mode.value = 'system'
}
</script>

<template>
  <div class="home-page">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <p class="eyebrow"><span class="eyebrow-line"></span> 你的成长工作台</p>
        <h1 id="hero-title">让每一步，<br /><em>都算数。</em></h1>
        <p class="hero-description">为重要的事留出空间，为每天的行动留下痕迹。<br class="hero-copy-break" />按自己的节奏，慢慢积累。</p>
        <div class="hero-actions">
          <RouterLink class="hero-task-link" to="/tasks">整理我的任务 <ArrowUpRight :size="16" aria-hidden="true" /></RouterLink>
          <span class="hero-status"><span class="status-dot" aria-hidden="true"></span> 本地优先 · 无需账号</span>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="art-orbit art-orbit--outer"></div>
        <div class="art-orbit art-orbit--inner"></div>
        <div class="art-center"><span>G<span class="art-dot">.</span></span></div>
        <span class="art-orbit-dot art-orbit-dot--one"></span>
        <span class="art-orbit-dot art-orbit-dot--two"></span>
      </div>
    </section>

    <section class="section-block" aria-labelledby="approach-title">
      <div class="section-heading">
        <div>
          <p class="section-kicker">成长的节奏</p>
          <h2 id="approach-title">从想法到积累</h2>
        </div>
        <span class="section-caption">接下来，更多成长方式</span>
      </div>
      <div class="feature-grid">
        <BaseCard class="feature-card">
          <div class="feature-top"><span class="feature-icon feature-icon--green"><Compass :size="22" :stroke-width="1.7" aria-hidden="true" /></span><h3>制定计划</h3><span class="feature-number">01</span></div>
          <p>把重要的事整理成清晰、可调整的每日计划。</p>
          <div class="feature-phase"><span class="feature-availability"><LockKeyhole :size="13" aria-hidden="true" /> 即将上线，敬请期待</span></div>
        </BaseCard>
        <BaseCard class="feature-card">
          <div class="feature-top"><span class="feature-icon feature-icon--peach"><NotebookPen :size="22" :stroke-width="1.7" aria-hidden="true" /></span><h3>记录行动</h3><span class="feature-number">02</span></div>
          <p>轻松记下实际进展，让每天的努力看得见。</p>
          <div class="feature-phase"><span class="feature-availability"><LockKeyhole :size="13" aria-hidden="true" /> 即将上线，敬请期待</span></div>
        </BaseCard>
        <BaseCard class="feature-card">
          <div class="feature-top"><span class="feature-icon feature-icon--blue"><Layers3 :size="22" :stroke-width="1.7" aria-hidden="true" /></span><h3>定期回看</h3><span class="feature-number">03</span></div>
          <p>看见积累的轨迹，再决定下一步怎么走。</p>
          <div class="feature-phase"><span class="feature-availability"><LockKeyhole :size="13" aria-hidden="true" /> 即将上线，敬请期待</span></div>
        </BaseCard>
      </div>
    </section>

    <section class="section-block preferences" aria-labelledby="preferences-title">
      <div class="section-heading">
        <div>
          <p class="section-kicker">界面偏好</p>
          <h2 id="preferences-title">调整你的阅读环境</h2>
        </div>
      </div>
      <BaseCard class="preferences-card">
        <div class="preferences-copy">
          <h3>外观主题</h3>
          <p>选择舒适的颜色。设置会保存在当前浏览器中。</p>
          <p v-if="storageError" class="storage-error" role="alert">无法保存主题偏好；刷新页面后可能恢复默认设置。</p>
        </div>
        <div class="preferences-controls">
          <BaseSelect id="theme-mode" v-model="selectedTheme" label="主题模式" :options="themeOptions" />
          <BaseButton variant="ghost" :disabled="mode === 'system'" @click="resetTheme">恢复跟随系统</BaseButton>
        </div>
      </BaseCard>
    </section>
  </div>
</template>
