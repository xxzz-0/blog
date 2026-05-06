<template>
  <div :style="{ marginLeft: level * 30 + 'px', padding: level === 0 ? '15px' : '10px 0', borderBottom: level === 0 ? '1px solid #f2f2f2' : 'none', fontSize: level > 1 ? '13px' : '14px' }">
    <div style="font-weight: bold">{{ comment.nickname || comment.username }}</div>
    <div style="margin: 5px 0; white-space: pre-wrap">{{ comment.content }}</div>
    <div style="font-size: 12px; color: #999">
      <span>{{ comment.created_at }}</span>
      <span style="margin-left: 10px">点赞：{{ comment.like_count }}</span>
    </div>

    <div style="margin-top: 8px; display: flex; gap: 10px">
      <el-button
        size="small"
        :type="comment.is_liked ? 'danger' : 'default'"
        :disabled="likingComments.has(comment.uuid)"
        @click="$emit('toggleLike', comment.uuid, comment.is_liked)"
      >
        {{ comment.is_liked ? "取消点赞" : "点赞" }}
      </el-button>
      <el-button size="small" @click="$emit('reply', comment.uuid)">回复</el-button>
      <el-button
        v-if="currentUser && comment.nickname === currentUser.nickname"
        size="small"
        type="danger"
        plain
        @click="$emit('delete', comment.uuid)"
      >
        删除
      </el-button>
      <el-button
        size="small"
        type="warning"
        plain
        @click="$emit('report', comment.uuid)"
      >
        举报
      </el-button>
    </div>

    <CommentItem
      v-for="child in comment.children"
      :key="child.uuid"
      :comment="child"
      :level="level + 1"
      :current-user="currentUser"
      :liking-comments="likingComments"
      @toggle-like="$emit('toggleLike', $event[0], $event[1])"
      @reply="$emit('reply', $event)"
      @delete="$emit('delete', $event)"
      @report="$emit('report', $event)"
    />
  </div>
</template>

<script setup>
defineProps({
  comment: { type: Object, required: true },
  level: { type: Number, default: 0 },
  currentUser: { type: Object, default: null },
  likingComments: { type: Set, default: () => new Set() },
});

defineEmits(["toggleLike", "reply", "delete", "report"]);
</script>
