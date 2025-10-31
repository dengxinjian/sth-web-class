<template>
  <div>
    <!-- 动态组件，根据type参数决定引入哪个组件 -->
    <component
      :is="currentComponent"
      :visible="visible"
      :value="value"
      :data="data"
      :triUserId="triUserId"
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
import { athleteApi } from "../../services/classManagement";

export default {
  name: "SportDetailModal",
  props: {
    // 运动类型，用于决定引入哪个组件
    type: {
      type: String,
      required: true,
      default: "RUN",
      validator: function (value = "RUN") {
        console.log(value, "value");
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
    triUserId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      athleticThreshold: {},
    };
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
      return componentMap[this.type] || RunDetail;
    },
  },
  watch: {
    visible: {
      handler(newVal) {
        if (newVal && this.triUserId) {
          console.log(newVal, "newVal");
          this.getAthleticThreshold();
        }
      },
      immediate: false,
    },
    value: {
      handler(newVal) {
        if (newVal && this.triUserId) {
          console.log(newVal, "value newVal");
          this.getAthleticThreshold();
        }
      },
      immediate: false,
    },
    // 监听 triUserId 变化，确保有值后再调用
    triUserId: {
      handler(newVal) {
        if (newVal && (this.visible || this.value)) {
          this.getAthleticThreshold();
        }
      },
      immediate: true,
    },
  },
  methods: {

  },
};
</script>
