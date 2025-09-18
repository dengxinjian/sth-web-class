<template>
  <div>
    <!-- 动态组件，根据type参数决定引入哪个组件 -->
    <component
      :is="currentComponent"
      v-bind="$attrs"
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
  }
}
</script>
