// 根据环境自动设置 media URL
export const getMediaUrl = (path) => {
  if (!path) return '';
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http')) {
    return path;
  }
  
  // 开发环境：使用本地后端服务
  if (import.meta.env.DEV) {
    return `http://localhost:8000${path}`;
  }
  
  // 生产环境：使用相对路径，依赖 Nginx 反向代理
  return path;
};

// 获取完整的 API URL
export const getApiUrl = (path) => {
  if (!path) return '';
  
  if (path.startsWith('http')) {
    return path;
  }
  
  if (import.meta.env.DEV) {
    return `http://localhost:8000${path}`;
  }
  
  return path;
};
