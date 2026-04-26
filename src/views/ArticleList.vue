<template>
  <div class="article-list-page">
    <NavBar />

    <div class="article-list-container">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select
          v-model="filterParams.category"
          placeholder="选择分类"
          style="width: 200px; margin-right: 10px"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="category in categoryList"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
        <el-input
          v-model="filterParams.search"
          placeholder="搜索文章标题/内容"
          style="width: 300px; margin-right: 10px"
          @keyup.enter="getArticles"
        />
        <el-select
          v-model="filterParams.ordering"
          placeholder="排序方式"
          style="width: 150px; margin-right: 10px"
        >
          <el-option label="最新发布" value="-created_at" />
          <el-option label="最多浏览" value="-view_count" />
          <el-option label="最多点赞" value="-like_count" />
          <el-option label="最多收藏" value="-collect_count" />
        </el-select>
        <el-button type="primary" @click="getArticles">查询</el-button>
        <el-button type="success" @click="resetFilter">重置</el-button>
      </div>

      <!-- 文章列表 -->
      <el-card v-for="article in articleList" :key="article.id" class="article-card">
        <div class="article-header">
          <h3 @click="goToDetail(article.id)">{{ article.title }}</h3>
          <span class="article-category">{{
            article.category_name || article.category?.name || "未分类"
          }}</span>
        </div>
        <div class="article-meta">
          <span>作者：{{ article.user?.username }}</span>
          <span>发布时间：{{ article.created_at }}</span>
          <span>浏览：{{ article.view_count }}</span>
          <span>点赞：{{ article.like_count }}</span>
          <span>收藏：{{ article.collect_count }}</span>
        </div>
        <div class="article-actions">
          <el-button link @click="goToDetail(article.id)">查看详情</el-button>
          <el-button
            v-if="!article.is_liked"
            link
            icon="el-icon-heart"
            @click="handleLike(article.id)"
          >
            点赞({{ article.like_count }})
          </el-button>
          <el-button
            v-else
            link
            icon="el-icon-heart-filled"
            style="color: #f56c6c"
            @click="handleUnlike(article.id)"
          >
            取消点赞({{ article.like_count }})
          </el-button>
          <el-button
            v-if="!article.is_collected"
            link
            icon="el-icon-star-off"
            @click="handleCollect(article.id)"
          >
            收藏({{ article.collect_count || 0 }})
          </el-button>
          <el-button
            v-else
            link
            icon="el-icon-star-on"
            style="color: #e6a23c"
            @click="handleUncollect(article.id)"
          >
            取消收藏({{ article.collect_count || 0 }})
          </el-button>
        </div>
      </el-card>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="filterParams.page"
        :page-sizes="[10, 20, 50]"
        :page-size="filterParams.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        style="margin-top: 20px; text-align: center"
      >
      </el-pagination>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
// 导入所有需要的API方法（接口路径已在API文件中统一管理）
import {
  getArticleList,
  getCategoryList,
  likeArticle,
  unlikeArticle,
  collectArticle,
  uncollectArticle,
  checkArticleCollect,
  checkArticleLike,
} from "@/api/article";
// 导入Pinia store
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();

// 初始化 Pinia store
const authStore = useAuthStore();

// 响应式数据
const categoryList = ref([]);
const articleList = ref([]);
const totalCount = ref(0);
const filterParams = ref({
  category: "",
  search: "",
  ordering: "-created_at",
  page: 1,
  page_size: 10,
});

// 用于存储异步请求的取消令牌（优化性能）
const abortControllers = ref([]);

// 获取分类列表（完全使用导入的API方法）
const getCategories = async () => {
  // 创建取消令牌，防止重复请求
  const controller = new AbortController();
  abortControllers.value.push(controller);

  try {
    // 调用API文件中的getCategoryList方法（接口路径在API文件中定义）
    const res = await getCategoryList({ signal: controller.signal });
    if (res.code === 200) {
      // 兼容后端返回格式：数组或嵌套results
      categoryList.value = Array.isArray(res.data) ? res.data : res.data.results || [];
    }
  } catch (err) {
    // 忽略取消请求的错误
    if (err.name !== "AbortError") {
      ElMessage.error("获取分类列表失败");
      console.error("获取分类失败：", err);
    }
  }
};

// 获取文章列表（完全使用导入的API方法）
const getArticles = async () => {
  // 创建取消令牌
  const controller = new AbortController();
  abortControllers.value.push(controller);

  try {
    // 调用API文件中的getArticleList方法，传递筛选参数
    const res = await getArticleList(filterParams.value, { signal: controller.signal });
    if (res.code === 200) {
      articleList.value = res.data.results || [];
      totalCount.value = res.data.count || 0;

      // 检查登录状态，使用Pinia store
      let loginStatus = authStore.isLoggedIn;
      if (!loginStatus) {
        // 缓存可能过期，尝试刷新登录状态
        await authStore.getLoginState(true);
        loginStatus = authStore.isLoggedIn;
      }
      
      // 只有登录用户才检查收藏和点赞状态
      if (loginStatus) {
        // 批量检查收藏和点赞状态（优化：使用Promise.all，避免串行请求）
        const checkPromises = articleList.value.map(async (article) => {
          try {
            // 并行检查收藏和点赞状态
            const [collectRes, likeRes] = await Promise.all([
              checkArticleCollect(article.id),
              checkArticleLike(article.id)
            ]);
            article.is_collected = collectRes.code === 200 ? collectRes.data.is_collected : false;
            article.is_liked = likeRes.code === 200 ? likeRes.data.is_liked : false;
          } catch (err) {
            console.error(`检查文章${article.id}状态失败：`, err);
            article.is_collected = false;
            article.is_liked = false;
          }
        });
        await Promise.all(checkPromises);
      } else {
        // 未登录用户，默认所有文章都未收藏未点赞
        articleList.value.forEach((article) => {
          article.is_collected = false;
          article.is_liked = false;
        });
      }
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      ElMessage.error("获取文章列表失败");
      console.error("获取文章失败：", err);
    }
  }
};

