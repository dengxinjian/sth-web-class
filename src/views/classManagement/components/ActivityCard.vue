<template>
  <div style="position: relative">
    <div
      class="classScheduleCard sportScheduleCard js-sport-container-put js-sport-container-noDrag"
      :style="{ backgroundColor: bgColor }"
      :data-activityId="activity.activityId"
      :data-manualActivityId="activity.manualActivityId"
      :data-date="date"
    >
      <div
        :class="[
          'card-body',
          'sport-drap-handle',
          activity.classScheduleId ? 'js-sport-card-noDrag' : '',
        ]"
        :data-activityId="activity.activityId"
        :data-manualActivityId="activity.manualActivityId"
        :data-date="date"
        style="background-color: #fff"
        @contextmenu.prevent.stop="showContextMenu"
      >
        <div class="body-title" style="background-color: #fff">
          <div class="sport-type-icon">
            <img
              class="image-icon"
              :src="getSportIcon(activity.sportType)"
              alt=""
            />
          </div>
          <el-popover
            popper-class="athletic-btn-popover"
            placement="right"
            trigger="hover"
          >
            <div class="btn-list-hover">
              <el-button
                v-if="activity.classesJson"
                type="text"
                @click="$emit('unbind', activity.classScheduleId)"
              >
                解除匹配
              </el-button>

              <el-button type="text" @click="$emit('edit', activity)">
                编辑
              </el-button>
              <el-button
                v-if="!activity.classesJson"
                type="text"
                @click="$emit('delete', activity)"
              >
                删除
              </el-button>
            </div>
            <i class="el-icon-more" slot="reference" @click.stop></i>
          </el-popover>
        </div>

        <div
          class="sport-record-data"
          @click="
            $emit('click', activity);
            hideContextMenu();
          "
        >
          <div
            class="title"
            v-if="activity.classesJson.title || activity.activityName"
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
          <div class="keyword">{{ activity.duration }}</div>
          <div style="display: flex">
            <div class="keyword">
              {{ formatDistance(activity.distance, activity.sportType) }}
              <span v-if="activity.sportType === 'SWIM'">
                {{ activity.unit }}
              </span>
              <span v-else>km</span>
            </div>
          </div>
          <div style="display: flex; gap: 4px">
            <div class="keyword">
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
              <pre v-if="activity.classesJson.summary" class="stage-details">
                {{ truncateByLines(activity.classesJson.summary) }}
              </pre>
              <pre class="stage-details">
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
                  !activity.classesJson.distance
                    ? "--km"
                    : activity.classesJson.distance
                }}
                <span v-if="activity.sportType === 3">
                  {{ activity.classesJson.distanceUnit }}
                </span>
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
              style="height: 16px; display: flex; gap: 1px"
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
          <i class="el-icon-link"></i>
          解除匹配
        </div>
        <div
          class="context-menu-item"
          @click="
            $emit('edit', activity);
            hideContextMenu();
          "
        >
          <i class="el-icon-edit"></i>
          编辑
        </div>
        <div
          v-if="!activity.classesJson"
          class="context-menu-item"
          @click="handleDelete"
        >
          <i class="el-icon-delete"></i>
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
  },
};
</script>

<style lang="scss" scoped>
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
  background-color: #ffffff;
  padding-top: 10px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.75);

  &:hover {
    transform: scale(1.02);
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
      padding: 5px 3px;

      .sport-type-icon {
        display: flex;
        align-content: center;
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

    .sport-record-data {
      cursor: pointer;
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
