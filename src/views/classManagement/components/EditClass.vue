<template>
  <div>
    <el-dialog
      :visible.sync="innerVisible"
      width="60%"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="false"
      custom-class="edit-class-dialog"
      top="5vh"
    >
      <div slot="title" class="dialog-header">
        <div class="header-title">
          <span>标题：</span>
          <el-input type="text" v-model="classTitle" :maxlength="50" />
        </div>
      </div>

      <div class="class-detail-content" v-if="classData.classesJson">
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
            <div class="metric-value">
              {{ formatDuration(classData.classesJson?.duration) }}
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-value">
              {{
                formatDistance(
                  classData.classesJson?.distance,
                  classData.sportType
                )
              }}
               <span v-if="classData.classesJson.distanceUnit && classData.classesJson.distanceUnit !== 'km'">
                {{ classData.classesJson.distanceUnit }}
              </span>
              <span v-else>km</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-value">
              {{ classData.classesJson?.sth || "--" }} STH
            </div>
          </div>
          <div class="metric-item" v-if="!isRestType(classData.sportType)">
            <el-button type="primary" @click="handleEditClassDetail"
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

        <div class="scrollable-content">
          <!-- 计划 vs 实际 对比表格 -->
          <div class="comparison-table" v-if="!isRestType(classData.sportType)">
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
                    <el-input
                      v-model="actualData.totalDuration"
                      size="small"
                      placeholder="h:m:s"
                      :disabled="true"
                    ></el-input>
                  </td>
                  <td style="width: 60px">h:m:s</td>
                </tr>
                <tr>
                  <td>运动时长</td>
                  <td></td>
                  <td>
                    <el-input
                      v-model="actualData.exerciseDuration"
                      size="small"
                      placeholder="h:m:s"
                      :disabled="true"
                    ></el-input>
                  </td>
                  <td>h:m:s</td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>运动距离</td>
                  <td>{{ classData.classesJson?.distance || "--" }}</td>
                  <td>
                    <el-input
                      v-model="actualData.distance"
                      size="small"
                      placeholder=""
                      :disabled="true"
                    ></el-input>
                  </td>
                  <td>
                    {{
                      classData.classesJson.distanceUnit && classData.classesJson.distanceUnit !== 'km'
                        ? classData.classesJson.distanceUnit
                        : "km"
                    }}
                  </td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>STH</td>
                  <td>{{ classData.classesJson?.sth || "--" }}</td>
                  <td>
                    <el-input
                      v-model="actualData.sth"
                      size="small"
                      placeholder=""
                      :disabled="true"
                    ></el-input>
                  </td>
                  <td></td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>消耗</td>
                  <td></td>
                  <td>
                    <el-input
                      v-model="actualData.calories"
                      size="small"
                      placeholder=""
                      :disabled="true"
                    ></el-input>
                  </td>
                  <td>Kcal</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="flex: 1">
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
                  :maxlength="classData.sportType === 'REMARK' ? 2000 : 500"
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
                <template v-if="classData.sportType === 'CYCLE'">
                  <CycleStageDetails
                    :class-data="classData.classesJson"
                    type="class"
                  />
                </template>

                <!-- 跑步详情 -->
                <template v-else-if="classData.sportType === 'RUN'">
                  <RunStageDetails
                    :class-data="classData.classesJson"
                    type="class"
                  />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteClass(classData.id)">删除</el-button>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleEditSave(false)"
          >保存</el-button
        >
        <el-button type="danger" @click="handleEditSave(true)"
          >保存并关闭</el-button
        >
      </div>
    </el-dialog>
    <AddClassModal
      :visible="showAddClassModal"
      :sportType="classData.sportType"
      :type="type"
      :originalType="originalType"
      :data="classData"
      @save="handleSave"
      @cancel="handleAddClassModalClose"
      @delete="deleteClass(classData.id)"
    />
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "./CycleStageDetails.vue";
import RunStageDetails from "./RunStageDetails.vue";
import { SPORT_TYPE_ICONS } from "../constants";
import { submitData, getData } from "@/api/common.js";
import AddClassModal from "./AddClass/index.vue";
import { classApi } from "../services/classManagement.js";
import { parseClassesJson } from "../utils/helpers";
export default {
  name: "EditClass",
  components: {
    ExerciseProcessChart,
    CycleStageDetails,
    RunStageDetails,
    AddClassModal,
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
    originalType: {
      type: String,
      default: "my",
    },
  },
  data() {
    return {
      innerVisible: this.visible || false,
      classData: {
        classesJson: {},
      },
      actualData: {
        totalDuration: "",
        exerciseDuration: "",
        distance: "",
        sth: "",
        calories: "",
      },
      showAddClassModal: false,
      type: "edit",
    };
  },
  computed: {
    classTitle: {
      get() {
        return (
          (this.classData.classesJson && this.classData.classesJson.title) || ""
        );
      },
      set(value) {
        if (!this.classData.classesJson) {
          this.$set(this.classData, "classesJson", {});
        }
        this.$set(this.classData.classesJson, "title", value);
      },
    },
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
            totalDuration: "",
            exerciseDuration: "",
            distance: "",
            sth: "",
            calories: "",
          };
        });
      } else {
        // this.getClassInfo(this.classItem.id);
        // 确保 classesJson 被正确解析
        const classData = { ...this.classItem };
        if (classData.classesJson) {
          classData.classesJson = parseClassesJson(classData.classesJson);
        } else {
          classData.classesJson = {};
        }
        this.classData = classData;
      }
    },
  },
  methods: {
    // getClassInfo(id) {
    //   getData({
    //     url: "/api/classes/getClassesById",
    //     id,
    //   }).then((res) => {
    //     if (res.success) {
    //       const classData = JSON.parse(res.result.classesJson);
    //       this.classData = {
    //         ...res.result,
    //         classesJson: classData,
    //       };
    //     }
    //   });
    // },
    isRestType(sportType) {
      return ["REST", "REMARK"].includes(sportType);
    },
    isTrainingAdvice(sportType) {
      return ["REMARK", "OTHER", "REST"].includes(sportType);
    },
    deleteClass(id) {
      this.handleClose();
      console.log(id, "id");
      this.$emit("delete", id);
    },
    handleEditClassDetail() {
      // 只打开子对话框，不关闭当前对话框
      this.showAddClassModal = true;
    },
    handleAddClassModalClose() {
      // 子对话框关闭时的回调
      this.showAddClassModal = false;
      // this.getClassInfo(this.classItem.id);
      this.handleClose();
    },
    handleClose() {
      console.log("handleClose");
      this.showAddClassModal = false;
      this.$emit("close");
    },
    handleEditSave(flag) {
      const data = JSON.parse(JSON.stringify(this.classData));
      data.classesJson = JSON.stringify(data.classesJson);
      this.$emit("save", data, flag);
    },
    handleSave(saveData, flag) {
      console.log(saveData, flag, "saveData, flag");
      if (flag) this.handleClose();
      this.$emit("save", saveData, flag);
    },
    getSportIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
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
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
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
    display: flex;
    align-items: center;
    gap: 10px;
    > span {
      flex: 1;
      white-space: nowrap;
    }
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

::v-deep .el-dialog__body {
  padding-top: 0px;
}
.class-detail-content {
  .key-metrics {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-bottom: 20px;
    padding: 15px 0;
    padding-top: 0;

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

  .scrollable-content {
    display: flex;
    max-height: 500px;
    overflow-y: auto;
    gap: 10px;
    padding-right: 8px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #c1c1c1 0%, #a8a8a8 100%);
      border-radius: 10px;
      border: 2px solid #f5f7fa;
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(180deg, #a8a8a8 0%, #909090 100%);
      }

      &:active {
        background: linear-gradient(180deg, #909090 0%, #787878 100%);
      }
    }

    /* Firefox 滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f5f7fa;
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
