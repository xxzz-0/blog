import { defineStore } from 'pinia';
import { getUnreadCount } from '@/api/notification';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    unreadCount: 0,
  }),
  
  getters: {
    // 获取未读通知数量
    unreadNotificationCount: (state) => state.unreadCount,
  },
  
  actions: {
    /**
     * 加载未读通知数量
     * @returns {Promise<number>}
     */
    async loadUnreadCount() {
      try {
        const res = await getUnreadCount();
        if (res.code === 200) {
          this.unreadCount = res.data.unread_count || 0;
        }
      } catch (error) {
        console.error('获取未读通知数量失败:', error);
      }
      return this.unreadCount;
    },

    /**
     * 重置未读通知数量
     */
    resetUnreadCount() {
      this.unreadCount = 0;
    },
  },
});
