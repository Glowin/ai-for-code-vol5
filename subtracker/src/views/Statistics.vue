<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">财务统计</h2>
    
    <!-- 总览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">月度支出</h3>
        <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">¥{{ monthlyTotal.toFixed(2) }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">每月平均支出</p>
      </div>
      
      <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">年度支出</h3>
        <p class="text-3xl font-bold text-green-600 dark:text-green-400">¥{{ yearlyTotal.toFixed(2) }}</p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">全年预计支出</p>
      </div>
    </div>
    
    <!-- 分类支出饼图 -->
    <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">分类支出占比</h3>
      <div v-if="hasSubscriptions" class="h-80" ref="categoryChartRef"></div>
      <div v-else class="h-80 flex items-center justify-center">
        <p class="text-gray-500 dark:text-gray-400">暂无数据</p>
      </div>
    </div>
    
    <!-- 分类详细列表 -->
    <div class="bg-white dark:bg-gray-700 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">分类详细支出</h3>
      
      <div v-if="hasSubscriptions" class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">分类</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">月度支出</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">年度支出</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">占比</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            <tr v-for="(amount, category) in expensesByCategory" :key="category" v-show="amount > 0">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">¥{{ amount.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">¥{{ (amount * 12).toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ ((amount / monthlyTotal) * 100).toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">暂无订阅数据</p>
        <router-link 
          to="/subscription/add" 
          class="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          添加订阅
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  LabelLayout
])

const subscriptionStore = useSubscriptionStore()

// 获取数据
const monthlyTotal = computed(() => subscriptionStore.getMonthlyTotal)
const yearlyTotal = computed(() => subscriptionStore.getYearlyTotal)
const expensesByCategory = computed(() => subscriptionStore.getExpensesByCategory)
const hasSubscriptions = computed(() => monthlyTotal.value > 0)

// 图表引用
const categoryChartRef = ref(null)
let categoryChart = null

// 初始化图表
function initCategoryChart() {
  if (!categoryChartRef.value) return
  
  // 创建图表实例
  categoryChart = echarts.init(categoryChartRef.value)
  
  // 更新图表数据
  updateCategoryChart()
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    categoryChart && categoryChart.resize()
  })
}

// 更新分类饼图数据
function updateCategoryChart() {
  if (!categoryChart) return
  
  const chartData = []
  const categories = Object.keys(expensesByCategory.value)
  
  categories.forEach(category => {
    const amount = expensesByCategory.value[category]
    if (amount > 0) {
      chartData.push({
        name: category,
        value: amount
      })
    }
  })
  
  // 设置图表选项
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
      }
    },
    series: [
      {
        name: '月度支出',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }
  
  // 应用配置
  categoryChart.setOption(option)
}

// 监听数据变化，更新图表
watch(
  () => expensesByCategory.value,
  () => {
    if (categoryChart) {
      updateCategoryChart()
    }
  },
  { deep: true }
)

// 组件挂载后初始化图表
onMounted(() => {
  initCategoryChart()
})
</script>