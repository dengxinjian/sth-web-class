<template>
  <div class="planned-schedule-container">
    <div class="planned-schedule-header">
      <div class="planned-schedule-header-title-left">
        <div style="width: 200px;">
          <el-button type="info" style="margin-left: 20px" @click="handleCancel"
            >取消</el-button
          >
        </div>
        <div class="planned-schedule-header-title-left-title">
          {{ planTitle }}
        </div>
        <div class="planned-schedule-header-title-left-button">
          <!-- <el-button type="primary" @click="handleAddWeek">添加周</el-button> -->
          <el-button
            type="primary"
            @click="handleSave"
            style="background-color: #f5a623; border-color: #f5a623"
            >保存</el-button
          >
          <el-button type="primary" @click="handleSaveAndExit"
            >保存并关闭</el-button
          >
        </div>
      </div>
      <div class="planned-schedule-header-title-right">
        <div class="planned-schedule-header-title-right-total-label">总时长/总距离/总STH</div>
        <div class="planned-schedule-header-title-right-total-value">
          <span>{{
            secondsToHHMMSS(getTotalDuration()) === "00:00:00"
              ? "--:--:--"
              : secondsToHHMMSS(getTotalDuration())
          }}</span>/<span class="planned-schedule-header-title-right-total-value">{{ getTotalDistance() || "--" }}km</span>/<span class="planned-schedule-header-title-right-total-value">{{
            getTotalSth() > 100000
              ? (getTotalSth() / 10000).toFixed(2) + "万"
              : getTotalSth() || "--"
          }}</span>
        </div>
        <!-- 总运动时长距离sth总值 -->
        <!-- <div class="planned-schedule-header-title-right-total">
          <span class="label">总运动时长:</span>
          <span class="value">{{
            secondsToHHMMSS(getTotalDuration()) === "00:00:00"
              ? "--:--:--"
              : secondsToHHMMSS(getTotalDuration())
          }}</span>
        </div>
        <div class="planned-schedule-header-title-right-total">
          <span class="label">总运动距离:</span>
          <span class="value">{{ getTotalDistance() || "--" }}km</span>
        </div>
        <div class="planned-schedule-header-title-right-total">
          <span class="label">总STH:</span>
          <span class="value">{{
            getTotalSth() > 100000
              ? (getTotalSth() / 10000).toFixed(2) + "万"
              : getTotalSth() || "--"
          }}</span>
        </div> -->
      </div>
    </div>
    <div class="planned-schedule-container-planned">
      <div class="planned-schedule-container-plan">
        <ScheduleBoxes
          :plan-list="planList"
          :box-count="7"
          :start-number="1"
          @box-click="$emit('box-click', $event)"
          @delete-class="handleDeleteClass"
          @edit-class="handleEditClass"
          @paste-class="handlePasteClass"
          @paste-event="handlePasteEvent"
          @delete-event="handleDeleteEvent"
          @edit-event="handleEditEvent"
          @plan-item-move="$emit('plan-item-move', $event)"
          @plan-item-reorder="$emit('plan-item-reorder', $event)"
          @plan-library-drop="$emit('plan-library-drop', $event)"
          @add-week="handleAddWeek"
        />
      </div>
    </div>
    <!-- <div class="box-content" @click="handleAddWeek">
      <div class="box-plus-circle">
        <el-tooltip effect="dark" content="添加周" placement="top">
          <div class="box-plus">+</div>
        </el-tooltip>
      </div>
    </div> -->
  </div>
</template>

<script>
import ScheduleBoxes from "./ScheduleBoxes.vue";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils";

