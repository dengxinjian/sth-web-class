# 重构版本测试指南

## ✅ 问题已修复

我已经修复了导致"点击课程页面不显示内容"的问题：

### 修复内容

1. **添加了 currentWeek 检查**
   ```javascript
   async getScheduleData() {
     if (!this.selectedAthletic) return
     if (!this.currentWeek || this.currentWeek.length === 0) return  // ✅ 新增
     // ...
   }
   ```

2. **调整了初始化顺序**
   - 移除了 `getTeamAndAthleticData()` 中过早的 `getScheduleData()` 调用
   - 移除了 `getAthleticList()` 中过早的 `getScheduleData()` 调用
   - `getScheduleData()` 现在会在 `WeekRangePicker` 初始化完成后通过 `onWeekChange` 事件自动调用

## 🚀 快速测试步骤

### 步骤 1: 重启服务
```bash
# 如果服务在运行，先停止（Ctrl+C）
# 然后重新启动
npm run dev
```

### 步骤 2: 打开页面
1. 在浏览器中访问课程管理页面
2. 打开浏览器开发者工具（F12）

### 步骤 3: 验证功能

#### ✅ 检查项 1: 左侧菜单显示
- [ ] 左侧应该显示"运动员"和"课程"两个菜单项
- [ ] 默认"课程"应该是激活状态（黑色背景）

#### ✅ 检查项 2: 课程列表显示
- [ ] 中间区域应该显示课程列表
- [ ] 顶部有"我的课程"和"官方课程"切换标签
- [ ] 下方有"新增"按钮和搜索框
- [ ] 应该看到课程分组（如"未分组"）
- [ ] 分组下应该显示课程卡片

#### ✅ 检查项 3: 日程表显示
- [ ] 右侧应该显示周日历
- [ ] 顶部有团队和运动员选择器
- [ ] 显示周一到周日的日期

#### ✅ 检查项 4: 统计面板显示
- [ ] 最右侧应该显示统计面板
- [ ] 显示 STH 数据
- [ ] 显示周统计数据

## 🐛 如果仍有问题

### 方案 A: 查看控制台日志

在浏览器控制台中，你应该看到：
```
📚 开始获取课程列表, activeClassType: my
📚 课程列表API返回: {success: true, result: [...]}
📚 处理后的课程列表: [...]
```

如果没有这些日志，说明 API 调用有问题。

### 方案 B: 检查 API 响应

在 Network 标签中检查以下请求：

1. `/api/team/coach/all-teams`
   - 应该返回 200 状态码
   - 返回团队列表数据

2. `/api/classes/getClassesByUserIdGroupedWithName`
   - 应该返回 200 状态码
   - 返回课程列表数据

### 方案 C: 临时添加调试代码

如果课程列表仍然不显示，在 `ClassList.vue` 中添加调试信息：

```vue
<template>
  <div class="class-container">
    <!-- 添加调试信息 -->
    <div style="padding: 10px; background: yellow;">
      调试：classList长度 = {{ classList.length }}
      <br>
      activeClassType = {{ activeClassType }}
    </div>
    
    <!-- 原有内容 -->
    <ul class="class-type-list">
      ...
    </ul>
  </div>
</template>
```

## 🔄 对比测试

如果你想对比重构前后的效果：

### 使用原版本
```bash
cd /Users/michenlle/Desktop/sth-web-class/src/views/classManagement
# 备份重构版
cp index-refactored.vue index-refactored-backup.vue
# 使用原版
mv index.vue index-refactored.vue
mv index-old.vue index.vue
# 重启服务
npm run dev
```

### 切回重构版本
```bash
cd /Users/michenlle/Desktop/sth-web-class/src/views/classManagement
# 恢复重构版
mv index.vue index-old.vue
mv index-refactored.vue index.vue
# 重启服务
npm run dev
```

## 📊 测试用例

### 测试 1: 基本显示
1. 打开页面
2. 确认课程列表显示
3. **预期结果**: 看到课程分组和课程卡片

### 测试 2: 切换课程类型
1. 点击"官方课程"标签
2. **预期结果**: 显示官方课程列表

### 测试 3: 搜索功能
1. 在搜索框输入关键词
2. 点击搜索按钮
3. **预期结果**: 显示过滤后的课程

### 测试 4: 新增课程
1. 点击"新增"按钮
2. 选择"新增课程"
3. **预期结果**: 弹出选择运动类型的对话框

### 测试 5: 课程操作
1. 点击课程卡片右侧的"..."按钮
2. **预期结果**: 显示操作菜单（移动、删除、复制）

## 🎯 成功标准

页面功能正常的标准：
- ✅ 课程列表正常显示
- ✅ 可以切换课程类型（我的/官方）
- ✅ 搜索功能正常
- ✅ 新增课程功能正常
- ✅ 课程操作（移动、删除、复制）正常
- ✅ 拖拽功能正常
- ✅ 日程表正常显示
- ✅ 统计数据正常显示
- ✅ 无控制台错误

## 📝 测试报告模板

如果需要报告问题，请使用以下模板：

```
### 问题描述
[描述具体问题]

### 复现步骤
1. 
2. 
3. 

### 预期结果
[应该发生什么]

### 实际结果
[实际发生了什么]

### 控制台错误
```
[粘贴控制台错误信息]
```

### 截图
[如果可能，附上截图]

### 环境信息
- 浏览器: [Chrome/Firefox/Safari + 版本号]
- Node 版本: [node --version]
- npm 版本: [npm --version]
```

---

**测试状态:** ⏳ 待测试  
**修复版本:** v2.0.1  
**最后更新:** 2025-10-14

