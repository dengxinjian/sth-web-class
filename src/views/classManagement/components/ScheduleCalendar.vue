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
            v-for="item in currentWeek"
            :key="item.timesp"
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
                v-for="(healthDataItem, index) in item.healthInfos"
                :key="healthDataItem.date || index"
                :health-data="healthDataItem"
                :date="item.commonDate"
                @click="$emit('view-health-data', $event)"
              />
              <!-- 课表卡片 -->
              <ScheduleClassCard
                v-for="classItem in item.classSchedule"
                :key="classItem.id"
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
                v-for="activityItem in item.activityList"
                :key="activityItem.activityId"
                :activity="activityItem"
                :date="item.commonDate"
                @click="$emit('activity-detail', activityItem)"
                @unbind="$emit('unbind', $event)"
                @delete="$emit('delete-activity', $event)"
                @edit="$emit('edit-activity', activityItem)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="context-menu-fade">
      <div
        v-if="contextMenuVisible && hasCopiedClass"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop

      >
        <!-- <div class="context-menu-item" @click="hideContextMenu()">
          <i class="el-icon-close"></i>
          <span>取消</span>
        </div> -->
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
</template>

<script>
import WeekRangePicker from "@/components/WeekRangePicker";
import ScheduleClassCard from "./ScheduleClassCard.vue";
import ActivityCard from "./ActivityCard.vue";
import HealthDataCard from "./HealthDataCard.vue";
import { WEEK_LIST } from "../constants";
import { isToday, convertToLunar } from "../utils/helpers";

export default {
  name: "ScheduleCalendar",
  components: {
    WeekRangePicker,
    ScheduleClassCard,
    ActivityCard,
    HealthDataCard,
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
  },
};
</script>

<style lang="scss" scoped>
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
  gap: 4px;
  flex-direction: row;
  overflow: auto;
  .schedule-table-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 120px;
    background-color: #f5f5f5;

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
      transition: all 0.3s ease;
      cursor: pointer;
      padding-bottom: 20px;
    }
  }
}
.context-menu {
  position: fixed;
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