// 重置筛选条件
const resetFilter = () => {
  filterParams.value = {
    category: "",
    search: "",
    ordering: "-created_at",
    page: 1,
    page_size: 10,
  };
  getArticles();
};

// 分页相关
const handleSizeChange = (val) => {
  filterParams.value.page_size = val;
  getArticles();
};
const handleCurrentChange = (val) => {
  filterParams.value.page = val;
  getArticles();
};

// 文章点赞（使用导入的likeArticle API方法）
const handleLike = async (id) => {
  try {
    const res = await likeArticle(id);
    if (res.code === 200) {
      ElMessage.success(res.msg || "点赞成功");
      // 更新列表中的点赞数和状态
      const article = articleList.value.find((item) => item.id === id);
      if (article) {
        article.like_count = res.data?.like_count || article.like_count + 1;
        article.is_liked = true;
      }
    } else {
      ElMessage.warning(res.msg || "点赞失败");
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || "点赞失败");
    console.error(`文章${id}点赞失败：`, err);
  }
};

// 取消点赞（使用导入的unlikeArticle API方法）
const handleUnlike = async (id) => {
  try {
    const res = await unlikeArticle(id);
    if (res.code === 200) {
      ElMessage.success(res.msg || "取消点赞成功");
      // 更新列表中的点赞数和状态
      const article = articleList.value.find((item) => item.id === id);
      if (article) {
        article.like_count = res.data?.like_count || Math.max(0, article.like_count - 1);
        article.is_liked = false;
      }
    } else {
      ElMessage.warning(res.msg || "取消点赞失败");
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || "取消点赞失败");
    console.error(`文章${id}取消点赞失败：`, err);
  }
};

// 收藏文章（使用导入的collectArticle API方法）
const handleCollect = async (id) => {
  try {
    const res = await collectArticle(id);
    if (res.code === 200) {
      ElMessage.success(res.msg || "收藏成功");
      // 更新列表中的收藏数和状态
      const article = articleList.value.find((item) => item.id === id);
      if (article) {
        article.collect_count = res.data?.collect_count || article.collect_count + 1;
        article.is_collected = true;
      }
    } else {
      ElMessage.warning(res.msg || "收藏失败");
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || "收藏失败");
    console.error(`文章${id}收藏失败：`, err);
  }
};

// 取消收藏（使用导入的uncollectArticle API方法）
const handleUncollect = async (id) => {
  try {
    const res = await uncollectArticle(id);
    if (res.code === 200) {
      ElMessage.success(res.msg || "取消收藏成功");
      // 更新列表中的收藏数和状态
      const article = articleList.value.find((item) => item.id === id);
      if (article) {
        article.collect_count = res.data?.collect_count || Math.max(0, article.collect_count - 1);
        article.is_collected = false;
      }
    } else {
      ElMessage.warning(res.msg || "取消收藏失败");
    }
  } catch (err) {
    ElMessage.error(err.response?.data?.msg || "取消收藏失败");
    console.error(`文章${id}取消收藏失败：`, err);
  }
};

// 跳转到文章详情
const goToDetail = (id) => {
  router.push(`/article/${id}`);
};

// 组件卸载时取消所有未完成的请求
onUnmounted(() => {
  abortControllers.value.forEach((controller) => controller.abort());
  abortControllers.value = [];
});

// 初始化
onMounted(() => {
  getCategories();

  // 从URL读取搜索参数
  const searchKeyword = route.query.search;
  if (searchKeyword) {
    // 自动填充搜索框
    filterParams.value.search = decodeURIComponent(searchKeyword);
  }

  // 执行搜索
  getArticles();
});
</script>

<style scoped>
.article-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.article-list-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  min-height: 400px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.article-card {
  margin-bottom: 15px;
  cursor: pointer;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.article-header h3 {
  margin: 0;
  color: #1989fa;
  cursor: pointer;
}

.article-header h3:hover {
  text-decoration: underline;
}

.article-category {
  background: #e8f4ff;
  color: #1989fa;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.article-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #909399;
}

.article-actions {
  display: flex;
  gap: 10px;
}

/* 暗黑模式下的样式 */
.dark .article-list-page {
  background-color: #121212;
}

.dark .filter-bar {
  background: #1e1e1e;
}
</style>
