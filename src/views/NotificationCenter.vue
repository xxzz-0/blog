<template>
  <div class="notification-container" style="width: 900px; margin: 50px auto">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
      "
    >
      <h2>通知中心</h2>
      <div style="display: flex; gap: 10px">
        <el-button type="primary" size="small" @click="markAllRead" :loading="loading">
          全部标记已读
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <div v-loading="loading" element-loading-text="加载中..." style="min-height: 400px">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="未读" name="unread">
          <template #label>
            <span>未读</span>
            <el-badge
              v-if="unreadCount > 0"
              :value="unreadCount"
              :max="99"
              style="margin-left: 5px"
            />
          </template>
        </el-tab-pane>
        <el-tab-pane label="邮件通知" name="email"></el-tab-pane>
      </el-tabs>

      <div v-if="notifications.length === 0" class="empty-state">
        <el-empty description="暂无通知" />
      </div>

      <div v-else class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.is_read }"
        >
          <div class="notification-icon">
            <el-icon v-if="notification.type === 'email'" color="#409eff"><Message /></el-icon>
            <el-icon v-else-if="notification.type === 'comment'" color="#67c23a"
              ><ChatDotRound
            /></el-icon>
            <el-icon v-else-if="notification.type === 'reply'" color="#e6a23c"
              ><ChatLineRound
            /></el-icon>
            <el-icon v-else-if="notification.type === 'like'" color="#f56c6c"><Star /></el-icon>
            <el-icon v-else-if="notification.type === 'audit'" color="#909399"
              ><CircleCheck
            /></el-icon>
            <el-icon v-else color="#409eff"><Bell /></el-icon>
          </div>

          <div class="notification-content-wrapper">
            <div class="notification-content">{{ notification.content }}</div>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
              <span class="notification-type">{{ getTypeName(notification.type) }}</span>
            </div>
          </div>

          <div class="notification-actions">
            <el-button
              v-if="!notification.is_read"
              type="primary"
              size="small"
              text
              @click="markRead(notification.id)"
            >
              标记已读
            </el-button>
            <el-tag v-else type="info" size="small">已读</el-tag>
          </div>
        </div>
      </div>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="loadNotifications"
        layout="prev, pager, next, jumper, ->, total"
        style="margin-top: 20px; justify-content: center"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  ChatDotRound,
  ChatLineRound,
  Star,
  CircleCheck,
  Bell,
  Message,
} from "@element-plus/icons-vue";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "@/api/notification";
import { useNotificationStore } from "@/stores/notification";

const router = useRouter();

// 初始化 Pinia store
const notificationStore = useNotificationStore();

const loading = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const activeTab = ref("all");

const typeMap = {
  comment: "评论",
  reply: "回复",
  like: "点赞",
  audit: "审核",
  email: "邮件通知",
};

const getTypeName = (type) => {
  return typeMap[type] || "通知";
};

const loadNotifications = async () => {
  try {
    loading.value = true;
    const params = {
      page: page.value,
      page_size: pageSize.value,
    };

    if (activeTab.value === "unread") {
      params.is_read = "false";
    } else if (activeTab.value === "email") {
      params.type = "email";
    }

    const response = await getNotifications(params);
    if (response.code === 200) {
      notifications.value = response.data.results || [];
      total.value = response.data.count || 0;
    } else {
      ElMessage.error(response.msg || "加载通知失败");
    }
  } catch (error) {
    ElMessage.error("加载通知失败");
  } finally {
    loading.value = false;
  }
};

const loadUnreadCount = async () => {
  try {
    await notificationStore.loadUnreadCount();
    unreadCount.value = notificationStore.unreadCount;
  } catch (error) {
    console.error("获取未读通知数量失败:", error);
  }
};

const markRead = async (id) => {
  try {
    const response = await markNotificationRead(id);
    if (response.code === 200) {
      const notification = notifications.value.find((n) => n.id === id);
      if (notification) {
        notification.is_read = true;
      }
      await notificationStore.loadUnreadCount();
      unreadCount.value = notificationStore.unreadCount;
      ElMessage.success("标记成功");
    } else {
      ElMessage.error(response.msg || "标记失败");
    }
  } catch (error) {
    ElMessage.error("标记失败");
    console.error("标记通知已读失败:", error);
  }
};

const markAllRead = async () => {
  try {
    loading.value = true;
    const response = await markAllNotificationsRead();
    if (response.code === 200) {
      notifications.value.forEach((notification) => {
        notification.is_read = true;
      });
      await notificationStore.loadUnreadCount();
      unreadCount.value = notificationStore.unreadCount;
      ElMessage.success("全部标记成功");
    } else {
      ElMessage.error(response.msg || "标记失败");
    }
  } catch (error) {
    ElMessage.error("标记失败");
    console.error("标记所有通知已读失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleTabChange = () => {
  page.value = 1;
  loadNotifications();
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadNotifications();
  loadUnreadCount();
});
</script>

<style scoped>
.notification-container {
  padding: 20px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.notification-item:hover {
  background: #ecf5ff;
}

.notification-item.unread {
  background: #fef0f0;
  border-left: 3px solid #f56c6c;
}

.notification-item.unread:hover {
  background: #fff5f5;
}

.notification-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  margin-right: 15px;
  font-size: 20px;
}

.notification-content-wrapper {
  flex: 1;
  min-width: 0;
}

.notification-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.notification-type {
  color: #409eff;
}

.notification-actions {
  margin-left: 15px;
  min-width: 80px;
  text-align: right;
}
</style>
