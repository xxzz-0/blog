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

onMounted(() => {
  initTheme();
});
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 暗黑模式样式 */
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

/* 暗黑模式下的链接样式 */
.dark a {
  color: #64b5f6;
}

.dark a:hover {
  color: #90caf9;
}

/* 暗黑模式下的卡片样式 */
.dark .el-card {
  background-color: #1e1e1e;
  border-color: #333;
  color: #e0e0e0;
}

/* 暗黑模式下的输入框样式 */
.dark .el-input__inner {
  background-color: #ffffff;
  border-color: #e0e0e0;
  color: #333333;
}

.dark .el-input__inner:focus {
  border-color: #64b5f6;
}

/* 暗黑模式下的分页组件样式 */
.dark .el-pagination__jump {
  color: #e0e0e0;
}

.dark .el-pagination__editor {
  background-color: #ffffff;
  border-color: #e0e0e0;
  color: #333333;
}

.dark .el-pagination__editor:focus {
  border-color: #64b5f6;
}

/* 暗黑模式下的按钮样式 */
.dark .el-button--primary {
  background-color: #1976d2;
  border-color: #1976d2;
}

.dark .el-button--primary:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}

.dark .el-button--text {
  color: #64b5f6;
}

.dark .el-button--text:hover {
  color: #90caf9;
}

/* 暗黑模式下的表单标签样式 */
.dark .el-form-item__label {
  color: #e0e0e0;
}

/* 暗黑模式下的分割线样式 */
.dark .el-divider {
  background-color: #333;
}

/* 暗黑模式下的消息提示样式 */
.dark .el-message {
  background-color: #2d2d2d;
  border-color: #444;
  color: #e0e0e0;
}

/* 暗黑模式下的对话框样式 */
.dark .el-dialog {
  background-color: #1e1e1e;
  border-color: #333;
}

.dark .el-dialog__title {
  color: #e0e0e0;
}

/* 暗黑模式下的下拉菜单样式 */
.dark .el-dropdown-menu {
  background-color: #1e1e1e;
  border-color: #333;
}

.dark .el-dropdown-menu__item {
  color: #e0e0e0;
}

.dark .el-dropdown-menu__item:hover {
  background-color: #2d2d2d;
}

/* 暗黑模式下的标签样式 */
.dark .el-tag {
  background-color: #2d2d2d;
  border-color: #444;
  color: #e0e0e0;
}

/* 页面基础样式 */
#app {
  min-height: 100vh;
}
</style>
