import { defineStore } from 'pinia'

// 用于生成唯一ID的辅助函数
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptions: [],
    categories: ['娱乐', '工具', '购物', '音乐', '视频', '游戏', '其他']
  }),
  
  getters: {
    // 获取所有订阅
    getAllSubscriptions: (state) => state.subscriptions,
    
    // 获取所有分类
    getAllCategories: (state) => state.categories,
    
    // 按分类获取订阅
    getSubscriptionsByCategory: (state) => (category) => {
      return state.subscriptions.filter(sub => sub.category === category)
    },
    
    // 通过ID获取订阅
    getSubscriptionById: (state) => (id) => {
      return state.subscriptions.find(sub => sub.id === id)
    },
    
    // 获取即将到期的订阅（30天内）
    getUpcomingRenewals: (state) => {
      const today = new Date()
      const thirtyDaysLater = new Date()
      thirtyDaysLater.setDate(today.getDate() + 30)
      
      return state.subscriptions.filter(sub => {
        const renewalDate = new Date(sub.nextRenewalDate)
        return renewalDate >= today && renewalDate <= thirtyDaysLater
      }).sort((a, b) => new Date(a.nextRenewalDate) - new Date(b.nextRenewalDate))
    },
    
    // 计算月度总支出
    getMonthlyTotal: (state) => {
      return state.subscriptions.reduce((total, sub) => {
        // 根据付费周期计算月均支出
        let monthlyAmount = 0
        switch(sub.billingCycle) {
          case 'monthly':
            monthlyAmount = sub.price
            break
          case 'yearly':
            monthlyAmount = sub.price / 12
            break
          case 'quarterly':
            monthlyAmount = sub.price / 3
            break
          case 'weekly':
            monthlyAmount = sub.price * 4.33 // 平均一个月4.33周
            break
          default:
            monthlyAmount = sub.price
        }
        return total + monthlyAmount
      }, 0)
    },
    
    // 计算年度总支出
    getYearlyTotal: (state) => {
      return state.subscriptions.reduce((total, sub) => {
        // 根据付费周期计算年均支出
        let yearlyAmount = 0
        switch(sub.billingCycle) {
          case 'monthly':
            yearlyAmount = sub.price * 12
            break
          case 'yearly':
            yearlyAmount = sub.price
            break
          case 'quarterly':
            yearlyAmount = sub.price * 4
            break
          case 'weekly':
            yearlyAmount = sub.price * 52 // 一年52周
            break
          default:
            yearlyAmount = sub.price * 12
        }
        return total + yearlyAmount
      }, 0)
    },
    
    // 按分类统计支出
    getExpensesByCategory: (state) => {
      const result = {}
      state.categories.forEach(category => {
        result[category] = 0
      })
      
      state.subscriptions.forEach(sub => {
        let monthlyAmount = 0
        switch(sub.billingCycle) {
          case 'monthly':
            monthlyAmount = sub.price
            break
          case 'yearly':
            monthlyAmount = sub.price / 12
            break
          case 'quarterly':
            monthlyAmount = sub.price / 3
            break
          case 'weekly':
            monthlyAmount = sub.price * 4.33
            break
          default:
            monthlyAmount = sub.price
        }
        
        if (result[sub.category]) {
          result[sub.category] += monthlyAmount
        } else {
          result[sub.category] = monthlyAmount
        }
      })
      
      return result
    }
  },
  
  actions: {
    // 添加新订阅
    addSubscription(subscription) {
      const newSubscription = {
        ...subscription,
        id: generateId(),
        createdAt: new Date().toISOString()
      }
      this.subscriptions.push(newSubscription)
      this.saveToLocalStorage()
      return newSubscription
    },
    
    // 更新订阅
    updateSubscription(subscription) {
      const index = this.subscriptions.findIndex(sub => sub.id === subscription.id)
      if (index !== -1) {
        this.subscriptions[index] = {
          ...subscription,
          updatedAt: new Date().toISOString()
        }
        this.saveToLocalStorage()
        return true
      }
      return false
    },
    
    // 删除订阅
    deleteSubscription(id) {
      const index = this.subscriptions.findIndex(sub => sub.id === id)
      if (index !== -1) {
        this.subscriptions.splice(index, 1)
        this.saveToLocalStorage()
        return true
      }
      return false
    },
    
    // 添加自定义分类
    addCategory(category) {
      if (!this.categories.includes(category)) {
        this.categories.push(category)
        this.saveToLocalStorage()
        return true
      }
      return false
    },
    
    // 保存到本地存储
    saveToLocalStorage() {
      localStorage.setItem('subscriptions', JSON.stringify(this.subscriptions))
      localStorage.setItem('categories', JSON.stringify(this.categories))
    },
    
    // 从本地存储加载数据
    loadFromLocalStorage() {
      const subscriptions = localStorage.getItem('subscriptions')
      const categories = localStorage.getItem('categories')
      
      if (subscriptions) {
        this.subscriptions = JSON.parse(subscriptions)
      }
      
      if (categories) {
        this.categories = JSON.parse(categories)
      }
    }
  }
})