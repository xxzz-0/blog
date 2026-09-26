<template>
  <!-- 折叠态：悬浮按钮 -->
  <div v-if="!isOpen" class="rag-fab" title="AI 问答助手" @click="openPanel">
    <el-icon :size="26"><ChatDotRound /></el-icon>
    <span class="rag-fab-label">AI 问答</span>
  </div>

  <!-- 展开态：聊天面板 -->
  <div v-else class="rag-panel">
    <!-- 会话侧边栏 -->
    <div class="rag-sidebar">
      <button class="rag-new-session-btn" @click="newConversation">
        <el-icon :size="14"><Plus /></el-icon>
        <span>新建对话</span>
      </button>
      <div class="rag-session-list">
        <div v-if="sessions.length === 0" class="rag-session-empty">暂无历史会话</div>
        <div
          v-for="s in sessions"
          :key="s.id"
          :class="['rag-session-item', { active: s.id === currentSessionId }]"
          @click="switchSession(s.id)"
        >
          <span class="rag-session-title" :title="s.title">{{ s.title }}</span>
          <span class="rag-session-time">{{ s.updated_at }}</span>
          <el-icon class="rag-session-del" :size="13" @click.stop="removeSession(s.id)">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 右侧聊天主区 -->
    <div class="rag-main">
      <!-- 头部 -->
      <div class="rag-header">
        <div class="rag-title">
          <el-icon :size="18"><ChatDotRound /></el-icon>
          <span>AI 问答助手</span>
        </div>
        <div class="rag-header-actions">
          <el-tooltip content="清空对话" placement="bottom">
            <el-button
              text
              size="small"
              :icon="Delete"
              @click="clearConversation"
              :disabled="loading || messages.length === 0"
            />
          </el-tooltip>
          <el-tooltip content="收起" placement="bottom">
            <el-button text size="small" :icon="Close" @click="closePanel" />
          </el-tooltip>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageListRef" class="rag-messages">
        <!-- 空状态 -->
        <div v-if="messages.length === 0" class="rag-empty">
          <el-icon :size="40" color="#c0c4cc"><ChatLineSquare /></el-icon>
          <p class="rag-empty-title">基于知识库的 AI 问答</p>
          <p class="rag-empty-tip">
            向我提问技术问题，答案来自你的本地知识库（BGE-M3 + Qdrant 混合检索）
          </p>
          <div class="rag-suggestions">
            <el-button v-for="s in suggestions" :key="s" size="small" round @click="quickAsk(s)">{{
              s
            }}</el-button>
          </div>
        </div>

        <!-- 消息项 -->
        <div v-for="(msg, idx) in messages" :key="idx" :class="['rag-msg', `rag-msg-${msg.role}`]">
          <div class="rag-msg-avatar">
            <el-icon v-if="msg.role === 'user'" :size="18"><User /></el-icon>
            <el-icon v-else :size="18"><Cpu /></el-icon>
          </div>
          <div class="rag-msg-body">
            <div class="rag-msg-role">{{ msg.role === "user" ? "我" : "AI" }}</div>

            <!-- 加载中 -->
            <div v-if="msg.loading" class="rag-msg-loading">
              <span class="rag-dot"></span>
              <span class="rag-dot"></span>
              <span class="rag-dot"></span>
              <span class="rag-loading-text">{{ loadingText }}</span>
            </div>

            <!-- 错误 -->
            <div v-else-if="msg.error" class="rag-msg-error">{{ msg.content }}</div>

            <!-- 正常内容 -->
            <template v-else>
              <div class="rag-msg-content" v-html="renderMarkdown(msg.content)"></div>

              <!-- 来源（仅 assistant 且有 sources） -->
              <div
                v-if="msg.role === 'assistant' && msg.sources && msg.sources.length"
                class="rag-sources"
              >
                <div class="rag-sources-header" @click="toggleSources(idx)">
                  <el-icon :size="14"><Document /></el-icon>
                  <span>检索来源（{{ msg.sources.length }}）</span>
                  <el-icon class="rag-sources-arrow" :class="{ expanded: msg.sourcesExpanded }">
                    <ArrowDown />
                  </el-icon>
                </div>
                <div v-show="msg.sourcesExpanded" class="rag-sources-list">
                  <div v-for="(src, sIdx) in msg.sources" :key="sIdx" class="rag-source-item">
                    <div class="rag-source-meta">
                      <el-tag size="small" type="info">[{{ sIdx + 1 }}]</el-tag>
                      <span class="rag-source-cat">{{ src.category_name || "未分类" }}</span>
                      <span class="rag-source-score"
                        >相关度 {{ (src.score * 100).toFixed(1) }}%</span
                      >
                    </div>
                    <div class="rag-source-path" :title="src.file_path">{{ src.file_path }}</div>
                    <div class="rag-source-text">{{ src.text_preview }}</div>
                    <div class="rag-source-actions">
                      <el-button
                        text
                        size="small"
                        :icon="DocumentCopy"
                        @click="insertText(src.text)"
                        >插入原文</el-button
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- 答案操作按钮 -->
              <div v-if="msg.role === 'assistant'" class="rag-msg-actions">
                <el-button text size="small" :icon="DocumentCopy" @click="insertText(msg.content)"
                  >插入到文章</el-button
                >
                <el-button text size="small" :icon="CopyDocument" @click="copyText(msg.content)"
                  >复制</el-button
                >
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="rag-input-area">
        <div class="rag-input-row">
          <el-select
            v-model="selectedCategoryId"
            placeholder="全部分类"
            size="small"
            clearable
            class="rag-category-select"
          >
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
          <!-- 模式切换：问答 = 直接回答；建议 = 结合编辑器内容给写作建议 -->
          <el-radio-group
            v-model="suggestMode"
            size="small"
            class="rag-mode-switch"
            :disabled="loading"
          >
            <el-radio-button :value="false">问答</el-radio-button>
            <el-radio-button :value="true">建议</el-radio-button>
          </el-radio-group>
          <el-tooltip content="清空对话" placement="top">
            <el-button
              text
              size="small"
              :icon="RefreshRight"
              @click="clearConversation"
              :disabled="loading || messages.length === 0"
            />
          </el-tooltip>
        </div>
        <div class="rag-input-row">
          <el-input
            v-model="inputQuestion"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 5 }"
            :placeholder="inputPlaceholder"
            resize="none"
            @keydown.enter.exact.prevent="sendQuestion"
            @keydown.ctrl.enter.prevent="sendQuestion"
            @keydown.meta.enter.prevent="sendQuestion"
          />
          <el-button
            type="primary"
            :icon="Promotion"
            :loading="loading"
            @click="sendQuestion"
            class="rag-send-btn"
            >发送</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ChatDotRound,
  ChatLineSquare,
  User,
  Cpu,
  Delete,
  Close,
  Document,
  ArrowDown,
  DocumentCopy,
  CopyDocument,
  RefreshRight,
  Promotion,
  Plus,
} from "@element-plus/icons-vue";
import { askRagStream, listRagSessions, getRagSessionMessages, deleteRagSession } from "@/api/rag";

