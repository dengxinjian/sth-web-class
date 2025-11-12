<template>
  <div>
    <!-- 动态组件，根据type参数决定引入哪个组件 -->
    <component
      :is="currentComponent"
      :visible="visible"
      :value="value"
      :data="data"
      :class-type="classType"
      :type="type"
      :originalType="originalType"
      v-on="$listeners"
    />
  </div>
</template>

<script>
// 同步导入所有组件，避免懒加载导致的数据传递问题
import RunDetail from "./runClassDetail.vue";
import BikeDetail from "./bikeClassDetail.vue";
import SwimDetail from "./swimClassDetail.vue";
import PowerDetail from "./powerClassDetail.vue";
import OtherDetail from "./otherClassDetail.vue";
import NoteDetail from "./noteClassDetail.vue";
import RestDetail from "./restClassDetail.vue";

export default {
  name: "AddClassModal",
  props: {
    // 运动类型，用于决定引入哪个组件
    sportType: {
      type: [String, null],
      required: false,
      default: "RUN",
      validator: function (value) {
        // 如果值为 null 或 undefined，允许通过（会在 computed 中处理）
        if (value === null || value === undefined) {
          return true;
        }
        // 验证type参数是否有效
        return (
          [
            "SWIM",
            "CYCLE",
            "RUN",
            "STRENGTH",
            "OTHER",
            "REMARK",
            "REST",
          ].indexOf(value) !== -1
        );
      },
    },
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Boolean,
      default: undefined,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: "add",
    },
    originalType: {
      type: String,
      default: "my",
    },
    classType: {
      type: String,
      default: "class",
    },
  },
  computed: {
    // 根据type计算当前应该使用的组件
    currentComponent() {
      const componentMap = {
        RUN: RunDetail,
        CYCLE: BikeDetail,
        SWIM: SwimDetail,
        STRENGTH: PowerDetail,
        OTHER: OtherDetail,
        REMARK: NoteDetail,
        REST: RestDetail,
      };
      // 如果 sportType 为 null 或 undefined，使用默认值
      const sportType = this.sportType || "RUN";
      return componentMap[sportType] || RunDetail;
    },
  },
};
</script>
