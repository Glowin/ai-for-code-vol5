<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">我的订阅</h2>
      <router-link 
        to="/subscription/add" 
        class="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        添加订阅
      </router-link>
    </div>
    
    <!-- 分类筛选 -->
    <div class="mb-6">
      <div class="flex flex-wrap gap-2">
        <button 
          @click="selectedCategory = null" 
          class="px-3 py-1 text-sm rounded-full" 
          :class="selectedCategory === null ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
        >
          全部
        </button>
        <button 
          v-for="category in categories" 
          :key="category" 
          @click="selectedCategory = category" 
          class="px-3 py-1 text-sm rounded-full" 
          :class="selectedCategory === category ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
        >
          {{ category }}
        </button>
      </div>
    </div>
    
    <!-- 订阅列表 -->
    <div v-if="filteredSubscriptions.length > 0" class="space-y-4">
      <div 
        v-for="subscription in filteredSubscriptions" 
        :key="subscription.id" 
        class="bg-white dark:bg-gray-700 shadow overflow-hidden rounded-lg"
      >
        <div class="px-6 py-4">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ subscription.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ subscription.category }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-medium text-gray-900 dark:text-white">¥{{ subscription.price }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ getBillingCycleText(subscription.billingCycle) }}付</p>
            </div>
          </div>
          
          <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500 dark:text-gray-400">开始日期</p>
              <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(subscription.startDate) }}</p>
            </div>
            <div>
              <p class="text-gray-500 dark:text-gray-400">下次续费日期</p>
              <p class="font-medium" :class="isNearRenewal(subscription.nextRenewalDate) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'">
                {{ formatDate(subscription.nextRenewalDate) }}
              </p>
            </div>
          </div>
          
          <div class="mt-4 flex justify-end space-x-2">
            <router-link 
              :to="`/subscription/edit/${subscription.id}`" 
              class="px-3 py-1 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              编辑
            </router-link>
            <button 
              @click="confirmDelete(subscription)" 
              class="px-3 py-1 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p class="text-gray-500 dark:text-gray-400 mb-4">还没有添加任何订阅服务</p>
      <router-link 
        to="/subscription/add" 
        class="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        添加第一个订阅
      </router-link>
    </div>
    
    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">确认删除</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">确定要删除订阅 "{{ subscriptionToDelete?.name }}" 吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete" 
            class="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button 
            @click="deleteSubscription" 
            class="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const subscriptionStore = useSubscriptionStore()

// 获取所有订阅和分类
const subscriptions = computed(() => subscriptionStore.getAllSubscriptions)
const categories = computed(() => subscriptionStore.getAllCategories)

// 分类筛选
const selectedCategory = ref(null)

// 根据选择的分类过滤订阅
const filteredSubscriptions = computed(() => {
  if (!selectedCategory.value) {
    return subscriptions.value
  }
  return subscriptions.value.filter(sub => sub.category === selectedCategory.value)
})

// 删除确认状态
const showDeleteConfirm = ref(false)
const subscriptionToDelete = ref(null)

// 确认删除
function confirmDelete(subscription) {
  subscriptionToDelete.value = subscription
  showDeleteConfirm.value = true
}

// 取消删除
function cancelDelete() {
  showDeleteConfirm.value = false
  subscriptionToDelete.value = null
}

// 执行删除
function deleteSubscription() {
  if (subscriptionToDelete.value) {
    subscriptionStore.deleteSubscription(subscriptionToDelete.value.id)
    showDeleteConfirm.value = false
    subscriptionToDelete.value = null
  }
}

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

// 检查是否接近续费日期（7天内）
function isNearRenewal(dateString) {
  const today = new Date()
  const renewalDate = new Date(dateString)
  const diffTime = renewalDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}
</script>