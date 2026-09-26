import service from "@/utils/request";

// 与 request.js 保持一致的 baseURL（开发 http://localhost:8000/api，生产 /api）
const getBaseURL = () => {
  if (import.meta.env.DEV) return "http://localhost:8000/api";
  return "/api";
};

/**
 * RAG 问答（非流式，一次性返回完整答案）
 *
 * @param {string} question - 用户问题
 * @param {Object} options - 可选参数
 * @param {number} [options.categoryId] - 分类 ID
 * @param {Array<{role: string, content: string}>} [options.history] - 多轮对话历史
 * @returns {Promise<{code: number, msg: string, data: {answer: string, sources: Array, query_time_ms: number}}>}
 */
export const askRag = (question, options = {}) => {
  const { categoryId, history = [] } = options;
  const data = { question };
  if (categoryId) data.category_id = categoryId;
  if (history && history.length > 0) data.history = history;

  return service.post("/rag/ask/", data, {
    timeout: 180000,
  });
};

/**
 * RAG 流式问答（打字机效果，逐 token 返回）
 *
 * 后端返回 NDJSON（每行一个 JSON 事件）：
 *   - {"type":"sources","data":[...]}  检索+重排后的来源片段
 *   - {"type":"token","data":"..."}    LLM 生成的每个 token
 *   - {"type":"error","data":"..."}    错误
 *   - {"type":"done","data":1234}      完成（耗时毫秒）
 *
 * @param {string} question
 * @param {Object} options - { categoryId, sessionId, mode, editorContent }
 * @param {Object} callbacks - { onSources, onToken, onDone, onError, onMeta }
 * @returns {{ abort: () => void }} 可调用 abort() 取消请求
 */
export const askRagStream = (question, options = {}, callbacks = {}) => {
  const { categoryId, history = [], sessionId, mode, editorContent } = options;
  const { onSources, onToken, onDone, onError, onMeta } = callbacks;
  const data = { question };
  if (categoryId) data.category_id = categoryId;
  if (sessionId) data.session_id = sessionId;
  if (history && history.length > 0) data.history = history;
  // 建议模式：结合编辑器内容给写作建议（后端去标签+截断）
  if (mode) data.mode = mode;
  if (editorContent) data.editor_content = editorContent;

  const controller = new AbortController();

  (async () => {
    try {
      const resp = await fetch(`${getBaseURL()}/rag/ask/stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // 携带 httponly cookie 鉴权
        signal: controller.signal,
      });

      if (!resp.ok) {
        const text = await resp.text();
        onError && onError(`请求失败 [${resp.status}]: ${text.slice(0, 200)}`);
        onDone && onDone(0);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 按行分割处理 NDJSON
        const lines = buffer.split("\n");
        buffer = lines.pop(); // 最后一段可能不完整，留到下一轮

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const event = JSON.parse(trimmed);
            switch (event.type) {
              case "sources":
                onSources && onSources(event.data);
                break;
              case "token":
                onToken && onToken(event.data);
                break;
              case "error":
                onError && onError(event.data);
                break;
              case "done":
                onDone && onDone(event.data);
                break;
            }
          } catch (e) {
            // 忽略解析失败的行
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        // 用户主动取消，不报错
      } else {
        onError && onError(err?.message || "流式请求失败");
      }
      onDone && onDone(0);
    }
  })();

  return {
    abort: () => controller.abort(),
  };
};

// ==================== 会话管理（阶段3：动态会话） ====================

/** 会话列表（侧边栏），按更新时间倒序 */
export const listRagSessions = () => service.get("/rag/sessions/");

/** 新建空会话 */
export const createRagSession = () => service.post("/rag/sessions/");

/** 会话历史消息 */
export const getRagSessionMessages = (id) => service.get(`/rag/sessions/${id}/messages/`);

/** 删除会话（级联删除消息） */
export const deleteRagSession = (id) => service.delete(`/rag/sessions/${id}/`);
