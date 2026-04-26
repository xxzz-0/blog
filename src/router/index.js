import { createRouter, createWebHistory, createMemoryHistory } from "vue-router";
import { ElMessage } from "element-plus";
// 导入封装的登录态工具
import { getLoginState } from "@/utils/auth";

// 导入页面组件
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import ProfileView from "@/views/ProfileView.vue";
import HomeView from "@/views/HomeView.vue";
import ArticleDetail from "@/views/ArticleDetail.vue";
import ArticleList from "@/views/ArticleList.vue";
import PublishArticle from "@/views/PublishArticle.vue";
import EditArticle from "@/views/EditArticle.vue";
import FileManager from "@/views/FileManager.vue";
import AdminDashboard from "@/views/AdminDashboard.vue";
import ArchiveView from "@/views/ArchiveView.vue";
import NotificationCenter from "@/views/NotificationCenter.vue";

// 路由规则
const routes = [
  { path: "/", name: "home", component: HomeView },
  { path: "/login", name: "login", component: LoginView },
  { path: "/register", name: "register", component: RegisterView },
  { path: "/reset-password", name: "resetPassword", component: ResetPassword },
  {
    path: "/profile",
    name: "profile",
    component: ProfileView,
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
    component: PublishArticle,
    meta: { requiresAuth: true }, // 必须登录才能发布
  },
  {
    path: "/edit-article/:id",
    name: "EditArticle",
    component: EditArticle,
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
    component: ArchiveView,
  },
  { path: "/article/list", name: "articleList", component: ArticleList },
  { path: "/article/:id", name: "articleDetail", component: ArticleDetail },

  {
    path: "/file-manager",
    name: "fileManager",
    component: FileManager,
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminDashboard,
    meta: { requiresAuth: true }, // 需要登录验证的页面
  },
  {
    path: "/notification",
    name: "notification",
    component: NotificationCenter,
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
