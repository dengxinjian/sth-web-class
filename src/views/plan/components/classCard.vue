<template>
  <div
    class="plan-class-card-wrapper"
    style="position: relative"
    :data-id="classItem.id"
    :data-day="date"
    data-type="planClass"
  >
    <div
      class="class-schedule-card-container js-plan-class-card"
      :data-id="classItem.id"
      :data-date="date"
      data-type="classSchedule"
    >
      <div
        class="classScheduleCard"
        :class="{ 'is-dragging': isDragging }"
        :style="cardStyle"
        :data-id="classItem.id"
        :data-date="date"
        data-type="classSchedule"
        @click.stop="handleClick"
        @contextmenu.stop.prevent="showContextMenu"
      >
        <div
          class="card-body class-drap-handle"
          style="background-color: white"
        >
          <!-- 标题栏 -->
          <div class="body-title">
            <div class="sport-type-icon">
              <img
                class="image-icon"
                :src="getSportIcon(classItem.sportType)"
                alt=""
              />
            </div>
            <el-popover
              popper-class="athletic-btn-popover"
              placement="right"
              trigger="hover"
              :tabindex="9999"
              v-if="type === 'edit'"
            >
              <div class="btn-list-hover">
                <el-button type="text" @click.stop="$emit('edit', classItem)">
                  编辑
                </el-button>
                <el-button type="text" @click.stop="$emit('copy', classItem)">
                  复制
                </el-button>
                <el-button
                  type="text"
                  @click.stop="$emit('delete', classItem.id)"
                >
                  删除
                </el-button>
              </div>
              <i class="el-icon-more" slot="reference" @click.stop></i>
            </el-popover>
          </div>

          <!-- 课程标题 -->
          <div class="title">{{ classItem.classesJson.title }}</div>

          <!-- 运动类型 -->
          <div class="keyword">
            {{ classItem.sportType === "CYCLE" ? "BIKE" : classItem.sportType }}
          </div>

          <!-- 时长 -->
          <div class="keyword">
            {{ formatDuration(classItem.classesJson.duration) }}
          </div>

          <!-- 距离 -->
          <div style="display: flex" v-if="!isRestType(classItem.sportType)">
            <div class="keyword">
              {{
                formatDistance(
                  classItem.classesJson.distance,
                  classItem.sportType
                )
              }}
              <span v-if="classItem.sportType === 'SWIM'">
                {{ classItem.classesJson.distanceUnit }}
              </span>
              <span v-else>km</span>
            </div>
            <div>&nbsp;&nbsp;</div>
          </div>

          <!-- STH -->
          <div
            style="display: flex; gap: 4px"
            v-if="!isRestType(classItem.sportType)"
          >
            <div class="keyword">
              {{
                !classItem.classesJson.sth ? "--" : classItem.classesJson.sth
              }}
            </div>
            <div>
              <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
            </div>
          </div>
          <template
            v-if="
              classItem.classesJson.summary ||
              classItem.classesJson.trainingAdvice
            "
          >
            <!-- 概要 -->
            <pre v-if="classItem.classesJson.summary" class="stage-details">
          {{ truncateByLines(classItem.classesJson.summary) }}
        </pre
            >
            <!-- 训练建议 -->
            <pre class="stage-details">
  {{ truncateByLines(classItem.classesJson.trainingAdvice) }}</pre
            >
          </template>

          <!-- 骑行详情 -->
          <template v-else-if="classItem.sportType === 'CYCLE'">
            <CycleStageDetails
              :class-data="classItem.classesJson"
              :max-stages="3"
              type="class"
            />
          </template>

          <!-- 跑步详情 -->
          <template v-else-if="classItem.sportType === 'RUN'">
            <RunStageDetails
              :class-data="classItem.classesJson"
              :max-stages="3"
              type="class"
            />
          </template>

          <!-- 训练强度可视化 -->
          <div
            v-if="classItem.classesJson.timeline"
            style="height: 16px; display: flex; gap: 1px"
          >
            <div
              v-for="(stage, index) in classItem.classesJson.timeline"
              :key="index"
              class="time-stage"
              :style="{ flex: stage.duration }"
            >
              <div style="display: flex; gap: 1px; height: 16px">
                <div v-for="n in +stage.times" :key="n" :style="{ flex: 1 }">
                  <ExerciseProcessChart
                    :exerciseList="stage.stageTimeline"
                    :maxIntensity="classItem.classesJson.maxIntensity"
                    :height="16"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义右键菜单 -->
    <transition name="context-menu-fade" v-if="type === 'edit'">
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop
      >
        <div
          class="context-menu-item"
          @click="
            $emit('edit', classItem);
            hideContextMenu();
          "
        >
          <i class="el-icon-edit"></i>
          编辑
        </div>
        <div
          class="context-menu-item"
          @click="
            handleCut();
            hideContextMenu();
          "
        >
          <i class="el-icon-scissors"></i>
          剪切
        </div>
        <div class="context-menu-item" @click="handleCopy">
          <i class="el-icon-crop"></i>
          复制
        </div>
        <div class="context-menu-item" @click="handleDelete">
          <i class="el-icon-delete"></i>
          删除
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "@/views/classManagement/components/CycleStageDetails.vue";
import RunStageDetails from "@/views/classManagement/components/RunStageDetails.vue";
import {
  SPORT_TYPE_ICONS,
  DEVICE_TYPE_ICON_DICT,
} from "@/views/classManagement/constants";
import {
  truncateByLines,
  isExpired,
} from "@/views/classManagement/utils/helpers";