const props = defineProps({
  // 分类列表：[{id, name}]，与 exp_load.py 的 CORPUS_CATEGORY_MAP 对应
  categoryList: { type: Array, default: () => [] },
  // 默认分类 ID
  defaultCategoryId: { type: [Number, null], default: null },
  // 获取当前编辑器内容（建议模式用）：() => string（富文本 HTML），由父页面提供
  getEditorContent: { type: Function, default: null },
});

const emit = defineEmits(["insert-text"]);

// ==================== 状态 ====================
const isOpen = ref(false);
const messages = ref([]); // [{role, content, sources?, loading?, error?, sourcesExpanded?}]
const inputQuestion = ref("");
const selectedCategoryId = ref(props.defaultCategoryId);
const loading = ref(false);
const messageListRef = ref(null);
// 模式：false=问答（直接回答），true=建议（结合编辑器内容给写作建议）
const suggestMode = ref(false);

// 动态文案
const inputPlaceholder = computed(() =>
  suggestMode.value
    ? "描述你想要哪方面的建议，将结合当前文章内容回答"
    : "输入你的问题，Ctrl/⌘ + Enter 发送"
);
const loadingText = computed(() =>
  suggestMode.value ? "正在结合文章内容生成建议..." : "检索知识库并生成答案中..."
);

// 会话管理（阶段3）
const sessions = ref([]); // [{id, title, updated_at}]
const currentSessionId = ref(null);
const SESSION_STORAGE_KEY = "rag_current_session";

// 推荐问题
const suggestions = [
  "Promise.all 和 Promise.race 的区别？",
  "Vue3 响应式原理是什么？",
  "Django 中间件的执行顺序？",
  "什么是 Docker 镜像？",
];

