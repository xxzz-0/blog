import { defineStore } from 'pinia';
import SettingsService from '@/services/SettingsService';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    siteSettings: {
      site_name: '博客平台',
      site_subtitle: '分享知识，连接世界',
    },
    isLoaded: false,
  }),
  
  getters: {
    // 获取网站设置
    settings: (state) => state.siteSettings,
    // 获取网站名称
    siteName: (state) => state.siteSettings.site_name,
    // 获取网站副标题
    siteSubtitle: (state) => state.siteSettings.site_subtitle,
    // 是否已加载
    loaded: (state) => state.isLoaded,
  },
  
  actions: {
    /**
     * 加载网站设置
     * @returns {Promise<object>}
     */
    async loadSettings() {
      try {
        const settings = await SettingsService.getSettings();
        if (settings) {
          this.siteSettings = {
            site_name: settings.site_name || '博客平台',
            site_subtitle: settings.site_subtitle || '分享知识，连接世界',
          };
          // 设置浏览器标签页标题
          document.title = `${this.siteSettings.site_name} - ${this.siteSettings.site_subtitle}`;
        }
        this.isLoaded = true;
        return this.siteSettings;
      } catch (error) {
        console.error('获取网站设置失败:', error);
        this.isLoaded = true;
        return this.siteSettings;
      }
    },
  },
});
