<template>
  <el-header class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <el-link href="/" class="navbar-logo">{{ siteSettings.site_name }}</el-link>
        <el-text class="navbar-subtitle">{{ siteSettings.site_subtitle }}</el-text>
      </div>

      <!-- 导航链接 -->
      <div class="navbar-links">
        <el-link href="/" class="navbar-link">首页</el-link>
        <el-link href="/article/list" class="navbar-link">文章列表</el-link>
        <el-link href="/archive" class="navbar-link">文章归档</el-link>
      </div>

      <!-- 搜索框 -->
      <div class="navbar-search-wrapper">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文章..."
          class="navbar-search"
          name="navbar-search-keyword"
          autocomplete="off"
          @keyup.enter="goSearch"
          clearable
        >
          <template #suffix>
            <el-button type="primary" @click="goSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="navbar-user">
        <!-- 主题切换按钮 -->
        <div class="theme-toggle" @click="toggleTheme">
          <el-icon :size="20">
            <component :is="currentTheme === 'light' ? Moon : Sunny" />
          </el-icon>
        </div>

        <!-- 未登录：显示登录/注册 -->
        <template v-if="!isLogin">
          <el-button link class="navbar-btn" @click="goToLogin">登录</el-button>
          <el-button type="primary" class="navbar-btn" @click="goToRegister">注册</el-button>
        </template>

        <!-- 已登录：显示用户名/登出 -->
        <template v-else>
          <el-badge
            :value="unreadCount"
            :hidden="unreadCount === 0"
            :max="99"
            style="cursor: pointer"
            @click="goToNotification"
          >
            <el-icon :size="22" style="margin-right: 8px"><Bell /></el-icon>
          </el-badge>
          <el-avatar :size="32" :src="userInfo.avatar || ''" class="navbar-avatar" />
          <el-text class="navbar-username">{{
            userInfo.nickname || userInfo.phone || "用户"
          }}</el-text>
          <el-button link class="navbar-btn" @click="goToProfile">个人中心</el-button>
          <el-button link class="navbar-btn logout-btn" @click="handleLogout">退出登录</el-button>
        </template>
      </div>
    </div>
  </el-header>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElIcon } from "element-plus";
import { Sunny, Moon, Bell } from "@element-plus/icons-vue";
import { getTheme, toggleTheme as toggleThemeUtil } from "@/utils/theme";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useSettingsStore } from "@/stores/settings";

const router = useRouter();
const route = useRoute();
const currentTheme = ref("light");

// 初始化 Pinia store
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const settingsStore = useSettingsStore();

// 计算属性
const isLogin = computed(() => authStore.isLoggedIn);
const userInfo = computed(() => authStore.currentUser);
const unreadCount = computed(() => notificationStore.unreadNotificationCount);
const siteSettings = computed(() => settingsStore.settings);

// 搜索
const searchKeyword = ref("");
const goSearch = () => {
  if (!searchKeyword.value.trim()) return;
  // 跳转到搜索页面，并带上搜索关键词
  router.push(`/search?q=${encodeURIComponent(searchKeyword.value.trim())}`);
};

// 跳转
const goToLogin = () => router.push("/login");
const goToRegister = () => router.push("/register");
const goToProfile = () => router.push("/profile");
const goToNotification = () => router.push("/notification");

// 加载网站设置
const loadSiteSettings = async () => {
  await settingsStore.loadSettings();
};

// 加载登录态
const loadLoginState = async (forceRefresh = true) => {
  await authStore.getLoginState(forceRefresh);
};

// 退出登录
const handleLogout = async () => {
  await authStore.logout();
  notificationStore.resetUnreadCount();
  // 刷新页面，确保数据更新
  window.location.reload();
};

// 加载未读通知数量
const loadUnreadNotificationCount = async () => {
  if (authStore.isLoggedIn) {
    await notificationStore.loadUnreadCount();
  } else {
    notificationStore.resetUnreadCount();
  }
};

