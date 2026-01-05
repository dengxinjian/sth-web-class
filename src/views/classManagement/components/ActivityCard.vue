<template>
  <div style="position: relative">
    <div
      class="classScheduleCard ActivityCard sportScheduleCard js-sport-container-put js-sport-container-noDrag"
      :data-activityId="activity.activityId"
      :data-manualActivityId="activity.manualActivityId"
      :data-date="date"
      data-type="activity"
    >
      <div :style="{ backgroundColor: bgColor, height: '6px' }"></div>
      <div
        :class="[
          'card-body',
          'sport-drap-handle',
          activity.classScheduleId ? 'js-sport-card-noDrag' : '',
        ]"
        :data-activityId="activity.activityId"
        :data-manualActivityId="activity.manualActivityId"
        :data-date="date"
        @contextmenu.prevent.stop="showContextMenu"
      >
        <div class="body-title">
          <div class="sport-type-icon">
            <img
              class="image-icon"
              :src="getSportIcon(activity.sportType)"
              alt=""
            />
          </div>
          <div
            class="title"
            v-if="
              (activity.classesJson && activity.classesJson.title) ||
              activity.activityName
            "
          >
            {{
              activity.classesJson
                ? activity.classesJson.title
                : activity.activityName
            }}
          </div>
          <div class="title" v-else>
            {{ getSportTypeName(activity.sportType) }}_手动录入
          </div>
          <el-popover
            popper-class="athletic-btn-popover"
            placement="right"
            trigger="hover"
          >
            <div class="btn-list-hover">
              <div
                class="btn-list-hover-item"
                v-if="activity.classesJson"
                @click="$emit('unbind', activity.classScheduleId)"
              >
                解除匹配
              </div>
              <div
                class="btn-list-hover-item"
                v-if="activity.classesJson"
                @click="handleCopy"
              >
                复制
              </div>

              <div class="btn-list-hover-item" @click="$emit('edit', activity)">
                编辑
              </div>
              <div
                class="btn-list-hover-item"
                style="color: #f92b30"
                v-if="!activity.classesJson"
                @click="$emit('delete', activity)"
              >
                删除
              </div>
            </div>
            <!-- <i class="el-icon-more" slot="reference" @click.stop></i> -->
            <img
              src="~@/assets/addClass/Component 117.png"
              alt=""
              @click.stop
              slot="reference"
              style="width: 16px; height: 16px"
            />
          </el-popover>
        </div>

        <div
          class="sport-record-data"
          @click="
            $emit('click', activity);
            hideContextMenu();
          "
        >
          <div class="keyword">
            {{ restoreVerification("duration") ? "" : "*" }}
            {{ activity.duration }}
          </div>
          <div style="display: flex">
            <div class="keyword">
              {{ restoreVerification("preciseDistance") ? "" : "*" }}
              {{ formatDistance(activity.distance, activity.sportType) }}
              <span v-if="activity.sportType === 3"> m </span>
              <span v-else>km</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px;margin-top: 4px;">
            <div class="keyword" style="margin-top: 0px;">
              {{ restoreVerification("sthValue") ? "" : "*" }}
              {{ activity.sthValue ? activity.sthValue : "--" }}
            </div>
            <div>
              <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
            </div>
          </div>
          <!-- 如果有匹配的课表，显示课表详情 -->
          <template v-if="activity.classesJson">
            <template
              v-if="
                activity.classesJson.summary ||
                activity.classesJson.trainingAdvice
              "
            >
              <pre v-if="activity.classesJson.summary" class="stage-details-p">
                {{ truncateByLines(activity.classesJson.summary) }}
              </pre>
              <pre class="stage-details-p">
                {{ truncateByLines(activity.classesJson.trainingAdvice) }}
              </pre>
            </template>
            <template
              v-else-if="
                activity.sportType === 'CYCLE' || activity.sportType === 1
              "
            >
              <CycleStageDetails
                :class-data="activity.classesJson"
                :max-stages="3"
              />
            </template>
            <template
              v-else-if="
                activity.sportType === 'RUN' || activity.sportType === 2
              "
            >
              <RunStageDetails
                :class-data="activity.classesJson"
                :max-stages="3"
              />
            </template>

            <!-- 时长、距离、STH -->
            <div
              class="keyword"
              v-if="!isRestType(activity.classesJson.sportType)"
              style="color: #999"
            >
              {{
                !activity.classesJson.duration
                  ? "--:--:--"
                  : activity.classesJson.duration
              }}
            </div>
            <div style="display: flex" v-if="activity.classesJson.distance">
              <div class="keyword" style="color: #999">
                {{
                  formatDistance(
                    activity.classesJson.distance,
                    activity.sportType
                  )
                }}
                <span v-if="activity.sportType === 3">
                  {{ activity.classesJson.distanceUnit }}
                </span>
                <span v-else>km</span>
              </div>
            </div>
            <div
              style="display: flex; gap: 4px"
              v-if="!isRestType(activity.classesJson.sportType)"
            >
              <div class="keyword" style="color: #999">
                {{ activity.classesJson.sth ? activity.classesJson.sth : "--" }}
              </div>
              <div>
                <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
              </div>
            </div>

            <!-- 训练强度可视化 -->
            <div
              v-if="activity.classesJson.timeline"
              style="height: 16px; display: flex; gap: 1px ;margin-top: 10px;"
            >
              <div
                v-for="(stage, index) in activity.classesJson.timeline"
                :key="index"
                class="time-stage"
                :style="{ flex: stage.duration }"
              >
                <div style="display: flex; gap: 1px; height: 16px">
                  <div v-for="n in +stage.times" :key="n" :style="{ flex: 1 }">
                    <ExerciseProcessChart
                      :exerciseList="stage.stageTimeline"
                      :maxIntensity="activity.classesJson.maxIntensity"
                      :height="16"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 自定义右键菜单 -->
    <transition name="context-menu-fade">
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop
      >
        <div
          v-if="activity.classesJson"
          class="context-menu-item"
          @click="handleUnbind"
        >
          解除匹配
        </div>
        <div
          v-if="activity.classesJson"
          class="context-menu-item"
          @click="handleCopy"
        >
          复制
        </div>
        <div
          class="context-menu-item"
          @click="
            $emit('edit', activity);
            hideContextMenu();
          "
        >
          编辑
        </div>
        <div
          v-if="!activity.classesJson"
          class="context-menu-item"
          @click="handleDelete"
        >
          删除
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "./CycleStageDetails.vue";
import RunStageDetails from "./RunStageDetails.vue";
import {
  getSportBackgroundColor,
  getClassImageIcon,
  getSportTypeName,
  truncateByLines,
} from "../utils/helpers";

