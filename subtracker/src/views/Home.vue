<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">欢迎使用 SubTracker</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 月度支出卡片 -->
      <div class="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">月度总支出</h3>
        <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
          ¥{{ monthlyTotal.toFixed(2) }}
        </p>
      </div>
      
      <!-- 年度支出卡片 -->
      <div class="bg-green-50 dark:bg-green-900 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-medium text-green-800 dark:text-green-200 mb-2">年度总支出</h3>
        <p class="text-3xl font-bold text-green-600 dark:text-green-300">
          ¥{{ yearlyTotal.toFixed(2) }}
        </p>
      </div>
      
      <!-- 订阅数量卡片 -->
      <div class="bg-purple-50 dark:bg-purple-900 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">订阅服务数量</h3>
        <p class="text-3xl font-bold text-purple-600 dark:text-purple-300">
          {{ subscriptions.length }}
        </p>
      </div>
    </div>
    
    <!-- 即将到期的订阅 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">即将到期的订阅</h3>
      
      <div v-if="upcomingRenewals.length > 0" class="bg-white dark:bg-gray-700 shadow overflow-hidden rounded-md">
        <ul class="divide-y divide-gray-200 dark:divide-gray-600">
          <li v-for="subscription in upcomingRenewals" :key="subscription.id" class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-indigo-600 dark:text-indigo-400">{{ subscription.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ subscription.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900 dark:text-white">¥{{ subscription.price }} / {{ getBillingCycleText(subscription.billingCycle) }}</p>
                <p class="text-sm text-red-500">{{ formatDate(subscription.nextRenewalDate) }} 到期</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-md">
        <p class="text-gray-500 dark:text-gray-400">近期没有即将到期的订阅</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const subscriptionStore = useSubscriptionStore()

// 获取所有订阅
const subscriptions = computed(() => subscriptionStore.getAllSubscriptions)

// 获取即将到期的订阅
const upcomingRenewals = computed(() => subscriptionStore.getUpcomingRenewals)

// 获取月度总支出
const monthlyTotal = computed(() => subscriptionStore.getMonthlyTotal)

// 获取年度总支出
const yearlyTotal = computed(() => subscriptionStore.getYearlyTotal)

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取付费周期文本
function getBillingCycleText(cycle) {
  const cycleMap = {
    'weekly': '周',
    'monthly': '月',
    'quarterly': '季度',
    'yearly': '年'
  }
  return cycleMap[cycle] || '月'
}
</script>