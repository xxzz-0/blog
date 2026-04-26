<template>
  <div class="article-detail">
    <NavBar />

    <!-- 密码输入弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="请输入访问密码" :close-on-click-modal="false">
      <el-input
        v-model="password"
        placeholder="请输入访问密码"
        type="password"
        autocomplete="new-password"
        name="article-access-password"
        @keyup.enter="verifyPassword"
      />
      <template #footer>
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="verifyPassword">确认</el-button>
      </template>
    </el-dialog>

    <div class="article-container" style="width: 1200px; margin: 0 auto; padding: 20px 0">
      <!-- 加载中状态 -->
      <div v-if="loading" style="text-align: center; padding: 100px 0">
        <el-icon class="is-loading" style="font-size: 32px; color: #409eff">
          <Loading />
        </el-icon>
        <p style="margin-top: 20px; color: #666">加载中...</p>
      </div>

      <!-- 文章内容 -->
      <div v-else-if="article" class="article-content-wrap">
        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta" style="margin: 15px 0; color: #666; font-size: 14px">
          <span>作者：{{ article.nickname || article.username || "匿名" }}</span>
          <span style="margin: 0 10px">|</span>
          <span>分类：{{ article.category_name || "未分类" }}</span>
          <span style="margin: 0 10px">|</span>
          <span>发布时间：{{ article.created_at }}</span>
          <span style="margin: 0 10px">|</span>
          <span>阅读：{{ article.view_count || 0 }}</span>
          <span style="margin: 0 10px">|</span>
          <span>点赞：{{ article.like_count || 0 }}</span>
          <span style="margin: 0 10px">|</span>
          <span>收藏：{{ article.collect_count || 0 }}</span>
        </div>

        <div class="article-actions" style="margin: 20px 0">
          <el-button
            :type="isLiked ? 'danger' : 'primary'"
            icon="el-icon-thumbs-up"
            @click="handleLikeToggle"
            :disabled="loading"
          >
            {{ isLiked ? "取消点赞" : "点赞" }}
          </el-button>

          <el-button
            :type="article.is_collected ? 'warning' : 'success'"
            icon="el-icon-star"
            @click="handleCollectToggle"
            :disabled="loading"
            style="margin-left: 10px"
          >
            {{ article.is_collected ? "取消收藏" : "收藏" }}
          </el-button>

          <el-button
            type="default"
            icon="el-icon-back"
            @click="$router.push('/')"
            style="margin-left: 10px"
          >
            返回列表
          </el-button>
        </div>

        <div
          class="article-content"
          style="
            line-height: 1.8;
            font-size: 16px;
            color: #333;
            padding: 20px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          "
          v-html="sanitizedContent"
        ></div>

        <div class="comment-section" style="margin-top: 40px">
          <h3>评论区</h3>

          <div style="margin: 20px 0">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="3"
              placeholder="写下你的评论..."
              maxlength="500"
              show-word-limit
            ></el-input>
            <el-button
              type="primary"
              style="margin-top: 10px"
              :loading="submittingComment"
              @click="submitComment"
            >
              发表评论
            </el-button>
          </div>

          <div
            v-if="replyTarget"
            style="margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 6px"
          >
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="2"
              placeholder="输入回复内容..."
            ></el-input>
            <div style="margin-top: 8px; display: flex; gap: 10px">
              <el-button type="primary" size="small" @click="submitReply(replyTarget)">
                提交回复
              </el-button>
              <el-button
                size="small"
                @click="
                  replyTarget = null;
                  replyContent = '';
                "
              >
                取消
              </el-button>
            </div>
          </div>

          <div class="comment-list">
            <div
              v-for="comment in commentList"
              :key="comment.uuid"
              style="padding: 15px; border-bottom: 1px solid #f2f2f2"
            >
              <div style="font-weight: bold">{{ comment.nickname || comment.username }}</div>
              <div style="margin: 5px 0; white-space: pre-wrap">{{ comment.content }}</div>
              <div style="font-size: 12px; color: #999">
                <span>{{ comment.created_at }}</span>
                <span style="margin-left: 10px">点赞：{{ comment.like_count }}</span>
              </div>

              <div style="margin-top: 8px; display: flex; gap: 10px">
                <el-button
                  size="small"
                  :type="comment.is_liked ? 'danger' : 'default'"
                  :disabled="likingComments.has(comment.uuid)"
                  @click="comment.is_liked ? doUnlikeComment(comment.uuid) : doLikeComment(comment.uuid)"
                >
                  {{ comment.is_liked ? "取消点赞" : "点赞" }}
                </el-button>
                <el-button size="small" @click="showReply(comment.uuid)"> 回复 </el-button>
                <el-button
                  v-if="currentUser && comment.nickname === currentUser.nickname"
                  size="small"
                  type="danger"
                  plain
                  @click="doDeleteComment(comment.uuid)"
                >
                  删除
                </el-button>
                <el-button
                  size="small"
                  type="warning"
                  plain
                  @click="showReportDialog(comment.uuid)"
                >
                  举报
                </el-button>
              </div>

              <div
                v-for="child in comment.children"
                :key="child.uuid"
                style="margin-left: 30px; padding: 10px 0; font-size: 14px"
              >
                <div style="font-weight: bold">{{ child.nickname || child.username }}</div>
                <div style="margin: 4px 0">{{ child.content }}</div>
                <div style="font-size: 12px; color: #999">
                  <span>{{ child.created_at }}</span>
                  <span style="margin-left: 10px">点赞：{{ child.like_count }}</span>
                </div>

                <div style="margin-top: 8px; display: flex; gap: 10px">
                  <el-button
                    size="small"
                    :type="child.is_liked ? 'danger' : 'default'"
                    :disabled="likingComments.has(child.uuid)"
                    @click="child.is_liked ? doUnlikeComment(child.uuid) : doLikeComment(child.uuid)"
                  >
                    {{ child.is_liked ? "取消点赞" : "点赞" }}
                  </el-button>
                  <el-button size="small" @click="showReply(child.uuid)">回复</el-button>
                  <el-button
                    v-if="currentUser && child.nickname === currentUser.nickname"
                    size="small"
                    type="danger"
                    plain
                    @click="doDeleteComment(child.uuid)"
                    >删除</el-button
                  >
                  <el-button
                    size="small"
                    type="warning"
                    plain
                    @click="showReportDialog(child.uuid)"
                  >
                    举报
                  </el-button>
                </div>

                <div
                  v-for="grandchild in child.children"
                  :key="grandchild.uuid"
                  style="margin-left: 60px; padding: 10px 0; font-size: 13px"
                >
                  <div style="font-weight: bold">
                    {{ grandchild.nickname || grandchild.username }}
                  </div>
                  <div style="margin: 4px 0">{{ grandchild.content }}</div>
                  <div style="font-size: 12px; color: #999">
                    <span>{{ grandchild.created_at }}</span>
                    <span style="margin-left: 10px">点赞：{{ grandchild.like_count }}</span>
                  </div>

                  <div style="margin-top: 8px; display: flex; gap: 10px">
                    <el-button
                    size="small"
                    :type="grandchild.is_liked ? 'danger' : 'default'"
                    :disabled="likingComments.has(grandchild.uuid)"
                    @click="grandchild.is_liked ? doUnlikeComment(grandchild.uuid) : doLikeComment(grandchild.uuid)"
                  >
                    {{ grandchild.is_liked ? "取消点赞" : "点赞" }}
                  </el-button>
                    <el-button size="small" @click="showReply(grandchild.uuid)">回复</el-button>
                    <el-button
                      v-if="currentUser && grandchild.nickname === currentUser.nickname"
                      size="small"
                      type="danger"
                      plain
                      @click="doDeleteComment(grandchild.uuid)"
                      >删除</el-button
                    >
                    <el-button
                      size="small"
                      type="warning"
                      plain
                      @click="showReportDialog(grandchild.uuid)"
                    >
                      举报
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <el-empty v-if="commentList.length === 0" description="暂无评论"></el-empty>
          </div>
        </div>
      </div>

      <el-dialog v-model="reportDialogVisible" title="举报评论" width="450px">
        <el-input
          v-model="reportReason"
          type="textarea"
          :rows="4"
          placeholder="请输入举报原因（不少于10个字）"
          maxlength="200"
          show-word-limit
        ></el-input>
        <div style="margin-top: 10px; text-align: right">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="submitReport">提交举报</el-button>
        </div>
      </el-dialog>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import { sanitizeHtml } from "@/utils/xss.js";
