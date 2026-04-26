<template>
  <div class="register-page">
    <div class="register-container">
      <h2 style="text-align: center">博客用户注册</h2>
      <el-form :model="registerForm" label-width="80px" @submit.prevent="handleRegister">
        <!-- 手机号（必填） -->
        <el-form-item label="手机号">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号"></el-input>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" :disabled="countdown > 0" @click="sendCode">
                {{ countdown > 0 ? `${countdown}s后重试` : "获取验证码" }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <!-- 验证码（必填） -->
        <el-form-item label="验证码">
          <el-input v-model="registerForm.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <!-- 用户名 -->
        <el-form-item label="用户名">
          <el-input v-model="registerForm.nickname" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码（至少8位，含字母+数字）"
          ></el-input>
        </el-form-item>
        <!-- 确认密码 -->
        <el-form-item label="确认密码">
          <el-input
            v-model="registerForm.password_confirm"
            type="password"
            placeholder="请再次输入密码"
          ></el-input>
        </el-form-item>
        <!-- 性别（必填） -->
        <el-form-item label="性别">
          <el-select v-model="registerForm.gender" placeholder="请选择性别">
            <el-option label="男" value="male"></el-option>
            <el-option label="女" value="female"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">注册</el-button>
          <el-button type="text" @click="goToLogin">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register, sendRegisterCode } from "@/api/user";

const router = useRouter();

// 表单数据（字段名与后端序列化器完全一致）
const registerForm = ref({
  nickname: "", // 用户名
  phone: "", // 手机号（必填）
  code: "", // 验证码（必填）
  password: "", // 密码（必填）
  password_confirm: "", // 确认密码（必填）
  gender: "", // 性别（前端显示值：male/female/other）
});

// 验证码倒计时
const countdown = ref(0);
const timer = ref(null);

// 性别映射表：前端显示值 → 后端要求的数字编码
const genderMap = {
  male: 0, // 男 → 0
  female: 1, // 女 → 1
  other: 2, // 其他 → 2
};

// 跳转到登录页
const goToLogin = () => {
  router.push("/login");
};

// 发送验证码
const sendCode = async () => {
  if (countdown.value > 0) return;

  const phone = registerForm.value.phone;
  if (!phone) {
    ElMessage.warning("请输入手机号");
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning("请输入正确的手机号");
    return;
  }

  try {
    await sendRegisterCode({ phone });
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

// 注册核心逻辑
const handleRegister = async () => {
  // 解构表单数据
  const { phone, code, nickname, password, password_confirm, gender } = registerForm.value;

  // 1. 前端表单校验（全覆盖）
  // 手机号校验
  if (!phone) {
    ElMessage.warning("请输入手机号");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.error("请输入正确的11位手机号");
    return;
  }

  // 验证码校验
  if (!code) {
    ElMessage.warning("请输入验证码");
    return;
  }
  if (!/^\d{6}$/.test(code)) {
    ElMessage.error("请输入6位数字验证码");
    return;
  }

  // 用户名校验
  if (!nickname) {
    ElMessage.warning("请输入用户名");
    return;
  }
  if (nickname.length < 2 || nickname.length > 20) {
    ElMessage.error("用户名长度需在2-20位之间");
    return;
  }

  // 密码校验
  if (!password || !password_confirm) {
    ElMessage.warning("请填写密码和确认密码");
    return;
  }
  if (password !== password_confirm) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }
  if (password.length < 8) {
    ElMessage.error("密码长度不能少于8位");
    return;
  }
  // 密码复杂度校验（字母+数字）
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    ElMessage.error("密码必须包含字母和数字");
    return;
  }

  // 性别校验
  if (!gender) {
    ElMessage.warning("请选择性别");
    return;
  }

  // 2. 转换性别值（前端显示值 → 后端数字编码）
  const genderCode = genderMap[gender];

  // 3. 构造请求参数（与后端序列化器字段完全匹配）
  const requestData = {
    nickname,
    phone,
    code,
    password,
    password_confirm,
    gender: genderCode,
  };

  // 4. 调用注册接口
  try {
    await register(requestData);
    ElMessage.success("注册成功！即将跳转到登录页");
    // 延迟跳转，提升用户体验
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
    console.error("注册失败详情：", err);
    // 精准显示后端返回的错误信息
    let errorMsg = "注册失败，请稍后重试";
    if (err.errors) {
      // 解析后端返回的字段错误
      const errorFields = Object.keys(err.errors);
      if (errorFields.length > 0) {
        errorMsg = err.errors[errorFields[0]][0] || errorMsg;
      }
    } else if (err.msg) {
      errorMsg = err.msg;
    }
    ElMessage.error(errorMsg);
  }
};
</script>

<style scoped>
/* 注册页面样式 */
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 注册容器 */
.register-container {
  max-width: 420px;
  width: 100%;
  padding: 32px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.register-container:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.el-form-item {
  margin-bottom: 20px;
}

/* 暗黑模式下的注册页面样式 */
.dark .register-page {
  background-color: #121212;
}

.dark .register-container {
  background-color: #1e1e1e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dark h2 {
  color: #e0e0e0;
}

.dark .el-form-item__label {
  color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 24px;
  }
}
</style>
