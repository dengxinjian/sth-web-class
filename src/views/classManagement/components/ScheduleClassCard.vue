<template>
  <div
    class="class-schedule-card-container js-class-schedule-card js-sport-container-noDrag"
    :data-id="classItem.id"
    :data-date="date"
  >
    <div
      class="classScheduleCard"
      :style="cardStyle"
      :data-id="classItem.id"
      :data-date="date"
      @click.stop="$emit('click', classItem.id, classItem.sportType)"
    >
      <div class="card-body class-drap-handle" style="background-color: white">
        <!-- 标题栏 -->
        <div class="body-title">
          <div class="sport-type-icon">
            <img class="image-icon" :src="getSportIcon(classItem.sportType)" alt="" />
            <!-- 设备同步状态 -->
            <div
              v-for="device in classItem.syncStatusList"
              :key="device.deviceType + device.syncStatus"
              :class="['sport-type-name', 'sport-type-color' + device.syncStatus]"
              @click.stop="$emit('device-click', classItem, device)"
            >
              {{ getDeviceIcon(device.deviceType) }}
            </div>
          </div>
          <el-popover
            popper-class="athletic-btn-popover"
            placement="right"
            trigger="click"
            tabindex="9999"
          >
            <div class="btn-list-hover">
              <el-button type="text" @click.stop="$emit('delete', classItem.id)">
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
          {{ classItem.sportType === 'CYCLE' ? 'BIKE' : classItem.sportType }}
        </div>

        <!-- 时长 -->
        <div
          class="keyword"
          v-if="!isRestType(classItem.sportType)"
        >
          {{ formatDuration(classItem.classesJson.duration) }}
        </div>

        <!-- 距离 -->
        <div style="display: flex" v-if="classItem.classesJson.distance">
          <div class="keyword">
            {{ formatDistance(classItem.classesJson.distance) }}
            <span v-if="classItem.sportType === 'SWIM'">
              {{ classItem.classesJson.distanceUnit }}
            </span>
          </div>
          <div>&nbsp;&nbsp;</div>
        </div>

        <!-- STH -->
        <div style="display: flex" v-if="!isRestType(classItem.sportType)">
          <div class="keyword">{{ classItem.classesJson.sth }}</div>
          <div>&nbsp;&nbsp;STH</div>
        </div>

        <!-- 概要 -->
        <pre v-if="classItem.classesJson.summary" class="stage-details">
          {{ truncateByLines(classItem.classesJson.summary) }}
        </pre>

        <!-- 骑行详情 -->
        <template v-else-if="classItem.sportType === 'CYCLE'">
          <CycleStageDetails :class-data="classItem.classesJson" />
        </template>

        <!-- 跑步详情 -->
        <template v-else-if="classItem.sportType === 'RUN'">
          <RunStageDetails :class-data="classItem.classesJson" />
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
</template>

<script>
import ExerciseProcessChart from '@/components/ExerciseProcessChart'
import CycleStageDetails from './CycleStageDetails.vue'
import RunStageDetails from './RunStageDetails.vue'
import { SPORT_TYPE_ICONS, DEVICE_TYPE_ICON_DICT } from '../constants'
import { truncateByLines, isExpired } from '../utils/helpers'

export default {
  name: 'ScheduleClassCard',
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails
  },
  props: {
    classItem: {
      type: Object,
      required: true
    },
    date: {
      type: String,
      required: true
    }
  },
  computed: {
    cardStyle() {
      // 过期且有时长的课程显示为红色
      if (
        isExpired(this.date) &&
        this.classItem.classesJson.duration &&
        this.classItem.classesJson.duration !== '00:00:00'
      ) {
        return { backgroundColor: 'rgba(204, 35, 35, 1)' }
      }
      return { backgroundColor: '#fff' }
    }
  },
  methods: {
    truncateByLines,
    getSportIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER
    },
    getDeviceIcon(deviceType) {
      return DEVICE_TYPE_ICON_DICT[deviceType] || ''
    },
    isRestType(sportType) {
      return ['REST', 'REMARK', 'OTHER'].includes(sportType)
    },
    formatDuration(duration) {
      return duration === '00:00:00' ? '--:--:--' : duration
    },
    formatDistance(distance) {
      return !distance || distance === '0' ? '--km' : distance
    }
  }
}
</script>

<style lang="scss" scoped>
.class-schedule-card-container {
  margin-bottom: 5px;
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
}

.time-stage {
  height: 16px;
}
</style>

