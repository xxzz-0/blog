// src/utils/auth.js（最终版，完全适配后端）
import { checkLoginStatus, logout as logoutApi } from "@/api/user";
import { ElMessage } from "element-plus";

let loginStateCache = {
  isLogin: false,
  userInfo: {},
  expireTime: 0,
};

/**
 * 核心：调用后端/check-login接口，正确解析返回值
 */
export const getLoginState = async (forceRefresh = false) => {
  const now = Date.now();
  // 缓存有效则直接返回
  if (!forceRefresh && loginStateCache.expireTime > now) {
    return {
      isLogin: loginStateCache.isLogin,
      userInfo: loginStateCache.userInfo,
    };
  }

  try {
    // 直接调用后端的登录态检查接口（/api/check-login/）
    const res = await checkLoginStatus();
    // 后端返回格式：{code:200, is_login: true/false, user: {...}}
    const isLogin = res.is_login || false;
    const userInfo = res.user || {};

    // 更新缓存
    updateLoginCache(isLogin, userInfo);
    return { isLogin, userInfo };
  } catch (err) {
    console.error("登录态检查失败：", err);
    // 出错时返回未登录状态
    updateLoginCache(false, {});
    return { isLogin: false, userInfo: {} };
  }
};

// 更新缓存
const updateLoginCache = (isLogin, userInfo) => {
  loginStateCache = {
    isLogin,
    userInfo,
    expireTime: Date.now() + 5 * 60 * 1000, // 5分钟缓存
  };
};

// 快捷判断登录态
export const isLogin = () => {
  // 只依赖缓存，因为前端无法读取 httponly cookie
  return loginStateCache.isLogin;
};

// 退出登录
export const logout = async () => {
  try {
    await logoutApi();
  } catch (err) {
    console.error("登出接口调用失败：", err);
  }
  // 清空缓存，后端会处理 cookie
  updateLoginCache(false, {});
  ElMessage.success("退出登录成功！");
  return true;
};

// 登录成功后更新缓存
export const loginSuccess = (userInfo) => {
  updateLoginCache(true, userInfo || {});
};

// 获取当前用户信息
export const getUserInfo = () => {
  return loginStateCache.userInfo;
};