export default {
  name: "ClassCard",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
  },
  props: {
    classItem: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "edit",
      validator(value) {
        return ["view", "edit"].includes(value);
      },
    },
    isDragging: {
      type: Boolean,
      default: false,
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
    cardStyle() {
      // 过期且有时长的课程显示为红色
      return { backgroundColor: "#fff" };
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
    getSportIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
    },
    getDeviceIcon(deviceType) {
      return DEVICE_TYPE_ICON_DICT[deviceType] || "";
    },
    isRestType(sportType) {
      return ["REST", "REMARK"].includes(sportType);
    },
    formatDuration(duration) {
      return duration === "00:00:00" ? "--:--:--" : duration;
    },
    formatDistance(distance, sportType) {
      console.log(distance, sportType, "distance, sportType");
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && Number(distance) > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
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
    handleClick(event) {
      this.hideContextMenu();
      if (this.type === "view") {
        const clickPosition = {
          clientX: event.clientX,
          clientY: event.clientY,
        };
        this.$emit("view-class", this.classItem, clickPosition);
      }
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    handleDelete() {
      this.hideContextMenu();
      this.$emit("delete", this.classItem.id);
    },
    handleCopy() {
      this.hideContextMenu();
      this.$emit("copy", this.classItem);
    },
    handleCut() {
      this.hideContextMenu();
      console.log("handleCut-classItem-1", this.classItem);
      this.$emit("cut", this.classItem);
    },
    handleViewClass() {
      console.log("handleViewClass-classItem-1", this.classItem);
      if (this.type === "view") {
        this.$emit("view-class", this.classItem);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.class-schedule-card-container {
  margin-bottom: 5px;
  cursor: pointer;
  .sport-drap-handle {
    display: none;
  }
}

.classScheduleCard {
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  border: 1px solid #e5e5e5;
  transition: all 0.3s ease;
  overflow: hidden;
  border-radius: 6px;
  background-color: #ffffff;
  padding-top: 10px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.75);

  &:hover:not(.is-dragging) {
    transform: scale(1.02);
  }

  &.is-dragging {
    pointer-events: none;
  }

  > .classScheduleCard {
    display: none;
  }

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
        .sport-type-color0 {
          background-color: #aaaaaa;
        }
      }
    }

    .image-icon {
      width: 20px;
    }

    .title {
      font-size: 14px;
      font-weight: bold;
    }

    .keyword {
      font-size: 12px;
      font-weight: bold;
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

.btn-list-hover {
  display: flex;
  flex-direction: column;
  align-items: center;
  .el-button {
    margin-left: 0;
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
  min-width: 120px;

  .context-menu-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    i {
      font-size: 16px;
    }

    &:hover {
      background-color: #f5f7fa;
      color: #cc2323;
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
