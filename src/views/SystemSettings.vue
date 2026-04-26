<template>
  <div class="system-settings">
    <h2>系统设置</h2>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>基本信息设置</span>
        </div>
      </template>

      <el-form :model="basicSettings" label-width="150px">
        <el-form-item label="网站名称">
          <el-input v-model="basicSettings.site_name" placeholder="请输入网站名称" />
        </el-form-item>

        <el-form-item label="网站副标题">
          <el-input v-model="basicSettings.site_subtitle" placeholder="请输入网站副标题" />
        </el-form-item>

        <el-form-item label="网站描述">
          <el-input
            type="textarea"
            v-model="basicSettings.site_description"
            placeholder="请输入网站描述"
            rows="3"
          />
        </el-form-item>

        <el-form-item label="版权信息">
          <el-input v-model="basicSettings.copyright" placeholder="请输入版权信息" />
        </el-form-item>

        <el-form-item label="联系邮箱">
          <el-input v-model="basicSettings.contact_email" placeholder="请输入联系邮箱" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="basicSettings.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveBasicSettings">保存基本信息设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>用户注册设置</span>
        </div>
      </template>

      <el-form :model="settings" label-width="150px">
        <el-form-item label="是否允许新用户注册">
          <el-switch v-model="settings.allow_registration" />
        </el-form-item>

        <el-form-item label="是否强制邮箱验证">
          <el-switch v-model="settings.email_verification_required" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>内容设置</span>
        </div>
      </template>

      <el-form :model="contentSettings" label-width="150px">
        <el-form-item label="是否开启评论功能">
          <el-switch v-model="contentSettings.allow_comments" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveContentSettings">保存内容设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>安全设置</span>
        </div>
      </template>

      <el-form :model="securitySettings" label-width="150px">
        <el-form-item label="登录尝试限制(次)">
          <el-input
            type="number"
            v-model="securitySettings.login_attempt_limit"
            placeholder="请输入登录尝试限制"
          />
        </el-form-item>

        <el-form-item label="登录验证码">
          <el-switch v-model="securitySettings.login_captcha" />
        </el-form-item>

        <el-form-item label="会话超时时间(分钟)">
          <el-input
            type="number"
            v-model="securitySettings.session_timeout"
            placeholder="请输入会话超时时间"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSecuritySettings">保存安全设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>上传设置</span>
        </div>
      </template>

      <el-form :model="uploadSettings" label-width="150px">
        <el-form-item label="图片上传大小限制(MB)">
          <el-input
            type="number"
            v-model="uploadSettings.max_image_size"
            placeholder="请输入图片上传大小限制"
          />
        </el-form-item>

        <el-form-item label="允许的图片类型">
          <el-input
            v-model="uploadSettings.allowed_image_types"
            placeholder="请输入允许的图片类型，用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="图片存储路径">
          <el-input v-model="uploadSettings.image_upload_path" placeholder="请输入图片存储路径" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveUploadSettings">保存上传设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt-4">
      <template #header>
        <div class="card-header">
          <span>邮件配置设置</span>
        </div>
      </template>

      <el-form :model="emailSettings" label-width="150px">
        <el-form-item label="SMTP服务器地址">
          <el-input v-model="emailSettings.email_host" placeholder="请输入SMTP服务器地址" />
        </el-form-item>

        <el-form-item label="SMTP端口">
          <el-input type="number" v-model="emailSettings.email_port" placeholder="请输入SMTP端口" />
        </el-form-item>

        <el-form-item label="是否使用SSL">
          <el-switch v-model="emailSettings.email_use_ssl" />
        </el-form-item>

        <el-form-item label="发件人邮箱">
          <el-input v-model="emailSettings.email_host_user" placeholder="请输入发件人邮箱" />
        </el-form-item>

        <el-form-item label="邮箱密码/授权码">
          <el-input
            type="password"
            v-model="emailSettings.email_host_password"
            placeholder="请输入邮箱密码或授权码"
          />
        </el-form-item>

        <el-form-item label="默认发件人邮箱">
          <el-input v-model="emailSettings.default_from_email" placeholder="请输入默认发件人邮箱" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveEmailSettings">保存邮件设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";

