<template>
  <div
    class="plan-class-card-wrapper js-plan-drag-no-drag js-event-drag-no-drag js-event-drop-container"
    style="position: relative"
    data-type="planClass"
    :data-id="eventItem.id"
    :data-date="date"
    draggable="true"
  >
    <div class="class-schedule-card-container js-plan-class-card">
      <div
        class="classScheduleCard"
        :class="{ 'is-dragging': isDragging }"
        @click.stop="handleClick"
        @contextmenu.stop.prevent="showContextMenu"
      >
        <div
          class="card-body class-drap-handle"
          :style="
            eventItem.hasBind
              ? 'background: linear-gradient(114.04deg, #FFD657 0%, #FFECB0 32.71%, #FFD657 65.42%)'
              : ''
          "
        >
          <!-- 标题栏 -->
          <div class="body-title">
            <div
              class="sport-type-icon"
              :class="{ 'sport-type-icon-activity': eventItem.hasBind }"
            >
              <img
                class="image-icon"
                :src="getClassImageIcon(eventItem.priority)"
                alt=""
              />
            </div>
            <el-popover
              popper-class="athletic-btn-popover"
              placement="right"
              trigger="hover"
              :tabindex="9999"
              :disabled="isDragging"
              v-if="type === 'edit'"
            >
              <div class="btn-list-hover">
                <el-button
                  type="text"
                  icon="el-icon-edit"
                  v-if="isCanEditEvent(eventItem)"
                  @click.stop="$emit('edit', eventItem)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-scissors"
                  v-if="isCanEditEvent(eventItem)"
                  @click.stop="handleCut"
                >
                  剪切
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-crop"
                  @click.stop="handleCopy"
                >
                  复制
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  @click.stop="$emit('delete', eventItem.id)"
                >
                  删除
                </el-button>
              </div>
              <i class="el-icon-more" slot="reference" @click.stop></i>
            </el-popover>
          </div>
          <!-- 课程标题 -->
          <div class="title">
            {{ eventItem.competitionName }}
          </div>

          <div
            class="activity-info"
            v-if="eventItem.hasBind"
            style="margin-top: 10px"
          >
            <EventActivityCard
              v-for="(activityItem, activityIndex) in eventItem
                .deviceActivityBindView.swim"
              :key="`activity--${
                activityItem.activityId ||
                activityItem.manualActivityId ||
                activityIndex
              }-${
                activityItem.classScheduleId || 'unmatched'
              }-${!!activityItem.classesJson}-${Date.now()}`"
              :activity="activityItem"
            />
            <EventActivityCard
              v-for="(activityItem, activityIndex) in eventItem
                .deviceActivityBindView.otherT1"
              :key="`activity--${
                activityItem.activityId ||
                activityItem.manualActivityId ||
                activityIndex
              }-${
                activityItem.classScheduleId || 'unmatched'
              }-${!!activityItem.classesJson}-${Date.now()}`"
              :activity="activityItem"
            />
            <EventActivityCard
              v-for="(activityItem, activityIndex) in eventItem
                .deviceActivityBindView.cycle"
              :key="`activity--${
                activityItem.activityId ||
                activityItem.manualActivityId ||
                activityIndex
              }-${
                activityItem.classScheduleId || 'unmatched'
              }-${!!activityItem.classesJson}-${Date.now()}`"
              :activity="activityItem"
            />
            <EventActivityCard
              v-for="(activityItem, activityIndex) in eventItem
                .deviceActivityBindView.otherT2"
              :key="`activity--${
                activityItem.activityId ||
                activityItem.manualActivityId ||
                activityIndex
              }-${
                activityItem.classScheduleId || 'unmatched'
              }-${!!activityItem.classesJson}-${Date.now()}`"
              :activity="activityItem"
            />
            <EventActivityCard
              v-for="(activityItem, activityIndex) in eventItem
                .deviceActivityBindView.run"
              :key="`activity--${
                activityItem.activityId ||
                activityItem.manualActivityId ||
                activityIndex
              }-${
                activityItem.classScheduleId || 'unmatched'
              }-${!!activityItem.classesJson}-${Date.now()}`"
              :activity="activityItem"
            />
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
          v-if="isCanEditEvent(eventItem)"
          @click.stop="
            $emit('edit', eventItem);
            hideContextMenu();
          "
        >
          <i class="el-icon-edit"></i>
          编辑
        </div>
        <div
          class="context-menu-item"
          v-if="isCanEditEvent(eventItem)"
          @click.stop="handleCut"
        >
          <i class="el-icon-scissors"></i>
          剪切
        </div>
        <div class="context-menu-item" @click.stop="handleCopy">
          <i class="el-icon-crop"></i>
          复制
        </div>
        <div class="context-menu-item" @click.stop="handleDelete">
          <i class="el-icon-delete"></i>
          删除
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import EventActivityCard from "./EventActivityCard.vue";
export default {
  name: "EventCard",
  components: {
    EventActivityCard,
  },
  props: {
    eventItem: {
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
    isPlan: {
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
    isCanEditEvent(eventItem) {
      console.log(eventItem, "eventItem");
      if (this.isPlan) {
        return true;
      }
      // 获取今天的日期（只比较日期部分，不考虑时间）
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 解析 eventItem.competitionDate（可能是 "YYYY-MM-DD" 格式或 Date 对象）
      let eventDate;
      if (typeof eventItem.competitionDate === "string") {
        console.log(eventItem.competitionDate, "eventItem.competitionDate");
        eventDate = new Date(eventItem.competitionDate);
      } else if (eventItem.competitionDate instanceof Date) {
        eventDate = new Date(eventItem.competitionDate);
      } else {
        return;
      }

      eventDate.setHours(0, 0, 0, 0);

      // 计算天数差
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let flag = false;
      // 校验日期必须大于今天
      if (diffDays >= 0) {
        flag = true;
      } else {
        flag = false;
      }
      if (
        diffDays === 0 &&
        (this.eventItem.hasBind === true || this.eventItem.totalResult)
      ) {
        flag = false;
      }
      return flag;
    },
    getClassImageIcon(priority) {
      if (priority === "PRIMARY" || priority === 1) {
        return require("@/assets/addClass/eventOne.png");
      } else if (priority === "SECONDARY" || priority === 2) {
        return require("@/assets/addClass/eventTwo.png");
      } else {
        return require("@/assets/addClass/eventThree.png");
      }
    },
    showContextMenu(event) {
      // 如果正在拖拽，不显示右键菜单
      if (this.isDragging) {
        return;
      }
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
    handleClick() {
      // 如果正在拖拽，不处理点击事件
      if (this.isDragging) {
        return;
      }
      this.hideContextMenu();
      this.$emit("edit", this.eventItem, "click");
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
    },
    handleDelete() {
      this.hideContextMenu();
      this.$emit("delete", this.eventItem.id);
    },
    handleCopy() {
      this.hideContextMenu();
      this.$emit("copy", this.eventItem);
    },
    handleCut() {
      this.hideContextMenu();
      this.$emit("cut", this.eventItem);
    },
    handleViewClass() {
      console.log("handleViewClass-classItem-1", this.eventItem);
      if (this.type === "view") {
        this.$emit("view-class", this.eventItem);
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
  margin-top: 10px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.75);

  &:hover:not(.is-dragging) {
    transform: scale(1.02);
  }

  &.is-dragging {
    pointer-events: none;
    opacity: 0.6;
    cursor: grabbing !important;
  }

  > .classScheduleCard {
    display: none;
  }

  .card-body {
    width: 100%;
    // padding-left: 2px;
    // padding-right: 2px;
    padding-bottom: 5px;

    .body-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      // background-color: white;
      padding: 5px 3px;

      .sport-type-icon {
        display: flex;
        align-content: center;
        // width: 24px;
        // height: 24px;
        // border-radius: 50%;
        // background: linear-gradient(114.04deg, #FFD657 0%, #FFECB0 32.71%, #FFD657 65.42%);
        // display: flex;
        // align-items: center;
        // justify-content: center;

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
      .sport-type-icon-activity {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #fff !important;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .image-icon {
      width: 12px;
      height: 12px;
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
    color: #cc2323;
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
