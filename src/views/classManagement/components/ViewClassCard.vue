<template>
  <div>
    <el-dialog
      :visible.sync="innerVisible"
      width="20%"
      :before-close="handleClose"
      append-to-body
      :show-close="false"
      :modal="false"
      top="20vh"
      :custom-class="dialogCustomClass"
      :style="{ '--dialog-margin-left': dialogMarginLeft }"
    >
      <div
        slot="title"
        style="display: flex; justify-content: end; align-items: center"
      >
        <el-popover
          popper-class="athletic-btn-popover"
          placement="right"
          trigger="hover"
          :tabindex="999"
          v-if="type === 'edit' && showDeleteBtn"
        >
          <div class="btn-list-hover">
            <span v-if="showMoveBtn">
              <el-button
                type="text"
                @click.stop="
                  $emit('move', classItem.id);
                  handleClose();
                "
              >
                移动分组
              </el-button>
            </span>

            <span v-if="showDeleteBtn">
              <el-button
                type="text"
                @click.stop="
                  showEditClass = true;
                  handleClose();
                "
              >
                编辑课程
              </el-button>
            </span>

            <span v-if="showCopyBtn">
              <el-button
                type="text"
                @click.stop="
                  $emit('copy', classItem);
                  handleClose();
                "
              >
                {{ copyBtnText }}
              </el-button>
            </span>
            <span v-if="showDeleteBtn">
              <el-button type="text" @click.stop="handleDelete()">
                删除课程
              </el-button>
            </span>
          </div>
          <i class="el-icon-more" slot="reference" @click.stop></i>
        </el-popover>
        <span v-if="!showDeleteBtn">
          <el-button
            type="text"
            @click.stop="
              $emit('copy', classItem);
              handleClose();
            "
          >
            {{ copyBtnText }}
          </el-button>
        </span>
      </div>
      <div>
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
                      classItem.classesJson ? classItem.classesJson.title : "--"
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
                        classItem.classesJson && classItem.sportType === 'SWIM'
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
                    <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
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
                  (classItem.sportType === 'CYCLE' || classItem.sportType === 1)
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
                  classItem.classesJson && classItem.classesJson.trainingAdvice
                "
              >
                训练建议
              </div>
              <pre
                v-if="
                  classItem.classesJson && classItem.classesJson.trainingAdvice
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
    </el-dialog>
    <EditClass
      :visible="showEditClass"
      :class-item="classItem"
      @close="showEditClass = false"
      @save="handleEditSave"
      @delete="$emit('delete', classItem)"
    />
  </div>
</template>
<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "./CycleStageDetails.vue";
import RunStageDetails from "./RunStageDetails.vue";
import { SPORT_TYPE_ICONS, DEVICE_TYPE_ICON_DICT } from "../constants";
import { truncateByLines, isExpired } from "../utils/helpers";
import EditClass from "./EditClass.vue";
export default {
  name: "SthWebClassViewClassCard",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
    EditClass,
  },
  props: {
    classItem: {
      type: Object,
      required: true,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    activeClassType: {
      type: String,
      default: "my",
    },
    type: {
      type: String,
      default: "edit",
      validator(value) {
        return ["view", "edit"].includes(value);
      },
    },
    dialogMarginLeft: {
      type: String,
      default: "320px",
    },
  },
  data() {
    return {
      innerVisible: false,
      showEditClass: false,
    };
  },
  computed: {
    dialogCustomClass() {
      return "view-class-card-dialog";
    },
    cardStyle() {
      // 过期且有时长的课程显示为红色
      if (
        isExpired(this.date) &&
        this.classItem.classesJson &&
        this.classItem.classesJson.duration &&
        this.classItem.classesJson.duration !== "00:00:00"
      ) {
        return { backgroundColor: "rgba(204, 35, 35, 1)" };
      }
      return { backgroundColor: "#fff" };
    },
    showMoveBtn() {
      return this.activeClassType === "my";
    },
    showDeleteBtn() {
      return this.activeClassType === "my";
    },
    showCopyBtn() {
      return true;
    },
    copyBtnText() {
      return this.activeClassType === "official" ? "添加课程" : "复制课程";
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
  },

  methods: {
    handleClose() {
      // this.innerVisible = false;
      this.$emit("close");
    },
    truncateByLines,
    getSportIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
    },
    getDeviceIcon(deviceType) {
      return DEVICE_TYPE_ICON_DICT[deviceType] || "";
    },
    isRestType(sportType) {
      return ["REST", "REMARK", "OTHER"].includes(sportType);
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
        result = sportType !== "SWIM" ? Number(distance).toFixed(2) : distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    handleDelete() {
      this.handleClose();
      this.$emit("delete", this.classItem.id);
    },
    handleEditSave(saveData, flag) {
      console.log(saveData, flag, "saveData, flag");
      if (flag) this.showEditClass = false;
      this.$emit("save", saveData, flag);
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep(.el-dialog__body) {
  padding-top: 0 !important;
}

.classScheduleCard {
  margin-left: 2px;
  margin-right: 2px;
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background-color: #ffffff;
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

.btn-list-hover {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-stage {
  height: 16px;
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
  }
}
</style>
