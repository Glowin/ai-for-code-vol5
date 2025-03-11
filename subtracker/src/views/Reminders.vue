<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">续费提醒</h2>
    
    <!-- 提醒设置 -->
    <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">提醒设置</h3>
      
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">提前提醒天数</label>
          <select 
            v-model="reminderDays" 
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            @change="saveReminderSettings"
          >
            <option value="1">提前1天</option>
            <option value="3">提前3天</option>
            <option value="7">提前7天</option>
            <option value="14">提前14天</option>
            <option value="30">提前30天</option>
          </select>
        </div>
        
        <div class="flex items-center h-full pt-6 md:pt-0">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="notificationsEnabled" 
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
              @change="saveReminderSettings"
            >
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">启用浏览器通知</span>
          </label>
        </div>
        
        <div class="flex items-center h-full pt-2 md:pt-0 ml-auto">
          <button 
            @click="testNotification" 
            class="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            :disabled="!notificationsEnabled || !notificationPermissionGranted"
          >
            测试通知
          </button>
        </div>
      </div>
      
      <div v-if="notificationsEnabled && !notificationPermissionGranted" class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
        <p class="text-sm text-yellow-800 dark:text-yellow-200">
          您需要允许浏览器通知权限才能接收到期提醒。
          <button 
            @click="requestNotificationPermission" 
            class="ml-2 underline text-indigo-600 dark:text-indigo-400"
          >
            点击授权
          </button>
        </p>
      </div>
    </div>
    
    <!-- 即将到期的订阅 -->
    <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">即将到期的订阅</h3>
      
      <div v-if="upcomingRenewals.length > 0">
        <ul class="divide-y divide-gray-200 dark:divide-gray-600">
          <li v-for="subscription in upcomingRenewals" :key="subscription.id" class="py-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">{{ subscription.name }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ subscription.category }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium" :class="getDaysUntilRenewal(subscription.nextRenewalDate) <= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'">
                  {{ formatDate(subscription.nextRenewalDate) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getRenewalCountdown(subscription.nextRenewalDate) }}
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">近期没有即将到期的订阅</p>
      </div>
    </div>
    
    <!-- 简易日历视图 -->
    <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">续费日历</h3>
      
      <div class="overflow-hidden">
        <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden">
          <!-- 日历头部 -->
          <div 
            v-for="day in ['日', '一', '二', '三', '四', '五', '六']" 
            :key="day"
            class="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {{ day }}
          </div>
          
          <!-- 日历单元格 -->
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="min-h-[80px] p-2 bg-white dark:bg-gray-700 relative"
            :class="{
              'opacity-50': !day.isCurrentMonth,
              'bg-indigo-50 dark:bg-indigo-900': day.isToday
            }"
          >
            <div class="text-right text-xs font-medium mb-1" :class="day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'">
              {{ day.date.getDate() }}
            </div>
            
            <!-- 当天的续费项目 -->
            <div v-if="day.renewals.length > 0" class="space-y-1">
              <div 
                v-for="renewal in day.renewals" 
                :key="renewal.id"
                class="text-xs p-1 rounded truncate"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': getDaysUntilDate(day.date) <= 3,
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': getDaysUntilDate(day.date) > 3 && getDaysUntilDate(day.date) <= 7,
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': getDaysUntilDate(day.date) > 7
                }"
                :title="renewal.name + ' - ¥' + renewal.price"
              >
                {{ renewal.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'

const subscriptionStore = useSubscriptionStore()

// 获取即将到期的订阅
const upcomingRenewals = computed(() => subscriptionStore.getUpcomingRenewals)

// 提醒设置
const reminderDays = ref('7') // 默认提前7天提醒
const notificationsEnabled = ref(false)
const notificationPermissionGranted = ref(false)

// 日历相关
const currentMonth = ref(new Date())
const calendarDays = computed(() => generateCalendarDays(currentMonth.value))

// 检查通知权限
function checkNotificationPermission() {
  if ('Notification' in window) {
    notificationPermissionGranted.value = Notification.permission === 'granted'
    notificationsEnabled.value = localStorage.getItem('notificationsEnabled') === 'true'
    reminderDays.value = localStorage.getItem('reminderDays') || '7'
  }
}

// 请求通知权限
async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    notificationPermissionGranted.value = permission === 'granted'
    
    if (permission === 'granted') {
      notificationsEnabled.value = true
      saveReminderSettings()
    }
  }
}

