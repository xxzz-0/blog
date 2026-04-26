<template>
  <div class="search-container" style="width: 1000px; margin: 50px auto;">
    <h2 style="text-align: center; margin-bottom: 30px;">
      搜索结果：{{ keyword }}
    </h2>

    <div v-loading="loading" element-loading-text="搜索中..." style="min-height: 400px;">
      <!-- 无结果 -->
      <div
        v-if="articleList.length === 0 && !loading"
        style="text-align: center; padding: 60px; color: #999; font-size: 16px;"
      >
        暂无相关文章
      </div>

      <!-- 结果列表 -->
      <div
        v-for="article in articleList"
        :key="article.id"
        style="border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 8px; cursor: pointer;"
        @click="goToArticleDetail(article.id)"
      >
        <h3 style="margin: 0 0 10px 0; color: #333;">{{ article.title }}</h3>

        <div style="font-size: 12px; color: #999; margin-bottom: 8px;">
          <span>分类：{{ article.category_name || '未分类' }}</span>
          <span style="margin-left: 15px;">作者：{{ article.nickname || '匿名' }}</span>
          <span style="margin-left: 15px;">时间：{{ formatTime(article.created_at) }}</span>
        </div>

        <div style="font-size: 14px; color: #666; line-height: 1.6;">
          {{ article.summary ? article.summary.replace(/<[^>]+>/g, "").substring(0, 120) + "..." : "暂无简介" }}
        </div>

        <div style="margin-top: 10px; font-size: 12px; color: #999;">
          <span>浏览：{{ article.view_count || 0 }}</span>
          <span style="margin-left: 15px;">点赞：{{ article.like_count || 0 }}</span>
          <span style="margin-left: 15px;">收藏：{{ article.collect_count || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { searchArticles } from '@/api/article'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const keyword = ref('')
const articleList = ref([])

// 时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 跳转文章详情
const goToArticleDetail = (id) => {
  router.push(`/article/${id}`)
}

// 执行搜索
const doSearch = async () => {
  const q = route.query.q
  if (!q) return

  keyword.value = q
  loading.value = true

  try {
    const res = await searchArticles(q)
    articleList.value = res.data.results || []
  } catch (err) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 只监听路由变化，不重复请求
watch(
  () => route.query,
  () => {
    doSearch()
  },
  { immediate: true }
)
</script>

<style scoped>
.search-container {
  padding: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
</style>
