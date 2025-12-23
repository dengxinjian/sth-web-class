<template>
  <div style="position: relative">
    <div class="classScheduleCard sportScheduleCard" @click.stop="handleClick">
      <div :style="{ backgroundColor: bgColor, height: '10px' }"></div>
      <div
        :class="[
          'card-body',
          'sport-drap-handle',
          activity.classScheduleId ? 'js-sport-card-noDrag' : '',
        ]"
      >
        <div class="body-title">
          <div class="sport-type-icon">
            <img
              class="image-icon"
              :src="getSportIcon(activity.sportType)"
              alt=""
            />
          </div>
        </div>

        <div class="sport-record-data">
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
          <div style="display: flex; gap: 4px">
            <div class="keyword">
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
  },
  beforeDestroy() {
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
    handleClick() {
      this.$emit("click", this.activity);
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
    padding-left: 2px;
    padding-right: 2px;
    padding-bottom: 5px;
    // background-color: #fff;

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
