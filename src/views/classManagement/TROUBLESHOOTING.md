# 重构版本问题排查指南

## ❌ 问题：点击课程，页面没有显示内容

### 🔍 已修复的问题

我已经修复了以下问题：

1. **currentWeek 初始化问题**
   - 问题：`currentWeek` 初始化为空数组，导致 `getScheduleData()` 访问 `currentWeek[0]` 时报错
   - 修复：在 `getScheduleData()` 中添加了检查条件

2. **初始化顺序问题**
   - 问题：在 `WeekRangePicker` 初始化之前就调用了 `getScheduleData()`
   - 修复：移除了过早的 `getScheduleData()` 调用，等待 `onWeekChange` 事件触发

### ✅ 验证步骤

请按以下步骤验证修复：

1. **刷新页面**
   ```bash
   # 重启开发服务器
   npm run dev
   ```

2. **检查浏览器控制台**
   - 打开 Chrome DevTools (F12)
   - 查看 Console 标签页
   - 确认没有报错信息

3. **检查课程数据加载**
   - 打开 Network 标签页
   - 刷新页面
   - 查找以下 API 请求：
     - `/api/team/coach/all-teams` - 应该返回团队数据
     - `/api/classes/getClassesByUserIdGroupedWithName` - 应该返回课程数据

4. **检查 Vue DevTools**
   - 安装 Vue DevTools 扩展
   - 查看组件树
   - 检查 `ClassManagement` 组件的 data：
     - `classList` - 应该有数据
     - `selectedTeam` - 应该有值
     - `selectedAthletic` - 应该有值

### 🐛 如果仍然不显示，请检查

#### 1. API 返回数据格式

确认 API 返回的数据格式正确：

```javascript
// 正确的返回格式
{
  success: true,
  result: [
    {
      groupId: 1,
      groupName: "未分组",
      classesList: [
        {
          id: 1,
          classesJson: '{"title": "课程名称", ...}',
          sportType: "RUN"
        }
      ]
    }
  ]
}
```

#### 2. 检查组件渲染

在浏览器中检查 DOM 结构：

```
.container
  .athletic-container
    .left-menu (左侧菜单)
    .type-change (中间区域 - 应该显示课程列表)
      .class-container-wrapper
        .class-container
          .class-type-list (我的/官方切换)
          .class-operation (新增按钮和搜索)
          .schedule-class-container (课程列表区域)
    .schedule (日程表)
    .week-statistic (统计面板)
```

#### 3. 检查 CSS 样式

确认以下样式正确应用：

```scss
.type-change {
  flex: 0 0 260px;  // 固定宽度 260px
  height: 100vh;
  max-height: calc(100vh - 60px);
}

.class-container-wrapper {
  height: 100%;  // 应该继承父容器高度
  display: flex;
  flex-direction: column;
}
```

#### 4. 添加调试代码

在 `index-refactored.vue` 的 `getClassList` 方法中添加 console.log：

```javascript
async getClassList() {
  const apiMethod = this.activeClassType === 'official'
    ? classApi.getOfficialClasses
    : classApi.getClassesByUserId

  console.log('📚 开始获取课程列表, activeClassType:', this.activeClassType)
  
  const res = await apiMethod(this.classSearchInput)
  
  console.log('📚 课程列表API返回:', res)
  
  if (res.success) {
    this.classList = res.result.map(item => ({
      timespan: new Date().getTime(),
      ...item,
      classesCount: item.classesList.length,
      classesList: item.classesList.map(part => ({
        ...part,
        classesJson: parseClassesJson(part.classesJson)
      }))
    }))
    
    console.log('📚 处理后的课程列表:', this.classList)
    
    this.$nextTick(() => {
      this.classSlideChange()
    })
  } else {
    console.error('❌ 获取课程列表失败:', res)
    this.classList = []
  }
}
```

### 🔧 临时解决方案

如果问题依然存在，可以临时回退到原版本：

```bash
cd /Users/michenlle/Desktop/sth-web-class/src/views/classManagement
mv index.vue index-refactored-backup.vue
mv index-old.vue index.vue
npm run dev
```

### 📱 联系支持

如果以上步骤都无法解决问题，请提供：

1. 浏览器控制台的完整错误信息
2. Network 标签页中 API 请求的响应数据
3. Vue DevTools 中的组件数据截图

---

## 🎯 常见问题解答

### Q: 课程类型切换（我的/官方）不工作？
**A:** 检查 `ClassList.vue` 中的 `update:activeClassType` 事件是否正确触发。

### Q: 搜索功能不工作？
**A:** 确认 `handleClassSearch` 方法被正确调用，并且 `classSearchInput` 被传递给 API。

### Q: 拖拽功能不工作？
**A:** 确认 `dragMixin` 被正确引入，并且 `classSlideChange()` 在课程列表加载后被调用。

### Q: 新增课程按钮点击无反应？
**A:** 检查所有弹窗组件是否正确导入和注册。

---

**最后更新:** 2025-10-14  
**状态:** ✅ 主要问题已修复  
**版本:** v2.0.1