import {
  getArticleDetail,
  likeArticle,
  unlikeArticle,
  collectArticle,
  uncollectArticle,
} from "@/api/article";
import {
  getCommentList,
  createComment,
  replyComment,
  likeComment,
  unlikeComment,
  deleteComment,
  reportComment,
} from "@/api/comment";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const articleId = route.params.id;

// 初始化 Pinia store
const authStore = useAuthStore();

const article = ref(null);
const loading = ref(false);
const isLiked = ref(false);
const passwordDialogVisible = ref(false);
const password = ref("");
const needPassword = ref(false);

// 计算属性
const currentUser = computed(() => authStore.currentUser);
const isLogin = computed(() => authStore.isLoggedIn);

// 净化后的文章内容（防止 XSS）
const sanitizedContent = computed(() => {
  if (!article.value?.content) return "";

  // 先净化 HTML
  let content = sanitizeHtml(article.value.content);

  // 修复图片 URL，确保是完整的绝对路径
  content = content.replace(/<img([^>]*?)src="([^"]+)"([^>]*?)>/g, (match, before, src, after) => {
    // 如果是相对路径，添加后端服务器地址
    if (src && !src.startsWith("http://") && !src.startsWith("https://")) {
      // 使用后端服务器地址
      const baseUrl = "http://localhost:8000";
      const newSrc = `${baseUrl}${src}`;
      return `<img${before}src="${newSrc}"${after}>`;
    }

    return match;
  });

  return content;
});

