// 导入封装好的 axios 实例（核心：确保用这个发请求）
import service from "@/utils/request";

// 1. 登录（获取JWT token）→ 后端路径：/api/login/
export const login = (phone, password, code) => {
  return service.post("/login/", { phone, password, code }); // 字段名必须是 phone
};

// 2. 注册 → 后端路径：/api/user/users/register/
export const register = (userData) => {
  return service.post("/user/users/register/", userData);
};

// 3. 刷新token（延长登录态）→ 后端路径：/api/refresh-token/
export const refreshToken = (refreshToken) => {
  return service.post("/refresh-token/", { refresh: refreshToken });
};

// 4. 获取当前登录用户信息 → 后端路径：/api/user/users/me/
export const getCurrentUser = () => {
  return service.get("/user/users/me/");
};

// 6. 修改当前用户信息（昵称/性别）→ 后端路径：/api/user/users/me/
export const updateUserInfo = (userData) => {
  return service.patch("/user/users/update_profile/", userData);
};

// 7. 登出（前端清理token + 调用后端接口）→ 后端路径：/api/user/users/logout/
export const logout = () => {
  localStorage.clear();
  return service.post("/user/users/logout/");
};

// 8. 补全：修改密码 → 后端路径：/api/user/users/change_password/
export const changePassword = (pwdData) => {
  return service.patch("/user/users/change_password/", pwdData);
};

// 9. 补全：注销账号 → 后端路径：/api/user/users/deactivate_account/
export const deactivateAccount = () => {
  return service.post("/user/users/deactivate_account/");
};

// 10. 补全：检查登录状态 → 后端路径：/api/check-login/
export const checkLoginStatus = () => {
  return service.get("/check-login/");
};

// 11. 上传用户头像 → 后端路径：/api/user/users/upload_avatar/
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return service.post("/user/users/upload_avatar/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 12. 发送重置密码验证码 → 后端路径：/api/sms-code/reset/
export const sendResetCode = (data) => {
  return service.post("/sms-code/reset/", data);
};

// 13. 重置密码 → 后端路径：/api/user/users/reset_password/
export const resetPassword = (data) => {
  return service.post("/user/users/reset_password/", data);
};

// 14. 发送注册验证码 → 后端路径：/api/sms-code/register/
export const sendRegisterCode = (data) => {
  return service.post("/sms-code/register/", data);
};

// 15. 发送登录验证码 → 后端路径：/api/sms-code/login/
export const sendLoginCode = (data) => {
  return service.post("/sms-code/login/", data);
};

// 16. 发送邮箱验证邮件 → 后端路径：/api/notification/send_email_verification/
// 请使用 notification.js 中的 sendEmailVerification

// 17. 验证邮箱 → 后端路径：/api/notification/verify_email/
// 请使用 notification.js 中的 verifyEmail
