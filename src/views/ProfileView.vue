<template>
  <div class="profile-container" style="width: 1000px; margin: 50px auto">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      "
    >
      <h2>个人中心</h2>
      <el-button type="primary" @click="goToHome">返回文章首页</el-button>
    </div>

    <div v-loading="loading" element-loading-text="处理中..." style="min-height: 400px">
      <div style="display: flex; gap: 40px">
        <!-- 左侧菜单 -->
        <div style="width: 20%">
          <el-menu
            default-active="profile"
            class="profile-menu"
            @select="handleMenuSelect"
            style="border-right: none"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="collect">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </el-menu-item>
            <el-menu-item index="myArticles">
              <el-icon><Document /></el-icon>
              <span>我的文章</span>
            </el-menu-item>
            <el-menu-item index="myDrafts">
              <el-icon><DocumentCopy /></el-icon>
              <span>我的草稿</span>
            </el-menu-item>
            <el-menu-item index="password">
              <el-icon><Lock /></el-icon>
              <span>修改密码</span>
            </el-menu-item>
            <el-menu-item index="publish">
              <el-icon><EditPen /></el-icon>
              <span>发布文章</span>
            </el-menu-item>
            <el-menu-item index="logout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 右侧内容 -->
        <div style="width: 80%">
          <!-- 个人资料 -->
          <div v-if="activeMenu === 'profile'" style="margin-top: 10px">
            <h3 style="color: #409eff; margin-bottom: 20px">个人资料</h3>

            <div v-if="!isEditing" style="font-size: 16px; line-height: 2">
              <div><strong>昵称：</strong> {{ profileForm.nickname }}</div>
              <div>
                <strong>邮箱：</strong> {{ profileForm.email || "未设置" }}
                <el-tag
                  v-if="profileForm.email_verified"
                  type="success"
                  size="small"
                  style="margin-left: 10px"
                  >已验证</el-tag
                >
                <el-tag v-else type="warning" size="small" style="margin-left: 10px">未验证</el-tag>
                <el-button
                  v-if="profileForm.email && !profileForm.email_verified"
                  type="primary"
                  size="small"
                  @click="sendVerificationEmail"
                  style="margin-left: 10px"
                >
                  发送验证邮件
                </el-button>
              </div>
              <div>
                <strong>头像：</strong>
                <img
                  v-if="profileForm.avatar"
                  :src="profileForm.avatar"
                  style="width: 100px; height: 100px; border-radius: 6px; object-fit: cover"
                />
                <span v-else>未设置</span>
              </div>
              <div><strong>简介：</strong> {{ profileForm.intro || "未填写" }}</div>
              <div><strong>性别：</strong> {{ genderText }}</div>

              <el-button style="margin-top: 15px" type="primary" @click="isEditing = true">
                编辑资料
              </el-button>
            </div>

            <el-form v-else :model="profileForm" label-width="100px" style="max-width: 500px">
              <el-form-item label="昵称">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" maxlength="20" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="头像">
                <ImageUpload
                  :http-request="handleAvatarUploadRequest"
                  :imageUrl="profileForm.avatar"
                />
              </el-form-item>
              <el-form-item label="个人简介">
                <el-input
                  v-model="profileForm.intro"
                  placeholder="一句话介绍自己"
                  maxlength="100"
                />
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="profileForm.gender" placeholder="请选择性别">
                  <el-option label="男" :value="0" />
                  <el-option label="女" :value="1" />
                  <el-option label="未知" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="updateProfile" :loading="loading">
                  保存资料
                </el-button>
                <el-button @click="isEditing = false">取消</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 我的收藏 -->
          <div v-if="activeMenu === 'collect'">
            <h3 style="color: #409eff; margin-bottom: 20px">我的收藏</h3>
            <div
              v-if="collectList.length === 0 && !collectLoading"
              style="text-align: center; padding: 50px; color: #999"
            >
              暂无收藏的文章
            </div>
            <div v-else>
              <div
                v-for="article in collectList"
                :key="article.id"
                style="
                  border: 1px solid #eee;
                  padding: 15px;
                  margin-bottom: 15px;
                  border-radius: 8px;
                  cursor: pointer;
                "
                @click="goToArticleDetail(article.id)"
              >
                <h4 style="margin: 0 0 10px 0; color: #333">{{ article.title }}</h4>
                <div style="font-size: 12px; color: #999; margin-bottom: 8px">
                  <span>分类：{{ article.category_name || "未分类" }}</span>
                  <span style="margin-left: 15px">作者：{{ article.nickname }}</span>
                  <span style="margin-left: 15px"
                    >收藏时间：{{ formatTime(article.created_at) }}</span
                  >
                </div>
                <div style="font-size: 14px; color: #666; line-height: 1.5">
                  {{ article.summary }}
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #999">
                  <span>浏览：{{ article.view_count }}</span>
                  <span style="margin-left: 15px">点赞：{{ article.like_count }}</span>
                  <span style="margin-left: 15px">收藏：{{ article.collect_count }}</span>
                </div>
                <el-button
                  link
                  style="color: #f56c6c; margin-top: 8px"
                  @click.stop="cancelCollect(article.id)"
                  :loading="loading"
                >
                  取消收藏
                </el-button>
              </div>

              <!-- 收藏分页 5条/页 -->
              <el-pagination
                v-if="collectTotal > 0"
                v-model:current-page="collectPage.page"
                v-model:page-size="collectPage.pageSize"
                :total="collectTotal"
                style="margin-top: 20px; text-align: center"
                background
                layout="prev, pager, next, jumper, ->, total"
                @current-change="loadCollectList"
              />
            </div>
          </div>

          <!-- 我的文章 -->
          <div v-if="activeMenu === 'myArticles'">
            <h3 style="color: #409eff; margin-bottom: 20px">我的文章</h3>
            <div
              v-if="myArticleList.length === 0 && !myArticleLoading"
              style="text-align: center; padding: 50px; color: #999"
            >
              你还没有发布过文章
            </div>
            <div v-else>
              <div
                v-for="article in myArticleList"
                :key="article.id"
                style="
                  border: 1px solid #eee;
                  padding: 15px;
                  margin-bottom: 15px;
                  border-radius: 8px;
                  cursor: pointer;
                "
                @click="goToArticleDetail(article.id)"
              >
                <h4 style="margin: 0 0 10px 0; color: #333">{{ article.title }}</h4>
                <div style="font-size: 12px; color: #999; margin-bottom: 8px">
                  <span>分类：{{ article.category_name || "未分类" }}</span>
                  <span style="margin-left: 15px"
                    >发布时间：{{ formatTime(article.created_at) }}</span
                  >
                </div>
                <div style="font-size: 14px; color: #666; line-height: 1.5">
                  {{ stripHtml(article.content).substring(0, 100) }}...
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #999">
                  <span>浏览：{{ article.view_count }}</span>
                  <span style="margin-left: 15px">点赞：{{ article.like_count }}</span>
                  <span style="margin-left: 15px">收藏：{{ article.collect_count }}</span>
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px">
                  <el-button type="primary" size="small" @click.stop="goToEditArticle(article.id)"
                    >修改文章</el-button
                  >
                  <el-button type="danger" size="small" @click.stop="deleteArticle(article.id)"
                    >删除文章</el-button
                  >
                </div>
              </div>

              <!-- 我的文章分页 5条/页 -->
              <el-pagination
                v-if="myTotal > 0"
                v-model:current-page="myArticlePage.page"
                v-model:page-size="myArticlePage.pageSize"
                :total="myTotal"
                style="margin-top: 20px; text-align: center"
                background
                layout="prev, pager, next, jumper, ->, total"
                @current-change="loadMyArticleList"
              />
            </div>
          </div>

          <!-- 我的草稿 -->
          <div v-if="activeMenu === 'myDrafts'">
            <h3 style="color: #409eff; margin-bottom: 20px">我的草稿</h3>
            <div
              v-if="myDraftList.length === 0 && !myDraftLoading"
              style="text-align: center; padding: 50px; color: #999"
            >
              你还没有保存过草稿
            </div>
            <div v-else>
              <div
                v-for="draft in myDraftList"
                :key="draft.id"
                style="
                  border: 1px solid #eee;
                  padding: 15px;
                  margin-bottom: 15px;
                  border-radius: 8px;
                  cursor: pointer;
                "
                @click="goToEditArticle(draft.id)"
              >
                <h4 style="margin: 0 0 10px 0; color: #333">{{ draft.title }}</h4>
                <div style="font-size: 12px; color: #999; margin-bottom: 8px">
                  <span>分类：{{ draft.category_name || "未分类" }}</span>
                  <span style="margin-left: 15px"
                    >保存时间：{{ formatTime(draft.updated_at) }}</span
                  >
                </div>
                <div style="font-size: 14px; color: #666; line-height: 1.5">
                  {{ stripHtml(draft.content).substring(0, 100) }}...
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px">
                  <el-button type="primary" size="small" @click.stop="goToEditArticle(draft.id)"
                    >继续编辑</el-button
                  >
                  <el-button type="danger" size="small" @click.stop="deleteDraft(draft.id)"
                    >删除草稿</el-button
                  >
                </div>
              </div>

              <!-- 我的草稿分页 5条/页 -->
              <el-pagination
                v-if="myDraftTotal > 0"
                v-model:current-page="myDraftPage.page"
                v-model:page-size="myDraftPage.pageSize"
                :total="myDraftTotal"
                style="margin-top: 20px; text-align: center"
                background
                layout="prev, pager, next, jumper, ->, total"
                @current-change="loadMyDraftList"
              />
            </div>
          </div>

          <!-- 修改密码 -->
          <div v-if="activeMenu === 'password'" style="margin-top: 30px">
            <h3 style="color: #409eff; margin-bottom: 20px">修改密码</h3>
            <el-form :model="pwdForm" label-width="100px" @submit.prevent="handleChangePassword">
              <el-form-item label="原密码">
                <el-input
                  v-model="pwdForm.old_password"
                  type="password"
                  placeholder="请输入原密码"
                  :disabled="loading"
                />
              </el-form-item>
              <el-form-item label="新密码">
                <el-input
                  v-model="pwdForm.new_password"
                  type="password"
                  placeholder="新密码"
                  :disabled="loading"
                />
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input
                  v-model="pwdForm.confirm_password"
                  type="password"
                  placeholder="确认新密码"
                  :disabled="loading"
                />
              </el-form-item>
              <el-form-item style="text-align: center">
                <el-button type="primary" @click="handleChangePassword" :loading="loading"
                  >提交修改</el-button
                >
              </el-form-item>
            </el-form>
            <div style="text-align: center; margin-top: 20px">
              <el-button type="warning" @click="confirmDeactivate" :loading="loading"
                >注销账号</el-button
              >
            </div>
          </div>

          <!-- 发布文章 -->
          <div v-if="activeMenu === 'publish'">
            <h3 style="color: #409eff; margin-bottom: 20px">发布文章</h3>
            <div style="text-align: center; padding: 50px">
              <el-button
                type="primary"
                size="large"
                icon="edit"
                @click="goToPublishPage"
                :loading="loading"
              >
                进入文章编辑页
              </el-button>
              <p style="color: #999; margin-top: 20px">每位用户最多可发布10篇文章</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 注销弹窗 -->
  <el-dialog
    title="注销账号"
    v-model="deactivateDialogVisible"
    width="400px"
    :close-on-click-modal="false"
  >
    <el-alert
      title="警告"
      type="error"
      description="注销后无法恢复，请谨慎操作！"
      style="margin-bottom: 20px"
    />
    <el-input
      v-model="deactivateConfirm"
      placeholder="请输入：确认注销"
      style="margin-bottom: 20px"
    />
    <div style="text-align: right">
      <el-button @click="deactivateDialogVisible = false">取消</el-button>
      <el-button type="danger" @click="handleDeactivateAccount" :loading="loading"
        >确认注销</el-button
      >
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  User,
  Star,
  EditPen,
  SwitchButton,
  Document,
  Lock,
  DocumentCopy,
} from "@element-plus/icons-vue";

