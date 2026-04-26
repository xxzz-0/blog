<template>
  <div class="reset-password-container">
    <el-card class="reset-password-card">
      <template #header>
        <div class="card-header">
          <h2>找回密码</h2>
        </div>
      </template>

      <el-form
        ref="resetForm"
        :model="resetForm"
        :rules="resetRules"
        label-width="80px"
        class="reset-form"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="resetForm.phone"
            placeholder="请输入注册手机号"
            maxlength="11"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input
                v-model="resetForm.code"
                placeholder="请输入验证码"
                maxlength="6"
                show-word-limit
              />
            </el-col>
            <el-col :span="8">
              <el-button
                type="primary"
                :disabled="countdown > 0"
                @click="sendCode"
                class="get-code-btn"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="reset-btn"
            @click="resetPassword"
            :loading="loading"
          >
            重置密码
          </el-button>
        </el-form-item>

        <div class="login-link">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { sendResetCode, resetPassword as resetPasswordApi } from '@/api/user';

const router = useRouter();
const loading = ref(false);
const countdown = ref(0);
const timer = ref(null);

const resetForm = reactive({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

const resetRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const sendCode = async () => {
  if (countdown.value > 0) return;

  const phone = resetForm.phone;
  if (!phone) {
    ElMessage.warning('请输入手机号');
    return;
  }

  if (!/^1[3-9]\d{9}$/.test(phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }

  try {
    await sendResetCode({ phone });
    ElMessage.success('验证码已发送');

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
    ElMessage.error(error.msg || '发送验证码失败');
  }
};

const resetPassword = async () => {
  const formRef = document.querySelector('.reset-form');
  if (formRef) {
    const formInstance = formRef.__vueParentComponent.proxy;
    await formInstance.$refs.resetForm.validate(async (valid) => {
      if (valid) {
        loading.value = true;
        try {
          await resetPasswordApi({
            phone: resetForm.phone,
            code: resetForm.code,
            new_password: resetForm.newPassword,
            confirm_password: resetForm.confirmPassword
          });
          ElMessage.success('密码重置成功，请登录');
          router.push('/login');
        } catch (error) {
          ElMessage.error(error.msg || '密码重置失败');
        } finally {
          loading.value = false;
        }
      }
    });
  }
};
</script>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
}

/* 暗黑模式下的重置密码页面样式 */
.dark .reset-password-container {
  background-color: #121212;
}

.dark .reset-password-card {
  background-color: #1e1e1e;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dark .card-header h2 {
  color: #e0e0e0;
}

.dark .el-form-item__label {
  color: #e0e0e0;
}

.reset-password-card {
  width: 100%;
  max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  text-align: center;
  padding: 20px 0;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.reset-form {
  padding: 0 30px 30px;
}

.get-code-btn {
  width: 100%;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link a {
  color: #409eff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .reset-password-card {
    margin: 0 20px;
  }

  .reset-form {
    padding: 0 20px 20px;
  }
}
</style>