export default {
  name: "ActivityCard",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
  },
  props: {
    activity: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
    };
  },
  computed: {
    bgColor() {
      return getSportBackgroundColor(this.activity.percent)[0];
    },
  },
  mounted() {
    document.addEventListener("click", this.hideContextMenu);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideContextMenu);
  },
  methods: {
    truncateByLines,
    restoreVerification(field) {
      if (!this.activity.oldActivityDistance) {
        return true;
      }
      if (field === "preciseDistance") {
        let distance = 0;

        distance = this.activity.preciseDistance;
        console.log(distance, this.activity.oldActivityDistance, "distance");
        return distance === this.activity.oldActivityDistance;
      } else if (field === "duration") {
        return this.activity[field] === this.activity.oldActivityDuration;
      } else if (field === "sthValue") {
        return this.activity[field] === this.activity.oldActivitySthValue;
      }
    },
    formatDistance(distance, sportType) {
      let result = distance;
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      if (sportType === 3 && result > 0) {
        result = this.activity.preciseDistance;
      }
      return result;
    },
    getSportIcon(sportType) {
      return getClassImageIcon(sportType);
    },
    getSportTypeName(sportType) {
      return getSportTypeName(sportType);
    },
    isRestType(sportType) {
      return ["REST", "REMARK", "OTHER"].includes(sportType);
    },
    showContextMenu(event) {
      // 使用 nextTick 确保在隐藏旧菜单后再显示新菜单
      this.$nextTick(() => {
        // 获取组件根元素
        const rootElement = this.$el;
        const rootRect = rootElement.getBoundingClientRect();

        // 计算相对于组件根元素的初始坐标
        let x = event.clientX - rootRect.left;
        let y = event.clientY - rootRect.top;

        // 先设置菜单可见，以便获取菜单尺寸
        this.contextMenuX = x;
        this.contextMenuY = y;
        this.contextMenuVisible = true;

        // 等待菜单渲染完成后再计算边界并调整位置
        this.$nextTick(() => {
          const menuElement = this.$el.querySelector(".context-menu");
          if (!menuElement) return;

          const menuRect = menuElement.getBoundingClientRect();
          const menuWidth = menuRect.width;
          const menuHeight = menuRect.height;

          // 获取视口和容器边界
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const containerWidth = rootRect.width;
          const containerHeight = rootRect.height;

          // 计算菜单在视口中的绝对位置
          const menuAbsoluteX = rootRect.left + x;
          const menuAbsoluteY = rootRect.top + y;

          // 限制右边界（优先考虑视口，然后考虑容器）
          if (menuAbsoluteX + menuWidth > viewportWidth) {
            x = Math.min(
              containerWidth - menuWidth - 5,
              viewportWidth - rootRect.left - menuWidth - 5
            );
          } else if (x + menuWidth > containerWidth) {
            x = containerWidth - menuWidth - 5;
          }

          // 限制左边界（确保不会超出容器左边界）
          if (x < 0) {
            x = 5;
          }

          // 限制下边界（优先考虑视口，然后考虑容器）
          if (menuAbsoluteY + menuHeight > viewportHeight) {
            y = Math.min(
              containerHeight - menuHeight - 5,
              viewportHeight - rootRect.top - menuHeight - 5
            );
          } else if (y + menuHeight > containerHeight) {
            y = containerHeight - menuHeight - 5;
          }

          // 限制上边界（确保不会超出容器上边界）
          if (y < 0) {
            y = 5;
          }

          // 更新菜单位置（仅在需要调整时更新，避免不必要的闪烁）
          if (this.contextMenuX !== x || this.contextMenuY !== y) {
            this.contextMenuX = x;
            this.contextMenuY = y;
          }
        });
      });
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    handleUnbind() {
      this.hideContextMenu();
      this.$emit("unbind", this.activity.classScheduleId);
    },
    handleDelete() {
      this.hideContextMenu();
      this.$emit("delete", this.activity);
    },
    handleCopy() {
      this.hideContextMenu();
      console.log("handleCopy-activity-1", this.activity);
      this.$emit("copy", this.activity);
    },
  },
};
</script>