import {
  getCurrentUser,
  updateUserInfo,
  changePassword,
  logout,
  deactivateAccount,
  uploadAvatar,
} from "@/api/user";
import { sendEmailVerification, verifyEmail } from "@/api/notification";
import request from "@/utils/request";

import {
  getCollectArticleList,
  uncollectArticle,
  getMyArticleList,
  getMyDraftList,
  deleteMyArticle,
  deleteImage,
} from "@/api/article";
import ImageUpload from "@/components/ImageUpload.vue";

const router = useRouter();
const loading = ref(false);
const activeMenu = ref("profile");
const isEditing = ref(false);

const pwdForm = ref({ old_password: "", new_password: "", confirm_password: "" });
const profileForm = ref({
  nickname: "",
  email: "",
  avatar: "",
  intro: "",
  gender: 2,
  email_verified: false,
});

const deactivateDialogVisible = ref(false);
const deactivateConfirm = ref("");

// 追踪上传的头像（用于清理旧头像）
const uploadedAvatars = ref([]);
const originalAvatar = ref("");

// 收藏
const collectLoading = ref(false);
const collectList = ref([]);
const collectPage = ref({ page: 1, pageSize: 5 });
const collectTotal = ref(0);

// 我的文章
const myArticleLoading = ref(false);
const myArticleList = ref([]);
const myArticlePage = ref({ page: 1, pageSize: 5 });
const myTotal = ref(0);

