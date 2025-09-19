<template>
  <div>
    <!-- 动态组件，根据type参数决定引入哪个组件 -->
    <!-- 添加 key 属性确保组件切换时重新创建实例 -->
    <component
      :is="currentComponent"
      :key="componentKey"
      :value="value"
      :data="$attrs.data"
      v-on="$listeners"
    />
  </div>
</template>

<script>
// 动态引入组件
const RunDetail = () => import('./runDetail.vue')
const BikeDetail = () => import('./bikeDetail.vue')
const SwimDetail = () => import('./swimDetail.vue')
const PowerDetail = () => import('./powerDetail.vue')
const OtherDetail = () => import('./otherDetail.vue')

export default {
  name: 'SportDetailModal',
  props: {
    // 运动类型，用于决定引入哪个组件
    type: {
      type: Number,
      required: true,
      default: 2, // 默认跑步
      validator: function (value) {
        // 验证type参数是否有效
        return [1, 2, 3, 4, 5].indexOf(value) !== -1
      }
    },
    // 添加 value 属性来监听弹框的显示状态（v-model 对应的是 value）
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 用于生成唯一的组件 key
      componentKey: 0
    }
  },
  computed: {
    // 根据type计算当前应该使用的组件
    currentComponent() {
      console.log(this.type)
      const componentMap = {
        2: RunDetail,
        1: BikeDetail,
        3: SwimDetail,
        4: PowerDetail,
        5: OtherDetail
      }
      return componentMap[this.type] || RunDetail // 默认返回跑步组件
    }
  },
  watch: {
    // 监听 value 和 type 的变化，确保组件重新创建
    value(newVal, oldVal) {
      console.log('SportDetailModal value 变化:', newVal, 'oldVal:', oldVal)
      if (newVal && newVal !== oldVal) {
        // 当弹框打开时，更新 componentKey 强制重新创建组件
        this.componentKey = Date.now()
        console.log('弹框打开，更新 componentKey:', this.componentKey)
      }
    },
    type(newVal, oldVal) {
      // 当运动类型改变时，也更新 componentKey
      if (newVal !== oldVal) {
        this.componentKey = Date.now()
        console.log('运动类型改变，更新 componentKey:', this.componentKey)
      }
    }
  }
}
</script>
