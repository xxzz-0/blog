<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-info">
        <p class="footer-copyright">{{ siteSettings.copyright }}</p>
        <p class="footer-contact">
          <span v-if="siteSettings.contact_email"
            >联系邮箱：{{ siteSettings.contact_email }} |
          </span>
          <span v-if="siteSettings.contact_phone">联系电话：{{ siteSettings.contact_phone }}</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";

// 初始化 Pinia store
const settingsStore = useSettingsStore();

// 计算属性
const siteSettings = computed(() => settingsStore.settings);

// 加载网站设置
const loadSiteSettings = async () => {
  await settingsStore.loadSettings();
};

onMounted(() => {
  loadSiteSettings();
});
</script>

<style scoped>
/* 页脚样式 */
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 40px 0;
  margin-top: 60px;
}

/* 页脚容器 */
.footer-container {
  width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 页脚信息 */
.footer-info {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

/* 版权信息 */
.footer-copyright {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* 联系信息 */
.footer-contact {
  font-size: 13px;
  color: #888;
  margin-bottom: 0;
  line-height: 1.5;
}

/* 暗黑模式下的页脚样式 */
.dark .footer {
  background-color: #1e1e1e;
  border-top: 1px solid #333;
}

.dark .footer-copyright {
  color: #e0e0e0;
}

.dark .footer-contact {
  color: #999;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .footer-container {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 12px 0;
  }

  .footer-copyright {
    font-size: 12px;
  }

  .footer-contact {
    font-size: 10px;
  }
}
</style>