<style lang="scss" scoped>
.classScheduleCard .card-body {
  background-color: #fff;
}
.sportScheduleCard {
  .classScheduleCard {
    display: none;
  }
}

.classScheduleCard {
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  margin-bottom: 5px;
  overflow: hidden;
  border-radius: 6px;
  // background-color: #ffffff;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.75);

  &:hover {
    transform: scale(1.02);
  }

  .card-body {
    width: 100%;
    padding-bottom: 5px;
    padding: 0 10px;
    padding-bottom: 10px;

    .body-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 5px 3px;

      .sport-type-icon {
        display: flex;
        align-content: center;

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
        .sport-type-color3 {
          background-color: #f5a623;
        }
        .sport-type-color0 {
          background-color: #aaaaaa;
        }
      }
    }

    .image-icon {
      width: 20px;
    }

    .title {
      font-size: 15px;
      font-weight: 400;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left: 6px;
      font-family: PingFang SC;
      font-style: Regular;
      color: #101010;
    }

    .keyword {
      font-size: 12px;
      font-weight: bold;
      font-family: PingFang SC;
      font-weight: 500;
      font-style: Medium;
      font-size: 13px;
      letter-spacing: 0%;
      vertical-align: middle;
      color: #101010;
      margin-top: 4px;
    }

    .stage-details-p {
      // padding: 5px 5px 0;
      line-height: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-line;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      line-clamp: 5;
      font-family: PingFang SC;
      font-weight: 400;
      font-style: Regular;
      font-size: 12px;
      color: #101010;

      // margin-bottom: 5px;
    }
  }
}

.btn-list-hover {
  display: flex;
  flex-direction: column;
  align-items: center;
  .btn-list-hover-item {
    width: 60px;
    height: 32px;
    border-radius: 5px;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 14px;
    text-align: center;
    line-height: 32px;
    color: #101010;
    cursor: pointer;
    &:hover {
      background-color: #c3c9d740;
      font-family: PingFang SC;
      font-weight: 500;
      font-style: Medium;
      font-size: 14px;
    }
  }
}

.time-stage {
  height: 16px;
}

.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 99999;
  padding: 4px 0;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .context-menu-item {
    width: 60px;
    height: 32px;
    border-radius: 5px;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 14px;
    text-align: center;
    line-height: 32px;
    color: #101010;
    cursor: pointer;
    &:hover {
      background-color: #c3c9d740;
      font-family: PingFang SC;
      font-weight: 500;
      font-style: Medium;
      font-size: 14px;
    }
  }
}

.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition: opacity 0.2s ease;
}

.context-menu-fade-enter,
.context-menu-fade-leave-to {
  opacity: 0;
}
</style>
