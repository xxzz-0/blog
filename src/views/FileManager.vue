<template>
  <div class="file-manager">
    <h2>图片管理</h2>

    <!-- 搜索和分类筛选 -->
    <div class="search-filter">
      <el-input
        v-model="searchQuery"
        placeholder="搜索图片名称"
        prefix-icon="Search"
        style="width: 300px; margin-right: 10px"
        @keyup.enter="loadImages"
      />
      <el-select
        v-model="selectedCategory"
        placeholder="按分类筛选"
        style="width: 150px; margin-right: 10px"
        @change="loadImages"
      >
        <el-option label="全部" value="" />
        <el-option label="文章封面" value="cover" />
        <el-option label="用户头像" value="avatar" />
        <el-option label="内容图片" value="content" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-button type="primary" @click="loadImages">筛选</el-button>
    </div>

    <!-- 图片上传 -->
    <el-upload
      class="upload-demo"
      :action="uploadUrl"
      :headers="headers"
      :on-success="handleImageUpload"
      :multiple="true"
      :with-credentials="true"
      list-type="picture"
    >
      <el-button type="primary">上传图片</el-button>
      <template #tip>
        <div class="el-upload__tip">支持 JPG、PNG、GIF 格式，单个文件不超过 10MB</div>
      </template>
    </el-upload>

    <!-- 批量操作 -->
    <div class="batch-actions">
      <el-button @click="selectAll">全选</el-button>
      <el-button @click="selectedImages = []">取消选择</el-button>
      <span v-if="selectedImages.length > 0">已选择 {{ selectedImages.length }} 张图片</span>
      <el-button v-if="selectedImages.length > 0" type="danger" @click="batchDelete">批量删除</el-button>
    </div>

    <!-- 图片列表 -->
    <div class="image-list">
      <div
        v-for="image in images"
        :key="image.id"
        class="image-item"
        :class="{ selected: selectedImages.includes(image.id) }"
      >
        <el-checkbox v-model="selectedImages" :label="image.id" />
        <el-image
          :src="image.image_url"
          :preview-src-list="[image.image_url]"
          style="width: 150px; height: 150px"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="image-info">
          <div class="image-name">{{ image.name }}</div>
          <div class="image-meta">
            <span>{{ image.category_display }}</span>
            <span>{{ formatSize(image.size) }}</span>
            <span>{{ formatDate(image.created_at) }}</span>
          </div>
        </div>
        <div class="image-actions">
          <el-button size="small" @click="previewImage(image)">预览</el-button>
          <el-button size="small" type="danger" @click="deleteImage(image.id)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > 0">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Picture } from "@element-plus/icons-vue";

const images = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const searchQuery = ref("");
const selectedCategory = ref("");
const selectedImages = ref([]);

const uploadUrl = "/api/images/";

const getAuthHeaders = () => {
  // 后端使用 httponly cookie，浏览器会自动携带
  return { "Content-Type": "application/json" };
};

const headers = computed(() => {
  // 后端使用 httponly cookie，浏览器会自动携带
  return {};
});

const loadImages = async () => {
  try {
    let url = `/api/images/?page=${currentPage.value}&page_size=${pageSize.value}`;
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`;
    }
    if (selectedCategory.value) {
      url += `&category=${selectedCategory.value}`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (data.code === 200) {
      images.value = data.data;
      total.value = data.data.length; // 实际项目中应该从后端返回total
    } else {
      ElMessage.error("获取图片列表失败");
    }
  } catch (error) {
    ElMessage.error("获取图片列表失败");
  }
};

const handleImageUpload = () => {
  ElMessage.success("图片上传成功");
  loadImages();
};

const previewImage = (image) => {
  // 预览图片，使用Element Plus的图片预览功能
};

const deleteImage = async (id) => {
  try {
    const response = await fetch(`/api/images/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (data.code === 200) {
      ElMessage.success("图片删除成功");
      loadImages();
    } else {
      ElMessage.error("图片删除失败");
    }
  } catch (error) {
    ElMessage.error("图片删除失败");
  }
};

const batchDelete = async () => {
  try {
    const response = await fetch("/api/images/batch_delete/", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids: selectedImages.value }),
    });
    const data = await response.json();
    if (data.code === 200) {
      ElMessage.success("批量删除成功");
      selectedImages.value = [];
      loadImages();
    } else {
      ElMessage.error("批量删除失败");
    }
  } catch (error) {
    ElMessage.error("批量删除失败");
  }
};

const selectAll = () => {
  // 全选当前页的所有图片
  const allImageIds = images.value.map(image => image.id);
  selectedImages.value = allImageIds;
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  loadImages();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadImages();
};

const formatSize = (size) => {
  if (size < 1024) {
    return `${size} B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

onMounted(() => {
  loadImages();
});
</script>

<style scoped>
.file-manager {
  padding: 0;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.search-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.upload-demo {
  margin-bottom: 20px;
}

.batch-actions {
  margin-bottom: 20px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.batch-actions span {
  margin-right: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.image-item {
  width: 150px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  position: relative;
  transition: all 0.3s;
}

.image-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-item.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-item .el-checkbox {
  position: absolute;
  top: 5px;
  left: 5px;
  z-index: 1;
}

.image-info {
  margin-top: 10px;
}

.image-name {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  font-size: 12px;
  color: #909399;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.image-actions {
  margin-top: 10px;
  display: flex;
  gap: 5px;
}

.image-error {
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
