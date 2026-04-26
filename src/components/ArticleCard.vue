<template>
  <div class="article-card">
    <h3 class="article-title">
      <router-link :to="`/article/${article.id}`">{{ article.title }}</router-link>
    </h3>
    <div class="article-meta">
      <span>作者：{{ article.nickname || "匿名" }}</span>
      <span>分类：{{ article.category_name || "未分类" }}</span>
      <span>发布时间：{{ article.created_at }}</span>
    </div>
    <div class="article-content">
      {{ stripHtml(article.summary) }}
    </div>
    <div class="article-stats">
      <span>点赞：{{ article.like_count || 0 }}</span>
      <span>收藏：{{ article.collect_count || 0 }}</span>
      <span>阅读：{{ article.view_count || 0 }}</span>
    </div>
    <div class="article-actions">
      <!-- 核心修改1：添加ID非空判断 + 手动跳转（替代router-link） -->
      <el-button type="text" @click="handleDetail" :disabled="!article.id"> 查看详情 </el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

// 去除HTML标签，只显示纯文本
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
};

const router = useRouter();
const props = defineProps({
  article: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

// 核心修改2：手动跳转方法（带调试+异常处理）
const handleDetail = () => {
  // 1. 校验ID有效性
  if (!props.article.id) {
    ElMessage.error("文章ID不存在，无法跳转");
    return;
  }
  // 2. 打印调试信息
  console.log("跳转详情页，ID：", props.article.id);
  console.log("跳转路径：", `/article/${props.article.id}`);
  // 3. 手动跳转（替代router-link，更稳定）
  try {
    router.push({
      name: "articleDetail", // 用路由名称跳转（比路径更可靠）
      params: { id: props.article.id },
    });
  } catch (err) {
    console.error("跳转失败：", err);
    ElMessage.error("跳转失败，请刷新页面重试");
  }
};
</script>

<style scoped>
/* 文章卡片样式 */
.article-card {
  padding: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  margin-bottom: 20px;
  background-color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #e0e0e0;
}

/* 文章标题 */
.article-title {
  margin-bottom: 16px;
}

.article-title a {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  transition: color 0.3s ease;
  display: block;
  line-height: 1.4;
}

.article-title a:hover {
  color: #1976d2;
}

/* 文章元信息 */
.article-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 文章内容摘要 */
.article-content {
  line-height: 1.6;
  color: #444;
  font-size: 14px;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 文章统计信息 */
.article-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #999;
  margin-bottom: 16px;
}

.article-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.3s ease;
}

.article-stats span:hover {
  color: #1976d2;
}

/* 文章操作按钮 */
.article-actions {
  pointer-events: auto !important;
  z-index: 999 !important;
  margin-top: 16px;
}

.article-actions button {
  cursor: pointer !important;
  color: #1976d2 !important;
  font-size: 14px;
  padding: 6px 12px;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.article-actions button:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

/* 暗黑模式下的文章卡片样式 */
.dark .article-card {
  background-color: #1e1e1e;
  border-color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .article-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border-color: #444;
}

.dark .article-title a {
  color: #e0e0e0;
}

.dark .article-title a:hover {
  color: #64b5f6;
}

.dark .article-meta {
  color: #999;
  border-bottom-color: #333;
}

.dark .article-content {
  color: #c0c0c0;
}

.dark .article-stats {
  color: #777;
}

.dark .article-stats span:hover {
  color: #64b5f6;
}

.dark .article-actions button {
  color: #64b5f6 !important;
}

.dark .article-actions button:hover {
  background-color: rgba(100, 181, 246, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-card {
    padding: 16px;
  }

  .article-title a {
    font-size: 16px;
  }

  .article-meta {
    gap: 12px;
    font-size: 12px;
  }

  .article-stats {
    gap: 12px;
    font-size: 12px;
  }
}
</style>