// 主题切换
const toggleTheme = () => {
  currentTheme.value = toggleThemeUtil();
};

onMounted(() => {
  loadSiteSettings();
  loadLoginState(true);
  currentTheme.value = getTheme();
  loadUnreadNotificationCount();
});

watch(
  () => route.fullPath,
  () => {
    setTimeout(() => {
      // 移除 loadLoginState(true) 调用，避免重复发起 check-login 请求
      loadUnreadNotificationCount();
    }, 50);
  },
);
</script>

<style scoped>
/* 导航栏样式 */
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0;
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 导航栏容器 */
.navbar-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 20px;
}

/* 左侧区域 - 品牌信息 */
.navbar-brand {
  flex-shrink: 0;
  margin-right: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 0;
}

/* 导航链接 */
.navbar-links {
  display: flex;
  gap: 24px;
  margin-right: 40px;
  align-items: center;
}

/* 网站副标题 */
.navbar-subtitle {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* 暗黑模式下的网站副标题 */
.dark .navbar-subtitle {
  color: #999;
}

/* 导航链接样式优化 */
.navbar-link {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  position: relative;
  padding: 8px 0;
}

.navbar-link:hover {
  color: #1976d2 !important;
}

.navbar-link::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #1976d2;
  transition: width 0.3s ease;
}

.navbar-link:hover::after {
  width: 100%;
}

/* 暗黑模式下的导航链接 */
.dark .navbar-link {
  color: #e0e0e0 !important;
}

.dark .navbar-link:hover {
  color: #64b5f6 !important;
}

.dark .navbar-link::after {
  background-color: #64b5f6;
}

/* 中间区域 - 搜索框 */
.navbar-search-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}

/* 右侧区域 - 固定宽度 */
.navbar-user {
  flex-shrink: 0;
  width: 280px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

/* 主题切换按钮样式 */
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 16px;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

/* 博客系统 logo */
.navbar-logo {
  font-size: 24px;
  font-weight: bold;
  color: #1976d2 !important;
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-logo:hover {
  color: #1565c0 !important;
}

/* 搜索框 */
.navbar-search {
  width: 400px;
  transition: width 0.3s ease;
}

.navbar-search:hover {
  width: 450px;
}

/* 用户区域 - 已在上面定义 */
/* .navbar-user 样式已移至上方统一定义 */

/* 头像 */
.navbar-avatar {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.navbar-avatar:hover {
  transform: scale(1.1);
}

/* 用户名 */
.navbar-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-right: 8px;
}

/* 按钮 */
.navbar-btn {
  font-size: 14px;
  padding: 6px 12px;
  transition: all 0.3s ease;
}

.navbar-btn:hover {
  color: #1976d2 !important;
}

/* 退出登录按钮 */
.logout-btn {
  color: #f56c6c !important;
}

.logout-btn:hover {
  color: #f78989 !important;
}

/* 暗黑模式下的导航栏样式 */
.dark .navbar {
  background-color: #1e1e1e;
  border-bottom: 1px solid #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dark .navbar-logo {
  color: #64b5f6 !important;
}

.dark .navbar-logo:hover {
  color: #90caf9 !important;
}

.dark .navbar-username {
  color: #e0e0e0;
}

.dark .navbar-btn {
  color: #e0e0e0 !important;
}

.dark .navbar-btn:hover {
  color: #64b5f6 !important;
}

.dark .logout-btn {
  color: #f78989 !important;
}

.dark .logout-btn:hover {
  color: #ffb3b3 !important;
}

/* 暗黑模式下的导航链接 */
.dark .navbar-link {
  color: #e0e0e0 !important;
}

.dark .navbar-link:hover {
  color: #64b5f6 !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .navbar-search {
    width: 300px;
  }

  .navbar-search:hover {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .navbar-search {
    width: 200px;
  }

  .navbar-search:hover {
    width: 250px;
  }

  .navbar-username {
    display: none;
  }
}
</style>
