# ExerciseProcessChart 运动过程图形显示组件

一个用于显示运动过程数据的图形化组件，通过灰色矩形的宽度和高度来分别表示运动时长和强度。

## 功能特性

- 🎯 **直观显示**: 矩形宽度表示运动时长，高度表示运动强度
- 📱 **响应式设计**: 组件宽高根据容器自适应
- 🎨 **美观界面**: 灰色主题，支持悬停效果和动画
- ⚡ **高性能**: 支持大量数据的高效渲染
- 🔧 **高度可配置**: 支持自定义高度、间距、动画等参数

## 基本用法

```vue
<template>
  <div class="chart-container">
    <ExerciseProcessChart 
      :exerciseList="exerciseData"
      :height="200"
    />
  </div>
</template>

<script>
import ExerciseProcessChart from '@/components/ExerciseProcessChart'

export default {
  components: {
    ExerciseProcessChart
  },
  data() {
    return {
      exerciseData: [
        { duration: 30, intensity: 80 },  // 30分钟，强度80%
        { duration: 45, intensity: 60 },  // 45分钟，强度60%
        { duration: 20, intensity: 90 },  // 20分钟，强度90%
        { duration: 60, intensity: 70 },  // 60分钟，强度70%
        { duration: 15, intensity: 95 }   // 15分钟，强度95%
      ]
    }
  }
}
</script>

<style>
.chart-container {
  width: 100%;
  height: 250px;
}
</style>
```

## Props 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `exerciseList` | Array | `[]` | 运动过程列表，每个元素需包含 `duration`（时长）和 `intensity`（强度） |
| `height` | String/Number | `200` | 图表高度，支持数字（px）或字符串（如 '100%'） |
| `gap` | Number | `2` | 运动条之间的间距（px） |
| `animated` | Boolean | `true` | 是否显示动画效果 |

## 数据格式

每个运动数据对象应包含以下属性：

```javascript
{
  duration: 30,    // 运动时长（分钟），必须 > 0
  intensity: 80    // 运动强度（0-100），表示百分比
}
```

## 事件

组件目前没有对外暴露事件，但支持以下交互：

- **悬停效果**: 鼠标悬停在运动条上会显示详细信息
- **响应式**: 自动适应容器大小变化
- **动画**: 支持淡入动画效果

## 样式定制

组件使用 SCSS 编写，支持以下样式定制：

```scss
.exercise-process-chart {
  // 自定义容器样式
  .chart-wrapper {
    .exercise-bar {
      // 自定义运动条样式
      background-color: #your-color;
      border-radius: 4px;
      
      &:hover {
        // 自定义悬停效果
        background-color: #your-hover-color;
      }
    }
  }
}
```

## 注意事项

1. **数据验证**: 组件会自动验证输入数据的格式，确保 `duration` 为正数，`intensity` 在 0-100 范围内
2. **容器要求**: 父容器需要设置明确的宽度和高度，组件才能正确自适应
3. **性能考虑**: 建议运动数据条数不超过 50 个，以保证良好的渲染性能
4. **浏览器兼容**: 支持现代浏览器，IE 11+ 需要额外的 polyfill

## 示例

查看 `example.vue` 文件获取更多使用示例，包括：

- 基础用法
- 自定义参数
- 动态数据更新
- 响应式布局

## 更新日志

- **v1.0.0**: 初始版本，支持基本的运动过程图形显示功能
