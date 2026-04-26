import { createSSRApp } from "vue";
import ElementPlus from "element-plus"; // 可选，UI组件
import "element-plus/dist/index.css"; // 可选，UI样式
import App from "./App.vue";
import { createRouterInstance } from "./router";
import { createPinia } from "pinia";
import { initTheme } from "./utils/theme";
import SettingsService from "./services/SettingsService";

// 创建Vue实例（单实例，符合前后端分离场景）
const app = createSSRApp(App);

// 创建并注册Pinia
const pinia = createPinia();

// 创建路由实例
const router = createRouterInstance();

// 全局注册插件
app.use(router);
app.use(pinia);
app.use(ElementPlus); // 可选，注册element-plus

// 全局错误处理
app.config.errorHandler = (err) => {
  console.error("全局错误：", err);
};

// 初始化主题
initTheme();

// 初始化设置
SettingsService.getSettings();

// 挂载到index.html的#app
app.mount("#app");

export { createRouterInstance };