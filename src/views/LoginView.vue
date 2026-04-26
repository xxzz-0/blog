<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h2 class="login-title">用户登录</h2>
        <p class="login-subtitle">欢迎回来，开始您的创作之旅</p>
      </div>

      <el-form
        :model="loginForm"
        label-width="80px"
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            type="tel"
            :disabled="isLoading"
            class="login-input"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                :disabled="isLoading"
                class="login-input"
              />
            </el-col>
            <el-col :span="8">
              <el-button
                type="primary"
                :disabled="countdown > 0 || isLoading"
                @click="sendCode"
                class="login-input"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : "获取验证码" }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            :disabled="isLoading"
            class="login-input"
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="login-button-item">
          <el-button type="primary" native-type="submit" :loading="isLoading" class="login-button">
            {{ isLoading ? "登录中..." : "登录" }}
          </el-button>
        </el-form-item>

        <el-form-item class="login-links">
          <el-button
            link
            @click="goToResetPassword"
            :disabled="isLoading"
            class="login-link"
          >
            忘记密码？
          </el-button>
          <el-button link @click="goToRegister" :disabled="isLoading" class="login-link">
            还没有账号？立即注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { sendLoginCode, login } from "@/api/user";

const router = useRouter();

const loginForm = ref({
  phone: "",
  password: "",
  code: "",
});

const isLoading = ref(false);
const countdown = ref(0);
const timer = ref(null);

const goToRegister = () => {
  router.push("/register");
};

const goToResetPassword = () => {
  router.push("/reset-password");
};

// 发送验证码
const sendCode = async () => {
  if (countdown.value > 0 || isLoading.value) return;

  const phone = loginForm.value.phone;
  if (!phone) {
    ElMessage.warning("请输入手机号");
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error("请输入正确的11位手机号");
    return;
  }

  try {
    await sendLoginCode({ phone });
    ElMessage.success("验证码已发送");

    // 开始倒计时
    countdown.value = 60;
    timer.value = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer.value);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error(error.msg || "发送验证码失败");
  }
};

// ✅ 最终稳定登录函数
const handleLogin = async () => {
  if (isLoading.value) return;

  if (!loginForm.value.phone) {
    ElMessage.warning("请输入手机号");
    return;
  }
  if (!loginForm.value.code) {
    ElMessage.warning("请输入验证码");
    return;
  }
  if (!loginForm.value.password) {
    ElMessage.warning("请输入密码");
    return;
  }

  // 手机号格式校验
  if (!/^1[3-9]\d{9}$/.test(loginForm.value.phone)) {
    ElMessage.error("请输入正确的11位手机号");
    return;
  }

  // 验证码格式校验
  if (!/^\d{6}$/.test(loginForm.value.code)) {
    ElMessage.error("请输入6位数字验证码");
    return;
  }

  // 密码长度校验
  if (loginForm.value.password.length < 8) {
    ElMessage.error("密码长度不能少于8位");
    return;
  }

  isLoading.value = true;

  try {
    const res = await login(loginForm.value.phone, loginForm.value.password, loginForm.value.code);

    if (res.code === 200) {
      ElMessage.success("登录成功！");
      // 延迟跳转，确保cookie设置完成
      setTimeout(() => {
        router.push("/");
      }, 500);
    } else if (res.msg?.includes("重复登录")) {
      ElMessage.info("您已登录");
      router.push("/");
    } else if (res.msg?.includes("禁用")) {
      ElMessage.warning(Array.isArray(res.msg) ? res.msg[0] : res.msg);
    } else {
      ElMessage.warning(Array.isArray(res.msg) ? res.msg[0] : res.msg || "登录失败");
    }
  } catch (err) {
    console.error("登录错误:", err);
    let errorMsg = "登录失败，请检查账号密码和验证码";
    if (err.response?.data?.msg) {
      errorMsg = Array.isArray(err.response.data.msg)
        ? err.response.data.msg[0]
        : err.response.data.msg;
    } else if (err.msg) {
      errorMsg = Array.isArray(err.msg) ? err.msg[0] : err.msg;
    }
    console.error("最终错误信息:", errorMsg);
    if (errorMsg.includes("禁用")) {
      ElMessage.warning(errorMsg);
    } else {
      ElMessage.error(errorMsg);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 登录页面样式 */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 登录容器 */
.login-container {
  max-width: 420px;
  width: 100%;
  padding: 32px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-container:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 0;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* 输入框 */
.login-input {
  width: 100%;
  height: 44px;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-input:focus {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2) !important;
}

/* 按钮 */
.login-button-item {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

/* 链接 */
.login-links {
  display: flex;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 0;
}

.login-link {
  font-size: 14px;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #1976d2 !important;
}

/* 暗黑模式下的登录页面样式 */
.dark .login-page {
  background-color: #121212;
}

.dark .login-container {
  background-color: #1e1e1e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dark .login-title {
  color: #e0e0e0;
}

.dark .login-subtitle {
  color: #999;
}

.dark .el-form-item__label {
  color: #e0e0e0;
}

.dark .login-link {
  color: #999 !important;
}

.dark .login-link:hover {
  color: #64b5f6 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 24px;
  }

  .login-header {
    margin-bottom: 24px;
  }

  .login-title {
    font-size: 20px;
  }

  .login-button {
    height: 40px;
    font-size: 14px;
  }

  .login-input {
    height: 40px;
  }
}
</style>
