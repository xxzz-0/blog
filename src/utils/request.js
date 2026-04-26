import axios from "axios";
import { ElMessage, ElMessageBox } from "element-plus";

const service = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 10000,
  withCredentials: true,
});

// 暂时注释掉未使用的变量
// let isRefreshing = false;
// let requestQueue = [];

service.interceptors.request.use(
  (config) => {
    // 后端只接受 httponly cookie，浏览器会自动携带
    // 前端无法读取 httponly cookie，所以不需要手动添加 Authorization 头
    return config;
  },
  (error) => {
    ElMessage.error("请求参数错误");
    return Promise.reject(error);
  },
);

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      ElMessage.error("网络连接失败，请检查后端服务是否运行");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 检查是否是找回密码相关的接口
    const isResetPasswordApi =
      originalRequest.url.includes("/sms-code/reset/") ||
      originalRequest.url.includes("/user/users/reset-password/");

    // 检查是否是修改密码相关的接口
    const isChangePasswordApi =
      originalRequest.url.includes("/sms-code/change-password/") ||
      originalRequest.url.includes("/user/users/change_password/");

    // 401 处理：跳转到登录页面
    if (status === 401) {
      // 找回密码和修改密码相关接口不需要登录，直接返回错误
      if (isResetPasswordApi || isChangePasswordApi) {
        // 确保错误对象包含后端返回的错误信息
        if (data && data.msg) {
          error.msg = data.msg;
        }
        return Promise.reject(error);
      }

      // 后端会处理 token 的清除

      // 显示登录过期提示并跳转到登录页面
      ElMessageBox.confirm("登录已过期，请重新登录", "会话过期", {
        confirmButtonText: "去登录",
        type: "warning",
      }).then(() => {
        window.location.href = "/login";
      });

      return Promise.reject(error);
    }

    // ==================== ✅ 全部业务错误都不弹窗 ====================
    // 1. 评论点赞
    if (status === 400 && data?.msg?.includes("已为该评论点赞")) {
      return Promise.reject(error);
    }
    // 2. 重复登录
    if ((status === 400 && data?.msg?.includes("重复登录")) || data?.msg?.includes("已登录")) {
      return Promise.reject(error);
    }
    // 3. 登录接口
    if (originalRequest.url.includes("/login/")) {
      // 确保错误对象包含后端返回的错误信息
      if (data && data.msg) {
        error.msg = data.msg;
      }
      return Promise.reject(error);
    }
    // 4. 检查登录态接口（特殊处理，不视为错误）
    if (originalRequest.url.includes("check-login/")) {
      // 如果有响应数据，返回响应数据
      if (error.response && error.response.data) {
        return Promise.resolve(error.response.data);
      } else {
        // 如果没有响应数据，返回默认的未登录状态
        return Promise.resolve({ is_login: false, user: {} });
      }
    }
    // 5. 找回密码相关接口
    if (isResetPasswordApi) {
      // 确保错误对象包含后端返回的错误信息
      if (data && data.msg) {
        error.msg = data.msg;
      }
      return Promise.reject(error);
    }
    // 6. 修改密码相关接口
    if (isChangePasswordApi) {
      // 确保错误对象包含后端返回的错误信息
      if (data && data.msg) {
        error.msg = data.msg;
      }
      return Promise.reject(error);
    }

    // ==================== 🚫 只有真正系统错误才弹窗 ====================
    const errMsg = data.detail || data.msg || `请求失败 [${status}]`;
    ElMessage.error(errMsg);

    return Promise.reject(error);
  },
);

export default service;
