<template>
  <el-upload
    class="image-upload"
    :action="action"
    :http-request="handleHttpRequest"
    :headers="headers"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :disabled="disabled"
    :with-credentials="true"
  >
    <img v-if="imageUrl" :src="imageUrl" class="image" />
    <el-icon v-else class="upload-icon"><Plus /></el-icon>
  </el-upload>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  action: {
    type: String,
    default: ''
  },
  httpRequest: {
    type: Function,
    default: null
  },
  imageUrl: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})
const headers = computed(() => {
  // 后端使用 httponly cookie，浏览器会自动携带
  return {}
})

// 处理上传请求
const handleHttpRequest = async (options) => {
  // 如果有自定义的 httpRequest，使用它
  if (props.httpRequest) {
    try {
      await props.httpRequest(options)
      // 自定义上传成功后，触发事件让父组件更新图片显示
      // 注意：父组件需要在 httpRequest 中处理成功逻辑
    } catch (err) {
      console.error('上传失败:', err)
      throw err
    }
  }
}

const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG图片')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
  }
  return isJPG && isLt2M
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
}

.upload-icon {
  font-size: 24px;
  color: #999;
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-icon:hover {
  border-color: #409EFF;
  color: #409EFF;
}

.image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  cursor: pointer;
}
</style>
