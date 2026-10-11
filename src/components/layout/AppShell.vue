<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { LockKeyhole, Moon, Sun, UserRound } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'

const { mode, activeTheme, storageError } = useTheme()
const now = ref(new Date())
const dateLabel = computed(() => new Intl.DateTimeFormat('zh-CN', {
  month: 'long', day: 'numeric', weekday: 'short',
}).format(now.value))
const dateValue = computed(() => {
  const date = now.value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})
let dateTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => { dateTimer = setInterval(() => { now.value = new Date() }, 60_000) })
onUnmounted(() => { if (dateTimer !== undefined) clearInterval(dateTimer) })

const themeAction = computed(() => activeTheme.value === 'dark' ? '切换到浅色主题' : '切换到深色主题')
const upcomingPages = ['日历', '记录', '复盘']

function toggleTheme() {
  mode.value = activeTheme.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <header class="topbar sticky top-0 z-50 backdrop-blur-md">
      <div class="topbar-inner mx-auto w-full max-w-5xl px-6">
        <RouterLink class="brand" to="/" aria-label="GrowthFlow 首页">
          <span class="brand-mark" aria-hidden="true">G<span>.</span></span>
          <span class="brand-name">GrowthFlow</span>
        </RouterLink>

        <nav class="topbar-nav" aria-label="主导航">
          <RouterLink class="nav-tab" to="/" exact-active-class="nav-tab--active">今日</RouterLink>
          <RouterLink class="nav-tab" to="/tasks" active-class="nav-tab--active">任务</RouterLink>
          <span v-for="label in upcomingPages" :key="label" class="nav-tab nav-tab--upcoming" :aria-label="`${label}，即将上线`" title="即将上线">
            {{ label }}<LockKeyhole :size="10" aria-hidden="true" />
          </span>
        </nav>

        <div class="topbar-actions">
          <time class="topbar-date" :datetime="dateValue">{{ dateLabel }}</time>
          <button class="icon-button" type="button" :aria-label="themeAction" :title="themeAction" @click="toggleTheme">
            <Sun v-if="activeTheme === 'dark'" :size="18" :stroke-width="1.7" aria-hidden="true" />
            <Moon v-else :size="18" :stroke-width="1.7" aria-hidden="true" />
          </button>
          <span class="profile-avatar" role="img" aria-label="本地用户默认头像" title="本地用户">
            <UserRound :size="18" :stroke-width="1.7" aria-hidden="true" />
          </span>
        </div>
      </div>
      <p v-if="storageError" class="theme-error mx-auto max-w-5xl px-6" role="alert">无法保存主题偏好，刷新后可能恢复默认设置。</p>
    </header>

    <main id="main-content" class="workspace-main mx-auto w-full max-w-5xl px-6" tabindex="-1">
      <slot />
    </main>
  </div>
</template>
