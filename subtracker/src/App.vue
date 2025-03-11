<script setup>
import { onMounted } from 'vue'
import { useSubscriptionStore } from './stores/subscriptionStore'

const subscriptionStore = useSubscriptionStore()

onMounted(() => {
  // 从本地存储加载数据
  subscriptionStore.loadFromLocalStorage()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">SubTracker</h1>
            </div>
          </div>
        </div>
      </div>
    </header>

    <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between">
          <div class="flex">
            <router-link 
              to="/" 
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              active-class="border-b-2 border-indigo-500 text-gray-900 dark:text-white"
            >
              首页
            </router-link>
            <router-link 
              to="/subscriptions" 
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              active-class="border-b-2 border-indigo-500 text-gray-900 dark:text-white"
            >
              我的订阅
            </router-link>
            <router-link 
              to="/statistics" 
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              active-class="border-b-2 border-indigo-500 text-gray-900 dark:text-white"
            >
              财务统计
            </router-link>
            <router-link 
              to="/reminders" 
              class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              active-class="border-b-2 border-indigo-500 text-gray-900 dark:text-white"
            >
              续费提醒
            </router-link>
          </div>
          <div class="flex items-center">
            <router-link 
              to="/subscription/add" 
              class="ml-4 px-3 py-1 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              添加订阅
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <router-view />
      </div>
    </main>
  </div>
</template>
