<template>
  <div id="app">
    <RouterView />
    <!-- 路由占位符，渲染对应页面 -->
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import { initTheme } from "./utils/theme";
import { useSettingsStore } from "@/stores/settings";

onMounted(async () => {
  initTheme();
  // 全局初始化：加载网站设置（仅此一处）
  await useSettingsStore().loadSettings();
});
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 暗黑模式 - Element Plus 组件样式由 element-plus/theme-chalk/dark/css-vars.css 处理 */
.dark {
  background-color: #121212;
  color: #e0e0e0;
}

.dark #app {
  background-color: #121212;
}

.dark .theme-toggle {
  background-color: #2d2d2d;
  color: #e0e0e0;
}

.dark a {
  color: #64b5f6;
}

.dark a:hover {
  color: #90caf9;
}

#app {
  min-height: 100vh;
}
</style>
