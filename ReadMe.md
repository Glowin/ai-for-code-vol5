## 用户背景

一个好奇且好学的年轻人，最喜欢的博客是 Life Hacker，喜欢寻找生活和工作的小窍门，并利用这些技巧来提升个人效率。希望将自己的需求做成产品，赚取人生的第一桶金。
懂一点编程，但是不多。

## 用户需求
平时会订阅很多的服务，例如 Netflix、爱奇艺、网易云音乐等流媒体服务，创客贴、剪映等创意工具，盒马、山姆、京东会员等购物会员。需要有一个工具来记录并管理自己订阅过的服务，监控自己的月均和年度支出，帮助自己更好的了解自己的财务状况。

问了一圈身边的朋友，他们也有类似的需求，如果我做一个这种产品，再把里面有价值的功能拆分成付费功能，卖给他们，不就能赚到一大笔钱么，这可真是一个绝顶聪明的创业想法！
但是，我不会写代码咋整？

**Trae it!** 

## 完善需求

1. 使用 Trae 的 Chat 功能，帮助我梳理并整理需求；
2. 帮我脑爆有哪些可以付费的功能；
3. 起一个朗朗上口的名字，选一个好记的域名；

# 产品名称
SubTracker（订阅追踪者）

# 产品功能清单
## 1. 订阅服务记录与基础管理
这是产品的基础功能，允许用户：
- 添加各类订阅服务（Netflix、爱奇艺等）
- 记录关键信息：
  - 服务名称和图标
  - 订阅价格和付费周期（月付/年付等）
  - 订阅开始日期
  - 下次续费日期
- 简单分类（如娱乐、工具、购物等）
- 查看、编辑和删除已添加的订阅

## 2. 基础财务统计与可视化
帮助用户了解自己的订阅支出情况：
- 计算月度和年度总支出
- 显示各类别订阅的支出占比
- 简单的数据可视化（如饼图展示类别分布）
- 基础支出趋势图表

## 3. 续费提醒功能
解决用户最痛点的问题之一：
- 在订阅即将到期前发送通知提醒
- 显示近期需要续费的订阅列表
- 简单的日历视图，标记出续费日期
- 可选的提醒时间设置（如提前3天、7天等）

# SubTracker 技术选型方案

## 前端技术栈

核心框架

- Vue 3 + Vite

UI 框架

- Tailwind CSS
- HeadlessUI

状态管理
- Pinia

路由管理
- Vue Router

## 本地数据存储方案

- IndexedDB

## 图表可视化
- ECharts

## 通知实现
- 浏览器通知 API ：实现续费提醒