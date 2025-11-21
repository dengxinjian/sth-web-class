<template>
  <div class="schedule">
    <div class="schedule-table-container">
      <div class="schedule-table">
        <!-- 顶部控制栏 -->
        <div class="schedule-top">
          <WeekRangePicker @week-change="$emit('week-change', $event)" />
          <div class="schedule-search">
            <div v-if="loginType === '2'">
              <span>团队：</span>
              <el-select
                :value="selectedTeam"
                size="mini"
                placeholder="选择团队"
                @change="$emit('team-change', $event)"
                style="width: 160px"
              >
                <el-option
                  v-for="t in teamList"
                  :key="t.id"
                  :label="t.name"
                  :value="t.id"
                />
              </el-select>
            </div>
            <div v-if="loginType === '2'">
              <span>运动员：</span>
              <el-select
                :value="selectedAthletic"
                size="mini"
                placeholder="选择人员"
                @change="$emit('athletic-change', $event)"
                style="width: 100px"
              >
                <el-option
                  v-for="t in athleticList"
                  :key="t.triUserId"
                  :label="t.name"
                  :value="t.triUserId"
                />
              </el-select>
            </div>
            <el-button
              type="text"
              size="mini"
              :disabled="!selectedAthletic"
              @click="$emit('show-info')"
            >
              信息查看
            </el-button>
            <el-button
              type="text"
              size="mini"
              :disabled="!selectedAthletic"
              @click="$emit('show-statistic')"
            >
              月度统计
            </el-button>
            <el-button type="text" size="mini" @click="$emit('refresh')">
              刷新
            </el-button>
          </div>
        </div>

        <!-- 周表头 -->
        <div class="schedule-table-header">
          <div
            v-for="(item, index) in weekList"
            :key="item.id"
            :class="[
              'schedule-table-header-cell',
              { active: isToday(currentWeek[index]?.commonDate) },
            ]"
          >
            {{ item.name }}
            {{ isToday(currentWeek[index]?.commonDate) ? "（今天）" : "" }}
          </div>
        </div>

        <!-- 日程内容 -->
        <div class="schedule-table-body">
          <div
            v-for="(item, index) in currentWeek"
            :key="`day-${item.commonDate || index}`"
            class="schedule-table-cell"
          >
            <div class="schedule-table-cell-title">
              <span> {{ item?.commonDate }}</span>
              <span style="display: inline-block; transform: scale(0.8)">
                （{{ convertToLunar(item?.commonDate).dateStr }}）</span
              >
            </div>
            <div
              class="schedule-table-cell-item js-schedule-drag-container"
              :data-date="item.commonDate"
              @contextmenu.stop.prevent="
                showContextMenu($event, item.commonDate)
              "
            >
              <!-- 健康数据 -->
              <HealthDataCard
                v-for="healthDataItem in item.healthInfos"
                :key="`health-${item.commonDate}-${healthDataItem.date}`"
                class="js-health-data-no-drag"
                :health-data="healthDataItem"
                :date="item.commonDate"
                @click="$emit('view-health-data', $event)"
              />

              <!-- 赛事 -->
              <EventCard
                v-for="eventItem in item.competitionList"
                :key="`event-${item.commonDate}-${eventItem.id}`"
                :event-item="eventItem"
                :date="item.commonDate"
                @delete="$emit('event-detail', eventItem)"
                @edit="$emit('edit-event', eventItem)"
              />
              <!-- 课表卡片 -->
              <ScheduleClassCard
                v-for="classItem in item.classSchedule"
                :key="`class-${item.commonDate}-${classItem.id}`"
                :class-item="classItem"
                :date="item.commonDate"
                @click="$emit('class-detail', classItem, classItem.sportType)"
                @delete="$emit('delete-schedule', $event)"
                @device-click="handleDeviceClick"
                @edit="$emit('edit-schedule', $event)"
                @copy="handleCopyClass"
              />
              <!-- 运动记录卡片 -->
              <ActivityCard
                v-for="(activityItem, index) in item.activityList"
                :key="`activity-${item.commonDate}-${index}`"
                :activity="activityItem"
                :date="item.commonDate"
                @click="$emit('activity-detail', activityItem)"
                @unbind="$emit('unbind', $event)"
                @delete="$emit('delete-activity', $event)"
                @edit="$emit('edit-activity', activityItem)"
              />

              <!-- 添加课表 -->
              <div
                class="box-content js-schedule-drag-no-drag"
                @click="handleAddSchedule(item.commonDate)"
              >
                <div class="box-plus-circle">
                  <div class="box-plus">+</div>
                </div>
              </div>
            </div>
            <transition name="context-menu-fade">
              <div
                v-if="contextMenuVisible"
                class="context-menu"
                :style="{
                  left: contextMenuX + 'px',
                  top: contextMenuY + 'px',
                }"
                @click.stop
              >
                <div
                  class="context-menu-item"
                  @click="
                    handleAddSchedule(contextMenuDate);
                    hideContextMenu();
                  "
                >
                  <i class="el-icon-plus"></i>
                  <span>添加</span>
                </div>
                <div
                  class="context-menu-item"
                  @click="
                    handleInputActivity(contextMenuDate);
                    hideContextMenu();
                  "
                >
                  <i class="el-icon-plus"></i>
                  <span>录入运动</span>
                </div>
                <div
                  v-if="hasCopiedClass"
                  class="context-menu-item"
                  @click="handlePaste"
                >
                  <i class="el-icon-document-copy"></i>
                  <span>粘贴</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WeekRangePicker from "@/components/WeekRangePicker";