// 我的草稿
const myDraftLoading = ref(false);
const myDraftList = ref([]);
const myDraftPage = ref({ page: 1, pageSize: 5 });
const myDraftTotal = ref(0);

// 性别文字显示
const genderText = computed(() => {
  if (profileForm.value.gender === 0) return "男";
  if (profileForm.value.gender === 1) return "女";
  return "未知";
});

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}`;
};

// 去除HTML标签，只显示纯文本
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "");
};

// 处理头像上传请求
const handleAvatarUploadRequest = async (options) => {
  try {
    const res = await uploadAvatar(options.file);
    if (res.code === 200) {
      const avatarUrl = getFullImageUrl(res.data.url);
      profileForm.value.avatar = avatarUrl;

      // 记录上传的新头像
      uploadedAvatars.value.push(avatarUrl);

      ElMessage.success("上传成功");
    } else {
      ElMessage.error(res.msg || "上传失败");
    }
  } catch (err) {
    ElMessage.error("上传失败，请重试");
    console.error("头像上传失败:", err);
  }
};

// 处理头像上传成功
const handleAvatarUpload = (url) => {
  profileForm.value.avatar = url;

  // 记录上传的新头像
  uploadedAvatars.value.push(url);
};

// 清理旧头像
const cleanupOldAvatar = async () => {
  // 如果用户更换了头像，清理旧的头像
  if (originalAvatar.value && originalAvatar.value !== profileForm.value.avatar) {
    try {
      // 调用后端删除接口
      const res = await deleteImage([originalAvatar.value]);

      if (res.code === 200) {
      } else {
        console.error("清理旧头像失败:", res.msg);
      }
    } catch (err) {
      console.error("清理旧头像失败:", err);
    }
  }
};

// ==================================
// 加载资料
// 将相对路径转换为完整 URL
const getFullImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `http://localhost:8000${url}`;
};

