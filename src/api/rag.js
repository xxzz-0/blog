import service from "@/utils/request";

/**
 * RAG 问答（基于 BGE-M3 + Qdrant 混合检索 + Ollama 生成）
 *
 * @param {string} question - 用户问题
 * @param {Object} options - 可选参数
 * @param {number} [options.categoryId] - 分类 ID（按分类过滤检索范围，与 exp_load.py 中 CORPUS_CATEGORY_MAP 的 category_id 对应）
 * @param {Array<{role: string, content: string}>} [options.history] - 多轮对话历史
 * @returns {Promise<{code: number, msg: string, data: {answer: string, sources: Array, query_time_ms: number}}>}
 */
export const askRag = (question, options = {}) => {
  const { categoryId, history = [] } = options;
  const data = { question };
  if (categoryId) data.category_id = categoryId;
  if (history && history.length > 0) data.history = history;

  // RAG 涉及 BGE-M3 编码 + Qdrant 检索 + Ollama 推理，单次耗时可能 30-90s
  // 这里覆盖 request.js 默认的 10s 超时，放宽到 180s
  return service.post("/rag/ask/", data, {
    timeout: 180000,
  });
};
