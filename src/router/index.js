import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import { ElMessage } from "element-plus";
// 导入封装的登录态工具
import { getLoginState } from "@/utils/auth";

// 路由规则
const routes = [
  { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
  { path: "/login", name: "login", component: () => import("@/views/LoginView.vue") },
  { path: "/register", name: "register", component: () => import("@/views/RegisterView.vue") },
  { path: "/reset-password", name: "resetPassword", component: () => import("@/views/ResetPassword.vue") },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  {
    path: "/profile/verify-email",
    redirect: (to) => {
      // 保留查询参数
      return { path: "/profile", query: to.query };
    },
  },
  {
    path: "/publish-article",
    name: "PublishArticle",
    component: () => import("@/views/PublishArticle.vue"),
    meta: { requiresAuth: true }, // 必须登录才能发布
  },
  {
    path: "/edit-article/:id",
    name: "EditArticle",
    component: () => import("@/views/EditArticle.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("@/views/SearchPage.vue"),
  },
  {
    path: "/archive",
    name: "Archive",
    component: () => import("@/views/ArchiveView.vue"),
  },
  { path: "/article/list", name: "articleList", component: () => import("@/views/ArticleList.vue") },
  { path: "/article/:id", name: "articleDetail", component: () => import("@/views/ArticleDetail.vue") },

  {
    path: "/file-manager",
    name: "fileManager",
    component: () => import("@/views/FileManager.vue"),
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("@/views/AdminDashboard.vue"),
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  {
    path: "/notification",
    name: "notification",
    component: () => import("@/views/NotificationCenter.vue"),
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  // 404兜底路由
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

// 创建路由实例
export function createRouterInstance() {
  return createRouter({
    history:
      typeof window !== "undefined"
        ? createWebHistory(import.meta.env.BASE_URL)
        : createMemoryHistory(),
    routes,
  });
}

const router = createRouterInstance();

// 路由守卫（使用封装的登录态）
router.beforeEach(async (to) => {
  // 白名单放行：首页、登录、注册、找回密码、所有文章页面
  const whiteList = ["/", "/login", "/register", "/reset-password"];
  if (whiteList.includes(to.path) || to.path.startsWith("/article/")) {
    return true;
  }

  // 需要登录的页面，验证登录态（强制刷新缓存）
  if (to.meta.requiresAuth) {
    const { isLogin, userInfo } = await getLoginState(true);
    if (!isLogin) {
      ElMessage.warning("请先登录后再访问");
      return {
        path: "/login",
        query: { redirect: to.fullPath }, // 携带跳转前地址
      };
    }
  }

  // 已登录用户访问登录/注册页，跳个人中心
  if (to.name === "login" || to.name === "register") {
    const { isLogin } = await getLoginState();
    if (isLogin) {
      ElMessage.info("您已登录，无需重复操作");
      return "/profile";
    }
  }

  // 其他情况正常放行
  return true;
});

export default router;