// 保存提醒设置
function saveReminderSettings() {
  localStorage.setItem('reminderDays', reminderDays.value)
  localStorage.setItem('notificationsEnabled', notificationsEnabled.value)
  
  // 如果启用了通知但没有权限，请求权限
  if (notificationsEnabled.value && !notificationPermissionGranted.value) {
    requestNotificationPermission()
  }
}

// 测试通知
function testNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('SubTracker 续费提醒测试', {
      body: '这是一条测试通知，您的订阅提醒功能正常工作。',
      icon: '/vite.svg'
    })
  }
}

// 检查是否有即将到期的订阅并发送通知
function checkForDueSubscriptions() {
  if (!notificationsEnabled.value || !notificationPermissionGranted.value) return
  
  const today = new Date()
  const reminderThreshold = parseInt(reminderDays.value)
  
  upcomingRenewals.value.forEach(subscription => {
    const renewalDate = new Date(subscription.nextRenewalDate)
    const daysUntil = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntil === reminderThreshold) {
      new Notification('SubTracker 续费提醒', {
        body: `您的订阅「${subscription.name}」将在${reminderThreshold}天后到期，价格：¥${subscription.price}`,
        icon: '/vite.svg'
      })
    }
  })
}

// 生成日历数据
function generateCalendarDays(month) {
  const days = []
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  
  // 获取当月第一天
  const firstDay = new Date(year, monthIndex, 1)
  // 获取当月最后一天
  const lastDay = new Date(year, monthIndex + 1, 0)
  
  // 获取当月第一天是星期几（0-6，0表示星期日）
  const firstDayOfWeek = firstDay.getDay()
  
  // 添加上个月的日期
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, monthIndex - 1, prevMonthLastDay - i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      renewals: getSubscriptionsForDate(date)
    })
  }
  
  // 添加当月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, monthIndex, i)
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      renewals: getSubscriptionsForDate(date)
    })
  }
  
  // 添加下个月的日期，补齐日历（确保总共显示42个日期，即6行7列）
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, monthIndex + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
      renewals: getSubscriptionsForDate(date)
    })
  }
  
  return days
}

// 检查两个日期是否是同一天
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 获取指定日期的订阅
function getSubscriptionsForDate(date) {
  return subscriptionStore.getAllSubscriptions.filter(sub => {
    const renewalDate = new Date(sub.nextRenewalDate)
    return isSameDay(renewalDate, date)
  })
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取距离续费日期的天数
function getDaysUntilRenewal(dateString) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const renewalDate = new Date(dateString)
  renewalDate.setHours(0, 0, 0, 0)
  
  return Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24))
}

// 获取距离指定日期的天数
function getDaysUntilDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)
  
  return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24))
}

// 获取续费倒计时文本
function getRenewalCountdown(dateString) {
  const daysUntil = getDaysUntilRenewal(dateString)
  
  if (daysUntil === 0) {
    return '今天到期'
  } else if (daysUntil === 1) {
    return '明天到期'
  } else if (daysUntil <= 7) {
    return `${daysUntil}天后到期`
  } else {
    return `${daysUntil}天后到期`
  }
}

// 定时检查到期订阅
let checkInterval = null

onMounted(() => {
  checkNotificationPermission()
  
  // 每天检查一次到期订阅
  checkForDueSubscriptions()
  checkInterval = setInterval(checkForDueSubscriptions, 24 * 60 * 60 * 1000)
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})
</script>