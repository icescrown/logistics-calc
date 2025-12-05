<template>
  <el-container class="home-container">
    <!-- 左侧导航栏 -->
    <el-aside width="200px" class="home-aside">
      <div class="logo">
        <h2>物流管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <!-- 基础信息管理 -->
        <el-sub-menu index="1">
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>基础信息管理</span>
          </template>
          <el-menu-item index="/home/warehouse">发出仓库管理</el-menu-item>
          <el-menu-item index="/home/carrier">承运商管理</el-menu-item>
          <el-menu-item index="/home/logistics-method">物流方式管理</el-menu-item>
          <el-menu-item index="/home/region">区域管理</el-menu-item>
        </el-sub-menu>
        
        <!-- 报价管理 -->
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>报价管理</span>
          </template>
          <el-menu-item index="/home/quotation">报价配置</el-menu-item>
          <el-menu-item index="/home/quotation/import">报价导入导出</el-menu-item>
        </el-sub-menu>
        
        <!-- 物流方案计算 -->
        <el-menu-item index="/home/calculation">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>物流方案计算</span>
          </template>
        </el-menu-item>
        
        <!-- 系统设置 -->
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/home/system/log">系统日志</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部工具栏 -->
      <el-header class="home-header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleCollapse"
            :icon="isCollapse ? 'Menu' : 'MenuFold'"
          ></el-button>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar"></el-avatar>
              <span>{{ userName }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="home-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { ElMessage } from 'element-plus';
import {
  Menu,
  Document,
  Setting,
  ArrowDown,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 菜单折叠状态
const isCollapse = ref(false);

// 用户信息
const userName = ref('管理员');
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 切换菜单折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 菜单选择处理
const handleMenuSelect = (key: string) => {
  router.push(key);
};

// 个人中心
const handleProfile = () => {
  ElMessage.info('个人中心功能开发中');
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push('/');
  ElMessage.success('退出登录成功');
};

// 初始化
onMounted(() => {
  // 初始化用户信息
  if (userStore.userInfo) {
    userName.value = userStore.userInfo.name;
  }
});
</script>

<style scoped>
:deep(.el-container) {
  height: 100vh;
  width: 100%;
}

.home-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.home-aside {
  background-color: #545c64;
  color: #fff;
  overflow-y: auto;
}

.logo {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #666;
}

.logo h2 {
  color: #fff;
  font-size: 18px;
  margin: 0;
}

.el-menu-vertical-demo {
  border-right: none;
  height: calc(100% - 70px);
}

.home-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info span {
  margin: 0 10px;
}

.home-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
  height: calc(100vh - 60px);
}
</style>