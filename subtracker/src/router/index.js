import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/Subscriptions.vue'),
    meta: { title: '我的订阅' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/Statistics.vue'),
    meta: { title: '财务统计' }
  },
  {
    path: '/reminders',
    name: 'Reminders',
    component: () => import('../views/Reminders.vue'),
    meta: { title: '续费提醒' }
  },
  {
    path: '/subscription/add',
    name: 'AddSubscription',
    component: () => import('../views/AddSubscription.vue'),
    meta: { title: '添加订阅' }
  },
  {
    path: '/subscription/edit/:id',
    name: 'EditSubscription',
    component: () => import('../views/EditSubscription.vue'),
    meta: { title: '编辑订阅' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `SubTracker - ${to.meta.title || '订阅管理'}`
  next()
})

export default router