import service from "@/utils/request";

// ===================== 评论相关接口 =====================
/**
 * 获取文章评论列表
 * @param {number} article_id - 文章ID
 * @returns {Promise}
 */
export const getCommentList = (articleId, page = 1, page_size = 10) => {
  return service.get("/comments/", {
    params: {
      article_id: articleId,
      page: page,
      page_size: page_size,
    },
  });
};

/**
 * 发表评论
 * @param {Object} data - { article_id, content }
 * @returns {Promise}
 */
export const createComment = (data) => {
  return service.post("/comments/", data);
};

/**
 * 评论点赞
 * @param {string} uuid - 评论UUID
 * @returns {Promise}
 */
export const likeComment = (uuid) => {
  return service.post(`/comments/${uuid}/like/`);
};

/**
 * 取消评论点赞
 * @param {string} uuid - 评论UUID
 * @returns {Promise}
 */
export const unlikeComment = (uuid) => {
  return service.post(`/comments/${uuid}/unlike/`);
};

/**
 * 删除评论
 * @param {string} uuid - 评论UUID
 * @returns {Promise}
 */
export const deleteComment = (uuid) => {
  return service.delete(`/comments/${uuid}/`);
};

/**
 * 回复评论
 * @param {string} uuid - 父评论UUID
 * @param {string} content - 回复内容
 * @returns {Promise}
 */
export const replyComment = (uuid, content) => {
  return service.post(`/comments/${uuid}/reply/`, {
    content: content,
  });
};

/**
 * 举报评论
 * @param {string} uuid - 评论UUID
 * @param {Object} data - { reason, type }
 * @returns {Promise}
 */
export const reportComment = (uuid, data) => {
  return service.post(`/comments/${uuid}/report/`, data);
};

/**
 * 审核评论
 * @param {string} uuid - 评论UUID
 * @param {Object} data - 审核数据 {is_audit, reason}
 * @returns {Promise}
 */
export const auditComment = (uuid, data) => {
  return service.post(`/comments/${uuid}/audit/`, data);
};

/**
 * 获取待审核评论列表
 * @param {Object} params - 分页参数 {page, page_size}
 * @returns {Promise}
 */
export const getPendingComments = (params = {}) => {
  return service.get("/comments/", {
    params: {
      ...params,
      is_audit: false,
    },
  });
};
