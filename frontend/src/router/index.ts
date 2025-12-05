import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true },
    children: [
      // 基础信息管理
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('../views/warehouse/Index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'carrier',
        name: 'Carrier',
        component: () => import('../views/carrier/Index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'logistics-method',
        name: 'LogisticsMethod',
        component: () => import('../views/logisticsMethod/Index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'region',
        name: 'Region',
        component: () => import('../views/region/Index.vue'),
        meta: { requiresAuth: true },
      },
      // 报价管理
      {
        path: 'quotation',
        name: 'Quotation',
        component: () => import('../views/quotation/Index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'quotation/import',
        name: 'QuotationImport',
        component: () => import('../views/quotation/Import.vue'),
        meta: { requiresAuth: true },
      },
      // 物流方案计算
      {
        path: 'calculation',
        name: 'Calculation',
        component: () => import('../views/calculation/Index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((_to, _from, next) => {
  // 这里可以添加登录验证逻辑
  // 暂时直接放行
  next();
});

export default router;