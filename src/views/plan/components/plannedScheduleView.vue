<template>
  <div class="planned-schedule-container">
    <div class="planned-schedule-header">
      <div class="planned-schedule-header-title-left">
        <div style="width: 32px; height: 32px;"></div>
        <div class="planned-schedule-header-title-left-title">
          {{ planTitle || "计划日程" }}
        </div>
        <div v-if="!showMore"></div>
        <el-popover
          v-if="showMore"
          placement="bottom"
          width="110"
          trigger="hover"
          popper-class="add-class-btn-popover-planned-schedule"
        >
          <div class="add-class-btn-popover-more-list">
            <div v-for="(el, idx) in optionsArray" :key="idx">
              <div
                :class="idx === 5 ? 'add-class-btn-popover-more-list-item-del' : 'add-class-btn-popover-more-list-item'"
                :key="idx"
                @click="$emit('options-click', el, idx)"
              >
                {{ el }}
              </div>
            </div>
          </div>
          <!-- <i
            style="display: inline-block; cursor: pointer; font-size: 20px"
            class="el-icon-more"
            slot="reference"
            @click.stop
          ></i> -->
          <!-- <el-button type="text" slot="reference">操作</el-button> -->
          <span class="more-icon-span" slot="reference"
            ><img
              src="@/assets/plan/more.png"
              alt="更多"
              style="width: 16px; height: 16px"
          /></span>
        </el-popover>
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
          <span class="label">预估运动时长:</span>
          <span class="value">{{
            secondsToHHMMSS(getTotalDuration()) === "00:00:00"
              ? "--:--:--"
              : secondsToHHMMSS(getTotalDuration())
          }}</span>
        </div>
        <div class="planned-schedule-header-title-right-total">
          <span class="label">预估运动距离:</span>
          <span class="value">{{ getTotalDistance() || "--" }}km</span>
        </div>
        <div class="planned-schedule-header-title-right-total">
          <span class="label">预估STH:</span>
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
        <ScheduleBoxesView
          :plan-list="planList"
          :box-count="7"
          :start-number="1"
          @box-click="$emit('box-click', $event)"
          @delete-class="handleDeleteClass"
          @edit-class="handleEditClass"
          @paste-class="handlePasteClass"
          @plan-item-move="$emit('plan-item-move', $event)"
          @plan-item-reorder="$emit('plan-item-reorder', $event)"
          @plan-library-drop="$emit('plan-library-drop', $event)"
          @view-class="handleViewClass"
        />
      </div>
      <!-- <div class="planned-schedule-container-statistics"></div> -->
    </div>
  </div>
</template>