// ==================== 方法 ====================
const openPanel = () => {
  isOpen.value = true;
  loadSessions().then(() => restoreLastSession());
};
const closePanel = () => {
  isOpen.value = false;
};

// ---------- 会话管理 ----------
const loadSessions = async () => {
  try {
    const res = await listRagSessions();
    // axios 拦截器返回的是业务 body：{code, msg, data}
    if (res?.code === 200) sessions.value = res.data || [];
  } catch {
    /* 静默失败，不打断聊天 */
  }
};

const persistSession = (id) => {
  if (id) localStorage.setItem(SESSION_STORAGE_KEY, String(id));
  else localStorage.removeItem(SESSION_STORAGE_KEY);
};

// 打开面板时恢复上次会话（存在且未删除才恢复）
const restoreLastSession = () => {
  if (currentSessionId.value) return; // 已在会话中
  const saved = Number(localStorage.getItem(SESSION_STORAGE_KEY));
  if (saved && sessions.value.some((s) => s.id === saved)) {
    switchSession(saved);
  }
};

const newConversation = () => {
  if (currentStream) {
    currentStream.abort();
    currentStream = null;
  }
  loading.value = false;
  messages.value = [];
  currentSessionId.value = null;
  persistSession(null);
};

const switchSession = async (id) => {
  if (id === currentSessionId.value && messages.value.length) return;
  if (currentStream) {
    currentStream.abort();
    currentStream = null;
  }
  loading.value = false;
  try {
    const res = await getRagSessionMessages(id);
    if (res?.code !== 200) throw new Error(res?.msg || "加载失败");
    currentSessionId.value = id;
    persistSession(id);
    // 历史消息只有 user / assistant 文本，来源不入库
    messages.value = (res.data || []).map((m) => ({
      role: m.role,
      content: m.content,
      sources: [],
      sourcesExpanded: false,
      loading: false,
      error: false,
    }));
    scrollToBottom();
  } catch (e) {
    ElMessage.error(e?.message || "加载会话失败");
  }
};

