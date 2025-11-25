<template>
  <transition name="fade">
    <div
      v-if="innerVisible"
      class="view-plan-detail-overlay"
      @click.self="handleClose"
    >
      <div
        ref="popupContainer"
        class="view-plan-detail-popup"
        :style="popupStyle"
        @click.stop
      >
        <!-- 标题栏（关闭按钮） -->
        <div class="popup-header">
          <div style="display: flex; justify-content: end; align-items: center">
            <i
              class="el-icon-close"
              style="cursor: pointer; font-size: 18px"
              @click="handleClose"
            ></i>
          </div>
        </div>
        <!-- 内容区域 -->
        <div class="popup-body">
          <div class="class-schedule-card-container">
            <div
              class="classScheduleCard"
              :style="cardStyle"
              @click.stop="$emit('click', classItem.id, classItem.sportType)"
            >
              <div class="card-body" style="background-color: white">
                <!-- 标题栏 -->
                <div class="body-title">
                  <div class="sport-type-icon">
                    <img
                      class="image-icon"
                      :src="getSportIcon(classItem.sportType)"
                      alt=""
                    />
                    <!-- 课程标题 -->
                    <div class="title">
                      {{
                        classItem.classesJson
                          ? classItem.classesJson.title
                          : "--"
                      }}
                    </div>
                  </div>
                </div>

                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    margin-top: 10px;
                  "
                >
                  <!-- 时长 -->
                  <div class="keyword">
                    {{
                      classItem.classesJson
                        ? formatDuration(classItem.classesJson.duration)
                        : "--:--:--"
                    }}
                  </div>

                  <!-- 距离 -->
                  <div style="display: flex">
                    <div class="keyword">
                      {{
                        formatDistance(
                          classItem.classesJson?.distance,
                          classItem.sportType
                        )
                      }}
                      <span
                        v-if="
                          classItem.classesJson &&
                          classItem.sportType === 'SWIM'
                        "
                      >
                        {{ classItem.classesJson.distanceUnit }}
                      </span>
                      <span v-else>km</span>
                    </div>
                    <div>&nbsp;&nbsp;</div>
                  </div>

                  <!-- STH -->
                  <div style="display: flex; gap: 4px">
                    <div class="keyword">
                      {{
                        !classItem.classesJson || !classItem.classesJson.sth
                          ? "--"
                          : classItem.classesJson.sth
                      }}
                    </div>
                    <div>
                      <img
                        class="sth"
                        src="~@/assets/addClass/sth.png"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
                <div
                  class="section-title"
                  v-if="classItem.classesJson && classItem.classesJson.summary"
                >
                  概要
                </div>

                <!-- 概要 -->
                <pre
                  v-if="classItem.classesJson && classItem.classesJson.summary"
                  class="stage-details"
                >
          {{ classItem.classesJson.summary }}
        </pre
                >
                <!-- 训练强度可视化 -->

                <div
                  v-if="classItem.classesJson && classItem.classesJson.timeline"
                  style="height: 16px; display: flex; gap: 1px"
                >
                  <div
                    v-for="(stage, index) in classItem.classesJson.timeline"
                    :key="index"
                    class="time-stage"
                    :style="{ flex: stage.duration }"
                  >
                    <div style="display: flex; gap: 1px; height: 16px">
                      <div
                        v-for="n in +stage.times"
                        :key="n"
                        :style="{ flex: 1 }"
                      >
                        <ExerciseProcessChart
                          :exerciseList="stage.stageTimeline"
                          :maxIntensity="classItem.classesJson.maxIntensity"
                          :height="16"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="section-title"
                  style="margin-bottom: 10px"
                  v-if="
                    classItem.classesJson &&
                    classItem.classesJson.timeline &&
                    classItem.classesJson.timeline.length > 0
                  "
                >
                  阶段明细
                </div>
                <!-- 骑行详情 -->
                <template
                  v-if="
                    classItem.classesJson &&
                    (classItem.sportType === 'CYCLE' ||
                      classItem.sportType === 1)
                  "
                >
                  <CycleStageDetails
                    :class-data="classItem.classesJson"
                    :max-stages="99"
                    type="class"
                  />
                </template>
                <!-- 跑步详情 -->
                <template
                  v-else-if="
                    classItem.classesJson &&
                    (classItem.sportType === 'RUN' || classItem.sportType === 2)
                  "
                >
                  <RunStageDetails
                    :class-data="classItem.classesJson"
                    :max-stages="99"
                    type="class"
                  />
                </template>

                <!-- 训练建议 -->
                <div
                  class="section-title"
                  v-if="
                    classItem.classesJson &&
                    classItem.classesJson.trainingAdvice
                  "
                >
                  训练建议
                </div>
                <pre
                  v-if="
                    classItem.classesJson &&
                    classItem.classesJson.trainingAdvice
                  "
                  class="stage-details"
                >
          {{ classItem.classesJson.trainingAdvice }}
        </pre
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "../../../classManagement/components/CycleStageDetails.vue";
import RunStageDetails from "../../../classManagement/components/RunStageDetails.vue";
import { SPORT_TYPE_ICONS } from "../../../classManagement/constants";