// ==================================
const loadUserProfile = async () => {
  try {
    const res = await getCurrentUser();
    const user = res.data;
    const avatarUrl = getFullImageUrl(user.avatar);
    profileForm.value = {
      nickname: user.nickname || "",
      email: user.email || "",
      avatar: avatarUrl,
      intro: user.intro || "",
      gender: user.gender ?? 2,
      email_verified: user.email_verified || false,
    };
    // 保存原始头像URL
    originalAvatar.value = avatarUrl;
  } catch (err) {
    ElMessage.error("加载资料失败");
    console.error(err);
  }
};

// ==================================
// 保存资料
// ==================================
const updateProfile = async () => {
  if (!profileForm.value.nickname) {
    ElMessage.warning("请输入昵称");
    return;
  }

  if (profileForm.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    ElMessage.error("请输入正确的邮箱格式");
    return;
  }

  try {
    loading.value = true;
    // 处理头像 URL，确保发送完整 URL
    const profileData = { ...profileForm.value };
    // console.log("原始表单数据:", profileData);

    // 强制处理头像 URL
    if (profileData.avatar) {
      // console.log("原始头像 URL:", profileData.avatar);

      // 确保发送的是完整 URL（后端 URLField 要求）
      let avatarUrl = profileData.avatar;

      // 如果是相对路径，转换为完整 URL
      if (!avatarUrl.startsWith("http://") && !avatarUrl.startsWith("https://")) {
        // 确保路径以 / 开头
        if (!avatarUrl.startsWith("/")) {
          avatarUrl = "/" + avatarUrl;
        }
        // 添加后端地址前缀
        avatarUrl = `http://localhost:8000${avatarUrl}`;
      }

      // 对 URL 进行编码（处理空格等特殊字符）
      avatarUrl = encodeURI(avatarUrl);

      profileData.avatar = avatarUrl;
      // console.log("处理后的头像 URL:", profileData.avatar);
    }

    // console.log("发送到后端的数据:", profileData);

    // 测试用：直接打印发送的数据
    // console.log("发送的 avatar 字段:", profileData.avatar);

    await updateUserInfo(profileData);

    // 清理旧头像
    await cleanupOldAvatar();

    ElMessage.success("保存成功！");
    await loadUserProfile();
    isEditing.value = false;
  } catch (err) {
    ElMessage.error("保存失败");
  } finally {
    loading.value = false;
  }
};

