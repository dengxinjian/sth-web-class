<template>
  <div>
    <el-dialog
      :visible.sync="innerVisible"
      width="80%"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
      custom-class="edit-class-dialog"
      top="1vh"
    >
      <div slot="title" class="dialog-header">
        <div class="header-title">
          <span>{{
            classData.classesJson?.title || classData.activityName
          }}</span>
        </div>
      </div>

      <div class="class-detail-content">
        <!-- 顶部关键指标 -->
        <div class="key-metrics">
          <div class="metric-item">
            <img
              class="sport-icon"
              :src="getSportIcon(classData.sportType)"
              alt=""
            />
          </div>
          <div class="metric-item">
            <div class="metric-value" v-if="!isActivity">
              {{ formatDuration(classData.classesJson?.duration) }}
            </div>
            <div class="metric-value" v-else>
              {{ formatDuration(classData.duration) }}
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-value" v-if="!isActivity">
              {{ formatDistance(classData.classesJson?.distance) }}
              <span v-if="classData.sportType === 'SWIM'">
                {{ classData.classesJson?.distanceUnit }}
              </span>
            </div>
            <div class="metric-value" v-else>
              {{ formatDistance(classData.distance) }}
              <span v-if="classData.sportType === 'SWIM'">
                {{ classData.unit }}
              </span>
              <span v-else>km</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-value" v-if="!isActivity">
              {{ classData.classesJson?.sth || "--" }} STH
            </div>
            <div class="metric-value" v-else>
              {{ classData.sthValue || "--" }} STH
            </div>
          </div>
          <div class="metric-item">
            <el-button
              type="primary"
              v-if="!isActivity"
              @click="handleEditClassDetail"
              >编辑课程详情</el-button
            >
          </div>
        </div>

        <!-- 训练强度可视化 -->
        <div
          v-if="
            classData.classesJson?.timeline &&
            classData.classesJson.timeline.length > 0
          "
          class="intensity-chart"
        >
          <div
            v-for="(stage, index) in classData.classesJson.timeline"
            :key="index"
            class="time-stage"
            :style="{ flex: stage.duration }"
          >
            <div style="display: flex; gap: 1px; height: 30px">
              <div v-for="n in +stage.times" :key="n" :style="{ flex: 1 }">
                <ExerciseProcessChart
                  :exerciseList="stage.stageTimeline"
                  :maxIntensity="classData.classesJson.maxIntensity"
                  :height="30"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style="display: flex; max-height: 500px; overflow-y: auto; gap: 10px"
        >
          <!-- 计划 vs 实际 对比表格 -->
          <div class="comparison-table">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>计划</th>
                  <th>实际</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>总时长</td>
                  <td>{{ formatDuration(classData.classesJson?.duration) }}</td>
                  <td>
                    <TimeInput v-model="actualData.duration" size="small" />
                  </td>
                  <td>h:m:s</td>
                </tr>
                <tr>
                  <td>运动时长</td>
                  <td></td>
                  <td>
                    <TimeInput v-model="actualData.netDuration" size="small" />
                  </td>
                  <td>h:m:s</td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>运动距离</td>
                  <td>{{ classData.classesJson?.distance || "--" }}</td>
                  <td>
                    <el-input-number
                      v-model="actualData.distance"
                      size="small"
                      placeholder=""
                      :step="0.1"
                      :min="0"
                      :step-strictly="true"
                      :controls="false"
                    />
                  </td>
                  <td>km</td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>STH</td>
                  <td>{{ classData.classesJson?.sth || "--" }}</td>
                  <td>
                    <!-- <el-input
                      v-model="actualData.sth"
                      size="small"
                      placeholder=""
                      :disabled="true"
                    ></el-input> -->
                    <el-input-number
                      v-model="actualData.sthValue"
                      size="small"
                      placeholder=""
                      :step="1"
                      :min="0"
                      :step-strictly="true"
                      :controls="false"
                    />
                  </td>
                  <td></td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>消耗</td>
                  <td></td>
                  <td>
                    <el-input-number
                      v-model="actualData.calories"
                      size="small"
                      placeholder=""
                      :step="1"
                      :min="0"
                      :step-strictly="true"
                      :controls="false"
                    />
                  </td>
                  <td>Kcal</td>
                </tr>
              </tbody>
            </table>
            <!-- 运动参数部分 -->
            <div class="edit-section" v-if="isActivity">
              <div class="section-header">
                <span class="section-title">同步参数</span>
              </div>
              <div class="sync-params">
                <span>时间：{{ sportDetail.startTime }}</span>
                <span
                  >距离：{{ (sportDetail.distance / 1000).toFixed(2) }} km</span
                >
              </div>
              <div class="sync-params">
                <span
                  >平均速度：{{
                    (sportDetail.avgSpeed * 3.6).toFixed(1)
                  }}
                  km/h</span
                >
                <span>卡路里：{{ sportDetail.calories }} kcal</span>
              </div>
              <div class="sync-params">
                <span>爬升：{{ sportDetail.totalAscent || "--" }} m</span>
                <span>STH：{{ sportDetail.sthValue }}</span>
              </div>
              <div class="sync-params">
                <span>功率：{{ sportDetail.maxPower }}</span>
                <span></span>
              </div>
              <table class="sync-params-table">
                <tr>
                  <td></td>
                  <td>最小</td>
                  <td>平均</td>
                  <td>最大</td>
                  <td>单位</td>
                </tr>
                <tr>
                  <td>功率</td>
                  <td>{{ sportDetail.minPower }}</td>
                  <td>{{ sportDetail.avgPower }}</td>
                  <td>{{ sportDetail.maxPower }}</td>
                  <td>w</td>
                </tr>
                <tr>
                  <td>心率</td>
                  <td>{{ sportDetail.minHeartRate }}</td>
                  <td>{{ sportDetail.avgHeartRate }}</td>
                  <td>{{ sportDetail.maxHeartRate }}</td>
                  <td>bpm</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="flex: 1" v-if="classData.classesJson">
            <!-- 概要 -->
            <div class="section">
              <div class="section-header">
                <span class="section-title">概要</span>
              </div>
              <div class="section-content">
                <el-input
                  type="textarea"
                  :rows="8"
                  v-model="classData.classesJson.summary"
                  maxlength="500"
                  show-word-limit
                  placeholder="请输入概要内容"
                ></el-input>
              </div>
            </div>

            <!-- 训练建议 -->
            <div class="section" v-if="!isTrainingAdvice(classData.sportType)">
              <div class="section-header">
                <span class="section-title">训练建议</span>
              </div>
              <div class="section-content">
                <el-input
                  type="textarea"
                  :rows="4"
                  v-model="classData.classesJson.trainingAdvice"
                  placeholder="请输入训练建议"
                ></el-input>
              </div>
            </div>

            <!-- 阶段明细 -->
            <div
              class="section"
              v-if="
                classData.classesJson?.timeline &&
                classData.classesJson.timeline.length > 0
              "
            >
              <div class="section-header">
                <span class="section-title">阶段明细</span>
              </div>
              <div class="section-content">
                <!-- 骑行详情 -->
                <template
                  v-if="
                    classData.sportType === 'CYCLE' || classData.sportType === 1
                  "
                >
                  <CycleStageDetails :class-data="classData.classesJson" />
                </template>

                <!-- 跑步详情 -->
                <template
                  v-else-if="
                    classData.sportType === 'RUN' || classData.sportType === 2
                  "
                >
                  <RunStageDetails :class-data="classData.classesJson" />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteClass(classData.id)" v-if="!isActivity"
          >删除</el-button
        >
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave(false)">保存</el-button>
        <el-button type="danger" @click="handleSave(true)"
          >保存并关闭</el-button
        >
      </div>
    </el-dialog>
    <ClassDetailModal
      :visible="showClassDetailModal"
      :type="classData.sportType"
      :data="classData"
      :athleticThreshold="athleticThreshold"
      :triUserId="triUserId"
      @save="$emit('save', $event)"
      @cancel="handleClassDetailClose"
    />
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "./CycleStageDetails.vue";
import RunStageDetails from "./RunStageDetails.vue";
import { SPORT_TYPE_ICONS } from "../constants";
import { submitData, getData } from "@/api/common.js";
import ClassDetailModal from "./ClassDetailModal/index.vue";
import { scheduleApi } from "../services/classManagement.js";
import TimeInput from "@/views/classManagement/components/timeInpt";
import { getClassImageIcon } from "../utils/helpers";
export default {
  name: "EditClass",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
    ClassDetailModal,
    TimeInput,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    classItem: {
      type: Object,
      default: () => ({}),
    },
    isActivity: {
      type: Boolean,
      default: false,
    },
    athleticThreshold: {
      type: Object,
      default: () => ({}),
    },
    triUserId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      innerVisible: this.visible || false,
      classData: {},
      actualData: {
        duration: "00:00:00",
        netDuration: "00:00:00",
        distance: "",
        sthValue: "",
        calories: "",
      },
      showClassDetailModal: false,
      type: "edit",
      originalType: "my",
      sportDetail: {},
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    innerVisible(val) {
      // 对话框完全关闭后重置数据
      if (!val) {
        this.$nextTick(() => {
          this.classData = {
            classesJson: {},
          };
          this.actualData = {
            duration: "00:00:00",
            netDuration: "00:00:00",
            distance: "",
            sthValue: "",
            calories: "",
          };
        });
      } else {
        if (this.isActivity) {
          this.classData = this.classItem;
          this.getSportDetail();
        } else {
          this.getClassScheduleInfo(this.classItem.id);
        }
      }
    },
  },
  methods: {
    // 编辑进入弹框时，查询课程数据
    getClassScheduleInfo(id) {
      getData({
        url: "/api/classSchedule/getClassScheduleById",
        id,
      }).then((res) => {
        if (res.success) {
          const classData = JSON.parse(res.result.classesJson);
          this.classData = {
            ...res.result,
            classesJson: classData,
          };
        }
      });
    },
    isRestType(sportType) {
      return ["REST", "REMARK"].includes(sportType);
    },
    isTrainingAdvice(sportType) {
      return ["REMARK", "OTHER", "REST"].includes(sportType);
    },
    deleteClass(id) {
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await scheduleApi.deleteSchedule(id);
        if (res.success) {
          this.$message.success("删除成功");
          this.handleClose();
          this.$emit("save", true);
        }
      });
    },
    // s转换成hh:mm:ss
    translateSecondsToFormat(seconds) {
      // 计算小时、分钟和剩余秒数
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      // 格式化各部分为两位数
      const pad = (num) => num.toString().padStart(2, "0");

      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    },
    // 查询运动详情
    getSportDetail() {
      getData({
        url: "/api/classSchedule/getActivityDetail",
        activityId: this.classData.activityId,
      }).then((res) => {
        if (res.success) {
          this.sportDetail = res.result;
          this.actualData = {
            duration: this.classData.duration,
            netDuration: this.translateSecondsToFormat(this.sportDetail.netDuration),
            distance: this.classData.distance,
            sthValue: this.classData.sthValue,
            calories: this.sportDetail.calories,
          };
        }
      });
    },
    handleEditClassDetail() {
      // 只打开子对话框，不关闭当前对话框
      this.showClassDetailModal = true;
    },
    handleClassDetailClose() {
      // 子对话框关闭时的回调
      this.showClassDetailModal = false;
      this.getClassScheduleInfo(this.classItem.id);
    },
    handleClose() {
      console.log("handleClose");
      this.showClassDetailModal = false;
      this.$emit("close");
    },
    handleSave(flag) {
      console.log(this.classData, "classData");
      submitData({
        url: "/api/classSchedule/updateClassSchedule",
        id: this.classData.id,
        classesJson: JSON.stringify(this.classData.classesJson),
      }).then((res) => {
        if (res.success) {
          this.$message.success("课程保存成功");
          if (flag) this.handleClose();
          this.$emit("save", flag);
        }
      });
    },
    getSportIcon(sportType) {
      console.log(sportType, "sportType");
      if (!this.isActivity) {
        return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
      } else {
        return getClassImageIcon(sportType);
      }
    },
    formatDuration(duration) {
      return duration === "00:00:00" || !duration ? "--:--:--" : duration;
    },
    formatDistance(distance) {
      return !distance || distance === "0"
        ? this.classData.sportType === "SWIM"
          ? "--"
          : "--km"
        : distance;
    },
  },
};
</script>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .header-close {
    cursor: pointer;
    font-size: 20px;
    color: #909399;

    &:hover {
      color: #333;
    }
  }
}