export default {
  name: "ViewPlanDetail",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
  },
  props: {
    classItem: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    visible: {
      type: Boolean,
      default: false,
    },
    clickPosition: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      innerVisible: this.visible || false,
      popupStyle: {},
    };
  },
  computed: {
    cardStyle() {
      return { backgroundColor: "#fff" };
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.innerVisible = val;
        if (val && this.clickPosition) {
          // 使用双重 nextTick 确保 DOM 已完全渲染
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.setPopupPosition();
            });
          });
        }
      },
    },
    clickPosition: {
      immediate: false,
      handler(newVal) {
        if (this.innerVisible && newVal) {
          // 使用双重 nextTick 确保 DOM 已完全渲染
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.setPopupPosition();
            });
          });
        }
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    getSportIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
    },
    formatDuration(duration) {
      return duration === "00:00:00" || !duration ? "--:--:--" : duration;
    },
    formatDistance(distance, sportType) {
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance.toString();
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    setPopupPosition() {
      if (!this.clickPosition || !this.$refs.popupContainer) {
        return;
      }

      const popupEl = this.$refs.popupContainer;
      if (!popupEl) {
        return;
      }

      // 获取弹窗尺寸
      const popupRect = popupEl.getBoundingClientRect();
      const popupWidth = popupRect.width || 400; // 默认宽度
      const popupHeight = popupRect.height || 300; // 默认高度

      // 计算位置：点击位置右侧10px
      // 兼容 clientX/clientY 和 x/y 两种格式
      const clickX = this.clickPosition.clientX || this.clickPosition.x || 0;
      const clickY = this.clickPosition.clientY || this.clickPosition.y || 0;
      let left = clickX + 10;
      let top = clickY;

      // 边界检查：确保弹窗不超出视口
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 如果右侧超出，调整到左侧
      if (left + popupWidth > viewportWidth) {
        left = clickX - popupWidth - 10;
      }

      // 如果左侧超出，调整到右侧
      if (left < 0) {
        left = 10;
      }

      // 如果底部超出，向上调整
      if (top + popupHeight > viewportHeight) {
        top = viewportHeight - popupHeight - 10;
      }

      // 如果顶部超出，向下调整
      if (top < 0) {
        top = 10;
      }

      // 应用位置
      this.popupStyle = {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 2001,
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.view-plan-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0);
  pointer-events: auto;
}

.view-plan-detail-popup {
  position: fixed;
  width: 20%;
  min-width: 300px;
  max-width: 500px;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  // 匹配 el-dialog 的字体样式
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: 10px;
  color: #606266;
  border-radius: 16px;

  .popup-header {
    padding: 20px 20px 10px;
    flex-shrink: 0;
  }

  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    // 匹配 el-dialog__body 的样式
    padding-top: 0 !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.classScheduleCard {
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background-color: #ffffff;
  padding: 0 10px 10px 10px;
  box-sizing: border-box;
  .card-body {
    width: 100%;
    padding-left: 2px;
    padding-right: 2px;
    padding-bottom: 5px;

    .body-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      background-color: white;
      padding: 5px 3px;

      .sport-type-icon {
        display: flex;
        align-items: center;
        justify-content: center;

        .sport-type-name {
          width: 15px;
          height: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          margin-left: 5px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
        }

        .sport-type-color1 {
          background-color: #7fb135;
        }
        .sport-type-color2 {
          background-color: #c72a29;
        }
        .sport-type-color0 {
          background-color: #aaaaaa;
        }
      }
    }

    .image-icon {
      width: 40px;
    }

    .title {
      font-size: 14px;
      font-weight: bold;
      margin-left: 10px;
    }

    .keyword {
      font-size: 14px;
      font-weight: bold;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      margin-top: 10px;
    }

    .stage-details {
      font-size: 12px;
      color: #999;
      padding: 5px 5px 0;
      line-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-line;
    }
  }
}

.time-stage {
  height: 16px;
}
</style>