const removeSession = async (id) => {
  try {
    await ElMessageBox.confirm("删除后该会话记录不可恢复", "删除会话", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return; // 用户取消
  }
  try {
    const res = await deleteRagSession(id);
    if (res?.code !== 200) throw new Error(res?.msg || "删除失败");
    sessions.value = sessions.value.filter((s) => s.id !== id);
    if (id === currentSessionId.value) newConversation();
    ElMessage.success("会话已删除");
  } catch (e) {
    ElMessage.error(e?.message || "删除失败");
  }
};

// 头部/输入区的"清空对话"：有会话则删会话，本地草稿则直接清空
const clearConversation = () => {
  if (currentSessionId.value) {
    removeSession(currentSessionId.value);
  } else {
    newConversation();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = messageListRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

watch(() => messages.value.length, scrollToBottom);

// 当前流式请求（用于发送新问题或关闭时取消）
let currentStream = null;

const sendQuestion = () => {
  const q = inputQuestion.value.trim();
  if (!q) {
    ElMessage.warning("请输入问题");
    return;
  }
  if (loading.value) return;

  // 取消上一个未完成的流
  if (currentStream) {
    currentStream.abort();
    currentStream = null;
  }

  // 追加用户消息
  messages.value.push({ role: "user", content: q });
  inputQuestion.value = "";
  // 追加占位的 assistant 消息（loading 中，sources 等检索完成后填充）
  const aiIdx =
    messages.value.push({
      role: "assistant",
      content: "",
      loading: true,
      sources: [],
      sourcesExpanded: false,
      error: false,
    }) - 1;
  loading.value = true;
  scrollToBottom();

  // 建议模式：从父页面取当前编辑器内容（问答模式不传，节省带宽）
  const editorContent =
    suggestMode.value && props.getEditorContent ? props.getEditorContent() || "" : "";

  currentStream = askRagStream(
    q,
    {
      categoryId: selectedCategoryId.value || undefined,
      sessionId: currentSessionId.value || undefined,
      mode: suggestMode.value ? "suggest" : "answer",
      editorContent: editorContent || undefined,
    },
    {
      onMeta: (meta) => {
        // 新会话由后端创建，回填 id 并持久化
        if (meta?.session_id) {
          currentSessionId.value = meta.session_id;
          persistSession(meta.session_id);
        }
      },
      onSources: (sources) => {
        if (messages.value[aiIdx]) {
          messages.value[aiIdx].sources = sources || [];
        }
      },
      onToken: (token) => {
        if (messages.value[aiIdx]) {
          messages.value[aiIdx].content += token;
          scrollToBottom();
        }
      },
      onError: (msg) => {
        if (messages.value[aiIdx]) {
          // 如果已有部分 token，把错误信息拼到末尾；否则显示失败
          const existing = messages.value[aiIdx].content;
          messages.value[aiIdx].error = true;
          messages.value[aiIdx].content = existing
            ? `${existing}\n\n⚠️ ${msg}`
            : `问答失败：${msg}`;
        }
      },
      onDone: () => {
        if (messages.value[aiIdx]) {
          messages.value[aiIdx].loading = false;
          // 空答案兜底
          if (!messages.value[aiIdx].content && !messages.value[aiIdx].error) {
            messages.value[aiIdx].content = "(空答案)";
          }
        }
        loading.value = false;
        currentStream = null;
        scrollToBottom();
        // 刷新侧边栏（新会话标题 / 排序变化）
        loadSessions();
      },
    },
  );
};

const quickAsk = (q) => {
  inputQuestion.value = q;
  sendQuestion();
};

// 组件卸载时取消进行中的流式请求
onUnmounted(() => {
  if (currentStream) currentStream.abort();
});

const toggleSources = (idx) => {
  const m = messages.value[idx];
  if (m) m.sourcesExpanded = !m.sourcesExpanded;
};

const insertText = (text) => {
  emit("insert-text", text);
  ElMessage.success("已插入到文章内容末尾");
};

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success("已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败");
  }
};

// ==================== 简易 Markdown 渲染 ====================
// 避免引入额外依赖，处理 LLM 常见输出：代码块、行内代码、加粗、标题、列表
const renderMarkdown = (text) => {
  if (!text) return "";
  // 先转义 HTML，防止 XSS
  let html = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 代码块：```lang\ncode\n```
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="md-code-block${lang ? ` lang-${lang}` : ""}"><code>${code.replace(/\n$/, "")}</code></pre>`;
  });

  // 行内代码：`code`
  html = html.replace(/`([^`\n]+)`/g, '<code class="md-inline-code">$1</code>');

  // 加粗：**text**
  html = html.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");

  // 标题：### / ## / #
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="md-h">$1</h4>');
  html = html.replace(/^##\s+(.+)$/gm, '<h3 class="md-h">$1</h3>');
  html = html.replace(/^#\s+(.+)$/gm, '<h2 class="md-h">$1</h2>');

  // 引用：>
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote class="md-quote">$1</blockquote>');

  // 无序列表项：- text
  html = html.replace(/^-\s+(.+)$/gm, '<li class="md-li">$1</li>');
  // 有序列表项：1. text
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-li md-li-ordered">$1</li>');
  // 合并连续 <li>
  html = html.replace(
    /(?:<li class="md-li[^"]*">[\s\S]*?<\/li>\n?)+/g,
    (m) => `<ul class="md-ul">${m}</ul>`,
  );

  // 段落：连续两个换行
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (/^<(pre|h\d|ul|blockquote)/.test(block.trim())) return block;
      if (block.trim() === "") return "";
      return `<p class="md-p">${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");

  return html;
};
</script>

<style scoped>
/* ==================== 折叠态：悬浮按钮 ==================== */
.rag-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #409eff 0%, #6a5acd 100%);
  color: #fff;
  border-radius: 28px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.rag-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.55);
}
.rag-fab-label {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

/* ==================== 展开态：面板 ==================== */
.rag-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  width: 620px;
  max-width: calc(100vw - 48px);
  height: 640px;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

/* 右侧聊天主区（纵向） */
.rag-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ==================== 会话侧边栏 ==================== */
.rag-sidebar {
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #f2f3f5;
  border-right: 1px solid #ebeef5;
}
.rag-new-session-btn {
  margin: 10px;
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px dashed #409eff;
  border-radius: 6px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.rag-new-session-btn:hover {
  background: #d9ecff;
}
.rag-session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 6px 10px;
}
.rag-session-empty {
  font-size: 12px;
  color: #909399;
  text-align: center;
  padding: 14px 0;
}
.rag-session-item {
  position: relative;
  padding: 8px 8px 8px 10px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.rag-session-item:hover {
  background: #e6e8eb;
}
.rag-session-item.active {
  background: #e6f0ff;
}
.rag-session-title {
  display: block;
  font-size: 13px;
  color: #303133;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 14px;
}
.rag-session-item.active .rag-session-title {
  color: #409eff;
  font-weight: 600;
}
.rag-session-time {
  display: block;
  font-size: 11px;
  color: #b0b3ba;
  margin-top: 2px;
}
.rag-session-del {
  position: absolute;
  right: 6px;
  top: 8px;
  color: #c0c4cc;
  opacity: 0;
  transition:
    opacity 0.15s ease,
    color 0.15s ease;
}
.rag-session-item:hover .rag-session-del {
  opacity: 1;
}
.rag-session-del:hover {
  color: #f56c6c;
}

/* 头部 */
.rag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #409eff 0%, #6a5acd 100%);
  color: #fff;
  flex-shrink: 0;
}
.rag-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}
.rag-header-actions {
  display: flex;
  gap: 4px;
}
.rag-header-actions :deep(.el-button) {
  color: #fff;
}
.rag-header-actions :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.15);
}

/* 消息列表 */
.rag-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f7f8fa;
}
.rag-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  padding: 20px;
}
.rag-empty-title {
  margin: 12px 0 4px;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}
.rag-empty-tip {
  margin: 0 0 16px;
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  max-width: 320px;
}
.rag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 360px;
}

/* 消息项 */
.rag-msg {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.rag-msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.rag-msg-user .rag-msg-avatar {
  background: #409eff;
}
.rag-msg-assistant .rag-msg-avatar {
  background: linear-gradient(135deg, #6a5acd, #409eff);
}
.rag-msg-body {
  flex: 1;
  min-width: 0;
}
.rag-msg-role {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.rag-msg-content {
  font-size: 14px;
  line-height: 1.7;
  color: #303133;
  word-break: break-word;
}
.rag-msg-user .rag-msg-content {
  background: #e6f0ff;
  padding: 8px 12px;
  border-radius: 4px 12px 12px 12px;
  display: inline-block;
  max-width: 100%;
}
.rag-msg-assistant .rag-msg-content {
  background: #fff;
  padding: 10px 14px;
  border-radius: 12px 4px 12px 12px;
  border: 1px solid #ebeef5;
}

/* 加载中 */
.rag-msg-loading {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px 4px 12px 12px;
  font-size: 13px;
  color: #909399;
}
.rag-dot {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
  animation: rag-bounce 1.4s infinite ease-in-out;
}
.rag-dot:nth-child(2) {
  animation-delay: 0.16s;
}
.rag-dot:nth-child(3) {
  animation-delay: 0.32s;
}
.rag-loading-text {
  margin-left: 8px;
}
@keyframes rag-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 错误 */
.rag-msg-error {
  background: #fef0f0;
  color: #f56c6c;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  border: 1px solid #fbc4c4;
}

/* 来源 */
.rag-sources {
  margin-top: 8px;
  border: 1px dashed #d9dcd6;
  border-radius: 6px;
  overflow: hidden;
  background: #fafafa;
}
.rag-sources-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  user-select: none;
}
.rag-sources-header:hover {
  background: #f0f2f5;
}
.rag-sources-arrow {
  margin-left: auto;
  transition: transform 0.2s ease;
}
.rag-sources-arrow.expanded {
  transform: rotate(180deg);
}
.rag-sources-list {
  padding: 4px 10px 10px;
  border-top: 1px solid #ebeef5;
}
.rag-source-item {
  padding: 8px;
  margin-top: 6px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}
.rag-source-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 4px;
}
.rag-source-cat {
  color: #409eff;
  font-weight: 500;
}
.rag-source-score {
  margin-left: auto;
  color: #909399;
}
.rag-source-path {
  font-size: 11px;
  color: #909399;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rag-source-text {
  font-size: 12px;
  color: #606266;
  line-height: 1.6;
  max-height: 80px;
  overflow-y: auto;
  padding: 4px 6px;
  background: #f7f8fa;
  border-radius: 4px;
}
.rag-source-actions {
  margin-top: 4px;
  text-align: right;
}

/* 答案操作 */
.rag-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

/* 输入区 */
.rag-input-area {
  padding: 10px 12px;
  border-top: 1px solid #ebeef5;
  background: #fff;
  flex-shrink: 0;
}
.rag-input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
}
.rag-input-row:last-child {
  margin-bottom: 0;
}
.rag-category-select {
  width: 160px;
  flex-shrink: 0;
}
/* 模式切换（问答/建议）：占中间剩余空间，靠左排列 */
.rag-mode-switch {
  margin-right: auto;
  flex-shrink: 0;
}
.rag-mode-switch :deep(.el-radio-button__inner) {
  padding: 5px 12px;
}
.rag-send-btn {
  flex-shrink: 0;
  height: auto;
}

/* ==================== Markdown 样式 ==================== */
.rag-msg-content :deep(.md-code-block) {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 10px 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 8px 0;
}
.rag-msg-content :deep(.md-inline-code) {
  background: #f0f2f5;
  color: #c7254e;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
}
.rag-msg-content :deep(.md-h) {
  margin: 10px 0 6px;
  font-weight: 600;
  color: #303133;
}
.rag-msg-content :deep(h2.md-h) {
  font-size: 17px;
}
.rag-msg-content :deep(h3.md-h) {
  font-size: 15px;
}
.rag-msg-content :deep(h4.md-h) {
  font-size: 14px;
}
.rag-msg-content :deep(.md-p) {
  margin: 6px 0;
}
.rag-msg-content :deep(.md-ul) {
  margin: 6px 0;
  padding-left: 22px;
}
.rag-msg-content :deep(.md-li) {
  margin: 2px 0;
  list-style: disc;
}
.rag-msg-content :deep(.md-li-ordered) {
  list-style: decimal;
}
.rag-msg-content :deep(.md-quote) {
  margin: 6px 0;
  padding: 6px 10px;
  background: #f7f8fa;
  border-left: 3px solid #409eff;
  color: #606266;
  font-size: 13px;
}
.rag-msg-content :deep(strong) {
  font-weight: 600;
  color: #303133;
}

/* ==================== 暗黑模式 ==================== */
.dark .rag-panel {
  background: #1e1e1e;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
.dark .rag-messages {
  background: #181818;
}
.dark .rag-empty-title {
  color: #e0e0e0;
}
.dark .rag-empty-tip {
  color: #999;
}
.dark .rag-msg-role {
  color: #888;
}
.dark .rag-msg-content {
  color: #e0e0e0;
}
.dark .rag-msg-user .rag-msg-content {
  background: #2a3a4a;
  color: #d4e6ff;
}
.dark .rag-msg-assistant .rag-msg-content {
  background: #252525;
  border-color: #333;
  color: #e0e0e0;
}
.dark .rag-msg-loading {
  background: #252525;
  border-color: #333;
  color: #999;
}
.dark .rag-sources {
  background: #252525;
  border-color: #333;
}
.dark .rag-sources-header {
  color: #aaa;
}
.dark .rag-sources-header:hover {
  background: #2a2a2a;
}
.dark .rag-sources-list {
  border-top-color: #333;
}
.dark .rag-source-item {
  background: #1e1e1e;
  border-color: #333;
}
.dark .rag-source-cat {
  color: #409eff;
}
.dark .rag-source-score {
  color: #777;
}
.dark .rag-source-path {
  color: #777;
}
.dark .rag-source-text {
  background: #181818;
  color: #bbb;
}
.dark .rag-input-area {
  background: #1e1e1e;
  border-top-color: #333;
}
/* 暗黑模式：侧边栏 */
.dark .rag-sidebar {
  background: #181818;
  border-right-color: #2a2a2a;
}
.dark .rag-new-session-btn {
  background: #1e2a36;
  border-color: #409eff;
  color: #409eff;
}
.dark .rag-new-session-btn:hover {
  background: #24384a;
}
.dark .rag-session-empty {
  color: #666;
}
.dark .rag-session-item:hover {
  background: #222;
}
.dark .rag-session-item.active {
  background: #1d2b3a;
}
.dark .rag-session-title {
  color: #d0d0d0;
}
.dark .rag-session-item.active .rag-session-title {
  color: #66b1ff;
}
.dark .rag-session-time {
  color: #555;
}
.dark .rag-session-del {
  color: #555;
}
.dark .rag-session-del:hover {
  color: #f56c6c;
}
.dark .rag-msg-content :deep(.md-inline-code) {
  background: #2a2a2a;
  color: #ff8b8b;
}
.dark .rag-msg-content :deep(.md-quote) {
  background: #252525;
  color: #aaa;
}
.dark .rag-msg-content :deep(strong) {
  color: #fff;
}

/* ==================== 响应式 ==================== */
@media (max-width: 600px) {
  .rag-panel {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  /* 小屏隐藏会话侧边栏，保证聊天可用宽度 */
  .rag-sidebar {
    display: none;
  }
  .rag-fab {
    right: 16px;
    bottom: 16px;
    padding: 10px 14px;
  }
  .rag-fab-label {
    display: none;
  }
}
</style>
