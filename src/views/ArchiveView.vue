<template>
  <div class="archive-page">
    <NavBar />

    <div class="archive-container">
      <h1 class="archive-title">文章归档</h1>

      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <div v-else-if="error" class="error">
        <el-alert title="加载失败" type="error" :closable="false" show-icon />
        <el-button type="primary" @click="fetchArchive">重新加载</el-button>
      </div>

      <div v-else class="archive-content">
        <div v-for="yearItem in archiveData" :key="yearItem.year" class="year-section">
          <h2 class="year-title">{{ yearItem.year }}年</h2>
          <div class="months-list">
            <div
              v-for="monthItem in yearItem.months"
              :key="`${yearItem.year}-${monthItem.month}`"
              class="month-item"
            >
              <div class="month-header" @click="toggleMonth(monthItem)">
                <span class="month-name">{{ monthItem.month }}月</span>
                <span class="article-count">({{ monthItem.count }}篇)</span>
                <el-icon class="toggle-icon">
                  <ArrowDown v-if="!monthItem.expanded" />
                  <ArrowUp v-else />
                </el-icon>
              </div>
              <div v-if="monthItem.expanded" class="articles-list">
                <el-card v-for="article in monthItem.articles" :key="article.id" class="article-card">
                  <router-link :to="`/article/${article.id}`" class="article-title">
                    {{ article.title }}
                  </router-link>
                  <div class="article-meta">
                    <span class="publish-date">{{ article.created_at }}</span>
                    <span class="view-count">
                      <el-icon><View /></el-icon> {{ article.view_count }}
                    </span>
                    <span class="like-count">
                      <el-icon><Star /></el-icon> {{ article.like_count }}
                    </span>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </div>

        <div v-if="archiveData.length === 0" class="empty">
          <el-empty description="暂无文章" />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getArticleArchive } from "@/api/article";
import { Loading, ArrowDown, ArrowUp, View, Star } from "@element-plus/icons-vue";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";

const archiveData = ref([]);
const loading = ref(false);
const error = ref(false);

const fetchArchive = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await getArticleArchive();
    if (response.code === 200) {
      // 为每个月份添加展开状态
      archiveData.value = response.data.map((yearItem) => ({
        ...yearItem,
        months: yearItem.months.map((monthItem) => ({
          ...monthItem,
          expanded: false,
        })),
      }));
    } else {
      error.value = true;
    }
  } catch (err) {
    console.error("获取归档数据失败:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const toggleMonth = (monthItem) => {
  monthItem.expanded = !monthItem.expanded;
};

onMounted(() => {
  fetchArchive();
});
</script>

<style scoped>
.archive-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.archive-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  min-height: 400px;
}

.archive-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  font-size: 16px;
  color: #666;
}

.loading .el-icon {
  margin-right: 10px;
  font-size: 20px;
}

.error {
  text-align: center;
  padding: 100px 0;
}

.error .el-button {
  margin-top: 20px;
}

.year-section {
  margin-bottom: 30px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.year-title {
  font-size: 18px;
  font-weight: bold;
  padding: 15px 20px;
  background-color: #f5f7fa;
  margin: 0;
  color: #303133;
}

.months-list {
  background-color: #fff;
}

.month-item {
  border-top: 1px solid #e4e7ed;
}

.month-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.month-header:hover {
  background-color: #f5f7fa;
}

.month-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  flex: 1;
}

.article-count {
  font-size: 14px;
  color: #909399;
  margin-right: 10px;
}

.toggle-icon {
  font-size: 14px;
  color: #909399;
  transition: transform 0.3s;
}

.articles-list {
  padding: 0 20px 20px;
}

.article-card {
  margin-top: 15px;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.article-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-decoration: none;
  margin-bottom: 10px;
  display: block;
  transition: color 0.3s;
}

.article-title:hover {
  color: #409eff;
}

.article-meta {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #909399;
  margin-top: 10px;
}

.publish-date {
  margin-right: 20px;
}

.view-count,
.like-count {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.view-count .el-icon,
.like-count .el-icon {
  margin-right: 5px;
  font-size: 14px;
}

.empty {
  padding: 100px 0;
  text-align: center;
}

/* 暗黑模式下的样式 */
.dark .archive-page {
  background-color: #121212;
}

.dark .year-title {
  background-color: #1e1e1e;
  color: #e0e0e0;
}

.dark .months-list {
  background-color: #121212;
}

.dark .month-header:hover {
  background-color: #1e1e1e;
}

.dark .month-name {
  color: #e0e0e0;
}

.dark .article-title {
  color: #e0e0e0;
}

@media (max-width: 768px) {
  .archive-container {
    padding: 10px;
  }

  .year-title {
    font-size: 16px;
    padding: 12px 15px;
  }

  .month-header {
    padding: 10px 15px;
  }

  .month-name {
    font-size: 14px;
  }

  .articles-list {
    padding: 0 15px 15px;
  }

  .article-title {
    font-size: 14px;
  }
}
</style>