const settings = ref({
  allow_registration: true,
  email_verification_required: false,
});

const basicSettings = ref({
  site_name: "博客平台",
  site_subtitle: "分享知识，连接世界",
  site_description: "一个专注于技术分享的博客平台，为用户提供优质的内容和交流空间。",
  copyright: "© 2026 博客平台. All rights reserved.",
  contact_email: "contact@blog.com",
  contact_phone: "12345678901",
});

const contentSettings = ref({
  allow_comments: true,
});

const securitySettings = ref({
  login_attempt_limit: 5,
  login_captcha: false,
  session_timeout: 60,
});

const uploadSettings = ref({
  max_image_size: 2,
  allowed_image_types: "image/jpeg,image/png,image/gif",
  image_upload_path: "images/%Y/%m/%d/",
});

const emailSettings = ref({
  email_host: "smtp.qq.com",
  email_port: 465,
  email_use_ssl: true,
  email_host_user: "",
  email_host_password: "",
  default_from_email: "",
});

const loadSettings = async () => {
  try {
    const res = await request.get("/settings/");
    if (res.code === 200) {
      // 加载基本信息设置
      basicSettings.value.site_name = res.data.site_name || "博客平台";
      basicSettings.value.site_subtitle = res.data.site_subtitle || "分享知识，连接世界";
      basicSettings.value.site_description =
        res.data.site_description ||
        "一个专注于技术分享的博客平台，为用户提供优质的内容和交流空间。";
      basicSettings.value.copyright = res.data.copyright || "© 2026 博客平台. All rights reserved.";
      basicSettings.value.contact_email = res.data.contact_email || "contact@blog.com";
      basicSettings.value.contact_phone = res.data.contact_phone || "12345678901";

      // 转换设置值为布尔类型
      settings.value.allow_registration =
        (res.data.allow_registration || "true").toLowerCase() === "true";
      settings.value.email_verification_required =
        (res.data.email_verification_required || "false").toLowerCase() === "true";

      // 加载内容设置
      contentSettings.value.allow_comments =
        (res.data.allow_comments || "true").toLowerCase() === "true";

      // 加载安全设置
      securitySettings.value.login_attempt_limit = parseInt(res.data.login_attempt_limit) || 5;
      securitySettings.value.login_captcha =
        (res.data.login_captcha || "false").toLowerCase() === "true";
      securitySettings.value.session_timeout = parseInt(res.data.session_timeout) || 60;

      // 加载上传设置
      uploadSettings.value.max_image_size = parseInt(res.data.max_image_size) || 2;
      uploadSettings.value.allowed_image_types =
        res.data.allowed_image_types || "image/jpeg,image/png,image/gif";
      uploadSettings.value.image_upload_path = res.data.image_upload_path || "images/%Y/%m/%d/";

      // 加载邮件设置
      emailSettings.value.email_host = res.data.email_host || "smtp.qq.com";
      emailSettings.value.email_port = parseInt(res.data.email_port) || 465;
      emailSettings.value.email_use_ssl =
        (res.data.email_use_ssl || "true").toLowerCase() === "true";
      emailSettings.value.email_host_user = res.data.email_host_user || "3382972457@qq.com";
      emailSettings.value.email_host_password = res.data.email_host_password || "qaxzqfzgagkscibf";
      emailSettings.value.default_from_email =
        res.data.default_from_email || res.data.email_host_user || "3382972457@qq.com";
    }
  } catch (error) {
    ElMessage.error("加载设置失败");
  }
};

const saveBasicSettings = async () => {
  try {
    // 保存网站名称
    await request.post("/settings/", {
      key: "site_name",
      value: basicSettings.value.site_name,
      description: "网站名称",
    });

    // 保存网站副标题
    await request.post("/settings/", {
      key: "site_subtitle",
      value: basicSettings.value.site_subtitle,
      description: "网站副标题",
    });

    // 保存网站描述
    await request.post("/settings/", {
      key: "site_description",
      value: basicSettings.value.site_description,
      description: "网站描述",
    });

    // 保存版权信息
    await request.post("/settings/", {
      key: "copyright",
      value: basicSettings.value.copyright,
      description: "版权信息",
    });

    // 保存联系邮箱
    await request.post("/settings/", {
      key: "contact_email",
      value: basicSettings.value.contact_email,
      description: "联系邮箱",
    });

    // 保存联系电话
    await request.post("/settings/", {
      key: "contact_phone",
      value: basicSettings.value.contact_phone,
      description: "联系电话",
    });

    ElMessage.success("基本信息设置保存成功");
  } catch (error) {
    ElMessage.error("保存基本信息设置失败");
  }
};

