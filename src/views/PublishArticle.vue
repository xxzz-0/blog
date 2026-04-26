<template>
  <div class="edit-container">
    <div class="page-header">
      <h2>发布文章</h2>
      <p class="subtitle">创作并分享您的文章内容</p>
    </div>

    <div v-loading="loading" element-loading-text="提交中..." class="form-wrapper">
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules" class="article-form">
        <!-- 标题 -->
        <el-form-item label="文章标题" prop="title">
          <el-input
            v-model="form.title"
            maxlength="200"
            show-word-limit
            placeholder="请输入文章标题（至少5个字符）"
            size="large"
          />
        </el-form-item>

        <!-- 分类和标签并排 -->
        <div class="form-row">
          <el-form-item label="文章分类" prop="category" class="flex-item">
            <el-select
              v-model="form.category"
              placeholder="选择分类"
              size="large"
              style="width: 100%"
            >
              <template v-for="item in categoryList" :key="item?.id || Math.random()">
                <el-option v-if="item && item.id" :label="item.name" :value="item.id" />
              </template>
            </el-select>
          </el-form-item>

          <el-form-item label="文章标签" prop="tags" class="flex-item">
            <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" size="large" />
          </el-form-item>
        </div>

        <!-- 封面图上传 -->
        <el-form-item label="封面图片" prop="cover">
          <div class="cover-upload-wrapper">
            <ImageUpload
              :http-request="handleCoverUploadRequest"
              :imageUrl="form.cover"
              :disabled="loading"
              class="cover-uploader"
            />
            <div class="upload-tips">
              <p>建议尺寸：1200 × 600 px</p>
              <p>支持格式：JPG、PNG</p>
              <p>文件大小：不超过 2MB</p>
            </div>
          </div>
        </el-form-item>

        <!-- 文章设置 -->
        <el-form-item label="文章设置">
          <div class="article-settings">
            <!-- 置顶选项 -->
            <el-checkbox v-model="form.is_top" class="setting-item">
              <el-icon><Top /></el-icon>
              <span>置顶文章</span>
            </el-checkbox>

            <!-- 私密选项 -->
            <el-checkbox v-model="form.is_private" class="setting-item">
              <el-icon><Lock /></el-icon>
              <span>私密文章</span>
            </el-checkbox>

            <!-- 密码输入 -->
            <el-form-item v-if="form.is_private" prop="password" class="password-input">
              <el-input
                v-model="form.password"
                placeholder="请输入访问密码"
                size="large"
                style="width: 300px"
              />
            </el-form-item>

            <!-- 定时发布 -->
            <el-checkbox v-model="form.is_scheduled" class="setting-item">
              <el-icon><Clock /></el-icon>
              <span>定时发布</span>
            </el-checkbox>

            <!-- 定时发布时间 -->
            <el-form-item v-if="form.is_scheduled" prop="scheduled_publish_time" class="time-input">
              <el-date-picker
                v-model="form.scheduled_publish_time"
                type="datetime"
                placeholder="选择发布时间"
                size="large"
                style="width: 300px"
                :disabled="loading"
              />
            </el-form-item>
          </div>
        </el-form-item>

        <!-- 文章内容编辑器 -->
        <el-form-item label="文章内容" prop="content" class="content-item">
          <div class="editor-box">
            <!-- 工具栏 -->
            <div class="editor-toolbar">
              <el-button type="primary" size="small" @click="insertImage" class="toolbar-btn">
                <el-icon><Picture /></el-icon>
                <span>插入图片</span>
              </el-button>
            </div>
            <!-- 编辑器 -->
            <div
              contenteditable
              class="rich-editor"
              @input="handleContentInput"
              @blur="handleContentInput"
              @paste="handlePaste"
              @keydown="handleKeyDown"
              ref="contentEditor"
              placeholder="请输入文章内容，支持直接粘贴图片..."
            ></div>
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="action-buttons">
          <el-button type="primary" @click="submitArticle" :loading="loading" size="large">
            <el-icon><Check /></el-icon>
            发布文章
          </el-button>
          <el-button type="info" @click="saveDraft" :loading="loading" size="large">
            <el-icon><Document /></el-icon>
            保存草稿
          </el-button>
          <el-button @click="goBack" size="large">
            <el-icon><Close /></el-icon>
            取消返回
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      title="插入图片"
      width="500px"
      class="image-dialog"
      destroy-on-close
    >
      <div class="dialog-content">
        <el-upload
          class="image-uploader"
          :http-request="handleContentImageUpload"
          :show-file-list="false"
          :before-upload="beforeImageUpload"
          drag
        >
          <img v-if="previewImageUrl" :src="previewImageUrl" class="preview-image" />
          <div v-else class="upload-area">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">
              <p>将图片拖到此处，或<em>点击上传</em></p>
              <p class="upload-hint">支持 JPG、PNG 格式，大小不超过 2MB</p>
            </div>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="imageDialogVisible = false" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="confirmInsertImage"
            :disabled="!previewImageUrl"
            size="large"
          >
            插入图片
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Picture, Check, Close, Upload, Top, Lock, Clock } from "@element-plus/icons-vue";
import {
  getCategoryList,
  createArticle,
  uploadCover,
  uploadContentImage,
  deleteImage,
} from "@/api/article";
import { getLoginState } from "@/utils/auth";
import request from "@/utils/request";
import ImageUpload from "@/components/ImageUpload.vue";