// ==================================
// 加载收藏
// ==================================
const loadCollectList = async () => {
  try {
    collectLoading.value = true;
    const res = await getCollectArticleList({
      page: collectPage.value.page,
      page_size: collectPage.value.pageSize,
    });
    collectList.value = res.data?.results || [];
    collectTotal.value = res.data?.count || 0;
  } catch (err) {
    ElMessage.error("加载收藏失败");
  } finally {
    collectLoading.value = false;
  }
};

// ==================================
// 取消收藏
// ==================================
const cancelCollect = async (id) => {
  try {
    await ElMessageBox.confirm("确定取消收藏？");
    loading.value = true;
    await uncollectArticle(id);
    collectList.value = collectList.value.filter((article) => article.id !== id);
    ElMessage.success("取消成功！");
    loadCollectList();
  } catch (err) {
    ElMessage.error("操作失败");
    loadCollectList();
  } finally {
    loading.value = false;
  }
};

// ==================================
// 我的文章
// ==================================
const loadMyArticleList = async () => {
  try {
    myArticleLoading.value = true;
    const res = await getMyArticleList({
      page: myArticlePage.value.page,
      page_size: myArticlePage.value.pageSize,
    });
    // console.log("loadMyArticleList response:", res);
    // 尝试不同的响应结构
    if (res.data) {
      // 如果 res 有 data 字段
      myArticleList.value = res.data?.results || [];
      myTotal.value = res.data?.count || 0;
    } else {
      // 如果 res 直接是数据
      myArticleList.value = res.results || [];
      myTotal.value = res.count || 0;
    }
    // console.log("myArticleList:", myArticleList.value);
    // console.log("myTotal:", myTotal.value);
  } catch (err) {
    console.error("loadMyArticleList error:", err);
    ElMessage.error("加载我的文章失败");
  } finally {
    myArticleLoading.value = false;
  }
};

const deleteArticle = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除？");
    myArticleLoading.value = true;
    await deleteMyArticle(id);
    ElMessage.success("删除成功");
    // 直接重新加载文章列表，确保数据一致性
    await loadMyArticleList();
  } catch (e) {
    if (e !== "cancel" && e !== "close") ElMessage.error("删除失败");
  } finally {
    myArticleLoading.value = false;
  }
};

// ==================================
// 我的草稿
// ==================================
const loadMyDraftList = async () => {
  try {
    myDraftLoading.value = true;
    const res = await getMyDraftList({
      page: myDraftPage.value.page,
      page_size: myDraftPage.value.pageSize,
    });
    // console.log("loadMyDraftList response:", res);
    // 尝试不同的响应结构
    if (res.data) {
      // 如果 res 有 data 字段
      myDraftList.value = res.data?.results || [];
      myDraftTotal.value = res.data?.count || 0;
    } else {
      // 如果 res 直接是数据
      myDraftList.value = res.results || [];
      myDraftTotal.value = res.count || 0;
    }
    // console.log("myDraftList:", myDraftList.value);
    // console.log("myDraftTotal:", myDraftTotal.value);
  } catch (err) {
    console.error("loadMyDraftList error:", err);
    ElMessage.error("加载我的草稿失败");
  } finally {
    myDraftLoading.value = false;
  }
};