const commentList = ref([]);
const commentContent = ref("");
const replyContent = ref("");
const replyTarget = ref(null);
const submittingComment = ref(false);

const reportDialogVisible = ref(false);
const reportTargetUuid = ref("");
const reportReason = ref("");

// 获取当前用户信息
const loadCurrentUser = async () => {
  // 直接强制刷新登录状态，确保获取最新的登录信息
  await authStore.getLoginState(true);
};

onMounted(async () => {
  await loadCurrentUser();
  // 页面加载时自动请求文章
  if (articleId) {
    loadArticleDetail();
  }
});

const loadArticleDetail = async (params = {}) => {
  try {
    // 重置状态
    article.value = null;
    needPassword.value = false;
    loading.value = true;

    const res = await getArticleDetail(articleId, params);
    if (res.code === 200) {
      article.value = res.data;
      // ✅ 关键修复：同步点赞和收藏状态
      isLiked.value = !!article.value.is_liked;
      article.value.is_collected = !!article.value.is_collected;
      needPassword.value = false;
      // 加载成功后关闭密码框
      passwordDialogVisible.value = false;
      // 加载评论
      loadCommentList();
    } else if (res.code === 403) {
      // 需要密码访问，显示密码输入框（不报错）
      needPassword.value = true;
      passwordDialogVisible.value = true;
      // 不显示错误消息，让用户输入密码
    }
  } catch (e) {
    if (e.response?.status === 403) {
      // 需要密码访问，显示密码输入框（不报错）
      needPassword.value = true;
      passwordDialogVisible.value = true;
      // 不显示错误消息，让用户输入密码
    } else {
      ElMessage.error("加载失败");
    }
  } finally {
    loading.value = false;
  }
};

// 验证密码
const verifyPassword = async () => {
  if (!password.value) {
    ElMessage.warning("请输入密码");
    return;
  }
  await loadArticleDetail({ password: password.value });
};

// 返回上一页
const goBack = () => {
  router.push("/");
};

