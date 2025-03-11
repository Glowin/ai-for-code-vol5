<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const router = useRouter()
const route = useRoute()
const subscriptionStore = useSubscriptionStore()

// 获取订阅ID
const subscriptionId = route.params.id

// 表单数据
const subscription = ref({
  id: '',
  name: '',
  price: '',
  category: '',
  billingCycle: '',
  startDate: '',
  nextRenewalDate: '',
  description: '',
  website: '',
  logo: ''
})

// 获取所有分类
const categories = subscriptionStore.getAllCategories

// 加载订阅数据
onMounted(() => {
  const existingSubscription = subscriptionStore.getSubscriptionById(subscriptionId)
  if (existingSubscription) {
    subscription.value = { ...existingSubscription }
  } else {
    // 如果找不到订阅，返回列表页
    router.push('/subscriptions')
  }
})

// 计算下次续费日期
const calculateNextRenewalDate = () => {
  if (!subscription.value.startDate) return
  
  const startDate = new Date(subscription.value.startDate)
  const nextDate = new Date(startDate)
  
  switch (subscription.value.billingCycle) {
    case 'monthly':
      nextDate.setMonth(startDate.getMonth() + 1)
      break
    case 'quarterly':
      nextDate.setMonth(startDate.getMonth() + 3)
      break
    case 'semiannually':
      nextDate.setMonth(startDate.getMonth() + 6)
      break
    case 'yearly':
      nextDate.setFullYear(startDate.getFullYear() + 1)
      break
  }
  
  subscription.value.nextRenewalDate = nextDate.toISOString().split('T')[0]
}

// 监听开始日期和付费周期变化，自动计算下次续费日期
const updateNextRenewalDate = () => {
  calculateNextRenewalDate()
}

// 表单验证
const errors = ref({})
const validateForm = () => {
  errors.value = {}
  let isValid = true
  
  if (!subscription.value.name.trim()) {
    errors.value.name = '请输入服务名称'
    isValid = false
  }
  
  if (!subscription.value.price || isNaN(subscription.value.price) || Number(subscription.value.price) <= 0) {
    errors.value.price = '请输入有效的价格'
    isValid = false
  }
  
  if (!subscription.value.startDate) {
    errors.value.startDate = '请选择开始日期'
    isValid = false
  }
  
  if (!subscription.value.nextRenewalDate) {
    errors.value.nextRenewalDate = '请选择下次续费日期'
    isValid = false
  }
  
  return isValid
}

// 提交表单
const submitForm = () => {
  if (!validateForm()) return
  
  // 转换价格为数字
  subscription.value.price = Number(subscription.value.price)
  
  // 更新订阅
  subscriptionStore.updateSubscription(subscription.value)
  
  // 返回订阅列表页面
  router.push('/subscriptions')
}

// 取消编辑
const cancelEdit = () => {
  router.push('/subscriptions')
}

// 删除订阅
const deleteSubscription = () => {
  if (confirm('确定要删除这个订阅吗？此操作不可撤销。')) {
    subscriptionStore.deleteSubscription(subscription.value.id)
    router.push('/subscriptions')
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">编辑订阅</h2>
    </div>
    
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- 服务名称 -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">服务名称</label>
        <input 
          type="text" 
          id="name" 
          v-model="subscription.name" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="例如：Netflix、爱奇艺"
        >
        <p v-if="errors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.name }}</p>
      </div>
      
      <!-- 价格和付费周期 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">价格</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 dark:text-gray-400">¥</span>
            </div>
            <input 
              type="number" 
              id="price" 
              v-model="subscription.price" 
              class="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
            >
          </div>
          <p v-if="errors.price" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.price }}</p>
        </div>
        
        <div>
          <label for="billingCycle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">付费周期</label>
          <select 
            id="billingCycle" 
            v-model="subscription.billingCycle" 
            @change="updateNextRenewalDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="monthly">月付</option>
            <option value="quarterly">季付</option>
            <option value="semiannually">半年付</option>
            <option value="yearly">年付</option>
          </select>
        </div>
      </div>
      
      <!-- 分类 -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">分类</label>
        <select 
          id="category" 
          v-model="subscription.category" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </div>
      
      <!-- 日期选择 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">开始日期</label>
          <input 
            type="date" 
            id="startDate" 
            v-model="subscription.startDate" 
            @change="updateNextRenewalDate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
          <p v-if="errors.startDate" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.startDate }}</p>
        </div>
        
        <div>
          <label for="nextRenewalDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">下次续费日期</label>
          <input 
            type="date" 
            id="nextRenewalDate" 
            v-model="subscription.nextRenewalDate" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
          <p v-if="errors.nextRenewalDate" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.nextRenewalDate }}</p>
        </div>
      </div>
      
      <!-- 描述 -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">描述（可选）</label>
        <textarea 
          id="description" 
          v-model="subscription.description" 
          rows="3" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="添加关于此订阅的备注..."
        ></textarea>
      </div>
      
      <!-- 网站链接 -->
      <div>
        <label for="website" class="block text-sm font-medium text-gray-700 dark:text-gray-300">网站链接（可选）</label>
        <input 
          type="url" 
          id="website" 
          v-model="subscription.website" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="https://example.com"
        >
      </div>
      
      <!-- 按钮组 -->
      <div class="flex justify-between">
        <button 
          type="button" 
          @click="deleteSubscription" 
          class="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:border-red-600 dark:text-white dark:hover:bg-red-600"
        >
          删除订阅
        </button>
        
        <div class="flex space-x-3">
          <button 
            type="button" 
            @click="cancelEdit" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存
          </button>
        </div>
      </div>
    </form>
  </div>
</template>