.class-detail-content {
  .key-metrics {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-bottom: 20px;
    padding: 15px 0;

    .metric-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .sport-icon {
        width: 40px;
        height: 40px;
      }

      .metric-value {
        font-size: 20px;
        font-weight: 600;
        color: #333;
      }
    }
  }

  .intensity-chart {
    display: flex;
    gap: 2px;
    height: 30px;
    margin-bottom: 20px;
    border-radius: 4px;
    overflow: hidden;

    .time-stage {
      height: 30px;
    }
  }

  .comparison-table {
    margin-bottom: 20px;
    flex: 1;
    .sync-params {
      font-size: 12px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-content: center;
      margin-bottom: 5px;
      > span {
        flex: 2;
      }
      span:last-child {
        flex: 1.2;
      }
    }
    .sync-params-table {
      font-size: 12px;
      line-height: 20px;
      width: 100%;
      border-collapse: collapse;
      td {
        flex: 1;
        text-align: center;
      }
      td:last-child {
        flex: 1;
      }
      td:first-child {
        flex: 1;
      }
      tr:first-child {
        background-color: #f5f5f5;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;

      th,
      td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #e5e5e5;
      }

      th {
        background-color: #f5f7fa;
        font-weight: 600;
        color: #333;
      }

      td:first-child {
        width: 80px;
        color: #606266;
        white-space: nowrap;
      }

      td:nth-child(2) {
        width: 100px;
        color: #333;
      }

      td:nth-child(3) {
        width: 120px;
      }

      td:last-child {
        width: 50px;
        color: #909399;
      }

      ::v-deep .el-input__inner {
        border: 1px solid #dcdfe6;
      }

      ::v-deep .el-input {
        max-width: 120px;
      }
    }
  }
  .edit-section {
    margin-top: 10px;
  }
  .section-header {
    margin-bottom: 10px;
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
  }
  .section {
    margin-bottom: 20px;

    .section-header {
      margin-bottom: 10px;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
    }

    .section-content {
      ::v-deep .el-textarea__inner {
        font-family: inherit;
        line-height: 1.6;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
}
.dialog-footer .el-button {
  min-width: 120px;
  border-radius: 22px;
}
.dialog-footer .el-button--warning {
  background: #f5a623;
  border-color: #f5a623;
}
.dialog-footer .el-button--danger {
  background: #d83b36;
  border-color: #d83b36;
}
</style>
