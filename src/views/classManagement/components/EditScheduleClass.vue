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
      <span slot="title" class="dialog-title">课表简介</span>
      <div class="header-title">
        <!-- <div v-if="classData.classesJson?.title || classData.activityName">
            <span>标题：</span>
            <el-input
              type="text"
              v-if="classData.classesJson?.title"
              v-model="classData.classesJson.title"
              :maxlength="50"
            />
            <el-input
              type="text"
              v-else
              v-model="classData.activityName"
              disabled
              :maxlength="50"
            />
          </div> -->
        <el-form
          v-if="classData.classesJson?.title || classData.activityName"
          ref="titleRef"
          :model="form"
          :rules="rules"
          label-width="70px"
        >
          <el-form-item label="标题：" prop="title">
            <el-input
              type="text"
              placeholder="标题"
              v-model="form.title"
              :disabled="
                !classData.classesJson?.title && !!classData.activityName
              "
              :maxlength="50"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <span v-else
          >{{ getSportTypeName(classData.sportType) }}_手动录入数据</span
        >
      </div>

      <div class="class-detail-content">
        <!-- 顶部关键指标 -->
        <div class="key-metrics">
          <div style="display: flex; align-items: center; gap: 50px">
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
                {{
                  scheduleFormatDistance(
                    classData.classesJson?.distance,
                    classData.classesJson?.sportType
                  )
                }}
                <span
                  v-if="
                    classData.classesJson?.distanceUnit &&
                    classData.classesJson.distanceUnit !== 'km'
                  "
                >
                  {{ classData.classesJson?.distanceUnit }}
                </span>
                <span v-else>km</span>
              </div>
              <div class="metric-value" v-else>
                {{
                  actualformatDistance(
                    classData.preciseDistance,
                    classData.sportType
                  )
                }}
                <span v-if="classData.sportType === 3"> m </span>
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
          </div>
          <div
            class="metric-item"
            v-if="!isActivity && !isRestType(classData.sportType)"
          >
            <el-button
              type="primary"
              @click="handleEditClassDetail"
              class="edit-class-detail-btn"
              >编辑课表详情</el-button
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
                  :maxIntensity="classData.classesJson?.maxIntensity"
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
                  <td>
                    <div style="width: 100px">
                      {{ formatDuration(classData.classesJson?.duration) }}
                    </div>
                  </td>
                  <td class="time-input-cell">
                    <div class="input-with-actions">
                      <span
                        class="modified-indicator"
                        v-if="
                          classData.activityId &&
                          actualData.duration !== originalData.duration
                        "
                        >*</span
                      >
                      <TimeInput
                        v-model="actualData.duration"
                        size="small"
                        :disabled="isInputDisabled"
                      />
                      <div class="action-buttons">
                        <el-button
                          type="text"
                          size="small"
                          @click="restoreField('duration')"
                          :disabled="
                            !(
                              classData.activityId &&
                              actualData.duration !== originalData.duration
                            ) || isInputDisabled
                          "
                          >还原</el-button
                        >
                        <el-button
                          type="text"
                          size="small"
                          @click="resetField('duration')"
                          :disabled="
                            !(
                              classData.manualActivityId &&
                              actualData.duration !== defaultData.duration
                            ) || isInputDisabled
                          "
                          >重置</el-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="unit-cell">
                    <div style="width: 60px">h:m:s</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div>运动时长</div>
                  </td>
                  <td></td>
                  <td class="time-input-cell">
                    <div class="input-with-actions">
                      <!-- <span
                        class="modified-indicator"
                        v-if="
                          classData.activityId &&
                          actualData.activityDuration !==
                            originalData.activityDuration
                        "
                        >*</span
                      > -->
                      <TimeInput
                        v-model="actualData.activityDuration"
                        size="small"
                        :disabled="isInputDisabled"
                      />
                      <div class="action-buttons">
                        <!-- <el-button
                          type="text"
                          size="small"
                          @click="restoreField('activityDuration')"
                          :disabled="
                            !(
                              classData.activityId &&
                              actualData.activityDuration !==
                                originalData.activityDuration
                            ) || isInputDisabled
                          "
                          >还原</el-button
                        > -->
                        <el-button
                          type="text"
                          size="small"
                          @click="resetField('activityDuration')"
                          :disabled="
                            !(
                              classData.manualActivityId &&
                              actualData.activityDuration !==
                                defaultData.activityDuration
                            ) || isInputDisabled
                          "
                          >重置</el-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="unit-cell">h:m:s</td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>运动距离</td>
                  <td>
                    <div>
                      {{
                        formatDistance(
                          classData.classesJson?.distance,
                          actualData.distanceUnit
                        )
                      }}
                    </div>
                  </td>
                  <td>
                    <div class="input-with-actions">
                      <span
                        class="modified-indicator"
                        v-if="!restoreVerification('distance')"
                        >*</span
                      >
                      <el-input-number
                        v-model="actualData.distance"
                        size="small"
                        placeholder=""
                        :min="0"
                        :step="actualData.distanceUnit === 'km' ? 0.01 : 1"
                        :controls="false"
                        :disabled="isInputDisabled"
                        @input="handleDistanceInput"
                      />
                      <div class="action-buttons">
                        <el-button
                          type="text"
                          size="small"
                          @click="restoreField('distance')"
                          :disabled="restoreVerification('distance')"
                          >还原</el-button
                        >
                        <el-button
                          type="text"
                          size="small"
                          @click="resetField('distance')"
                          :disabled="resetVerification('distance')"
                          >重置</el-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="unit-cell">
                    <el-select
                      v-model="actualData.distanceUnit"
                      :disabled="isInputDisabled"
                      placeholder="请选择"
                      @change="handleDistanceUnitChange"
                    >
                      <el-option label="km" value="km"></el-option>
                      <el-option label="m" value="m"></el-option>
                    </el-select>
                  </td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>STH</td>
                  <td>{{ classData.classesJson?.sth || "--" }}</td>
                  <td>
                    <div class="input-with-actions">
                      <span
                        class="modified-indicator"
                        v-if="
                          classData.activityId &&
                          actualData.sthValue !== originalData.sthValue
                        "
                        >*</span
                      >
                      <el-input-number
                        v-model="actualData.sthValue"
                        size="small"
                        placeholder=""
                        :step="1"
                        :min="0"
                        :step-strictly="true"
                        :controls="false"
                        :disabled="isInputDisabled"
                      />
                      <div class="action-buttons">
                        <el-button
                          type="text"
                          size="small"
                          @click="restoreField('sthValue')"
                          :disabled="
                            !(
                              classData.activityId &&
                              actualData.sthValue !== originalData.sthValue
                            ) || isInputDisabled
                          "
                          >还原</el-button
                        >
                        <el-button
                          type="text"
                          size="small"
                          @click="resetField('sthValue')"
                          :disabled="
                            !(
                              classData.manualActivityId &&
                              actualData.sthValue !== defaultData.sthValue
                            ) || isInputDisabled
                          "
                          >重置</el-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="unit-cell"></td>
                </tr>
                <tr v-if="!isRestType(classData.sportType)">
                  <td>消耗</td>
                  <td></td>
                  <td>
                    <div class="input-with-actions">
                      <span
                        class="modified-indicator"
                        v-if="
                          classData.activityId &&
                          actualData.calories !== originalData.calories
                        "
                        >*</span
                      >
                      <el-input-number
                        v-model="actualData.calories"
                        size="small"
                        placeholder=""
                        :step="1"
                        :min="0"
                        :step-strictly="true"
                        :controls="false"
                        :disabled="isInputDisabled"
                      />
                      <div class="action-buttons">
                        <el-button
                          type="text"
                          size="small"
                          @click="restoreField('calories')"
                          :disabled="
                            !(
                              classData.activityId &&
                              actualData.calories !== originalData.calories
                            ) || isInputDisabled
                          "
                          >还原</el-button
                        >
                        <el-button
                          type="text"
                          size="small"
                          @click="resetField('calories')"
                          :disabled="
                            !(
                              classData.manualActivityId &&
                              actualData.calories !== defaultData.calories
                            ) || isInputDisabled
                          "
                          >重置</el-button
                        >
                      </div>
                    </div>
                  </td>
                  <td class="unit-cell">kcal</td>
                </tr>
              </tbody>
            </table>
            <!-- 运动参数部分 -->
            <div class="edit-section" v-if="isActivity && classData.activityId">
              <div class="section-header">
                <span class="section-title">同步参数</span>
              </div>
              <div class="sync-params">
                <span>时间：{{ sportDetail.startTime }}</span>
                <span
                  >距离：{{
                    actualformatDistance(
                      sportDetail.distance,
                      sportDetail.sportType
                    )
                  }}
                  {{ sportDetail.sportType === 3 ? "m" : "km" }}</span
                >
              </div>
              <div class="sync-params">
                <span
                  >平均{{ sportDetail.sportType === 1 ? "速度" : "配速" }}：{{
                    sportDetail.avgSpeed
                  }}
                  {{
                    sportDetail.sportType === 1
                      ? "km/h"
                      : sportDetail.sportType === 2
                      ? "km"
                      : "m"
                  }}</span
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
                  <td>心率</td>
                  <td>{{ sportDetail.minHeartRate || "-" }}</td>
                  <td>{{ sportDetail.avgHeartRate || "-" }}</td>
                  <td>{{ sportDetail.maxHeartRate || "-" }}</td>
                  <td>bpm</td>
                </tr>
                <tr v-if="sportDetail.sportType === 1">
                  <td>功率</td>
                  <td>{{ sportDetail.minPower || "-" }}</td>
                  <td>{{ sportDetail.avgPower || "-" }}</td>
                  <td>{{ sportDetail.maxPower || "-" }}</td>
                  <td>w</td>
                </tr>
                <tr v-if="sportDetail.sportType !== 4">
                  <td>{{ sportDetail.sportType === 1 ? "速度" : "配速" }}</td>
                  <td>{{ sportDetail.minSpeed || "-" }}</td>
                  <td>{{ sportDetail.avgSpeed || "-" }}</td>
                  <td>{{ sportDetail.maxSpeed || "-" }}</td>
                  <td>
                    {{
                      sportDetail.sportType === 1
                        ? "km/h"
                        : sportDetail.sportType === 2
                        ? "/km"
                        : "/100m"
                    }}
                  </td>
                </tr>
                <tr v-if="sportDetail.sportType !== 4">
                  <td>
                    {{
                      sportDetail.sportType === 1
                        ? "踏频"
                        : sportDetail.sportType === 2
                        ? "步频"
                        : "划频"
                    }}
                  </td>
                  <td>{{ sportDetail.minCadence || "-" }}</td>
                  <td>{{ sportDetail.avgCadence || "-" }}</td>
                  <td>{{ sportDetail.maxCadence || "-" }}</td>
                  <td>
                    {{
                      sportDetail.sportType === 1
                        ? "rpm"
                        : sportDetail.sportType === 2
                        ? "spm"
                        : "/min"
                    }}
                  </td>
                </tr>
                <tr v-if="sportDetail.sportType === 2">
                  <td>步幅</td>
                  <td>{{ sportDetail.minStrideLength || "-" }}</td>
                  <td>{{ sportDetail.avgStrideLength || "-" }}</td>
                  <td>{{ sportDetail.maxStrideLength || "-" }}</td>
                  <td>m</td>
                </tr>
                <tr>
                  <td>温度</td>
                  <td>{{ sportDetail.minTemperature || "-" }}</td>
                  <td>{{ sportDetail.avgTemperature || "-" }}</td>
                  <td>{{ sportDetail.maxTemperature || "-" }}</td>
                  <td>-</td>
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
                  v-if="classData.classesJson"
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
                  v-if="classData.classesJson"
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
        <img
          src="@/assets/addClass/dele.png"
          alt=""
          class="delete-icon"
          @click="deleteClass(classData)"
        />
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSave(false)">保存</el-button>
          <el-button type="primary" @click="handleSave(true)"
            >保存并关闭</el-button
          >
        </div>
      </div>
    </el-dialog>
    <ClassDetailModal
      :visible="showClassDetailModal"
      :type="normalizedSportType"
      scheduleType="edit"
      :data="classData"
      :athleticThreshold="athleticThreshold"
      :triUserId="triUserId"
      @save="$emit('save', $event)"
      @cancel="handleClassDetailClose"
      v-if="!isActivity"
    />
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import CycleStageDetails from "./CycleStageDetails.vue";
import RunStageDetails from "./RunStageDetails.vue";
import { SPORT_TYPE_ICONS, ACTIVITY_TYPE_DICT } from "../constants";
import { submitData, getData } from "@/api/common.js";
import ClassDetailModal from "./ClassDetailModal/index.vue";
import { scheduleApi } from "../services/classManagement.js";
import TimeInput from "@/views/classManagement/components/timeInpt";
import { getClassImageIcon, getSportTypeName } from "../utils/helpers";
import { hhmmssToSeconds } from "@/utils/index";
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
        activityDuration: "00:00:00",
        distance: 0,
        distanceUnit: "km",
        sthValue: 0,
        calories: 0,
      },
      // 存储原始数据，用于还原功能
      originalData: {
        duration: "00:00:00",
        activityDuration: "00:00:00",
        distance: 0,
        sthValue: 0,
        calories: 0,
      },
      // 存储默认数据，用于重置功能
      defaultData: {
        duration: "00:00:00",
        activityDuration: "00:00:00",
        distance: 0,
        sthValue: 0,
        calories: 0,
      },
      showClassDetailModal: false,
      type: "edit",
      sportDetail: {},
      form: {
        title: "",
      },
      rules: {
        title: [
          {
            required: true,
            message: "请输入标题",
            trigger: ["change", "blur"],
          },
        ],
      },
    };
  },
  computed: {
    // 判断是否应该禁用输入（当课表日期大于当前时间时禁用）
    isInputDisabled() {
      if (!this.classData.classesDate) return false;
      const classDate = new Date(this.classData.classesDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return classDate > today;
    },
    // 将sportType从数字转换为字符串类型
    normalizedSportType() {
      if (!this.classData.sportType) return "RUN";

      // 如果已经是字符串类型，直接返回
      if (typeof this.classData.sportType === "string") {
        return this.classData.sportType;
      }

      // 如果是数字类型，使用常量映射转换为字符串
      return ACTIVITY_TYPE_DICT[this.classData.sportType] || "RUN";
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
            duration: "00:00:00",
            activityDuration: "00:00:00",
            distance: 0,
            sthValue: 0,
            calories: 0,
            distanceUnit: "km",
          };
          this.originalData = {
            duration: "00:00:00",
            activityDuration: "00:00:00",
            distance: 0,
            sthValue: 0,
            calories: 0,
            distanceUnit: "km",
          };
          this.form.title = "";
        });
      } else {
        if (this.isActivity) {
          this.classData = this.classItem;
          console.log(this.classData, "classData");
          // 同步标题到 form
          this.form.title =
            this.classData.classesJson?.title ||
            this.classData.activityName ||
            "";
          if (this.classData.activityId) {
            this.getSportDetail();
          } else {
            this.actualData = {
              duration: this.classData.duration || "00:00:00",
              activityDuration:
                this.translateSecondsToFormat(
                  this.classData.activityDuration
                ) || "00:00:00",
              distance: this.classData.distance || 0,
              sthValue: this.classData.sthValue || 0,
              calories: this.classData.calories || 0,
              distanceUnit:
                this.classData.distanceUnit ||
                (this.classData.sportType === "SWIM" ||
                this.classData.sportType === 3
                  ? "m"
                  : "km"),
            };
            console.log(this.classData, "classData");
            this.defaultData = {
              duration: this.classData.duration || "00:00:00",
              activityDuration:
                this.translateSecondsToFormat(
                  this.classData.activityDuration
                ) || "00:00:00",
              distance: this.classData.distance || 0,
              sthValue: this.classData.sthValue || 0,
              calories: this.classData.calories || 0,
              distanceUnit:
                this.classData.distanceUnit ||
                (this.classData.sportType === "SWIM" ||
                this.classData.sportType === 3
                  ? "m"
                  : "km"),
            };
            // if (
            //   this.classData.sportType === "SWIM" ||
            //   this.classData.sportType === 3
            // ) {
            //   this.actualData.distance = this.classData.preciseDistance;
            //   this.defaultData.distance = this.classData.preciseDistance;
            // } else {
            //   this.actualData.distance = this.classData.distance;
            // }
            if (this.actualData.distanceUnit === "m") {
              this.actualData.distance = this.classData.preciseDistance;
              console.log(
                this.actualData.distance,
                "=========this.actualData.distance"
              );
              this.defaultData.distance = this.classData.preciseDistance;
            } else {
              this.actualData.distance = this.classData.preciseDistance / 1000;
              this.defaultData.distance = this.classData.preciseDistance / 1000;
            }
            console.log(this.actualData, "this.actualData");
          }
        } else if (!this.classItem.manualActivityId) {
          console.log(this.classItem, "this.classItem");
          this.getClassScheduleInfo(this.classItem.id);
        }
      }
    },
  },
  methods: {
    restoreVerification(field) {
      if (this.isInputDisabled) {
        return true;
      }
      const distance =
        this.actualData.distanceUnit === "km"
          ? this.actualData[field] * 1000
          : this.actualData[field];
      if (this.classData.activityId) {
        return distance === this.originalData[field];
      } else {
        return true;
      }
    },
    resetVerification(field) {
      if (this.isInputDisabled) {
        return true;
      }
      let distance = 0;
      if (
        this.defaultData.distanceUnit === "km" &&
        this.actualData.distanceUnit === "km"
      ) {
        distance = this.defaultData.distance;
      } else if (
        this.defaultData.distanceUnit === "m" &&
        this.actualData.distanceUnit === "m"
      ) {
        distance = this.defaultData.distance;
      } else if (
        this.defaultData.distanceUnit === "m" &&
        this.actualData.distanceUnit === "km"
      ) {
        distance = this.defaultData.distance / 1000;
      } else if (
        this.defaultData.distanceUnit === "km" &&
        this.actualData.distanceUnit === "m"
      ) {
        distance = this.defaultData.distance * 1000;
      }
      if (this.classData.manualActivityId) {
        return distance === this.actualData[field];
      } else {
        return true;
      }
    },
    getSportTypeName(sportType) {
      return getSportTypeName(sportType);
    },
    // 编辑进入弹框时，查询课表数据
    getClassScheduleInfo(id) {
      if (!this.classItem.classesJson) return;
      getData({
        url: "/gateway/training/classSchedule/getClassScheduleById",
        id,
      }).then((res) => {
        if (res.success) {
          const classData = JSON.parse(res.result.classesJson);
          this.classData = {
            ...res.result,
            classesJson: classData,
          };
          // 同步标题到 form
          this.form.title = this.classData.classesJson?.title || "";
          this.actualData = {
            duration: this.classData.duration || "00:00:00",
            activityDuration: "00:00:00",
            distance: this.classData.distance || 0,
            sthValue: this.classData.sthValue || 0,
            calories: this.classData.calories || 0,
            distanceUnit:
              this.classData.classesJson?.distanceUnit &&
              this.classData.classesJson.distanceUnit !== "km"
                ? "m"
                : "km",
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
    deleteClass(classData) {
      this.$confirm(
        `确认删除课表【${classData?.classesJson?.title}】？`,
        "提示",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        const res = await scheduleApi.deleteSchedule({
          id: classData?.id,
          triUserId: this.triUserId,
        });
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
    // 将速度按运动类型格式化显示
    formatSpeedBySport(sportType, min, avg, max) {
      const toPace = (secondsPerUnit, unitLabel) => {
        if (!secondsPerUnit || secondsPerUnit <= 0) return "-";
        const minutes = Math.floor(secondsPerUnit / 60);
        const seconds = Math.round(secondsPerUnit % 60);
        return `${minutes}:${String(seconds).padStart(2, "0")}`;
      };

      const toKmPerHour = (val) => {
        if (val === undefined || val === null) return "-";
        return `${(val * 3.6).toFixed(1)}`;
      };

      const convertValue = (val) => {
        const isSwim = sportType === "SWIM" || sportType === 3;
        const isRun = sportType === "RUN" || sportType === 2;
        const isCycle = sportType === "CYCLE" || sportType === 1;
        console.log(val, "val");

        if (!val || val === undefined || val === null || Number.isNaN(val)) {
          return "-";
        }
        // val 预期为 m/s
        if (isSwim) {
          const secPer100m = 100 / val;
          return toPace(secPer100m);
        }
        if (isRun) {
          const secPerKm = 1000 / val;
          return toPace(secPerKm);
        }
        if (isCycle) {
          return toKmPerHour(val);
        }
        // 其他默认 km/h
        return toKmPerHour(val);
      };

      return {
        minSpeed: convertValue(min),
        avgSpeed: convertValue(avg),
        maxSpeed: convertValue(max),
      };
    },
    // 将步频按运动类型格式化显示
    formatCadenceBySport(sportType, min, avg, max) {
      const formatVal = (val) =>
        val === undefined || val === null || Number.isNaN(val)
          ? "-"
          : `${val} `;
      return {
        minCadence: formatVal(min),
        avgCadence: formatVal(avg),
        maxCadence: formatVal(max),
      };
    },
    // 步幅格式化（单位米）
    formatStride(min, avg, max) {
      const formatVal = (val) =>
        val === undefined || val === null || Number.isNaN(val)
          ? "-"
          : `${Number(val)} `;
      return {
        minStrideLength: formatVal(min),
        avgStrideLength: formatVal(avg),
        maxStrideLength: formatVal(max),
      };
    },
    formatOutlineData(result = {}) {
      const {
        sportType = this.data.sportType,
        duration = 0,
        netDuration = 0,
        distance = 0,
        minSpeed,
        avgSpeed,
        maxSpeed,
        calories = 0,
        sthValue = 0,
        totalAscent,
        totalDescent,
        minCadence,
        avgCadence,
        maxCadence,
        minStrideLength,
        avgStrideLength,
        maxStrideLength,
        minTemperature,
        avgTemperature,
        maxTemperature,
        deviceType,
        productName = "",
        np,
        if: intensityFactor,
      } = result;
      const formattedSpeeds = this.formatSpeedBySport(
        sportType,
        minSpeed,
        avgSpeed,
        maxSpeed
      );
      const formattedCadence = this.formatCadenceBySport(
        sportType,
        minCadence,
        avgCadence,
        maxCadence
      );
      const formattedStride =
        sportType === 2
          ? this.formatStride(minStrideLength, avgStrideLength, maxStrideLength)
          : {
              minStrideLength: "-",
              avgStrideLength: "-",
              maxStrideLength: "-",
            };

      const deviceTypeFormat = [
        { en: "COROS", cn: "高驰" },
        { en: "GARMIN", cn: "佳明中国" },
        { en: "GARMIN", cn: "佳明国际" },
        { en: "HUAMI", cn: "华米" },
      ];
      const deviceName =
        deviceType && deviceTypeFormat[deviceType - 1]
          ? deviceTypeFormat[deviceType - 1].en
          : "";

      return {
        ...result,
        sportType,
        minSpeed: formattedSpeeds.minSpeed,
        avgSpeed: formattedSpeeds.avgSpeed,
        maxSpeed: formattedSpeeds.maxSpeed,
        minCadence: formattedCadence.minCadence,
        avgCadence: formattedCadence.avgCadence,
        maxCadence: formattedCadence.maxCadence,
        minStrideLength: formattedStride.minStrideLength,
        avgStrideLength: formattedStride.avgStrideLength,
        maxStrideLength: formattedStride.maxStrideLength,
        minTemperature: minTemperature || "-",
        avgTemperature: avgTemperature || "-",
        maxTemperature: maxTemperature || "-",
        totalAscent: totalAscent || "-",
        totalDescent: totalDescent || "-",
        np: np || "-",
        if: intensityFactor || "-",
        productName: `${deviceName || ""} ${productName || ""}`.trim(),
      };
    },
    // 查询运动详情
    getSportDetail() {
      scheduleApi.getActivityDetail(this.classData.activityId, this.triUserId).then((res) => {
        if (res.success) {
          this.sportDetail = this.formatOutlineData(res.result);
          const actualData = {
            duration: this.translateSecondsToFormat(this.sportDetail.duration),
            activityDuration: this.translateSecondsToFormat(
              this.sportDetail.netDuration || 0
            ),
            distance: parseFloat(this.sportDetail.distance),
            sthValue: this.sportDetail.sthValue,
            calories: this.sportDetail.calories,
            distanceUnit: this.sportDetail.sportType === 3 ? "m" : "km",
          };
          actualData.distance =
            actualData.distanceUnit === "km"
              ? actualData.distance / 1000
              : actualData.distance;
          this.defaultData = JSON.parse(JSON.stringify(actualData));
          if (!this.classData.manualActivityId) {
            this.actualData = actualData;
          } else {
            this.actualData = {
              duration: this.classData.duration,
              activityDuration: this.translateSecondsToFormat(
                this.classData.activityDuration || 0
              ),
              sthValue: this.classData.sthValue,
              calories: this.classData.calories,
            };
            if (!this.classData.distanceUnit) {
              this.$set(
                this.actualData,
                "distanceUnit",
                this.sportDetail.sportType === 3 ? "m" : "km"
              );
            } else {
              this.$set(
                this.actualData,
                "distanceUnit",
                this.classData.distanceUnit
              );
            }
            this.$set(
              this.actualData,
              "distance",
              this.actualData.distanceUnit === "km"
                ? this.classData.preciseDistance / 1000
                : this.classData.preciseDistance
            );
            console.log(this.actualData, "this.actualData");
            this.defaultData = JSON.parse(JSON.stringify(this.actualData));
          }
          // 保存原始数据
          this.originalData = JSON.parse(JSON.stringify(actualData));
          this.originalData.distance = parseFloat(
            this.sportDetail.distance.toFixed(0)
          );
          console.log(this.originalData, "originalData");
        }
      });
    },
    // 还原字段到原始值
    restoreField(field) {
      if (field === "distance") {
        this.$set(
          this.actualData,
          "distance",
          this.actualData.distanceUnit === "km"
            ? this.originalData[field] / 1000
            : this.originalData[field]
        );
      } else {
        this.$set(this.actualData, field, this.originalData[field]);
      }
    },
    // 重置字段到默认值
    resetField(field) {
      if (field === "distance") {
        if (
          this.actualData.distanceUnit === "km" &&
          this.defaultData.distanceUnit === "km"
        ) {
          this.$set(this.actualData, "distance", this.defaultData.distance);
        } else if (
          this.actualData.distanceUnit === "m" &&
          this.defaultData.distanceUnit === "m"
        ) {
          this.$set(this.actualData, "distance", this.defaultData.distance);
        } else if (
          this.actualData.distanceUnit === "m" &&
          this.defaultData.distanceUnit === "km"
        ) {
          this.$set(
            this.actualData,
            "distance",
            this.defaultData.distance * 1000
          );
        } else if (
          this.actualData.distanceUnit === "km" &&
          this.defaultData.distanceUnit === "m"
        ) {
          this.$set(
            this.actualData,
            "distance",
            this.defaultData.distance / 1000
          );
        } else {
          this.$set(this.actualData, "distance", this.defaultData.distance);
        }
      } else {
        this.$set(this.actualData, field, this.defaultData[field]);
      }
    },
    handleDistanceUnitChange(value) {
      console.log(value, "value");
      if (value === "km") {
        this.$set(
          this.actualData,
          "distance",
          parseFloat(this.actualData.distance / 1000)
        );
      } else {
        // 当切换为米时，确保距离是整数
        const distanceInMeters = parseFloat(this.actualData.distance * 1000);
        this.$set(this.actualData, "distance", Math.round(distanceInMeters));
      }
      console.log(this.actualData, "this.actualData");
      console.log(this.originalData, "this.originalData");
      console.log(this.defaultData, "this.defaultData");
    },
    handleDistanceInput(value) {
      // 当单位为米时，确保输入的值是整数
      if (
        this.actualData.distanceUnit === "m" &&
        value !== null &&
        value !== undefined
      ) {
        const intValue = Math.round(value);
        if (intValue !== value) {
          this.$set(this.actualData, "distance", intValue);
        }
      }
    },
    handleEditClassDetail() {
      // 只打开子对话框，不关闭当前对话框
      this.showClassDetailModal = true;
    },
    handleClassDetailClose() {
      // 子对话框关闭时的回调
      this.showClassDetailModal = false;
      this.getClassScheduleInfo(this.classItem.id);
      this.handleClose();
    },
    handleClose() {
      console.log("handleClose");
      this.showClassDetailModal = false;
      this.$emit("close");
    },
    // 判断是课表时 actualData是否被修改过（不是默认值）
    isActualDataModified() {
      const defaultData = {
        duration: "00:00:00",
        activityDuration: "00:00:00",
        distance: 0,
        sthValue: 0,
        calories: 0,
      };
      // 判断是否有任何字段不等于默认值
      return (
        this.actualData.duration !== defaultData.duration ||
        this.actualData.activityDuration !== defaultData.activityDuration ||
        (this.actualData.distance !== defaultData.distance &&
          this.actualData.distance !== null &&
          this.actualData.distance !== undefined) ||
        (this.actualData.sthValue !== defaultData.sthValue &&
          this.actualData.sthValue !== null &&
          this.actualData.sthValue !== undefined) ||
        (this.actualData.calories !== defaultData.calories &&
          this.actualData.calories !== null &&
          this.actualData.calories !== undefined)
      );
    },
    // 判断 运动数据时 actualData是否被修改过（不是原始值）
    isActualDataModifiedForActivity() {
      // 判断是否有任何字段不等于原始值
      console.log(
        this.actualData,
        this.defaultData,
        "this.actualData.duration, this.defaultData.duration"
      );
      return (
        this.actualData.duration === this.defaultData.duration &&
        this.actualData.activityDuration ===
          this.defaultData.activityDuration &&
        this.actualData.distance === this.defaultData.distance &&
        this.actualData.sthValue === this.defaultData.sthValue &&
        this.actualData.calories === this.defaultData.calories
      );
    },
    saveClassSchedule(flag) {
      const isModified = this.isActualDataModified();
      let distance = null;
      if (this.actualData.distance) {
        distance =
          this.actualData.distanceUnit === "km"
            ? this.actualData.distance * 1000
            : this.actualData.distance;
      }
      submitData({
        url: "/gateway/training/classSchedule/updateClassSchedule",
        id: this.isActivity
          ? this.classData.classScheduleId
          : this.classData.id,
        classesJson: JSON.stringify(this.classData.classesJson),
        activityDuration:
          hhmmssToSeconds(this.actualData.activityDuration) || null,
        duration: hhmmssToSeconds(this.actualData.duration) || null,
        distance: distance,
        sthValue: this.actualData.sthValue || null,
        calories: this.actualData.calories || null,
        distanceUnit: this.actualData.distanceUnit || null,
        flag: isModified, // 如果修改过为true，否则为false
      }).then((res) => {
        if (res.success) {
          this.$message.success("课表保存成功");
          if (isModified) {
            this.handleClose();
            this.$emit("save", flag);
            return;
          }
          if (flag) this.handleClose();
          this.$emit("save", flag);
        }
      });
    },
    saveActivitySchedule(flag) {
      if (this.isActualDataModifiedForActivity()) {
        this.$message.error("运动数据未修改，无需保存");
        return;
      }
      submitData({
        url: "/training/api/activity/updateActivityDetail",
        activityId: this.classData.activityId,
        classesJson: JSON.stringify(this.classData.classesJson),
        activityDuration:
          hhmmssToSeconds(this.actualData.activityDuration) || null,
        duration: hhmmssToSeconds(this.actualData.duration) || null,
        distance:
          this.actualData.distanceUnit === "km"
            ? this.actualData.distance * 1000
            : this.actualData.distance || null,
        sthValue: this.actualData.sthValue || null,
        calories: this.actualData.calories || null,
        distanceUnit: this.actualData.distanceUnit,
      }).then((res) => {
        if (res.success) {
          this.$message.success("运动记录保存成功");
          this.handleClose();
          this.$emit("save", flag);
        }
      });
    },
    saveActivityScheduleForManual(flag) {
      submitData({
        url: "/training/api/manualDeviceActivity/update",
        manualActivityId: this.classData.manualActivityId,
        activityDuration:
          hhmmssToSeconds(this.actualData.activityDuration) || null,
        duration: hhmmssToSeconds(this.actualData.duration) || null,
        distance:
          this.actualData.distanceUnit === "km"
            ? this.actualData.distance * 1000
            : this.actualData.distance || null,
        sthValue: this.actualData.sthValue || 0,
        calories: this.actualData.calories || 0,
        distanceUnit: this.actualData.distanceUnit,
      }).then((res) => {
        if (res.success) {
          this.$message.success("运动记录保存成功");
          this.handleClose();
          this.$emit("save", flag);
        }
      });
    },
    async handleSave(flag) {
      console.log(this.classData, "classData");
      // 如果有标题表单且可编辑（有 classesJson.title），先验证并同步标题
      if (this.$refs.titleRef && this.classData.classesJson?.title) {
        try {
          await this.$refs.titleRef.validate();
          // 同步 form.title 到 classData.classesJson.title
          if (!this.classData.classesJson) {
            this.$set(this.classData, "classesJson", {});
          }
          this.$set(this.classData.classesJson, "title", this.form.title);
        } catch (error) {
          // 验证失败，不继续保存
          return;
        }
      }
      // if (!this.isActivity || !this.classData.activityId) {
      //   this.saveClassSchedule(flag);
      // } else {
      //   this.saveActivitySchedule(flag);
      // }
      if (
        this.isActivity &&
        this.classData.activityId &&
        !this.classData.classScheduleId
      ) {
        this.saveActivitySchedule(flag);
      } else if (
        this.isActivity &&
        !this.classData.activityId &&
        !this.classData.classScheduleId
      ) {
        this.saveActivityScheduleForManual(flag);
      } else {
        this.saveClassSchedule(flag);
      }
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
    actualformatDistance(distance, sportType) {
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance;
      }
      if (sportType === 3) {
        result = distance;
      } else {
        result = Math.round(result / 10) / 100;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    scheduleFormatDistance(distance, sportType) {
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && Number(distance) > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    formatDistance(distance, distanceUnit) {
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
      if (
        distanceUnit === "m" &&
        result !== "--" &&
        this.classData.classesJson?.sportType !== "SWIM"
      ) {
        result = result * 1000;
      } else if (
        distanceUnit === "km" &&
        result !== "--" &&
        this.classData.classesJson?.sportType === "SWIM"
      ) {
        result = result / 1000;
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
    gap: 10px;
    div {
      display: flex;
      align-items: center;
      gap: 10px;
      > span {
        flex: 1;
        white-space: nowrap;
      }
    }
    ::v-deep .el-form-item {
      margin-left: 0;
      .el-form-item__content {
        margin-left: 0 !important;
      }
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
    gap: 10px;
    margin-bottom: 20px;
    padding: 15px 0;
    padding-top: 0;
    justify-content: space-between;

    .metric-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .sport-icon {
        width: 24px;
        height: 24px;
      }

      .metric-value {
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 14px;
        color: #101010;
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

    .input-with-actions {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      position: relative;
      .modified-indicator {
        position: absolute;
        left: -10px;
      }
      .el-input-number--small {
        width: 110px !important;
        flex-shrink: 0;
      }

      .action-buttons {
        display: flex;
        gap: 2px;
        white-space: nowrap;
        flex-shrink: 0;
        justify-content: flex-start;

        .el-button--text {
          padding: 2px 6px;
          font-size: 11px;
          color: #409eff;

          &:hover {
            color: #66b1ff;
          }

          &.is-disabled {
            color: #c0c4cc !important;
            cursor: not-allowed;

            &:hover {
              color: #c0c4cc !important;
            }
          }
        }
      }
    }

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
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 12px;
        color: #101010;
      }

      td:first-child {
        width: 80px;
        color: #666666;
        white-space: nowrap;
        font-family: PingFang SC;
        font-weight: 400;
        font-style: Medium;
        font-size: 12px;
      }

      td:nth-child(2) {
        width: 100px;
        color: #101010;
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 12px;
      }

      td:nth-child(3) {
        width: 120px;
      }

      td:last-child {
        width: 50px;
        color: #666666;
        white-space: nowrap;
        font-family: PingFang SC;
        font-weight: 400;
        font-style: Medium;
        font-size: 12px;
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
        color: #333;
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 14px;
        color: #101010;
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
  justify-content: space-between;
  gap: 10px;
  .delete-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
}
.dialog-footer .el-button {
  min-width: 102px;
  border-radius: 5px;
  font-family: PingFang SC;
  font-weight: 500;
  font-style: Medium;
  font-size: 12px;
  padding: 0px;
  height: 32px;
}
.dialog-footer .el-button--warning {
  background: #f5a623;
  border-color: #f5a623;
}
.dialog-footer .el-button--danger {
  background: #d83b36;
  border-color: #d83b36;
}
.edit-class-detail-btn {
  width: 116px;
  color: #101010;
  font-family: PingFang SC;
  font-weight: 500;
  font-style: Medium;
  font-size: 12px;
  border-radius: 5px;
  border: 1px solid #f92b30;
  font-family: PingFang SC;
  font-style: Medium;
  background-color: #fff;
  color: #f92b30;
  height: 32px;
  line-height: 32px;
  padding: 0px;
}
</style>