import ScheduleClassCard from "./ScheduleClassCard.vue";
import ActivityCard from "./ActivityCard.vue";
import HealthDataCard from "./HealthDataCard.vue";
import { WEEK_LIST } from "../constants";
import { isToday, convertToLunar } from "../utils/helpers";
import draggable from "vuedraggable";
import EventCard from "./eventCard.vue";

export default {
  name: "ScheduleCalendar",
  components: {
    WeekRangePicker,
    ScheduleClassCard,
    ActivityCard,
    HealthDataCard,
    draggable,
    EventCard,
  },
  props: {
    currentWeek: {
      type: Array,
      default: () => [],
    },
    teamList: {
      type: Array,
      default: () => [],
    },
    athleticList: {
      type: Array,
      default: () => [],
    },
    selectedTeam: {
      type: [String, Number],
      default: null,
    },
    selectedAthletic: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      weekList: WEEK_LIST,
      loginType: localStorage.getItem("loginType") || "2",
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuDate: null, // 保存右键点击的日期
      hasCopiedClass: false, // 是否已复制过课程
      copiedClass: null, // 保存复制的课程数据
    };
  },
  mounted() {
    document.addEventListener("click", this.hideContextMenu);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideContextMenu);
  },
  methods: {
    isToday,
    convertToLunar,
    handleDeviceClick(classItem, device) {
      this.$emit("device-click", classItem, device);
    },
    // 添加课表
    handleAddSchedule(date) {
      this.$emit("add-schedule", date);
    },
    showContextMenu(event, date) {
      // 使用 nextTick 确保在隐藏旧菜单后再显示新菜单
      this.$nextTick(() => {
        this.contextMenuVisible = true;
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.contextMenuDate = date;
      });
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
      this.contextMenuDate = null;
      // 不要清除 copiedClass 和 hasCopiedClass，这样复制状态会保留
    },
    handlePaste() {
      this.$emit("paste-class", this.contextMenuDate, this.copiedClass);
      this.hideContextMenu();
      // 粘贴完成后清除复制状态
      this.hasCopiedClass = false;
      this.copiedClass = null;
    },
    handleCopyClass(classItem) {
      this.copiedClass = { ...classItem };
      this.hasCopiedClass = true;
      this.$message({
        message: "课表已复制，右键点击目标日期可粘贴",
        type: "success",
        duration: 2000,
      });
    },
    handleDragMove(evt) {
      // 处理拖拽移动事件，确保空容器也能接收拖拽
      // 返回 true 允许移动，返回 false 阻止移动
      try {
        // 检查目标容器是否存在且有效
        if (evt && evt.to) {
          // 确保目标容器有有效的 Sortable 实例
          const sortableInstance = evt.to.sortableInstance;
          if (sortableInstance && sortableInstance.options) {
            return true;
          }
          // 即使没有实例，也允许移动（vuedraggable 会自动处理）
          return true;
        }
        return false;
      } catch (error) {
        // 如果出现错误，允许移动以避免阻塞拖拽功能
        console.warn("拖拽移动事件处理出错:", error);
        return true;
      }
    },
    handleInputActivity(date) {
      this.$emit("input-activity", date);
    },
  },
};
</script>

<style lang="scss" scoped>
.schedule-class {
  display: none !important;
}
.schedule {
  flex: 1;
  // display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100%;
}

.schedule-table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  // overflow: hidden;
  height: calc(100vh - 60px);
  overflow: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2.5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2.5px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.schedule-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  // height: 100%;
}

.schedule-top {
  padding: 10px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  max-width: 1640px;
  flex-wrap: wrap;
  gap: 10px;

  .schedule-search {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;

    > div {
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;

      span {
        font-size: 14px;
        color: #333;
      }
    }
  }
}

.schedule-table-header {
  display: flex;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;

  .schedule-table-header-cell {
    flex: 1;
    text-align: center;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #333;

    &.active {
      color: #cc2323;
      background-color: rgba(204, 35, 35, 0.1);
    }
  }
}

.schedule-table-body {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: auto;

  .schedule-table-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 120px;
    background-color: #fff;
    border-left: 1px solid #e5e5e5;

    .schedule-table-cell-title {
      font-size: 12px;
      text-align: center;
      line-height: 30px;
      background-color: #f8f8f8;
      margin: 4px 0;
      flex-shrink: 0;
    }

    .schedule-table-cell-item {
      flex: 1;
      font-size: 12px;
      line-height: 18px;
      color: #333;
      cursor: pointer;
      padding-bottom: 20px;
      transform: none !important; /* 避免与Sortable的矩阵变换冲突 */
      will-change: transform; /* 提示浏览器优化渲染 */
      .box-content {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 20px;
        // margin: 10px;
        border: 2px solid #e5e5e5;
        background-color: #fff;
        transition: all 0.3s ease;
        opacity: 0;

        &:hover {
          opacity: 1;
          .box-plus-circle {
            border-color: #bc362e;

            .box-plus {
              color: #bc362e;
            }
          }
        }

        &:active {
          opacity: 0.8;
        }

        .box-plus-circle {
          .box-plus {
            font-size: 22px;
            color: #303133;
            font-weight: 300;
            user-select: none;
            line-height: 1;
            margin-bottom: 5px;
            transition: all 0.2s ease;
          }
        }
      }
    }
  }
}
::v-deep .is-class-drag-ghost {
  opacity: 0.5;
  transform: scale(0.98);
}

::v-deep .js-class-drag-container {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-height: 40px; /* 确保空容器也有足够的高度以被检测到 */
  position: relative; /* 确保定位上下文正确 */
}

::v-deep .js-class-drag-container.is-class-drop-target {
  background-color: rgba(64, 158, 255, 0.08);
}

::v-deep .js-class-drag-container.is-class-drop-active {
  background-color: rgba(64, 158, 255, 0.16);
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.25);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
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
