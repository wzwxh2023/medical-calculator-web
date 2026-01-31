<script setup lang="ts">
import { NConfigProvider, NGlobalStyle, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import { computed } from 'vue'
import { useSettingsStore } from './stores/settings'

const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.settings.theme === 'dark' ? darkTheme : null)
const themeOverrides = {
  common: {
    primaryColor: '#1890ff',
    primaryColorHover: '#40a9ff',
    primaryColorPressed: '#096dd9',
    primaryColorSuppl: '#1890ff',
    borderRadius: '8px'
  }
}
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NMessageProvider>
      <NDialogProvider>
        <NNotificationProvider>
          <div id="app">
            <RouterView />
          </div>
        </NNotificationProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 移动端适配 */
@media (max-width: 768px) {
  #app {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
