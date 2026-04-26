<template>
  <div class="admin-dashboard">
    <div class="admin-layout">
      <!-- 侧边栏 -->
      <div class="admin-sidebar">
        <div class="admin-logo">
          <h1>博客管理后台</h1>
        </div>
        <el-menu :default-active="activeMenu" class="admin-menu" @select="handleMenuSelect">
          <el-menu-item index="dashboard">
            <el-icon><House /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="articles">
            <el-icon><Document /></el-icon>
            <span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="audit">
            <el-icon><Check /></el-icon>
            <span>内容审核</span>
          </el-menu-item>
          <el-menu-item index="comments">
            <el-icon><ChatDotRound /></el-icon>
            <span>评论管理</span>
          </el-menu-item>
          <el-menu-item index="categories">
            <el-icon><CollectionTag /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="files">
            <el-icon><Folder /></el-icon>
            <span>文件管理</span>
          </el-menu-item>
          <el-menu-item index="settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主内容区 -->
      <div class="admin-content">
        <div class="admin-header">
          <div class="header-left">
            <el-button type="primary" link @click="toggleSidebar">
              <el-icon><Menu /></el-icon>
            </el-button>
            <h2>{{ currentPageTitle }}</h2>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="authStore.currentUser.avatar || ''" />
                <span>{{ authStore.currentUser.nickname || authStore.currentUser.username }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="admin-main">
          <!-- 仪表盘内容 -->
          <div v-if="activeMenu === 'dashboard'" class="dashboard-content">
            <!-- 统计卡片 -->
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><User /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total_users || 0 }}</div>
                      <div class="stat-label">总用户数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><UserFilled /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.new_users || 0 }}</div>
                      <div class="stat-label">新增用户</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><Bell /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.active_users || 0 }}</div>
                      <div class="stat-label">活跃用户</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><Document /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total_articles || 0 }}</div>
                      <div class="stat-label">总文章数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><DocumentAdd /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.new_articles || 0 }}</div>
                      <div class="stat-label">新增文章</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><StarFilled /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.hot_articles || 0 }}</div>
                      <div class="stat-label">热门文章</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><ChatLineRound /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total_comments || 0 }}</div>
                      <div class="stat-label">总评论数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><Message /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.pending_comments || 0 }}</div>
                      <div class="stat-label">待审核评论</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><View /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total_views || 0 }}</div>
                      <div class="stat-label">总浏览量</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><Star /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.total_likes || 0 }}</div>
                      <div class="stat-label">总点赞数</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="stat-card">
                  <div class="stat-item">
                    <el-icon class="stat-icon"><ChatDotRound /></el-icon>
                    <div class="stat-info">
                      <div class="stat-value">{{ stats.new_comments || 0 }}</div>
                      <div class="stat-label">新增评论</div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 访问统计图表 -->
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="24">
                <el-card class="chart-card">
                  <template #header>
                    <div class="chart-header">
                      <span>访问统计</span>
                      <el-radio-group v-model="accessPeriod" @change="loadAccessStats">
                        <el-radio label="day">日</el-radio>
                        <el-radio label="week">周</el-radio>
                        <el-radio label="month">月</el-radio>
                      </el-radio-group>
                    </div>
                  </template>
                  <div class="chart-container" ref="accessChartRef"></div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 设备和地区统计 -->
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="12">
                <el-card class="chart-card">
                  <template #header>
                    <span>设备分布</span>
                  </template>
                  <div class="chart-container" ref="deviceChartRef"></div>
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="chart-card">
                  <template #header>
                    <span>地区分布</span>
                  </template>
                  <div class="chart-container" ref="regionChartRef"></div>
                </el-card>
              </el-col>
            </el-row>

            <!-- IP统计 -->
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="chart-card">
                  <template #header>
                    <span>Top 10 IP访问量</span>
                  </template>
                  <div class="chart-container" ref="ipChartRef"></div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 用户管理页面 -->
          <div v-else-if="activeMenu === 'users'" class="users-content">
            <el-card>
              <template #header>
                <div
                  class="users-header"
                  style="display: flex; justify-content: space-between; align-items: center"
                >
                  <span>用户管理</span>
                  <el-button type="primary" @click="loadUsers">刷新列表</el-button>
                </div>
              </template>
              <el-table :data="users" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="60" align="left" header-align="left">
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.id }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="头像" width="80" align="left" header-align="left">
                  <template #default="scope">
                    <el-avatar :size="32" :src="scope.row.avatar || ''" />
                  </template>
                </el-table-column>
                <el-table-column
                  prop="username"
                  label="用户名"
                  width="150"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.username }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="nickname"
                  label="昵称"
                  min-width="150"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.nickname || "-" }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="phone"
                  label="手机号"
                  width="150"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.phone }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="is_staff"
                  label="是否管理员"
                  width="120"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <el-tag :type="scope.row.is_staff ? 'success' : 'info'" size="small">
                        {{ scope.row.is_staff ? "是" : "否" }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="is_active"
                  label="账号状态"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <el-tag :type="scope.row.is_active ? 'success' : 'danger'" size="small">
                        {{ scope.row.is_active ? "启用" : "禁用" }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_at"
                  label="创建时间"
                  width="160"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.created_at }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="left" header-align="left">
                  <template #default="scope">
                    <div style="display: flex; flex-direction: column; gap: 4px; padding: 2px 0">
                      <el-button
                        type="primary"
                        size="small"
                        @click="openEditUserDialog(scope.row)"
                        :disabled="scope.row.is_staff && !authStore.currentUser.is_superuser"
                        :title="
                          scope.row.is_staff && !authStore.currentUser.is_superuser
                            ? '管理员账户不能编辑'
                            : ''
                        "
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        编辑
                      </el-button>
                      <el-button
                        :type="scope.row.is_deleted ? 'success' : 'danger'"
                        size="small"
                        @click="deleteUser(scope.row.id)"
                        :disabled="scope.row.is_staff && !authStore.currentUser.is_superuser"
                        :title="
                          scope.row.is_staff && !authStore.currentUser.is_superuser
                            ? '管理员账户不能删除'
                            : ''
                        "
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        {{ scope.row.is_deleted ? "恢复" : "删除" }}
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination" v-if="userTotal > 0">
                <el-pagination
                  v-model:current-page="userCurrentPage"
                  v-model:page-size="userPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="userTotal"
                  @size-change="handleUserSizeChange"
                  @current-change="handleUserCurrentChange"
                />
              </div>
              <div v-else class="empty-users">
                <el-empty description="暂无用户" />
              </div>
            </el-card>

            <!-- 编辑用户弹窗 -->
            <el-dialog v-model="userDialogVisible" :title="userDialogTitle" width="500px">
              <el-form :model="userForm" label-width="80px">
                <el-form-item label="昵称">
                  <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="是否管理员">
                  <el-switch v-model="userForm.is_staff" />
                </el-form-item>
                <el-form-item label="账号状态">
                  <el-switch v-model="userForm.is_active" />
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="userDialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveUser">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </div>
          <div v-else-if="activeMenu === 'articles'" class="articles-content">
            <el-card>
              <template #header>
                <div
                  class="articles-header"
                  style="display: flex; justify-content: space-between; align-items: center"
                >
                  <span>文章管理</span>
                  <el-button type="primary" @click="loadArticles">刷新列表</el-button>
                </div>
              </template>
              <div class="articles-filter">
                <el-input
                  v-model="articleFilter.title"
                  placeholder="搜索文章标题"
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="loadArticles"
                />
                <el-input
                  v-model="articleFilter.author"
                  placeholder="搜索作者"
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="loadArticles"
                />
                <el-select
                  v-model="articleFilter.status"
                  placeholder="文章状态"
                  style="width: 150px; margin-right: 10px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="已发布" value="published" />
                  <el-option label="草稿" value="draft" />
                </el-select>
                <el-button type="primary" @click="loadArticles">查询</el-button>
                <el-button @click="resetArticleFilter">重置</el-button>
              </div>
              <el-table :data="articles" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="60" align="left" header-align="left">
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.id }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="title"
                  label="标题"
                  min-width="200"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <router-link
                        :to="`/article/${scope.row.id}`"
                        target="_blank"
                        class="article-title"
                      >
                        {{ scope.row.title }}
                      </router-link>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="nickname"
                  label="作者"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      {{ scope.row.nickname || scope.row.author || "未知" }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="category_name"
                  label="分类"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.category_name }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="view_count"
                  label="浏览量"
                  width="80"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.view_count }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="like_count"
                  label="点赞数"
                  width="80"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.like_count }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_at"
                  label="创建时间"
                  width="160"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.created_at }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="left" header-align="left">
                  <template #default="scope">
                    <div style="display: flex; flex-direction: column; gap: 4px; padding: 2px 0">
                      <!-- 只有文章作者可以编辑文章 -->
                      <el-button
                        type="primary"
                        size="small"
                        @click="editArticle(scope.row.id)"
                        :disabled="true"
                        :title="'管理员不能编辑文章'"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="deleteArticle(scope.row.id)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination" v-if="articleTotal > 0">
                <el-pagination
                  v-model:current-page="articleCurrentPage"
                  v-model:page-size="articlePageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="articleTotal"
                  @size-change="handleArticleSizeChange"
                  @current-change="handleArticleCurrentChange"
                />
              </div>
              <div v-else class="empty-articles">
                <el-empty description="暂无文章" />
              </div>
            </el-card>
          </div>
          <div v-else-if="activeMenu === 'audit'" class="audit-content">
            <el-card>
              <template #header>
                <div
                  class="audit-header"
                  style="display: flex; justify-content: space-between; align-items: center"
                >
                  <span>待审核文章</span>
                  <el-button type="primary" @click="loadAuditArticles">刷新列表</el-button>
                </div>
              </template>
              <el-table :data="auditArticles" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="60" align="left" header-align="left">
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.id }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="title"
                  label="标题"
                  min-width="200"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <router-link
                        :to="`/article/${scope.row.id}`"
                        target="_blank"
                        class="article-title"
                      >
                        {{ scope.row.title }}
                      </router-link>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="nickname"
                  label="作者"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      {{ scope.row.nickname || scope.row.author || "未知" }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_at"
                  label="提交时间"
                  width="160"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.created_at }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="left" header-align="left">
                  <template #default="scope">
                    <div style="display: flex; flex-direction: column; gap: 4px; padding: 2px 0">
                      <el-button
                        type="primary"
                        size="small"
                        @click="approveArticle(scope.row.id)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        通过
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="rejectArticle(scope.row.id)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        拒绝
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination" v-if="auditTotal > 0">
                <el-pagination
                  v-model:current-page="auditCurrentPage"
                  v-model:page-size="auditPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="auditTotal"
                  @size-change="handleAuditSizeChange"
                  @current-change="handleAuditCurrentChange"
                />
              </div>
              <div v-else class="empty-audit">
                <el-empty description="暂无待审核文章" />
              </div>
            </el-card>
          </div>
          <div v-else-if="activeMenu === 'comments'" class="comments-content">
            <el-card>
              <template #header>
                <div
                  class="comments-header"
                  style="display: flex; justify-content: space-between; align-items: center"
                >
                  <span>评论管理</span>
                  <el-button type="primary" @click="loadComments">刷新列表</el-button>
                </div>
              </template>
              <div class="comments-filter">
                <el-input
                  v-model="commentFilter.content"
                  placeholder="搜索评论内容"
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="loadComments"
                />
                <el-input
                  v-model="commentFilter.author"
                  placeholder="搜索作者"
                  style="width: 200px; margin-right: 10px"
                  @keyup.enter="loadComments"
                />
                <el-select
                  v-model="commentFilter.status"
                  placeholder="评论状态"
                  style="width: 150px; margin-right: 10px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="已显示" value="true" />
                  <el-option label="已隐藏" value="false" />
                </el-select>
                <el-select
                  v-model="commentFilter.auditStatus"
                  placeholder="审核状态"
                  style="width: 150px; margin-right: 10px"
                >
                  <el-option label="全部" value="" />
                  <el-option label="已审核" value="true" />
                  <el-option label="未审核" value="false" />
                </el-select>
                <el-button type="primary" @click="loadComments">查询</el-button>
                <el-button @click="resetCommentFilter">重置</el-button>
              </div>
              <el-table :data="comments" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="60" align="left" header-align="left" />
                <el-table-column
                  prop="content"
                  label="评论内容"
                  min-width="250"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.content }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="nickname"
                  label="作者"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      {{ scope.row.nickname || scope.row.author || "未知" }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="article.title"
                  label="文章"
                  min-width="150"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <router-link
                        :to="`/article/${scope.row.article.id}`"
                        target="_blank"
                        class="article-title"
                      >
                        {{ scope.row.article.title }}
                      </router-link>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="is_show"
                  label="显示状态"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <el-tag :type="scope.row.is_show ? 'success' : 'danger'" size="small">
                        {{ scope.row.is_show ? "已显示" : "已隐藏" }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="is_audit"
                  label="审核状态"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">
                      <el-tag :type="scope.row.is_audit ? 'success' : 'warning'" size="small">
                        {{ scope.row.is_audit ? "已审核" : "未审核" }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_at"
                  label="创建时间"
                  width="160"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.created_at }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="left" header-align="left">
                  <template #default="scope">
                    <div style="display: flex; flex-direction: column; gap: 4px; padding: 2px 0">
                      <el-button
                        :type="scope.row.is_show ? 'warning' : 'primary'"
                        size="small"
                        @click="toggleCommentStatus(scope.row.uuid, !scope.row.is_show)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        {{ scope.row.is_show ? "隐藏" : "显示" }}
                      </el-button>
                      <el-button
                        :type="scope.row.is_audit ? 'info' : 'success'"
                        size="small"
                        @click="auditComment(scope.row.uuid, !scope.row.is_audit)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        {{ scope.row.is_audit ? "取消审核" : "审核通过" }}
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="deleteComment(scope.row.uuid)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination" v-if="commentTotal > 0">
                <el-pagination
                  v-model:current-page="commentCurrentPage"
                  v-model:page-size="commentPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="commentTotal"
                  @size-change="handleCommentSizeChange"
                  @current-change="handleCommentCurrentChange"
                />
              </div>
              <div v-else class="empty-comments">
                <el-empty description="暂无评论" />
              </div>
            </el-card>
          </div>
          <div v-else-if="activeMenu === 'categories'" class="categories-content">
            <el-card>
              <template #header>
                <div
                  class="categories-header"
                  style="display: flex; justify-content: space-between; align-items: center"
                >
                  <span>分类管理</span>
                  <el-button type="primary" @click="openAddCategoryDialog">新增分类</el-button>
                </div>
              </template>
              <el-table :data="categories" style="width: 100%" border>
                <el-table-column prop="id" label="ID" width="60" align="left" header-align="left">
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.id }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="name"
                  label="分类名称"
                  min-width="200"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.name }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="sort"
                  label="排序"
                  width="80"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.sort }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="article_count"
                  label="文章数量"
                  width="100"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.article_count }}</div>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="created_at"
                  label="创建时间"
                  width="160"
                  align="left"
                  header-align="left"
                >
                  <template #default="scope">
                    <div style="padding: 4px 0">{{ scope.row.created_at }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="left" header-align="left">
                  <template #default="scope">
                    <div style="display: flex; flex-direction: column; gap: 4px; padding: 2px 0">
                      <el-button
                        type="primary"
                        size="small"
                        @click="openEditCategoryDialog(scope.row)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        编辑
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        @click="deleteCategory(scope.row.id)"
                        style="width: 100%; padding: 4px; margin: 0"
                      >
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
              <div class="pagination" v-if="categoryTotal > 0">
                <el-pagination
                  v-model:current-page="categoryCurrentPage"
                  v-model:page-size="categoryPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="categoryTotal"
                  @size-change="handleCategorySizeChange"
                  @current-change="handleCategoryCurrentChange"
                />
              </div>
              <div v-else class="empty-categories">
                <el-empty description="暂无分类" />
              </div>
            </el-card>

            <!-- 新增分类弹窗 -->
            <el-dialog v-model="categoryDialogVisible" :title="categoryDialogTitle" width="500px">
              <el-form :model="categoryForm" label-width="80px">
                <el-form-item label="分类名称">
                  <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
                </el-form-item>
                <el-form-item label="排序">
                  <el-input-number v-model="categoryForm.sort" :min="0" :max="100" />
                </el-form-item>
              </el-form>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="categoryDialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="saveCategory">确定</el-button>
                </span>
              </template>
            </el-dialog>
          </div>
          <div v-else-if="activeMenu === 'files'" class="files-content">
            <FileManager />
          </div>
          <div v-else-if="activeMenu === 'settings'" class="settings-content">
            <SystemSettings />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import request from "@/utils/request";
import * as echarts from "echarts";
import FileManager from "./FileManager.vue";
import SystemSettings from "./SystemSettings.vue";
import {
  House,
  User,
  UserFilled,
  Bell,
  Document,
  DocumentAdd,
  StarFilled,
  ChatDotRound,
  CollectionTag,
  Folder,
  Setting,
  Menu,
  ArrowDown,
  View,
  Star,
  ChatLineRound,
  Message,
  Check,
} from "@element-plus/icons-vue";

const router = useRouter();
const activeMenu = ref("dashboard");
const sidebarCollapsed = ref(false);

// 初始化 Pinia store
const authStore = useAuthStore();

// 统计数据
const stats = ref({});
const accessPeriod = ref("day");
const accessStats = ref({ labels: [], values: [] });
const deviceStats = ref({ data: [] });
const ipStats = ref({ data: [] });
const regionStats = ref({ data: [] });

// 用户信息
const userInfo = ref({});

// 审核相关数据
const auditArticles = ref([]);
const auditTotal = ref(0);
const auditCurrentPage = ref(1);
const auditPageSize = ref(10);

// 文章管理相关数据
const articles = ref([]);
const articleTotal = ref(0);
const articleCurrentPage = ref(1);
const articlePageSize = ref(10);
const articleFilter = ref({
  title: "",
  author: "",
  status: "",
});

// 评论管理相关数据
const comments = ref([]);
const commentTotal = ref(0);
const commentCurrentPage = ref(1);
const commentPageSize = ref(10);
const commentFilter = ref({
  content: "",
  author: "",
  status: "",
  auditStatus: "",
});

// 分类管理相关数据
const categories = ref([]);
const categoryTotal = ref(0);
const categoryCurrentPage = ref(1);
const categoryPageSize = ref(10);
const categoryDialogVisible = ref(false);
const categoryDialogTitle = ref("新增分类");
const categoryForm = ref({
  id: "",
  name: "",
  sort: 0,
});

// 用户管理相关数据
const users = ref([]);
const userTotal = ref(0);
const userCurrentPage = ref(1);
const userPageSize = ref(10);
const userDialogVisible = ref(false);
const userDialogTitle = ref("新增用户");
const userForm = ref({
  id: "",
  nickname: "",
  is_staff: false,
  is_active: true,
});

// 图表容器引用
const accessChartRef = ref(null);
const deviceChartRef = ref(null);
const regionChartRef = ref(null);
const ipChartRef = ref(null);

// 图表实例
let accessChart = null;
let deviceChart = null;
let regionChart = null;
let ipChart = null;

const currentPageTitle = computed(() => {
  const titles = {
    dashboard: "仪表盘",
    users: "用户管理",
    articles: "文章管理",
    audit: "内容审核",
    comments: "评论管理",
    categories: "分类管理",
    files: "文件管理",
    settings: "系统设置",
  };
  return titles[activeMenu.value];
});
// 菜单选择处理
const handleMenuSelect = (key) => {
  activeMenu.value = key;
  // 当切换到审核页面时，加载待审核文章
  if (key === "audit") {
    loadAuditArticles();
  }
  // 当切换到文章管理页面时，加载文章列表
  else if (key === "articles") {
    loadArticles();
  }
  // 当切换到评论管理页面时，加载评论列表
  else if (key === "comments") {
    loadComments();
  }
  // 当切换到分类管理页面时，加载分类列表
  else if (key === "categories") {
    loadCategories();
  }
  // 当切换到用户管理页面时，加载用户列表
  else if (key === "users") {
    loadUsers();
  }
};

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const goToProfile = () => {
  router.push("/profile");
};

const logout = async () => {
  try {
    await authStore.logout();
    ElMessage.success("退出登录成功");
    router.push("/login");
  } catch (error) {
    ElMessage.error("退出登录失败");
  }
};

// 加载待审核文章
const loadAuditArticles = async () => {
  try {
    const res = await request.get(`/articles/audit/`, {
      params: {
        page: auditCurrentPage.value,
        page_size: auditPageSize.value,
      },
    });
    if (res.code === 200) {
      auditArticles.value = res.data.results;
      auditTotal.value = res.data.count;
    }
  } catch (error) {
    ElMessage.error("加载待审核文章失败");
  }
};

// 审核通过文章
const approveArticle = async (articleId) => {
  try {
    const res = await request.post(`/articles/${articleId}/approve/`);
    if (res.code === 200) {
      ElMessage.success("审核通过成功");
      loadAuditArticles();
    }
  } catch (error) {
    ElMessage.error("审核通过失败");
  }
};

// 审核拒绝文章
const rejectArticle = async (articleId) => {
  try {
    const res = await request.post(`/articles/${articleId}/reject/`);
    if (res.code === 200) {
      ElMessage.success("审核拒绝成功");
      loadAuditArticles();
    }
  } catch (error) {
    ElMessage.error("审核拒绝失败");
  }
};

// 处理审核分页大小变化
const handleAuditSizeChange = (size) => {
  auditPageSize.value = size;
  loadAuditArticles();
};

// 处理审核分页当前页变化
const handleAuditCurrentChange = (current) => {
  auditCurrentPage.value = current;
  loadAuditArticles();
};

// 加载文章列表
const loadArticles = async () => {
  try {
    const params = {
      page: articleCurrentPage.value,
      page_size: articlePageSize.value,
    };

    // 构建搜索参数
    const searchTerms = [];
    if (articleFilter.value.title) {
      searchTerms.push(articleFilter.value.title);
    }
    if (articleFilter.value.author) {
      searchTerms.push(articleFilter.value.author);
    }
    if (searchTerms.length > 0) {
      params.search = searchTerms.join(" ");
    }

    if (articleFilter.value.status) {
      params.status = articleFilter.value.status;
    }

    const res = await request.get("/articles/", { params });
    if (res.code === 200) {
      articles.value = res.data.results;
      articleTotal.value = res.data.count;
    }
  } catch (error) {
    ElMessage.error("加载文章列表失败");
  }
};

// 编辑文章
const editArticle = (articleId) => {
  // 管理员不能编辑文章
  ElMessage.warning("管理员不能编辑文章");
};

// 删除文章
const deleteArticle = async (articleId) => {
  try {
    const res = await request.delete(`/articles/${articleId}/`);
    if (res.code === 200) {
      ElMessage.success("文章删除成功");
      loadArticles();
    }
  } catch (error) {
    ElMessage.error("文章删除失败");
  }
};

// 重置文章过滤条件
const resetArticleFilter = () => {
  articleFilter.value = {
    title: "",
    author: "",
    status: "",
  };
  loadArticles();
};

// 处理文章分页大小变化
const handleArticleSizeChange = (size) => {
  articlePageSize.value = size;
  loadArticles();
};

// 处理文章分页当前页变化
const handleArticleCurrentChange = (current) => {
  articleCurrentPage.value = current;
  loadArticles();
};

// 加载评论列表
const loadComments = async () => {
  try {
    const params = {
      page: commentCurrentPage.value,
      page_size: commentPageSize.value,
    };

    if (commentFilter.value.content) {
      params.search = commentFilter.value.content;
    }

    if (commentFilter.value.status) {
      params.is_show = commentFilter.value.status;
    }

    if (commentFilter.value.auditStatus) {
      params.is_audit = commentFilter.value.auditStatus;
    }

    // 构建搜索参数
    const searchTerms = [];
    if (commentFilter.value.content) {
      searchTerms.push(commentFilter.value.content);
    }
    if (commentFilter.value.author) {
      searchTerms.push(commentFilter.value.author);
    }
    if (searchTerms.length > 0) {
      params.search = searchTerms.join(" ");
    }

    const res = await request.get("/comments/", { params });
    if (res.code === 200) {
      comments.value = res.data.results;
      commentTotal.value = res.data.count;
      // 打印评论数据，检查是否包含 is_show 和 is_audit 字段
      console.log("Comments data:", res.data.results);
    }
  } catch (error) {
    ElMessage.error("加载评论列表失败");
  }
};

// 切换评论状态
const toggleCommentStatus = async (commentId, isShow) => {
  try {
    const res = await request.post(`/comments/${commentId}/toggle_show/`, {
      is_show: isShow,
    });
    if (res.code === 200) {
      ElMessage.success(`评论已${isShow ? "显示" : "隐藏"}`);
      loadComments();
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 审核评论
const auditComment = async (commentId, isAudit) => {
  try {
    const res = await request.post(`/comments/${commentId}/audit/`, {
      is_audit: isAudit,
    });
    if (res.code === 200) {
      ElMessage.success(`评论已${isAudit ? "审核通过" : "取消审核"}`);
      loadComments();
    }
  } catch (error) {
    ElMessage.error("审核操作失败");
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  try {
    const res = await request.delete(`/comments/${commentId}/`);
    if (res.code === 200) {
      ElMessage.success("评论删除成功");
      loadComments();
    }
  } catch (error) {
    ElMessage.error("评论删除失败");
  }
};

// 重置评论过滤条件
const resetCommentFilter = () => {
  commentFilter.value = {
    content: "",
    author: "",
    status: "",
    auditStatus: "",
  };
  loadComments();
};

// 处理评论分页大小变化
const handleCommentSizeChange = (size) => {
  commentPageSize.value = size;
  loadComments();
};

// 处理评论分页当前页变化
const handleCommentCurrentChange = (current) => {
  commentCurrentPage.value = current;
  loadComments();
};

// 加载分类列表
const loadCategories = async () => {
  try {
    const params = {
      page: categoryCurrentPage.value,
      page_size: categoryPageSize.value,
    };
    const res = await request.get("/categories/", { params });
    if (res.code === 200) {
      categories.value = res.data.results;
      categoryTotal.value = res.data.count;
    }
  } catch (error) {
    ElMessage.error("加载分类列表失败");
  }
};

// 打开新增分类弹窗
const openAddCategoryDialog = () => {
  categoryDialogTitle.value = "新增分类";
  categoryForm.value = {
    id: "",
    name: "",
    sort: 0,
  };
  categoryDialogVisible.value = true;
};

// 打开编辑分类弹窗
const openEditCategoryDialog = (category) => {
  categoryDialogTitle.value = "编辑分类";
  categoryForm.value = {
    id: category.id,
    name: category.name,
    sort: category.sort,
  };
  categoryDialogVisible.value = true;
};

// 保存分类
const saveCategory = async () => {
  try {
    let res;
    if (categoryForm.value.id) {
      // 编辑分类
      res = await request.put(`/categories/${categoryForm.value.id}/`, categoryForm.value);
    } else {
      // 新增分类
      res = await request.post("/categories/", categoryForm.value);
    }
    if (res.code === 200) {
      ElMessage.success(categoryForm.value.id ? "分类编辑成功" : "分类新增成功");
      categoryDialogVisible.value = false;
      loadCategories();
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 删除分类
const deleteCategory = async (categoryId) => {
  try {
    const res = await request.delete(`/categories/${categoryId}/`);
    if (res.code === 200) {
      ElMessage.success("分类删除成功");
      loadCategories();
    }
  } catch (error) {
    ElMessage.error("分类删除失败");
  }
};

// 处理分类分页大小变化
const handleCategorySizeChange = (size) => {
  categoryPageSize.value = size;
  loadCategories();
};

// 处理分类分页当前页变化
const handleCategoryCurrentChange = (current) => {
  categoryCurrentPage.value = current;
  loadCategories();
};

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await request.get(`/user/users/`, {
      params: {
        page: userCurrentPage.value,
        page_size: userPageSize.value,
      },
    });
    // 检查响应格式
    if (res.count !== undefined) {
      // 后端直接返回分页数据格式
      users.value = res.results;
      userTotal.value = res.count;
    } else if (res.code === 200 && res.data) {
      // 标准格式
      users.value = res.data.results;
      userTotal.value = res.data.count;
    }
  } catch (error) {
    ElMessage.error("加载用户列表失败");
  }
};

// 处理用户分页大小变化
const handleUserSizeChange = (size) => {
  userPageSize.value = size;
  loadUsers();
};

// 处理用户分页当前页变化
const handleUserCurrentChange = (current) => {
  userCurrentPage.value = current;
  loadUsers();
};

// 打开编辑用户对话框
const openEditUserDialog = (user) => {
  // 检查是否为管理员账户，且当前用户不是超级管理员
  if (user.is_staff && !userInfo.value.is_superuser) {
    ElMessage.warning("管理员账户不能编辑");
    return;
  }

  userDialogTitle.value = "编辑用户";
  userForm.value = {
    id: user.id,
    nickname: user.nickname,
    is_staff: user.is_staff,
    is_active: user.is_active,
  };
  userDialogVisible.value = true;
};

// 保存用户信息
const saveUser = async () => {
  try {
    let res;
    if (userForm.value.id) {
      // 编辑用户
      res = await request.put(`/user/users/${userForm.value.id}/`, userForm.value);
    } else {
      // 新增用户
      res = await request.post(`/user/users/`, userForm.value);
    }
    // 检查响应格式
    if (res.id || res.code === 200) {
      ElMessage.success(userForm.value.id ? "编辑用户成功" : "新增用户成功");
      userDialogVisible.value = false;
      loadUsers();
    }
  } catch (error) {
    ElMessage.error(userForm.value.id ? "编辑用户失败" : "新增用户失败");
  }
};

// 删除/恢复用户
const deleteUser = async (userId) => {
  // 找到要操作的用户
  const userToOperate = users.value.find((user) => user.id === userId);

  // 检查是否为管理员账户，且当前用户不是超级管理员
  if (userToOperate && userToOperate.is_staff && !userInfo.value.is_superuser) {
    ElMessage.warning("管理员账户不能删除");
    return;
  }

  try {
    const res = await request.delete(`/user/users/${userId}/`);
    // 检查响应格式
    if (res.status === 204 || res.code === 200) {
      ElMessage.success(userToOperate.is_deleted ? "恢复用户成功" : "删除用户成功");
      loadUsers();
    }
  } catch (error) {
    ElMessage.error(userToOperate.is_deleted ? "恢复用户失败" : "删除用户失败");
  }
};

// 初始化访问统计图表
const initAccessChart = () => {
  if (!accessChartRef.value) return;
  if (accessChart) {
    accessChart.dispose();
  }
  accessChart = echarts.init(accessChartRef.value);
  updateAccessChart();
};

// 更新访问统计图表
const updateAccessChart = () => {
  if (!accessChart) return;

  // 根据时间段设置标签
  let labels = [];
  if (accessPeriod.value === "day") {
    labels = [
      "24小时前",
      "21小时前",
      "18小时前",
      "15小时前",
      "12小时前",
      "9小时前",
      "6小时前",
      "3小时前",
    ];
  } else if (accessPeriod.value === "week") {
    labels = ["6天前", "5天前", "4天前", "3天前", "2天前", "1天前", "今天"];
  } else if (accessPeriod.value === "month") {
    labels = ["30天前", "25天前", "20天前", "15天前", "10天前", "5天内"];
  }

  const option = {
    title: {
      text: "访问统计",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: labels,
      name: "时间",
    },
    yAxis: {
      type: "value",
      name: "访问量",
    },
    series: [
      {
        data: accessStats.value.values || [],
        type: "line",
        smooth: true,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#409EFF",
        },
      },
    ],
  };
  accessChart.setOption(option);
};

// 初始化设备分布图表
const initDeviceChart = () => {
  if (!deviceChartRef.value) return;
  if (deviceChart) {
    deviceChart.dispose();
  }
  deviceChart = echarts.init(deviceChartRef.value);
  updateDeviceChart();
};

// 更新设备分布图表
const updateDeviceChart = () => {
  if (!deviceChart) return;
  const option = {
    title: {
      text: "设备分布",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: deviceStats.value.data || [],
        label: {
          show: true,
          position: "outside",
        },
      },
    ],
  };
  deviceChart.setOption(option);
};

// 初始化地区分布图表
const initRegionChart = () => {
  if (!regionChartRef.value) return;
  if (regionChart) {
    regionChart.dispose();
  }
  regionChart = echarts.init(regionChartRef.value);
  updateRegionChart();
};

// 更新地区分布图表
const updateRegionChart = () => {
  if (!regionChart) return;
  const option = {
    title: {
      text: "地区分布",
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: regionStats.value.data || [],
        label: {
          show: true,
          position: "outside",
        },
      },
    ],
  };
  regionChart.setOption(option);
};

// 初始化IP统计图表
const initIpChart = () => {
  if (!ipChartRef.value) return;
  if (ipChart) {
    ipChart.dispose();
  }
  ipChart = echarts.init(ipChartRef.value);
  updateIpChart();
};

// 更新IP统计图表
const updateIpChart = () => {
  if (!ipChart) return;
  const option = {
    title: {
      text: "Top 10 IP访问量",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "value",
      name: "访问量",
    },
    yAxis: {
      type: "category",
      data: ipStats.value.data?.map((item) => item.ip) || [],
      name: "IP地址",
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    series: [
      {
        data: ipStats.value.data?.map((item) => item.count) || [],
        type: "bar",
        itemStyle: {
          color: "#67C23A",
        },
      },
    ],
  };
  ipChart.setOption(option);
};

// 加载仪表盘统计数据
const loadDashboardStats = async () => {
  try {
    const res = await request.get("/dashboard/dashboard_stats/");
    if (res.code === 200) {
      stats.value = res.data;
    }
  } catch (error) {
    ElMessage.error("加载统计数据失败");
  }
};

// 加载访问统计
const loadAccessStats = async () => {
  try {
    const res = await request.get(`/dashboard/access_stats/?period=${accessPeriod.value}`);
    if (res.code === 200) {
      accessStats.value = res.data;
      updateAccessChart();
    }
  } catch (error) {
    ElMessage.error("加载访问统计失败");
  }
};

// 加载设备统计
const loadDeviceStats = async () => {
  try {
    const res = await request.get("/dashboard/device_stats/");
    if (res.code === 200) {
      const data = res.data.labels.map((label, index) => ({
        name: label,
        value: res.data.values[index],
      }));
      deviceStats.value = { data };
      updateDeviceChart();
    }
  } catch (error) {
    ElMessage.error("加载设备统计失败");
  }
};

// 加载IP统计
const loadIpStats = async () => {
  try {
    const res = await request.get("/dashboard/ip_stats/");
    if (res.code === 200) {
      ipStats.value = { data: res.data };
      updateIpChart();
    }
  } catch (error) {
    ElMessage.error("加载IP统计失败");
  }
};

// 加载地区统计
const loadRegionStats = async () => {
  try {
    const res = await request.get("/dashboard/region_stats/");
    if (res.code === 200) {
      const data = res.data.labels.map((label, index) => ({
        name: label,
        value: res.data.values[index],
      }));
      regionStats.value = { data };
      updateRegionChart();
    }
  } catch (error) {
    ElMessage.error("加载地区统计失败");
  }
};

// 处理窗口大小变化
const handleResize = () => {
  accessChart?.resize();
  deviceChart?.resize();
  regionChart?.resize();
  ipChart?.resize();
};

// 初始化加载数据
onMounted(async () => {
  const { isLogin, userInfo: info } = await authStore.getLoginState();
  if (!isLogin || !info.is_staff) {
    ElMessage.warning("只有管理员才能访问后台管理系统");
    router.push("/");
  } else {
    userInfo.value = info;

    // 使用 nextTick 确保 DOM 已经完全渲染
    await nextTick();

    // 初始化图表
    initAccessChart();
    initDeviceChart();
    initRegionChart();
    initIpChart();

    // 加载仪表盘数据
    await loadDashboardStats();
    await loadAccessStats();
    await loadDeviceStats();
    await loadRegionStats();
    await loadIpStats();

    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);
  }
});

// 监听菜单切换，重新初始化图表和加载数据
watch(
  () => activeMenu.value,
  async (newMenu) => {
    if (newMenu === "dashboard") {
      await nextTick();
      initAccessChart();
      initDeviceChart();
      initRegionChart();
      initIpChart();
    } else if (newMenu === "audit") {
      // 切换到审核页面时加载待审核文章
      loadAuditArticles();
    }
  },
);

// 清理图表实例
onUnmounted(() => {
  accessChart?.dispose();
  deviceChart?.dispose();
  regionChart?.dispose();
  ipChart?.dispose();
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.admin-dashboard {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  background-color: #1f2329;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: width 0.3s;
}

.admin-logo {
  padding: 20px;
  border-bottom: 1px solid #30363d;
}

.admin-logo h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.admin-menu {
  margin-top: 20px;
  border-right: none;
}

.admin-menu .el-menu-item {
  color: #c9d1d9;
  height: 50px;
  line-height: 50px;
  margin: 0 10px;
  border-radius: 6px;
}

.admin-menu .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-menu .el-menu-item.is-active {
  background-color: #238636;
  color: #fff;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  position: fixed;
  right: 0;
  left: 200px;
  top: 0;
  z-index: 99;
  transition: left 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.admin-main {
  margin-left: 200px;
  margin-top: 60px;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  transition: margin-left 0.3s;
  background-color: #f9fafb;
}

/* 仪表盘样式 */
.dashboard-content {
  width: 100%;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 24px;
  color: #409eff;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ecf5ff;
  border-radius: 8px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.chart-container {
  height: 300px;
  margin-top: 20px;
}

/* 审核页面样式 */
.audit-content {
  width: 100%;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
}

.article-title {
  color: #409eff;
  text-decoration: none;
}

.article-title:hover {
  text-decoration: underline;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-audit {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 60px !important;
  }

  .admin-header {
    left: 60px;
  }

  .admin-main {
    margin-left: 60px;
  }

  .admin-logo h1,
  .admin-menu .el-menu-item span {
    display: none;
  }

  .stat-value {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;
  }

  .audit-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .pagination {
    justify-content: center;
  }
}
</style>
