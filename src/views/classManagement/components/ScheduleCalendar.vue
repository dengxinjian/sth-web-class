<template>
  <div class="schedule">
    <div class="schedule-table-container">
      <div class="schedule-table">
        <!-- 顶部控制栏 -->
        <div class="schedule-top">
          <WeekRangePicker @week-change="$emit('week-change', $event)" />
          <div class="schedule-search">
            <div>
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
            <div>
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
              <span style="display: inline-block; transform: scale(0.8);"> （{{ convertToLunar(item?.commonDate).dateStr }}）</span>
            </div>
            <div
              class="schedule-table-cell-item js-schedule-drag-container"
              :data-date="item.commonDate"
            >
              <!-- 课表卡片 -->
              <ScheduleClassCard
                v-for="classItem in item.classSchedule"
                :key="classItem.id"
                :class-item="classItem"
                :date="item.commonDate"
                @click="
                  $emit('class-detail', classItem.id, classItem.sportType)
                "
                @delete="$emit('delete-schedule', $event)"
                @device-click="$emit('device-click', $event)"
              />

              <!-- 运动记录卡片 -->
              <ActivityCard
                v-for="activityItem in item.activityList"
                :key="activityItem.activityId"
                :activity="activityItem"
                :date="item.commonDate"
                @click="$emit('activity-detail', activityItem.activityId ,item.id ,activityItem.sportType)"
                @unbind="$emit('unbind', $event)"
                @delete="$emit('delete-activity', $event)"
              />
            </div>
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
import { WEEK_LIST } from "../constants";
import { isToday, convertToLunar } from "../utils/helpers";

export default {
  name: "ScheduleCalendar",
  components: {
    WeekRangePicker,
    ScheduleClassCard,
    ActivityCard,
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
    };
  },
  methods: {
    isToday,
    convertToLunar
  },
};
</script>

<style lang="scss" scoped>
.schedule {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.schedule-table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.schedule-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
}

.schedule-top {
  padding: 10px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  .schedule-search {
    display: flex;
    gap: 10px;
    align-items: center;

    > div {
      display: flex;
      align-items: center;
      gap: 5px;

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
  overflow: auto;
  .schedule-table-cell {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 120px;
    height: 80vh;
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
</style>