const handleLikeToggle = async () => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  try {
    if (isLiked.value) {
      await unlikeArticle(articleId);
      isLiked.value = false;
      article.value.like_count--;
      ElMessage.success("取消点赞成功");
    } else {
      await likeArticle(articleId);
      isLiked.value = true;
      article.value.like_count++;
      ElMessage.success("点赞成功");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const handleCollectToggle = async () => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  try {
    if (article.value.is_collected) {
      await uncollectArticle(articleId);
      article.value.is_collected = false;
      article.value.collect_count--;
      ElMessage.success("已取消收藏");
    } else {
      await collectArticle(articleId);
      article.value.is_collected = true;
      article.value.collect_count++;
      ElMessage.success("收藏成功");
    }
  } catch (e) {
    ElMessage.error("操作失败");
  }
};

const loadCommentList = async () => {
  try {
    const res = await getCommentList(articleId);
    if (res?.code === 200 && res.data?.results) {
      // 只显示已显示的评论
      commentList.value = res.data.results.filter((comment) => comment.is_show !== false);
    } else {
      commentList.value = [];
    }
  } catch (err) {
    console.error(err);
    ElMessage.error("加载评论失败");
  }
};

const submitComment = async () => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  if (!commentContent.value.trim()) return ElMessage.warning("请输入评论");
  submittingComment.value = true;
  try {
    await createComment({
      article_id: articleId,
      content: commentContent.value,
    });
    ElMessage.success("评论成功");
    commentContent.value = "";
    loadCommentList();
  } catch (e) {
    ElMessage.error("评论失败");
  } finally {
    submittingComment.value = false;
  }
};

const showReply = (uuid) => {
  replyTarget.value = uuid;
  replyContent.value = "";
};

const submitReply = async (uuid) => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  if (!replyContent.value.trim()) return ElMessage.warning("请输入回复内容");

  try {
    await replyComment(uuid, replyContent.value);
    ElMessage.success("回复成功");
    replyContent.value = "";
    replyTarget.value = null;
    loadCommentList();
  } catch (e) {
    console.error(e);
    ElMessage.error("回复失败，最多支持三级评论");
  }
};

// 评论点赞操作状态
const likingComments = ref(new Set());

const doLikeComment = async (uuid) => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  
  // 防止重复操作
  if (likingComments.value.has(uuid)) return;
  
  try {
    likingComments.value.add(uuid);
    await likeComment(uuid);
    ElMessage.success("点赞成功");
    
    // 直接更新前端状态，避免重新加载评论列表
    updateCommentLikeStatus(uuid, true);
  } catch (e) {
    if (e.response?.data?.msg?.includes("你已为该评论点赞")) {
      ElMessage.info("你已经点过赞了");
    } else {
      ElMessage.error("操作失败");
    }
  } finally {
    likingComments.value.delete(uuid);
  }
};

const doUnlikeComment = async (uuid) => {
  if (!isLogin.value) return ElMessage.warning("请登录");
  
  // 防止重复操作
  if (likingComments.value.has(uuid)) return;
  
  try {
    likingComments.value.add(uuid);
    await unlikeComment(uuid);
    ElMessage.success("已取消点赞");
    
    // 直接更新前端状态，避免重新加载评论列表
    updateCommentLikeStatus(uuid, false);
  } catch (e) {
    ElMessage.error("取消点赞失败");
  } finally {
    likingComments.value.delete(uuid);
  }
};

// 更新评论点赞状态和计数
const updateCommentLikeStatus = (uuid, isLiked) => {
  const updateComment = (comment) => {
    if (comment.uuid === uuid) {
      comment.is_liked = isLiked;
      comment.like_count += isLiked ? 1 : -1;
      return true;
    }
    if (comment.children) {
      for (const child of comment.children) {
        if (updateComment(child)) return true;
      }
    }
    return false;
  };
  
  for (const comment of commentList.value) {
    if (updateComment(comment)) break;
  }
};

const doDeleteComment = async (uuid) => {
  try {
    await ElMessageBox.confirm("确定删除该评论？");
    await deleteComment(uuid);
    ElMessage.success("删除成功");
    loadCommentList();
  } catch (err) {
    ElMessage.info("已取消删除");
  }
};

const showReportDialog = (uuid) => {
  if (!isLogin.value) {
    ElMessage.warning("请先登录");
    return;
  }
  reportTargetUuid.value = uuid;
  reportReason.value = "";
  reportDialogVisible.value = true;
};

const submitReport = async () => {
  const reason = reportReason.value.trim();
  if (!reason || reason.length < 10) {
    ElMessage.warning("举报原因不能为空且不少于10个字");
    return;
  }

  try {
    await reportComment(reportTargetUuid.value, {
      reason: reason,
      type: "spam",
    });

    ElMessage.success("举报提交成功，评论已隐藏");
    reportDialogVisible.value = false;
    await loadCommentList();
  } catch (e) {
    ElMessage.error("举报失败：" + (e.response?.data?.msg || "系统错误"));
  }
};
</script>

<style scoped></style>