const router = useRouter();
const loading = ref(false);
const formRef = ref(null);
const contentEditor = ref(null);

// 表单数据
const form = ref({
  title: "",
  category: "",
  tags: "",
  cover: "",
  content: "",
  is_top: false, // 是否置顶
  is_private: false, // 是否私密
  password: "", // 访问密码
  is_scheduled: false, // 是否定时发布
  scheduled_publish_time: "", // 定时发布时间
  mentioned_users: [], // @提及的用户ID列表
});

// 用于存储编辑器内容的非响应式变量
let editorContent = "";

// 分类列表
const categoryList = ref([]);
const imageDialogVisible = ref(false);
const previewImageUrl = ref("");
const uploadedImageUrl = ref("");

// 追踪上传但未使用的图片（用于清理）
const uploadedImages = ref([]);

// 表单校验规则
const rules = {
  title: [
    { required: true, message: "请输入文章标题", trigger: "blur" },
    { min: 5, message: "标题长度不能少于5个字符", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择文章分类", trigger: "change" }],
  content: [{ required: true, message: "请输入文章内容", trigger: "blur" }],
  password: [
    {
      required: (rule, value, callback) => {
        if (form.value.is_private && !value) {
          callback(new Error("私密文章必须设置访问密码"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  scheduled_publish_time: [
    {
      required: (rule, value, callback) => {
        if (form.value.is_scheduled && !value) {
          callback(new Error("定时发布必须设置发布时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
};

// 加载分类
const loadCategory = async () => {
  try {
    const res = await getCategoryList();
    // 确保正确处理响应结构，支持分页格式
    if (res.code === 200) {
      categoryList.value = res.data?.results || res.data || [];
    } else {
      categoryList.value = res.results || res.data || res || [];
    }
    console.log("分类列表:", categoryList.value);
    if (categoryList.value.length > 0) {
      form.value.category = categoryList.value[0].id;
    }
  } catch (err) {
    console.error("获取分类列表失败：", err);
    ElMessage.error("获取分类列表失败");
    categoryList.value = [];
  }
};

// 处理按键事件，检测@键
const handleKeyDown = (e) => {
  if (e.key === "@") {
    // 插入@符号
    if (contentEditor.value) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(document.createTextNode("@"));
        range.setStartAfter(range.endContainer);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
};

// 处理封面上传请求
const handleCoverUploadRequest = async (options) => {
  try {
    const res = await uploadCover(options.file);
    if (res.code === 200) {
      const url = res.data.url;
      // 转换为绝对路径，用于前端显示
      const absoluteUrl = url.startsWith("http") ? url : `http://localhost:8000${url}`;
      form.value.cover = absoluteUrl;
      // 记录上传的图片（使用绝对路径用于清理）
      uploadedImages.value.push({
        url: absoluteUrl,
        fileId: res.data.image_id,
      });
      ElMessage.success("封面上传成功");
    } else {
      ElMessage.error(res.msg || "上传失败");
    }
  } catch (err) {
    ElMessage.error("上传失败，请重试");
    console.error("封面上传失败:", err);
  }
};

// 处理内容输入（增强：直接从ref读取，避免e.target问题）
const handleContentInput = () => {
  if (contentEditor.value) {
    editorContent = contentEditor.value.innerHTML;
    // 不再直接更新 form.content，避免 v-html 重新渲染导致光标重置
    // form.value.content = editorContent;
  }
};

// 处理粘贴事件（支持粘贴图片）
const handlePaste = async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 检查是否是图片
    if (item.type.indexOf("image") !== -1) {
      e.preventDefault(); // 阻止默认粘贴行为

      const blob = item.getAsFile();
      if (!blob) continue;

      // 创建 File 对象
      const file = new File([blob], `pasted-image-${Date.now()}.png`, {
        type: blob.type,
      });

      try {
        // 上传图片
        const res = await uploadContentImage(file);
        if (res.code === 200) {
          const url = res.data.url;
          // 插入时使用完整的绝对路径，这样在编辑器中就能正确显示
          const imageUrl = url.startsWith("http") ? url : `http://localhost:8000${url}`;

          // 记录上传的图片（用于后续清理）
          uploadedImages.value.push({
            url: imageUrl,
            fileId: res.data.image_id,
          });

          // 插入图片到编辑器
          const imgHtml = `<img src="${imageUrl}" style="max-width: 100%; margin: 10px 0; border-radius: 4px;" />`;

          if (contentEditor.value) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = imgHtml;
              const imgNode = tempDiv.firstChild;
              range.insertNode(imgNode);
              range.setStartAfter(imgNode);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            } else {
              contentEditor.value.innerHTML += imgHtml;
            }
            // 更新非响应式变量
            editorContent = contentEditor.value.innerHTML;
            // 不再更新 form.content，避免 v-html 重新渲染导致光标重置
            // form.value.content = editorContent;
            console.log("handlePaste: editorContent updated", editorContent);
          }

          ElMessage.success("图片粘贴成功");
        } else {
          ElMessage.error(res.msg || "图片上传失败");
        }
      } catch (err) {
        console.error("粘贴图片上传失败:", err);
        ElMessage.error("图片上传失败，请重试");
      }

      break; // 只处理第一个图片
    }
  }
};

// 打开插入图片对话框
const insertImage = () => {
  previewImageUrl.value = "";
  uploadedImageUrl.value = "";
  imageDialogVisible.value = true;
};

// 图片上传前校验
const beforeImageUpload = (file) => {
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("只能上传JPG/PNG图片");
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过2MB");
  }
  return isJPG && isLt2M;
};

// 处理内容图片上传
const handleContentImageUpload = async (options) => {
  try {
    const res = await uploadContentImage(options.file);
    if (res.code === 200) {
      const url = res.data.url;
      uploadedImageUrl.value = url; // 直接使用后端返回的相对路径
      previewImageUrl.value = url.startsWith("http") ? url : `http://localhost:8000${url}`;

      // 记录上传的图片（使用绝对路径用于清理）
      const absoluteUrl = url.startsWith("http") ? url : `http://localhost:8000${url}`;
      uploadedImages.value.push({
        url: absoluteUrl,
        fileId: res.data.image_id,
      });

      ElMessage.success("图片上传成功");
    } else {
      ElMessage.error(res.msg || "上传失败");
    }
  } catch (err) {
    ElMessage.error("上传失败，请重试");
    console.error("图片上传失败:", err);
  }
};

// 确认插入图片到编辑器
const confirmInsertImage = () => {
  if (!uploadedImageUrl.value) {
    ElMessage.warning("请先上传图片");
    return;
  }

  console.log("confirmInsertImage called, contentEditor.value:", contentEditor.value);
  // 插入时使用完整的绝对路径，这样在编辑器中就能正确显示
  const imageUrl = uploadedImageUrl.value.startsWith("http")
    ? uploadedImageUrl.value
    : `http://localhost:8000${uploadedImageUrl.value}`;
  const imgHtml = `<img src="${imageUrl}" style="max-width: 100%; margin: 10px 0; border-radius: 4px;" />`;
  console.log("imgHtml:", imgHtml);

  // 直接更新编辑器的 DOM
  if (contentEditor.value) {
    // 直接追加图片到编辑器内容
    contentEditor.value.innerHTML += imgHtml;
    // 更新非响应式变量
    editorContent = contentEditor.value.innerHTML;
    console.log("confirmInsertImage: editorContent updated", editorContent);
  } else {
    console.error("contentEditor is null, cannot insert image");
  }

  imageDialogVisible.value = false;
  previewImageUrl.value = "";
  uploadedImageUrl.value = "";
  ElMessage.success("图片插入成功");
};

// 处理用户列表点击事件
const handleUserListClick = (event) => {
  const userItem = event.target.closest(".user-item");
  if (userItem) {
    const userId = parseInt(userItem.dataset.userId);
    const userNickname = userItem.dataset.userNickname;
    const user = { id: userId, nickname: userNickname };
    console.log("点击用户:", user);
    selectUser(user);
  }
};

// 选择用户
const selectUser = (user) => {
  console.log("选择用户:", user);
  if (contentEditor.value) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      // 找到最后一个@符号的位置
      const range = selection.getRangeAt(0);
      const textNode = range.startContainer;
      const text = textNode.textContent;
      const atIndex = text.lastIndexOf("@");

      if (atIndex !== -1) {
        // 创建新的文本节点，替换@符号后的内容
        const newText = text.substring(0, atIndex) + `@${user.nickname} `;
        const newTextNode = document.createTextNode(newText);

        // 替换文本节点
        textNode.parentNode.replaceChild(newTextNode, textNode);

        // 将用户ID添加到mentioned_users数组
        if (!form.value.mentioned_users.includes(user.id)) {
          form.value.mentioned_users.push(user.id);
          console.log("添加用户到mentioned_users:", user.id);
        }

        // 移动光标到@用户后面
        const newRange = document.createRange();
        newRange.setStartAfter(newTextNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        // 隐藏用户列表
        showUserList.value = false;
        console.log("隐藏用户列表");

        // 更新编辑器内容
        editorContent = contentEditor.value.innerHTML;
        console.log("更新编辑器内容");
      }
    }
  }
};

// 提取内容中实际使用的图片URL
const extractUsedImages = (content) => {
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  const usedUrls = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    usedUrls.push(match[1]);
  }
  return usedUrls;
};

// 清理未使用的图片
const cleanupUnusedImages = async () => {
  // 获取内容中实际使用的图片
  const usedInContent = extractUsedImages(editorContent);

  // 合并封面图（如果有的话）
  const allUsedImageUrls = [...usedInContent];
  if (form.value.cover) {
    allUsedImageUrls.push(form.value.cover);
  }

  // 找出未使用的图片
  const unusedImages = uploadedImages.value.filter((img) => {
    if (typeof img === "string") {
      return !allUsedImageUrls.includes(img);
    } else {
      return !allUsedImageUrls.includes(img.url);
    }
  });

  // 提取未使用的图片URLs
  const unusedImageUrls = unusedImages.map(img => {
    if (typeof img === "string") {
      return img;
    } else {
      return img.url;
    }
  });

  // 删除未使用的图片
  if (unusedImageUrls.length > 0) {
    try {
      await deleteImage(unusedImageUrls);
    } catch (err) {
      console.error("删除未使用图片失败:", err);
    }
  }

  // 更新已上传列表，只保留使用的图片
  uploadedImages.value = uploadedImages.value.filter((img) => {
    if (typeof img === "string") {
      return allUsedImageUrls.includes(img);
    } else {
      return allUsedImageUrls.includes(img.url);
    }
  });
};

// 提交文章
const submitArticle = async () => {
  try {
    loading.value = true;

    console.log("submitArticle called");
    // 提交前从 DOM 读取最新内容，确保包含用户输入和插入的图片
    if (contentEditor.value) {
      editorContent = contentEditor.value.innerHTML;
      form.value.content = editorContent;
      console.log("editorContent from DOM:", editorContent);
    }
    console.log("form.value.content before validate:", form.value.content);

    // 校验
    await formRef.value.validate();

    const content = form.value.content.trim();

    // 使用表单中的mentioned_users数组
    const articleData = {
      title: form.value.title.trim(),
      category: form.value.category,
      tags: form.value.tags.trim(),
      content: content,
      is_top: form.value.is_top,
      is_private: form.value.is_private,
      password: form.value.password.trim(),
      is_scheduled: form.value.is_scheduled,
      scheduled_publish_time: form.value.scheduled_publish_time,
      mentioned_users: form.value.mentioned_users,
    };

    // 处理定时发布时间格式
    if (form.value.is_scheduled && form.value.scheduled_publish_time) {
      // 如果是Date对象，转换为ISO格式字符串
      if (form.value.scheduled_publish_time instanceof Date) {
        articleData.scheduled_publish_time = form.value.scheduled_publish_time.toISOString();
      }
    } else {
      // 如果没有设置定时发布，设置为null
      articleData.scheduled_publish_time = null;
    }

    if (form.value.cover.trim()) {
      // 保留完整的URL，后端URLField需要完整的URL
      articleData.cover = form.value.cover.trim();
    }

    const res = await createArticle(articleData);
    if ([200, 201].includes(res.code || res.status)) {
      // 清理未使用的图片
      await cleanupUnusedImages();

      ElMessage.success("文章发布成功！文章将在5分钟后可在搜索中找到");
      setTimeout(() => router.push("/profile"), 1500);
    } else {
      ElMessage.warning(res.msg || "发布失败");
    }
  } catch (e) {
    if (e !== false) {
      console.error("发布文章失败：", e);
      ElMessage.error("发布失败");
    }
  } finally {
    loading.value = false;
  }
};

// 保存草稿
const saveDraft = async () => {
  try {
    loading.value = true;

    // 保存前从 DOM 读取最新内容
    if (contentEditor.value) {
      editorContent = contentEditor.value.innerHTML;
      form.value.content = editorContent;
    }

    // 校验（草稿可以不校验标题和内容）
    const articleData = {
      title: form.value.title.trim() || "无标题草稿",
      category: form.value.category || null,
      tags: form.value.tags.trim(),
      content: form.value.content || "<p>草稿内容</p>",
      is_top: form.value.is_top,
      is_private: form.value.is_private,
      password: form.value.password.trim(),
      is_scheduled: form.value.is_scheduled,
      scheduled_publish_time: form.value.scheduled_publish_time,
      mentioned_users: form.value.mentioned_users,
      status: "draft", // 设置为草稿状态
    };

    // 处理定时发布时间格式
    if (form.value.is_scheduled && form.value.scheduled_publish_time) {
      if (form.value.scheduled_publish_time instanceof Date) {
        articleData.scheduled_publish_time = form.value.scheduled_publish_time.toISOString();
      }
    } else {
      articleData.scheduled_publish_time = null;
    }

    if (form.value.cover.trim()) {
      articleData.cover = form.value.cover.trim();
    }

    const res = await createArticle(articleData);
    if ([200, 201].includes(res.code || res.status)) {
      ElMessage.success("草稿保存成功！");
      setTimeout(() => router.push("/profile"), 1500);
    } else {
      ElMessage.warning(res.msg || "保存草稿失败");
    }
  } catch (e) {
    if (e !== false) {
      console.error("保存草稿失败：", e);
      ElMessage.error("保存草稿失败");
    }
  } finally {
    loading.value = false;
  }
};

const goBack = async () => {
  // 清理未使用的图片
  await cleanupUnusedImages();
  router.push("/profile");
};

onMounted(async () => {
  await loadCategory();

  nextTick(() => {
    if (contentEditor.value) {
      contentEditor.value.innerHTML = "";
      // 🔴 修复4：初始化时同步清空editorContent
      editorContent = "";
    }
  });
});
</script>

<style scoped>
/* 编辑页面样式 */
.edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  font-size: 28px;
  color: #333;
  margin: 0 0 10px 0;
  font-weight: 600;
  transition: color 0.3s ease;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin: 0;
  transition: color 0.3s ease;
}

.form-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.article-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #666;
  transition: color 0.3s ease;
}

.form-row {
  display: flex;
  gap: 20px;
}

.flex-item {
  flex: 1;
}

/* 封面图上传样式 */
.cover-upload-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.cover-uploader :deep(.image-upload) {
  width: 300px;
  height: 180px;
}

.cover-uploader :deep(.upload-icon),
.cover-uploader :deep(.image) {
  width: 300px;
  height: 180px;
  border-radius: 8px;
}

.upload-tips {
  color: #666;
  font-size: 13px;
  line-height: 1.8;
  transition: color 0.3s ease;
}

.upload-tips p {
  margin: 0;
}

/* 编辑器样式 */
.content-item :deep(.el-form-item__content) {
  width: 100%;
}

.editor-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  position: relative;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

/* @用户列表样式 */
.at-user-list {
  position: absolute;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
}

.user-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background-color: #f5f5f5;
}

.dark .at-user-list {
  background: #1e1e1e;
  border-color: #333;
}

.dark .user-item:hover {
  background-color: #252525;
  color: #e0e0e0;
}

/* @用户样式 */
.rich-editor .at-user {
  color: #409eff;
  font-weight: 500;
  cursor: pointer;
}

.rich-editor .at-user:hover {
  text-decoration: underline;
}

.editor-toolbar {
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  transition:
    background-color 0.3s ease,
    border-bottom-color 0.3s ease;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rich-editor {
  min-height: 200px;
  max-height: 600px;
  padding: 20px;
  outline: none;
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  overflow-y: auto;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
}

.rich-editor:focus {
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.rich-editor:empty:before {
  content: attr(placeholder);
  color: #999;
  transition: color 0.3s ease;
}

.rich-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* 操作按钮 */
.action-buttons {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  transition: border-top-color 0.3s ease;
}

.action-buttons :deep(.el-form-item__content) {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-buttons .el-button {
  padding: 12px 30px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图片对话框样式 */
:deep(.image-dialog .el-dialog__header) {
  border-bottom: 1px solid #e0e0e0;
  padding: 20px;
  margin: 0;
  transition: border-bottom-color 0.3s ease;
}

:deep(.image-dialog .el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
  color: #333;
  transition: color 0.3s ease;
}

.dialog-content {
  padding: 20px;
}

.image-uploader :deep(.el-upload) {
  width: 100%;
}

.image-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 300px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.image-uploader :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

.upload-area {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #999;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.upload-text p {
  margin: 0;
  color: #666;
  font-size: 16px;
  transition: color 0.3s ease;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-hint {
  margin-top: 8px !important;
  font-size: 13px !important;
  color: #999 !important;
  transition: color 0.3s ease;
}

.preview-image {
  max-width: 100%;
  max-height: 280px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  transition: border-top-color 0.3s ease;
}

/* 暗黑模式 */
.dark .edit-container {
  background-color: #121212;
  transition: background-color 0.3s ease;
}

.dark .page-header h2 {
  color: #e0e0e0;
  transition: color 0.3s ease;
}

.dark .subtitle {
  color: #999;
  transition: color 0.3s ease;
}

.dark .form-wrapper {
  background: #1e1e1e;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease;
}

.dark .article-form :deep(.el-form-item__label) {
  color: #999;
  transition: color 0.3s ease;
}

.dark .upload-tips {
  color: #999;
  transition: color 0.3s ease;
}

.dark .editor-box {
  background: #1e1e1e;
  border-color: #333;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.dark .editor-toolbar {
  background: #1e1e1e;
  border-bottom-color: #333;
  transition:
    background-color 0.3s ease,
    border-bottom-color 0.3s ease;
}

.dark .rich-editor {
  color: #e0e0e0;
  background-color: #1e1e1e;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
}

.dark .rich-editor:focus {
  background-color: #252525;
  transition: background-color 0.3s ease;
}

.dark .rich-editor:empty:before {
  color: #666;
  transition: color 0.3s ease;
}

.dark .action-buttons {
  border-top-color: #333;
  transition: border-top-color 0.3s ease;
}

.dark :deep(.image-dialog .el-dialog__header) {
  border-bottom-color: #333;
  transition: border-bottom-color 0.3s ease;
}

.dark :deep(.image-dialog .el-dialog__title) {
  color: #e0e0e0;
  transition: color 0.3s ease;
}

.dark .image-uploader :deep(.el-upload-dragger) {
  border-color: #333;
  transition: border-color 0.3s ease;
}

.dark .upload-icon {
  color: #666;
  transition: color 0.3s ease;
}

.dark .upload-text p {
  color: #999;
  transition: color 0.3s ease;
}

.dark .upload-hint {
  color: #666 !important;
  transition: color 0.3s ease;
}

.dark .dialog-footer {
  border-top-color: #333;
  transition: border-top-color 0.3s ease;
}

/* 文章设置样式 */
.article-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333;
  transition: color 0.3s ease;
}

.setting-item :deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 0;
  font-size: 15px;
}

.password-input,
.time-input {
  margin-left: 32px;
  margin-top: 8px;
}

/* 暗黑模式下的文章设置样式 */
.dark .article-settings {
  background: #252525;
  transition: background-color 0.3s ease;
}

.dark .setting-item {
  color: #e0e0e0;
  transition: color 0.3s ease;
}

/* 响应式 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .cover-upload-wrapper {
    flex-direction: column;
  }

  .cover-uploader :deep(.image-upload),
  .cover-uploader :deep(.upload-icon),
  .cover-uploader :deep(.image) {
    width: 100%;
    height: 200px;
  }

  .action-buttons :deep(.el-form-item__content) {
    flex-direction: column;
  }

  .password-input,
  .time-input {
    margin-left: 0;
  }

  .article-settings {
    padding: 12px;
  }
}
</style>
