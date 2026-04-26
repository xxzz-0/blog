import { defineStore } from 'pinia';
import { checkLoginStatus, logout as logoutApi } from '@/api/user';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLogin: false,
    userInfo: {},
    expireTime: 0,
  }),
  
  getters: {
    // 快捷判断登录态
    isLoggedIn: (state) => state.isLogin,
    // 获取当前用户信息
    currentUser: (state) => state.userInfo,
  },
  
  actions: {
    /**
     * 获取登录状态
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<{isLogin: boolean, userInfo: object}>}
     */
    async getLoginState(forceRefresh = false) {
      const now = Date.now();
      // 缓存有效则直接返回
      if (!forceRefresh && this.expireTime > now) {
        return {
          isLogin: this.isLogin,
          userInfo: this.userInfo,
        };
      }

      try {
        // 直接调用后端的登录态检查接口（/api/check-login/）
        const res = await checkLoginStatus();
        // 后端返回格式：{code:200, is_login: true/false, user: {...}}
        const isLogin = res.is_login || false;
        const userInfo = res.user || {};

        // 更新状态
        this.updateLoginCache(isLogin, userInfo);
        return { isLogin, userInfo };
      } catch (err) {
        console.error('登录态检查失败：', err);
        // 出错时返回未登录状态
        this.updateLoginCache(false, {});
        return { isLogin: false, userInfo: {} };
      }
    },

    /**
     * 更新登录状态缓存
     * @param {boolean} isLogin - 是否登录
     * @param {object} userInfo - 用户信息
     */
    updateLoginCache(isLogin, userInfo) {
      this.isLogin = isLogin;
      this.userInfo = userInfo;
      this.expireTime = Date.now() + 5 * 60 * 1000; // 5分钟缓存
    },

    /**
     * 退出登录
     * @returns {Promise<boolean>}
     */
    async logout() {
      try {
        await logoutApi();
      } catch (err) {
        console.error('登出接口调用失败：', err);
      }
      // 清空状态，后端会处理 cookie
      this.updateLoginCache(false, {});
      ElMessage.success('退出登录成功！');
      return true;
    },

    /**
     * 登录成功后更新缓存
     * @param {object} userInfo - 用户信息
     */
    loginSuccess(userInfo) {
      this.updateLoginCache(true, userInfo || {});
    },
  },
});
