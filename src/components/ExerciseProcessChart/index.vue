<template>
  <div class="exercise-process-chart" ref="chartContainer">
    <div class="chart-wrapper" :style="chartStyle">
       <div
         v-for="(exercise, index) in exerciseList"
         :key="index"
         class="exercise-bar"
         :style="getBarStyle(exercise, index)"
         :title="`运动${index + 1}: 时长${exercise.duration}分钟, 强度${exercise.intensity}`"
       ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExerciseProcessChart',
  props: {
    // 运动过程列表，每个元素包含 duration（时长，单位：分钟）和 intensity（强度，0-100）
    exerciseList: {
      type: [Number, null],
      default: () => [],
      validator: (value) => {
        return value.every(item =>
          typeof item.duration === 'number' &&
          typeof item.intensity === 'number' &&
          item.duration > 0 &&
          item.intensity >= 0 &&
          item.intensity <= 100
        )
      }
    },
    // 图表高度，默认200px
    height: {
      type: [String, Number],
      default: 200
    },
    // 图表间距
    gap: {
      type: Number,
      default: 2
    },
    // 是否显示动画
    animated: {
      type: Boolean,
      default: true
    },
    // 最大强度值，如果不传则使用数据中的最大强度
    maxIntensity: {
      type: Number,
      default: null,
      validator: (value) => {
        return value === null || (typeof value === 'number' && value > 0)
      }
    }
  },
  data() {
    return {
      containerWidth: 0,
      containerHeight: 0
    }
  },
  computed: {
    chartStyle() {
      return {
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
        gap: `${this.gap}px`
      }
    },
    // 计算总时长
    totalDuration() {
      return this.exerciseList.reduce((sum, item) => sum + item.duration, 0)
    },
    // 计算实际使用的最大强度
    actualMaxIntensity() {
      // 如果传入了 maxIntensity，使用传入的值，否则使用数据中的最大强度
      if (this.maxIntensity !== null) {
        return this.maxIntensity
      }
      return Math.max(...this.exerciseList.map(item => item.intensity), 0)
    }
  },
  watch: {
    exerciseList: {
      handler() {
        this.$nextTick(() => {
          this.updateContainerSize()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    this.addResizeListener()
  },
  beforeDestroy() {
    this.removeResizeListener()
  },
  methods: {
    // 初始化图表
    initChart() {
      this.$nextTick(() => {
        this.updateContainerSize()
      })
    },
    // 更新容器尺寸
    updateContainerSize() {
      if (this.$refs.chartContainer) {
        const rect = this.$refs.chartContainer.getBoundingClientRect()
        this.containerWidth = rect.width
        this.containerHeight = rect.height
      }
    },
    // 获取每个运动条的样式
    getBarStyle(exercise, index) {
      if (this.totalDuration === 0 || this.actualMaxIntensity === 0) {
        return {}
      }

      // 计算宽度比例（基于时长）
      const widthPercent = (exercise.duration / this.totalDuration) * 100
      // 计算高度比例（基于强度）
      const heightPercent = (exercise.intensity / this.actualMaxIntensity) * 100

      // 最后一个矩形不需要减去gap
      const isLast = index === this.exerciseList.length - 1
      const width = isLast ? `${widthPercent}%` : `calc(${widthPercent}% - ${this.gap}px)`

      return {
        width,
        height: `${heightPercent}%`,
        animationDelay: this.animated ? `${Math.random() * 0.5}s` : '0s'
      }
    },
    // 添加窗口大小变化监听
    addResizeListener() {
      window.addEventListener('resize', this.handleResize)
    },
    // 移除窗口大小变化监听
    removeResizeListener() {
      window.removeEventListener('resize', this.handleResize)
    },
    // 处理窗口大小变化
    handleResize() {
      this.updateContainerSize()
    }
  }
}
</script>

<style lang="scss" scoped>
.exercise-process-chart {
  width: 100%;
  height: 100%;

  .chart-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    gap: v-bind('chartStyle.gap');

    .exercise-bar {
      background-color: rgba(222, 187, 146, 1);
      border-radius: 2px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      // 动画效果
      &.animated {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
      }
    }
  }
}

// 动画关键帧
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .exercise-process-chart {
    .chart-wrapper {
      .exercise-bar {
        border-radius: 1px;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }
  }
}
</style>