const deleteDraft = async (id) => {
  try {
    await ElMessageBox.confirm("确定删除草稿？");
    myDraftLoading.value = true;
    await deleteMyArticle(id);
    ElMessage.success("删除成功");
    // 直接重新加载草稿列表，确保数据一致性
    await loadMyDraftList();
  } catch (e) {
    if (e !== "cancel" && e !== "close") ElMessage.error("删除失败");
  } finally {
    myDraftLoading.value = false;
  }
};

// ==================================
// 修改密码
// ==================================
const handleChangePassword = async () => {
  if (
    !pwdForm.value.old_password ||
    !pwdForm.value.new_password ||
    !pwdForm.value.confirm_password
  ) {
    return ElMessage.warning("请填写完整");
  }
  if (pwdForm.value.new_password !== pwdForm.value.confirm_password) {
    return ElMessage.warning("两次密码不一致");
  }
  try {
    loading.value = true;
    await changePassword(pwdForm.value);
    ElMessage.success("修改成功，请重新登录");
    setTimeout(() => router.push("/login"), 1500);
  } catch (err) {
    ElMessage.error("修改失败");
  } finally {
    loading.value = false;
  }
};

// ==================================
// 退出 & 注销
// ==================================
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm("确定退出？");
    await logout();
    ElMessage.success("已退出");
    router.push("/");
  } catch {}
};

const confirmDeactivate = () => {
  deactivateConfirm.value = "";
  deactivateDialogVisible.value = true;
};

const handleDeactivateAccount = async () => {
  if (deactivateConfirm.value !== "确认注销") return ElMessage.error("请输入确认注销");
  try {
    loading.value = true;
    await deactivateAccount();
    ElMessage.success("账号已注销");
    logout();
    router.push("/");
  } finally {
    loading.value = false;
    deactivateDialogVisible.value = false;
  }
};

// ==================================
// 菜单切换
// ==================================
const handleMenuSelect = (index) => {
  activeMenu.value = index;
  if (index === "collect") loadCollectList();
  if (index === "myArticles") loadMyArticleList();
  if (index === "myDrafts") loadMyDraftList();
  if (index === "profile") loadUserProfile();
  if (index === "logout") handleLogout();
};

const goToArticleDetail = (id) => router.push(`/article/${id}`);
const goToEditArticle = (id) => router.push(`/edit-article/${id}`);
const goToPublishPage = () => router.push("/publish-article");
const goToHome = () => router.push("/");

// 发送邮箱验证邮件
const sendVerificationEmail = async () => {
  // 验证邮箱格式
  if (!profileForm.value.email) {
    ElMessage.error("请输入邮箱地址");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    ElMessage.error("请输入正确的邮箱格式");
    return;
  }

  try {
    loading.value = true;
    // console.log("发送验证邮件的邮箱地址:", profileForm.value.email);
    await sendEmailVerification({ email: profileForm.value.email });
    ElMessage.success("验证邮件已发送，请查收");
  } catch (err) {
    // console.log("发送验证邮件失败:", err);
    ElMessage.error(err.msg || "发送验证邮件失败");
  } finally {
    loading.value = false;
  }
};

// 验证邮箱
const verifyUserEmail = async (token) => {
  try {
    loading.value = true;
    await verifyEmail({ token });
    ElMessage.success("邮箱验证成功");
    await loadUserProfile();
  } catch (err) {
    ElMessage.error(err.msg || "邮箱验证失败");
  } finally {
    loading.value = false;
  }
};

// 检查URL参数，处理邮箱验证
onMounted(async () => {
  loadMyArticleList();
  await loadUserProfile();

  // 检查URL参数，处理邮箱验证
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  if (token) {
    await verifyUserEmail(token);
    // 移除URL参数，避免重复验证
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("token");
    window.history.replaceState({}, "", newUrl.toString());
  }
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  margin-top: 50px;
}
.profile-menu {
  height: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px 0;
}
</style>