<script>
import ScheduleBoxesView from "./ScheduleBoxesView.vue";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils";
export default {
  name: "PlannedScheduleView",
  components: {
    ScheduleBoxesView,
  },
  props: {
    planTitle: {
      type: String,
      default: "",
    },
    planList: {
      type: Array,
      default: () => [],
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    activeClassType: {
      type: String,
      default: "official",
    },
  },
  data() {
    return {};
  },
  computed: {
    optionsArray() {
      return this.activeClassType === "official"
        ? ["概要", "添加"]
        : ["概要", "编辑", "复制", "应用", "历史", "删除"];
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
      // 如果是整数，不保留小数；如果有小数，保留两位小数
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
                // console.log(classItem, "classItem");
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
    handleDeleteClass(classItem, classIndex, weekNumber, globalDay) {
      this.$emit("delete-class", classItem, classIndex, weekNumber, globalDay);
    },
    handleEditClass(classItem, classIndex, weekNumber, globalDay) {
      this.$emit("edit-class", classItem, classIndex, weekNumber, globalDay);
    },
    handlePasteClass(globalDay, weekNumber, classItem) {
      this.$emit("paste-class", globalDay, weekNumber, classItem);
    },
    handleAddWeek() {
      this.$emit("add-week");
    },
    handleViewClass(classItem, clickPosition) {
      // console.log("handleViewClass-classItem", classItem);
      // console.log("handleViewClass-clickPosition", clickPosition);
      this.$emit("view-class", classItem, clickPosition);
    },
  },
};
</script>

<style scoped lang="scss">
:global(.add-class-btn-popover-planned-schedule) {
  width: 110px !important;
  padding: 8px 0;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.add-class-btn-popover-more-list {
  width: 140px;
  background-color: #fff;
  padding: 0 0 0 8px;
  box-sizing: border-box;
  .add-class-btn-popover-more-list-item {
    width: 100%;
    height: 36px;
    line-height: 36px;
    text-align: center;
    background-color: #fff;
    font-size: 14px;
    color: #101010;
    &:hover {
      cursor: pointer;
      font-weight: 600;
      // background: rgba(64, 158, 255, 0.5);
      // color: #409eff;
      // color: #bc362e;
      background: #c3c9d740;
      border-radius: 5px;
      // border-bottom: 1px solid #bc362e;
    }

    &:active {
      background: rgba(64, 158, 255, 0.18);
    }
  }
  .add-class-btn-popover-more-list-item-del{
    width: 100%;
    height: 36px;
    line-height: 36px;
    text-align: center;
    background-color: #fff;
    font-size: 14px;
    color: #f92b30;
    &:hover {
      cursor: pointer;
      font-weight: 600;
      // background: rgba(64, 158, 255, 0.5);
      // color: #409eff;
      // color: #bc362e;
      background: #c3c9d740;
      border-radius: 5px;
      // border-bottom: 1px solid #bc362e;
    }

    &:active {
      background: rgba(64, 158, 255, 0.18);
    }
  }
  // .add-class-btn-popover-more-list-item:last-child {
  //   width: 100%;
  //   height: 36px;
  //   line-height: 36px;
  //   text-align: center;
  //   background-color: #fff;
  //   font-size: 14px;
  //   color: #F92B30;
  //   // border-bottom: 1px solid #eeeeee;

  //   &:hover {
  //     cursor: pointer;
  //     font-weight: 600;
  //     // background: rgba(64, 158, 255, 0.5);
  //     // color: #409eff;
  //     // color: #bc362e;
  //     background: #C3C9D740;
  //     border-radius: 5px;
  //     // border-bottom: 1px solid #bc362e;
  //   }

  //   &:active {
  //     background: rgba(64, 158, 255, 0.18);
  //   }
  // }
}

.add-class-btn-popover-more-list-official {
  width: 140px;
  background-color: #fff;
  padding: 0 0 0 8px;
  box-sizing: border-box;
  & .add-class-btn-popover-more-list-item {
    width: 100%;
    height: 36px;
    line-height: 36px;
    text-align: center;
    background-color: #fff;
    font-size: 12px;
    font-weight: bold;
    color: #101010;
    border-bottom: 1px solid #eeeeee;

    &:hover {
      cursor: pointer;
      // background: rgba(64, 158, 255, 0.5);
      // color: #409eff;
      color: #bc362e;
      background: rgba(204, 35, 35, 0.05);
      border-bottom: 1px solid #bc362e;
    }

    &:active {
      background: rgba(64, 158, 255, 0.18);
    }
  }
}
.planned-schedule-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  // box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  box-sizing: border-box;

  .planned-schedule-header {
    width: 100%;
    height: 60px;
    padding-right: 15px;
    // border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    // padding: 16px 20px;
    // background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border-bottom: 1px solid #00000026;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: flex-start;
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

    // .planned-schedule-header-title {
    //   font-size: 18px;
    //   font-weight: 600;
    //   color: #303133;
    //   text-align: center;
    //   letter-spacing: 0.5px;
    //   position: relative;
    //   padding-right: 220px;
    //   box-sizing: border-box;
    //   display: flex;
    //   justify-content: space-between;
    //   align-items: center;
    //   div {
    //     display: inline-block;
    //     padding: 4px 0;
    //     position: relative;
    //   }
    // }

    .planned-schedule-header-title-left {
      flex: 0.85;
      height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      // padding: 0 20px;
      border-right: 2px solid #00000026;
      padding: 0 10px;
      box-sizing: border-box;

      .planned-schedule-header-title-left-title {
        font-size: 15px;
        font-weight: 600;
        // margin-bottom: 10px;
        box-sizing: border-box;
        color: #101010;
        // position: absolute;
        // left: 50%;
        // transform: translateX(-50%);
      }

      .planned-schedule-header-title-left-button {
        margin-left: auto;
        margin-right: 20px;
      }
    }

    .planned-schedule-header-title-right {
      flex: 0.15;
      height: 60px;
      // min-width: 240px;
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
      background-color: transparent;
      overflow-y: auto;
      overflow-x: hidden;

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 4px;
        margin: 4px 0;
      }

      &::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #c0c4cc 0%, #909399 100%);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

        &:hover {
          background: linear-gradient(180deg, #909399 0%, #606266 100%);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
        }

        &:active {
          background: linear-gradient(180deg, #606266 0%, #303133 100%);
        }
      }

      /* Firefox 滚动条样式 */
      scrollbar-width: thin;
      scrollbar-color: #c0c4cc rgba(0, 0, 0, 0.02);
    }

    .planned-schedule-container-statistics {
      width: 220px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 1px solid rgba(228, 231, 237, 0.8);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    }
  }
}
.more-icon-span {
  cursor: pointer;
  display: inline-block;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #c3c9d740;
  border-radius: 50%;
}
</style>
