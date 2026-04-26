import service from "@/utils/request";

// ===================== 分类相关接口 =====================
/**
 * 获取分类列表
 * @returns {Promise}
 */
export const getCategoryList = () => {
  // 匹配后端实际分类路由，若后端是/api/articles/categories/则改为该路径
  return service.get("/categories/");
};

/**
 * 创建分类（仅管理员）
 * @param {Object} data - 分类数据 {name, sort, description}
 * @returns {Promise}
 */
export const createCategory = (data) => {
  return service.post("/categories/", data);
};

/**
 * 修改分类（仅管理员）
 * @param {number} id - 分类ID
 * @param {Object} data - 分类数据
 * @returns {Promise}
 */
export const updateCategory = (id, data) => {
  return service.patch(`/categories/${id}/`, data);
};

/**
 * 删除分类（软删除，仅管理员）
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export const deleteCategory = (id) => {
  return service.delete(`/categories/${id}/`);
};

// ===================== 文章相关接口 =====================
/**
 * 获取文章列表（支持过滤、分页、排序）
 * @param {Object} params - 查询参数 {category, search, ordering, page, page_size}
 * @returns {Promise}
 */
export const getArticleList = (params = {}) => {
  // 转为普通对象，避免响应式对象解析错误
  const plainParams = { ...params };
  // 匹配后端截图的 /api/articles/ 路由（无嵌套）
  return service.get("/articles/", {
    params: plainParams,
  });
};

/**
 * 获取文章详情
 * @param {number} id - 文章ID
 * @param {Object} params - 查询参数 {password}
 * @returns {Promise}
 */
export const getArticleDetail = (id, params = {}) => {
  return service.get(`/articles/${id}/`, {
    params: params,
  });
};

/**
 * 创建文章
 * @param {Object} data - 文章数据 {title, content, category, tags, is_show}
 * @returns {Promise}
 */
export const createArticle = (data) => {
  return service.post("/articles/", data);
};

/**
 * 修改文章
 * @param {number} id - 文章ID
 * @param {Object} data - 文章数据
 * @returns {Promise}
 */
export const updateArticle = (id, data) => {
  return service.patch(`/articles/${id}/`, data);
};

/**
 * 删除文章（软删除）
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const deleteMyArticle = (id) => {
  return service.delete(`/articles/${id}/`);
};
/**
 * 获取【我的文章】列表
 */
export const getMyArticleList = (params = {}) => {
  return service.get("/articles/my_articles/", {
    params: {
      ...params,
      user: true, // 让后端知道是查当前用户
    },
  });
};

/**
 * 获取【我的草稿】列表
 */
export const getMyDraftList = (params = {}) => {
  return service.get("/articles/my_drafts/", {
    params: params,
  });
};

/**
 * 恢复软删除文章（仅管理员）
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const restoreArticle = (id) => {
  return service.post(`/articles/${id}/restore/`);
};

// ===================== 文章互动接口 =====================
/**
 * 文章点赞
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const likeArticle = (id) => {
  return service.post(`/articles/${id}/like/`);
};

/**
 * 取消文章点赞
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const unlikeArticle = (id) => {
  return service.post(`/articles/${id}/unlike/`);
};

/**
 * 文章收藏
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const collectArticle = (id) => {
  return service.post(`/articles/${id}/collect/`);
};

/**
 * 取消文章收藏
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const uncollectArticle = (id) => {
  return service.post(`/articles/${id}/uncollect/`);
};

/**
 * 检查文章是否已收藏
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const checkArticleCollect = (id) => {
  return service.get(`/articles/${id}/check_collect/`);
};

/**
 * 检查文章是否已点赞
 * @param {number} id - 文章ID
 * @returns {Promise}
 */
export const checkArticleLike = (id) => {
  return service.get(`/articles/${id}/check_like/`);
};

/**
 * 获取用户收藏列表
 * @param {Object} params - 分页参数 {page, page_size}
 * @returns {Promise}
 */
export const getCollectArticleList = (params = {}) => {
  const plainParams = { ...params };
  return service.get("/articles/collect_list/", { params: plainParams });
};

/**
 * 获取热门文章列表
 * @returns {Promise}
 */
export const getHotArticleList = () => {
  return service.get("/articles/hot/");
};

export const searchArticles = (q) => {
  return service.get("/articles/search/", {
    params: { q },
  });
};

/**
 * 获取文章时间归档
 * @returns {Promise}
 */
export const getArticleArchive = () => {
  return service.get("/articles/archive/");
};

/**
 * 按指定年月获取文章列表
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {Object} params - 分页参数 {page, page_size}
 * @returns {Promise}
 */
export const getArticlesByDate = (year, month, params = {}) => {
  return service.get("/articles/archive_by_date/", {
    params: {
      year,
      month,
      ...params,
    },
  });
};

/**
 * 审核文章
 * @param {number} id - 文章ID
 * @param {Object} data - 审核数据 {status, reason}
 * @returns {Promise}
 */
export const auditArticle = (id, data) => {
  return service.post(`/articles/${id}/audit/`, data);
};

/**
 * 获取待审核文章列表
 * @param {Object} params - 分页参数 {page, page_size}
 * @returns {Promise}
 */
export const getPendingArticles = (params = {}) => {
  return service.get("/articles/", {
    params: {
      ...params,
      is_audit: false,
    },
  });
};

/**
 * 上传文章封面图
 * @param {File} file - 图片文件
 * @returns {Promise}
 */
export const uploadCover = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return service.post("/articles/upload_cover/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 上传文章内容图片
 * @param {File} file - 图片文件
 * @returns {Promise}
 */
export const uploadContentImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return service.post("/articles/upload_content_image/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 删除图片
 * @param {Array} image_urls - 图片URL数组
 * @returns {Promise}
 */
export const deleteImage = (image_urls) => {
  return service.post("/articles/delete_image/", { image_urls });
};