export default {
  name: "PlannedSchedule",
  components: {
    ScheduleBoxes,
  },
  props: {
    planList: {
      type: Array,
      default: () => [],
    },
    planTitle: {
      type: String,
      default: "",
    },
  },
  methods: {
    secondsToHHMMSS,
    getTotalSth() {
      return this.planList.reduce((total, week) => {
        return (
          total +
          week.reduce((weekTotal, item) => {
            return (
              weekTotal +
              item.details.reduce((classTotal, classItem) => {
                if (!classItem) {
                  return classTotal;
                }
                let classesJson = classItem.classesJson;
                if (typeof classesJson === "string") {
                  try {
                    classesJson = JSON.parse(classesJson);
                  } catch (error) {
                    console.error("解析 classesJson 失败:", error);
                    return classTotal;
                  }
                }
                if (!classesJson.sth) {
                  return classTotal;
                }
                return classTotal + Number(classesJson.sth);
              }, 0)
            );
          }, 0)
        );
      }, 0);
    },
    roundDistance(value, decimals = 2) {
      if (value === null || typeof value === "undefined") {
        return value;
      }
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return value;
      }
      const factor = Math.pow(10, decimals);
      return Math.round((numericValue + Number.EPSILON) * factor) / factor;
    },
    getTotalDistance() {
      const totalDistance = this.planList.reduce((total, week) => {
        return (
          total +
          week.reduce((weekTotal, item) => {
            return (
              weekTotal +
              item.details.reduce((classTotal, classItem) => {
                if (!classItem) {
                  return classTotal;
                }
                let classesJson = classItem.classesJson;
                if (typeof classesJson === "string") {
                  try {
                    classesJson = JSON.parse(classesJson);
                  } catch (error) {
                    console.error("解析 classesJson 失败:", error);
                    return classTotal;
                  }
                }
                if (
                  !classesJson.distance ||
                  classesJson.distance === "--km" ||
                  classesJson.distance === "--"
                ) {
                  return classTotal;
                }
                if (
                  classesJson.sportType === "SWIM" &&
                  classesJson.distanceUnit === "m"
                ) {
                  return classTotal + Number(classesJson.distance) / 1000;
                }
                if (
                  typeof classesJson.distance === "string" &&
                  classesJson.distance.includes("km")
                ) {
                  return (
                    classTotal + Number(classesJson.distance.replace("km", ""))
                  );
                }
                return classTotal + Number(classesJson.distance);
              }, 0)
            );
          }, 0)
        );
      }, 0);
      return this.roundDistance(totalDistance);
    },
    getTotalDuration() {
      return this.planList.reduce((total, week) => {
        return (
          total +
          week.reduce((weekTotal, item) => {
            return (
              weekTotal +
              item.details.reduce((classTotal, classItem) => {
                if (!classItem) {
                  return classTotal;
                }
                let classesJson = classItem.classesJson;
                if (typeof classesJson === "string") {
                  try {
                    classesJson = JSON.parse(classesJson);
                  } catch (error) {
                    console.error("解析 classesJson 失败:", error);
                    return classTotal;
                  }
                }
                if (
                  !classesJson.duration ||
                  classesJson.duration === "00:00:00" ||
                  classesJson.duration === "--:--:--"
                ) {
                  return classTotal;
                }
                return classTotal + hhmmssToSeconds(classesJson.duration);
              }, 0)
            );
          }, 0)
        );
      }, 0);
    },
    handleDeleteClass(
      classItem,
      classIndex,
      weekNumber,
      globalDay,
      isCut = false
    ) {
      console.log(
        classItem,
        classIndex,
        weekNumber,
        globalDay,
        isCut,
        "classItem, classIndex, weekNumber, globalDay, isCut"
      );
      this.$emit(
        "delete-class",
        classItem,
        classIndex,
        weekNumber,
        globalDay,
        isCut
      );
    },
    handleEditClass(classItem, classIndex, weekNumber, globalDay) {
      this.$emit("edit-class", classItem, classIndex, weekNumber, globalDay);
    },
    handlePasteClass(globalDay, weekNumber, classItem) {
      this.$emit("paste-class", globalDay, weekNumber, classItem);
    },
    handlePasteEvent(globalDay, weekNumber, eventItem) {
      this.$emit("paste-event", globalDay, weekNumber, eventItem);
    },
    handleDeleteEvent(eventItem, eventIndex, weekNumber, globalDay, isCut) {
      this.$emit(
        "delete-event",
        eventItem,
        eventIndex,
        weekNumber,
        globalDay,
        isCut
      );
    },
    handleEditEvent(eventItem, eventIndex, weekNumber, globalDay) {
      this.$emit("edit-event", eventItem, eventIndex, weekNumber, globalDay);
    },
    handleAddWeek() {
      this.$emit("add-week");
    },
    handleCancel() {
      this.$router.replace("/timeTable/class?type=cancel");
    },
    handleSave() {
      this.$emit("save");
    },
    handleSaveAndExit() {
      this.$emit("save-and-exit");
    },
  },
};
</script>

<style scoped lang="scss">
.planned-schedule-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  .planned-schedule-header {
    width: 100%;
    height: 60px;
    padding-right: 15px;
    // border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    // background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border-bottom: 1px solid #00000026;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      // background: linear-gradient(90deg, transparent, #409eff, transparent);
      opacity: 0.3;
    }

    .planned-schedule-header-title-left {
      flex: 0.85;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      border-right: 2px solid #00000026;
      padding: 0 10px;
      box-sizing: border-box;

      .planned-schedule-header-title-left-title {
        font-size: 15px;
        font-weight: 600;
        color: #101010;
        box-sizing: border-box;
        text-align: center;
        // position: absolute;
        // left: 50%;
        // transform: translateX(-50%);
      }

      .planned-schedule-header-title-left-button {
        width: 200px;
        // margin-left: auto;
        // margin-right: 20px;
      }
    }

    .planned-schedule-header-title-right {
      flex: 0.15;
      height: 60px;
      // min-width: 200px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      padding: 0 20px;
      box-sizing: border-box;
      gap: 5px;
      .planned-schedule-header-title-right-total-label{
        font-size: 12px;
        color: #666666;
      }
      .planned-schedule-header-title-right-total-value{
        font-size: 14px;
        color:#101010;
      }
      .planned-schedule-header-title-right-total {
        margin-bottom: 2px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .label {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }

        .value {
          color: #303133;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }

  .planned-schedule-container-planned {
    width: 100%;
    flex: 1;
    display: flex;
    overflow: hidden;

    .planned-schedule-container-plan {
      flex: 1;
    }

    .planned-schedule-container-statistics {
      width: 220px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 1px solid rgba(228, 231, 237, 0.8);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    }
  }
}

.box-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border: 2px solid #e5e5e5;
  background-color: #fff;
  transition: all 0.3s ease;
  margin-right: 200px;

  &:hover {
    border-color: #bc362e;
      .box-plus-circle {
        border-color: #bc362e;

        .box-plus {
          color: #bc362e;
        }
      }
    }
  .box-plus-circle {
    .box-plus {
      font-size: 22px;
      color: #303133;
      font-weight: 300;
      user-select: none;
      line-height: 1;
      transition: all 0.2s ease;
    }
  }
}
</style>
