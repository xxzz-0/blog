import request from "@/utils/request";

class SettingsService {
  constructor() {
    this.settings = null;
    this.isLoading = false;
    this.error = null;
  }

  // 获取设置（带缓存）
  async getSettings() {
    if (this.settings) {
      return this.settings;
    }

    if (this.isLoading) {
      // 如果正在加载，等待加载完成
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.settings;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const res = await request.get("/settings/");
      if (res.code === 200) {
        this.settings = res.data;
      }
    } catch (error) {
      console.error("获取网站设置失败:", error);
      this.error = error;
    } finally {
      this.isLoading = false;
    }

    return this.settings;
  }

  // 强制刷新设置
  async refreshSettings() {
    this.settings = null;
    return this.getSettings();
  }

  // 获取单个设置项
  async getSetting(key, defaultValue = null) {
    const settings = await this.getSettings();
    return settings?.[key] || defaultValue;
  }
}

// 导出单例实例
export default new SettingsService();