const saveSettings = async () => {
  try {
    // 保存是否允许注册设置
    await request.post("/settings/", {
      key: "allow_registration",
      value: settings.value.allow_registration ? "true" : "false",
      description: "是否允许新用户注册",
    });

    // 保存是否强制邮箱验证设置
    await request.post("/settings/", {
      key: "email_verification_required",
      value: settings.value.email_verification_required ? "true" : "false",
      description: "是否强制邮箱验证",
    });

    ElMessage.success("设置保存成功");
  } catch (error) {
    ElMessage.error("保存设置失败");
  }
};

const saveContentSettings = async () => {
  try {
    // 保存是否开启评论功能设置
    await request.post("/settings/", {
      key: "allow_comments",
      value: contentSettings.value.allow_comments ? "true" : "false",
      description: "是否开启评论功能",
    });

    ElMessage.success("内容设置保存成功");
  } catch (error) {
    ElMessage.error("保存内容设置失败");
  }
};

const saveSecuritySettings = async () => {
  try {
    // 保存登录尝试限制设置
    await request.post("/settings/", {
      key: "login_attempt_limit",
      value: securitySettings.value.login_attempt_limit.toString(),
      description: "登录尝试限制(次)",
    });

    // 保存登录验证码设置
    await request.post("/settings/", {
      key: "login_captcha",
      value: securitySettings.value.login_captcha ? "true" : "false",
      description: "登录验证码",
    });

    // 保存会话超时时间设置
    await request.post("/settings/", {
      key: "session_timeout",
      value: securitySettings.value.session_timeout.toString(),
      description: "会话超时时间(分钟)",
    });

    ElMessage.success("安全设置保存成功");
  } catch (error) {
    ElMessage.error("保存安全设置失败");
  }
};

const saveUploadSettings = async () => {
  try {
    // 保存图片上传大小限制设置
    await request.post("/settings/", {
      key: "max_image_size",
      value: uploadSettings.value.max_image_size.toString(),
      description: "图片上传大小限制(MB)",
    });

    // 保存允许的图片类型设置
    await request.post("/settings/", {
      key: "allowed_image_types",
      value: uploadSettings.value.allowed_image_types,
      description: "允许的图片类型",
    });

    // 保存图片存储路径设置
    await request.post("/settings/", {
      key: "image_upload_path",
      value: uploadSettings.value.image_upload_path,
      description: "图片存储路径",
    });

    ElMessage.success("上传设置保存成功");
  } catch (error) {
    ElMessage.error("保存上传设置失败");
  }
};

const saveEmailSettings = async () => {
  try {
    // 保存邮件设置
    await request.post("/settings/", {
      key: "email_host",
      value: emailSettings.value.email_host,
      description: "SMTP服务器地址",
    });

    await request.post("/settings/", {
      key: "email_port",
      value: emailSettings.value.email_port.toString(),
      description: "SMTP端口",
    });

    await request.post("/settings/", {
      key: "email_use_ssl",
      value: emailSettings.value.email_use_ssl ? "true" : "false",
      description: "是否使用SSL",
    });

    await request.post("/settings/", {
      key: "email_host_user",
      value: emailSettings.value.email_host_user,
      description: "发件人邮箱",
    });

    await request.post("/settings/", {
      key: "email_host_password",
      value: emailSettings.value.email_host_password,
      description: "邮箱密码/授权码",
    });

    await request.post("/settings/", {
      key: "default_from_email",
      value: emailSettings.value.default_from_email,
      description: "默认发件人邮箱",
    });

    ElMessage.success("邮件设置保存成功");
  } catch (error) {
    ElMessage.error("保存邮件设置失败");
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.system-settings {
  padding: 0;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mt-4 {
  margin-top: 20px;
}
</style>
