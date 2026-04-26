import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createRouterInstance } from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import { useSettingsStore } from './stores/settings'
import { getArticleList } from './api/article'

async function render(url) {
  const app = createSSRApp(App)
  const router = createRouterInstance()
  const pinia = createPinia()

  app.use(router)
  app.use(pinia)
  app.use(ElementPlus)

  await router.push(url)
  await router.isReady()

  // 预取数据
  if (router.currentRoute.value.path === '/') {
    const settingsStore = useSettingsStore()
    await settingsStore.loadSettings()
    
    try {
      const res = await getArticleList({
        page: 1,
        page_size: 10,
        ordering: "-created_at",
      })
    } catch (err) {
      console.error('加载文章失败:', err)
    }
  }

  const html = await renderToString(app)
  return `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>博客平台</title>
  </head>
  <body>
    <div id="app">${html}</div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
  `
}

export { render }