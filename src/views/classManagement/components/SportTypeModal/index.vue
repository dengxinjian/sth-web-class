<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    append-to-body
    :before-close="onCancel"
    class="sport-type-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">选择运动类型</span>
    <!-- <div class="add-class-img">
      <img :src="currentIcon" alt="" />
    </div> -->
    <div class="type-grid">
      <div
        v-for="item in types"
        :key="item.key"
        class="type-card"
        @click="onSelect(item)"
      >
        <img :src="item.icon" alt="" />
        <div>{{ item.name }}</div>
      </div>
    </div>
    <div class="add-event-title" v-if="!isClass">
      <span>添加赛事</span>
    </div>
    <div class="type-grid" v-if="!isClass" style="padding-bottom: 100px;">
      <div class="type-card" @click="onSelectEvent('event')">
        <img src="~@/assets/addClass/eventIcon.png" alt="" />
        <div>赛事</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "SportTypeModal",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    isClass: {
      type: Boolean,
      default: false,
    },
    isSchedule: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      types: [
        {
          key: "swim",
          name: "游泳",
          icon: require("@/assets/addClass/icon-swim.png"),
        },
        {
          key: "ride",
          name: "骑行",
          icon: require("@/assets/addClass/icon-bike.png"),
        },
        {
          key: "run",
          name: "跑步",
          icon: require("@/assets/addClass/icon-run.png"),
        },
        {
          key: "strength",
          name: "力量",
          icon: require("@/assets/addClass/icon-power.png"),
        },
        {
          key: "other",
          name: "其他",
          icon: require("@/assets/addClass/icon-other.png"),
        },
        {
          key: "note",
          name: "备忘录",
          icon: require("@/assets/addClass/icon-note.png"),
        },
        {
          key: "rest",
          name: "休息",
          icon: require("@/assets/addClass/icon-rest.png"),
        },
      ],
    };
  },
  computed: {
    currentIcon() {
      return this.isSchedule
        ? require("@/assets/addClass/type-title.png")
        : require("@/assets/addClass/addClass.png");
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val;
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
      this.$emit("input", val);
    },
  },
  methods: {
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onSelect(item) {
      this.$emit("select", { key: item.key, name: item.name });
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onSelectEvent() {
      this.$emit("addEvent");
      this.innerVisible = false;
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped>
.sport-type-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 30px 24px;
}
.type-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.add-event-title {
  color: #101010;
  margin-top: 4cqb;
  font-family: PingFang SC;
  font-weight: 600;
  font-style: Semibold;
  font-size: 16px;
  margin-bottom: 24px;
}
.type-card {
  border-radius: 8px;
  border: 1px solid #00000026;
  background: #ffffff1f;
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 10px; */
  padding: 8px 16px 8px 8px;
  cursor: pointer;
  img {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }
  div {
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 14px;
    color: #101010;
  }
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  /* &:hover {
    background: #ffffff33;
  } */
}
</style>
