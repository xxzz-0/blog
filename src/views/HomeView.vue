<template>
  <div class="home-page">
    <NavBar />

    <!-- 文章列表 + 分页 -->
    <div class="home-content">
      <div class="home-header">
        <h1 class="home-title">{{ siteSettings.site_name }}</h1>
        <p class="home-subtitle">{{ siteSettings.site_subtitle }}</p>
        <p class="home-description">{{ siteSettings.site_description }}</p>
      </div>

      <div class="article-container" v-loading="loading" element-loading-text="加载中...">
        <!-- 空数据 -->
        <div v-if="articleList.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无文章" />
        </div>

        <!-- 文章列表 -->
        <ArticleCard v-for="article in articleList" :key="article.id" :article="article" />

        <!-- 分页组件 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="total"
            background
            layout="prev, pager, next, total, jumper"
            @current-change="loadArticleList"
            class="pagination"
            style="display: flex; align-items: center; justify-content: center; gap: 10px"
          />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import NavBar from "@/components/NavBar.vue";
import ArticleCard from "@/components/ArticleCard.vue";
import Footer from "@/components/Footer.vue";
import { getArticleList } from "@/api/article";
import { useSettingsStore } from "@/stores/settings";

// 最新文章（带分页）
const articleList = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 初始化 Pinia store
const settingsStore = useSettingsStore();

// 计算属性
const siteSettings = computed(() => settingsStore.settings);

// 加载网站设置
const loadSiteSettings = async () => {
  await settingsStore.loadSettings();
};

// 加载首页文章列表（分页）
const loadArticleList = async () => {
  try {
    loading.value = true;
    const res = await getArticleList({
      page: page.value,
      page_size: pageSize.value,
      ordering: "-created_at",
    });
    articleList.value = res.data?.results || [];
    total.value = res.data?.count || 0;
  } catch (err) {
    ElMessage.error("加载文章失败");
  } finally {
    loading.value = false;
  }
};

// 页面加载
onMounted(() => {
  loadSiteSettings();
  loadArticleList();
});
</script>

<style scoped>
/* 首页样式 */
.home-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 首页内容 */
.home-content {
  width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 首页头部 */
.home-header {
  margin-bottom: 60px;
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.home-title {
  font-size: 40px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  transition: color 0.3s ease;
  letter-spacing: -0.5px;
}

.home-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  font-weight: 500;
}

.home-description {
  font-size: 16px;
  color: #777;
  margin-bottom: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.dark .home-header {
  background: linear-gradient(135deg, #1e2024 0%, #2a2d32 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark .home-title {
  color: #e0e0e0;
}

.dark .home-subtitle {
  color: #b0b0b0;
}

.dark .home-description {
  color: #909090;
}

/* 文章容器 */
.article-container {
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 0;
}

/* 分页容器 */
.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 暗黑模式下的首页样式 */
.dark .home-page {
  background-color: #121212;
}

.dark .home-content {
  background-color: #121212;
}

.dark .home-title {
  color: #e0e0e0;
}

.dark .home-subtitle {
  color: #999;
}

.dark .el-empty__description {
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .home-content {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .home-content {
    padding: 20px 16px;
  }

  .home-header {
    margin-bottom: 30px;
  }

  .home-title {
    font-size: 24px;
  }

  .home-subtitle {
    font-size: 14px;
  }

  .empty-state {
    padding: 60px 0;
  }

  .pagination-container {
    margin-top: 30px;
  }
}
</style>
