<script setup lang="ts">
// App.vue 入口组件
import { onMounted } from 'vue';
import { useUserStore } from './store/user';

const userStore = useUserStore();

// 初始化用户状态
onMounted(() => {
  userStore.initUser();
});
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  background-color: #fff;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>
