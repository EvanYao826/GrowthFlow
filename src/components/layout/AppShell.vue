<script setup lang="ts">
import { computed } from 'vue'
import { House, Moon, Sun } from 'lucide-vue-next'
import { useTheme } from '../../composables/useTheme'

const { mode, activeTheme } = useTheme()
const dateLabel = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}).format(new Date())

const themeAction = computed(() => activeTheme.value === 'dark' ? '切换到浅色主题' : '切换到深色主题')

function toggleTheme() {
  mode.value = activeTheme.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar" aria-label="主导航">
      <RouterLink class="brand" to="/" aria-label="GrowthFlow 首页">
        <span class="brand-mark" aria-hidden="true">G<span>.</span></span>
        <span class="brand-name">GrowthFlow</span>
      </RouterLink>

      <div class="sidebar-nav-label">工作台</div>
      <nav class="sidebar-nav">
        <RouterLink class="nav-link" to="/" active-class="nav-link--active">
          <House :size="18" :stroke-width="1.8" aria-hidden="true" />
          <span>首页</span>
        </RouterLink>
      </nav>

      <div class="sidebar-note">
        <span class="sidebar-note-dot" aria-hidden="true"></span>
        <span>一步一步，持续成长</span>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <RouterLink class="mobile-brand" to="/" aria-label="GrowthFlow 首页">
          <span class="brand-mark" aria-hidden="true">G<span>.</span></span>
          <span class="brand-name">GrowthFlow</span>
        </RouterLink>
        <div class="topbar-location">工作台 <span>/</span> 首页</div>
        <div class="topbar-actions">
          <span class="topbar-date">{{ dateLabel }}</span>
          <button class="icon-button" type="button" :aria-label="themeAction" :title="themeAction" @click="toggleTheme">
            <Sun v-if="activeTheme === 'dark'" :size="19" aria-hidden="true" />
            <Moon v-else :size="19" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main class="workspace-main" id="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>
