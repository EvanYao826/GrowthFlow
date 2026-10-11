import { computed, ref, watch } from 'vue'

export type ThemeMode = 'system' | 'light' | 'dark'

const storageKey = 'growthflow-theme'
const mode = ref<ThemeMode>('system')
const systemDark = ref(false)
const storageError = ref(false)
let initialized = false

const activeTheme = computed(() => mode.value === 'system'
  ? (systemDark.value ? 'dark' : 'light')
  : mode.value)

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  try {
    const saved = window.localStorage.getItem(storageKey)
    if (isThemeMode(saved)) mode.value = saved
  } catch {
    storageError.value = true
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = media.matches
  media.addEventListener('change', (event) => { systemDark.value = event.matches })

  watch(activeTheme, (theme) => {
    document.documentElement.dataset.theme = theme
  }, { immediate: true })

  watch(mode, (value) => {
    try {
      window.localStorage.setItem(storageKey, value)
      storageError.value = false
    } catch {
      storageError.value = true
    }
  })
}

export function useTheme() {
  initialize()
  return { mode, activeTheme, storageError }
}
