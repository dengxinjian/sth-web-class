<template>
  <div class="example-container">
    <h3>运动过程图形显示组件示例</h3>

    <!-- 基础用法 -->
    <div class="example-section">
      <h4>基础用法</h4>
      <div class="chart-container">
        <ExerciseProcessChart
          :exerciseList="basicExerciseList"
          :height="200"
        />
      </div>
    </div>

    <!-- 自定义高度和间距 -->
    <div class="example-section">
      <h4>自定义高度和间距</h4>
      <div class="chart-container">
        <ExerciseProcessChart
          :exerciseList="basicExerciseList"
          :height="300"
          :gap="8"
        />
      </div>
    </div>

    <!-- 无动画版本 -->
    <div class="example-section">
      <h4>无动画版本</h4>
      <div class="chart-container">
        <ExerciseProcessChart
          :exerciseList="basicExerciseList"
          :height="200"
          :animated="false"
        />
      </div>
    </div>

    <!-- 动态数据 -->
    <div class="example-section">
      <h4>动态数据</h4>
      <div class="chart-container">
        <ExerciseProcessChart
          :exerciseList="dynamicExerciseList"
          :height="200"
        />
      </div>
      <div class="controls">
        <el-button @click="addExercise">添加运动</el-button>
        <el-button @click="clearExercises">清空</el-button>
        <el-button @click="generateRandomData">生成随机数据</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciseProcessChart from './index.vue'

export default {
  name: 'ExerciseProcessChartExample',
  components: {
    ExerciseProcessChart
  },
  data() {
    return {
      // 基础运动数据
      basicExerciseList: [
        { duration: 30, intensity: 80 }, // 30分钟，强度80%
        { duration: 45, intensity: 60 }, // 45分钟，强度60%
        { duration: 20, intensity: 90 }, // 20分钟，强度90%
        { duration: 60, intensity: 70 }, // 60分钟，强度70%
        { duration: 15, intensity: 95 } // 15分钟，强度95%
      ],
      // 动态运动数据
      dynamicExerciseList: [
        { duration: 25, intensity: 75 },
        { duration: 40, intensity: 85 }
      ]
    }
  },
  methods: {
    // 添加运动
    addExercise() {
      const newExercise = {
        duration: Math.floor(Math.random() * 60) + 10, // 10-70分钟
        intensity: Math.floor(Math.random() * 40) + 60 // 60-100%
      }
      this.dynamicExerciseList.push(newExercise)
    },
    // 清空运动
    clearExercises() {
      this.dynamicExerciseList = []
    },
    // 生成随机数据
    generateRandomData() {
      const count = Math.floor(Math.random() * 8) + 3 // 3-10个运动
      this.dynamicExerciseList = Array.from({ length: count }, () => ({
        duration: Math.floor(Math.random() * 60) + 10,
        intensity: Math.floor(Math.random() * 40) + 60
      }))
    }
  }
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h3 {
    color: #333;
    margin-bottom: 30px;
    text-align: center;
  }

  .example-section {
    margin-bottom: 40px;

    h4 {
      color: #666;
      margin-bottom: 15px;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
    }

    .chart-container {
      width: 100%;
      height: 220px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 10px;
      background-color: #fafafa;
      margin-bottom: 15px;
    }

    .controls {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .el-button {
        margin: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .example-container {
    padding: 15px;

    .example-section {
      .chart-container {
        height: 180px;
      }

      .controls {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }
  }
}
</style>
