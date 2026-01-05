<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="880px"
    :before-close="handleClose"
    append-to-body
    class="athletic-info-dialog"
    :close-on-click-modal="false"
  >
    <span slot="title">运动员信息</span>
    <el-tabs v-model="activeMainTab" @tab-click="handleTabClick">
      <el-tab-pane label="运动偏好" name="preference">
        <div class="preference-form">
          <div class="section-header">
            <div class="section-title">{{ matchTypeToName[lastMatchType] }}</div>
            <div class="section-count">
              <span>综合次数</span>
              <span class="count-value">{{ totalTrainingCount }}</span>
            </div>
          </div>

          <div class="form-grid">
            <div
              class="form-row"
              v-if="lastMatchType === 2 || lastMatchType === 3"
            >
              <span class="form-label">游泳训练次数偏好设置</span>
              <el-input-number
                v-model="preferenceForm.swimTimes"
                :min="0"
                :max="14"
                :step="1"
                :precision="0"
                controls-position="right"
                class="count-input"
                @keydown.native="preventDecimal"
              />
            </div>

            <div
              class="form-row"
              v-if="lastMatchType === 2 || lastMatchType === 4"
            >
              <span class="form-label">骑行训练次数偏好设置</span>
              <el-input-number
                v-model="preferenceForm.cycleTimes"
                :min="0"
                :max="14"
                :step="1"
                :precision="0"
                controls-position="right"
                class="count-input"
                @keydown.native="preventDecimal"
              />
            </div>

            <div
              class="form-row"
              v-if="lastMatchType === 1 || lastMatchType === 2"
            >
              <span class="form-label">跑步训练次数偏好设置</span>
              <el-input-number
                v-model="preferenceForm.runTimes"
                :min="0"
                :max="14"
                :step="1"
                :precision="0"
                controls-position="right"
                class="count-input"
                @keydown.native="preventDecimal"
              />
            </div>

            <div class="form-row">
              <span class="form-label">力量训练次数偏好设置</span>
              <el-input-number
                v-model="preferenceForm.strengthTimes"
                :min="0"
                :max="14"
                :step="1"
                :precision="0"
                controls-position="right"
                class="count-input"
                @keydown.native="preventDecimal"
              />
            </div>
          </div>

          <div
            class="section-header"
            v-if="
              lastMatchType === 1 || lastMatchType === 2 || lastMatchType === 4
            "
          >
            <div class="section-title">长距离偏好设置</div>
          </div>

          <div class="form-grid">
            <div
              class="form-row"
              v-if="lastMatchType === 1 || lastMatchType === 2"
            >
              <span class="form-label">长距离跑步</span>
              <el-select
                v-model="preferenceForm.runLongDays"
                placeholder="请选择"
                class="week-select"
              >
                <el-option label="无" :value="0" />
                <el-option
                  v-for="day in availableDaysForLongDistance"
                  :key="'run-' + day.value"
                  :label="day.label"
                  :value="day.value"
                />
              </el-select>
            </div>

            <div
              class="form-row"
              v-if="lastMatchType === 2 || lastMatchType === 4"
            >
              <span class="form-label">长距离骑行</span>
              <el-select
                v-model="preferenceForm.cycleLongDays"
                placeholder="请选择"
                class="week-select"
              >
                <el-option label="无" :value="0" />

                <el-option
                  v-for="day in availableDaysForLongDistance"
                  :key="'bike-' + day.value"
                  :label="day.label"
                  :value="day.value"
                />
              </el-select>
            </div>
          </div>

          <div class="section-header rest-day-section">
            <div class="section-title">休息日偏好</div>
          </div>

          <div class="rest-day-radio">
            <el-radio-group
              v-model="preferenceForm.hasRestDay"
              @change="handleHasRestDayChange"
            >
              <el-radio :label="false">无休息日</el-radio>
              <el-radio :label="true">有休息日</el-radio>
            </el-radio-group>
          </div>

          <div v-if="preferenceForm.hasRestDay" class="rest-day-config">
            <el-select
              v-model="preferenceForm.restDays"
              multiple
              :multiple-limit="3"
              placeholder="长距离日不可选择"
              class="week-select-multiple"
            >
              <el-option
                v-for="day in availableRestDays"
                :key="'rest-' + day.value"
                :label="day.label"
                :value="day.value"
              />
            </el-select>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="阈值" name="threshold">
        <el-tabs v-model="activeSport" class="sport-tabs">
          <el-tab-pane label="心率" :name="1" />
          <el-tab-pane
            v-if="lastMatchType === 2 || lastMatchType === 3"
            label="游泳"
            :name="4"
          />
          <el-tab-pane
            v-if="lastMatchType === 2 || lastMatchType === 4"
            label="骑车"
            :name="2"
          />
          <el-tab-pane
            v-if="lastMatchType === 1 || lastMatchType === 2"
            label="跑步"
            :name="3"
          />
        </el-tabs>
        <div class="threshold-form">
          <div v-if="activeSport === 1" class="row">
            <span class="label"><span class="required">*</span>阈值心率</span>
            <el-input
              v-model="thresholdData.param2"
              :key="'hr-param2-' + activeSport"
              class="pill-input"
              @input="handleThresholdInput('param2', $event)"
            />
            <span class="suffix unit-red">bpm</span>
            <span class="label right-gap"
              ><span class="required">*</span>最大心率</span
            >
            <el-input
              v-model="thresholdData.param1"
              :key="'hr-param1-' + activeSport"
              class="pill-input"
              @input="handleThresholdInput('param1', $event)"
            />
            <span class="suffix unit-red">bpm</span>
          </div>
          <div v-else-if="activeSport === 4" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <!-- <el-time-picker
              v-model="thresholdData.thresholdTimeValue"
              :key="'swim-' + activeSport"
              value-format="mm:ss"
              format="mm:ss"
              popper-class="hide-hour"
              class="pill-input"
            /> -->
            <TimeInput
              v-model="thresholdData.thresholdTimeValue"
              :key="'swim-' + activeSport"
              timerType="mm:ss"
            />
            <span class="suffix unit-red">min/100m</span>
          </div>
          <div v-else-if="activeSport === 2" class="row">
            <span class="label"><span class="required">*</span>阈值功率</span>
            <el-input
              v-model="thresholdData.threshold"
              :key="'bike-' + activeSport"
              class="pill-input"
              @input="handleThresholdInput('threshold', $event)"
            />
            <span class="suffix unit-red">w</span>
          </div>
          <div v-else-if="activeSport === 3" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <!-- <el-time-picker
              v-model="thresholdData.thresholdTimeValue"
              :key="'run-' + activeSport"
              value-format="mm:ss"
              format="mm:ss"
              popper-class="hide-hour"
              class="pill-input"
            /> -->
            <TimeInput
              v-model="thresholdData.thresholdTimeValue"
              :key="'run-' + activeSport"
              timerType="mm:ss"
            />
            <span class="suffix unit-red">min/km</span>
          </div>
          <div class="zoneContainer">
            <div class="zoneTr">
              <div class="zoneTd">热身/冷身</div>
              <div class="zoneTd">min</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone1[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z1:恢复</div>
              <div class="zoneTd">{{ thresholdData.zone1[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone1[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z2:有氧</div>
              <div class="zoneTd">{{ thresholdData.zone2[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone2[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="LT">
              <div style="margin-left: 5px; margin-right: 5px">
                ...............................................................................
                LT1:
              </div>
              <div>{{ thresholdData.zone2[1] }} {{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z3:节奏</div>
              <div class="zoneTd">{{ thresholdData.zone3[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone3[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z4:阈值门槛</div>
              <div class="zoneTd">{{ thresholdData.zone4[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone4[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="LT">
              <div style="margin-left: 5px; margin-right: 5px">
                ...............................................................................
                LT2:
              </div>
              <div>{{ thresholdData.zone4[1] }} {{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5A:阈值上限</div>
              <div class="zoneTd">{{ thresholdData.zone5A[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone5A[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5B:最大摄氧量</div>
              <div class="zoneTd">{{ thresholdData.zone5B[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone5B[1] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5C:无氧能力</div>
              <div class="zoneTd">{{ thresholdData.zone5C[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">max</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="基本信息" name="base">
        <el-form :model="baseForm" label-width="80px" class="base-form">
          <el-form-item label="昵称">
            <el-input
              v-model="baseForm.nickname"
              placeholder="请输入昵称"
              disabled
            />
          </el-form-item>
          <el-form-item label="头像">
            <div class="avatar-uploader">
              <el-upload
                class="avatar-upload"
                action=""
                :http-request="noopRequest"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="onAvatarChange"
                accept="image/*"
                disabled
              >
                <img
                  v-if="baseForm.avatarUrl"
                  :src="baseForm.avatarUrl"
                  class="avatar"
                />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="baseForm.gender" disabled>
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="身高">
            <div class="inline-field">
              <el-input
                v-model.number="baseForm.height"
                placeholder="cm"
                disabled
              />
              <span class="unit">CM</span>
            </div>
          </el-form-item>
          <el-form-item label="体重">
            <div class="inline-field">
              <el-input
                v-model.number="baseForm.weight"
                placeholder="kg"
                disabled
              />
              <span class="unit">KG</span>
            </div>
          </el-form-item>
          <el-form-item label="BMI">
            <span>{{ bmiDisplay }}</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer" v-if="activeMainTab !== 'base'">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSave" :loading="loading"
        >保存</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import { secondsToMMSS, mmssToSeconds } from "@/utils/index";
import request from "@/utils/request";
import TimeInput from "../timeInpt/index.vue";
export default {
  name: "AthleticInfoDialog",
  components: {
    TimeInput,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      // 兼容 v-model 用法
      type: Boolean,
      default: undefined,
    },
    // 初始数据（可选）
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      innerVisible: this.visible || this.value || false,
      activeMainTab: "preference",
      activeSport: 1,
      baseForm: {
        nickname: this.data.nickname || "",
        avatar: this.data.avatar || "",
        gender: 1,
        heightCm: this.data.heightCm || null,
        weightKg: this.data.weightKg || null,
      },
      thresholds: [],
      thresholdData: {
        zone1: [],
        zone2: [],
        zone3: [],
        zone4: [],
        zone5A: [],
        zone5B: [],
        zone5C: [],
        unit: "",
        threshold: "",
        thresholdTimeValue: "00:00",
      },
      preferenceForm: {
        swimTimes: 3,
        cycleTimes: 3,
        runTimes: 3,
        strengthTimes: 3,
        runLongDays: 0,
        cycleLongDays: 0,
        hasRestDay: true,
        restDays: [],
      },
      triUserId: "",
      loginType: localStorage.getItem("loginType"),
      lastMatchType: 2,
      matchTypeToName: {
        1: "跑步模式",
        2: "铁三模式",
        3: "游泳模式",
        4: "骑行模式",
      },
    };
  },
  computed: {
    bmiDisplay() {
      const h = Number(this.baseForm.height);
      const w = Number(this.baseForm.weight);
      if (!h || !w) return "";
      const bmi = w / Math.pow(h / 100, 2);
      return bmi ? bmi.toFixed(1) : "";
    },
    totalTrainingCount() {
      // 根据matchTypeToName模式来计算综合训练次数
      let totalTimes = 0;
      if (this.lastMatchType === 1) {
        totalTimes =
          (this.preferenceForm.runTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === 2) {
        totalTimes =
          (this.preferenceForm.swimTimes || 0) +
          (this.preferenceForm.cycleTimes || 0) +
          (this.preferenceForm.runTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === 3) {
        totalTimes =
          (this.preferenceForm.swimTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === 4) {
        totalTimes =
          (this.preferenceForm.cycleTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      }
      return totalTimes;
    },
    // 可用于长距离训练的日期（排除休息日）
    availableDaysForLongDistance() {
      const allDays = [
        { label: "周一", value: 1 },
        { label: "周二", value: 2 },
        { label: "周三", value: 3 },
        { label: "周四", value: 4 },
        { label: "周五", value: 5 },
        { label: "周六", value: 6 },
        { label: "周日", value: 7 },
      ];

      // 如果没有休息日，返回所有日期
      if (
        !this.preferenceForm.hasRestDay ||
        !this.preferenceForm.restDays ||
        this.preferenceForm.restDays.length === 0
      ) {
        return allDays;
      }

      // 过滤掉休息日
      return allDays.filter(
        (day) => !this.preferenceForm.restDays.includes(day.value)
      );
    },
    // 可用于休息日的日期（排除长距离训练日）
    availableRestDays() {
      const allDays = [
        { label: "周一", value: 1 },
        { label: "周二", value: 2 },
        { label: "周三", value: 3 },
        { label: "周四", value: 4 },
        { label: "周五", value: 5 },
        { label: "周六", value: 6 },
        { label: "周日", value: 7 },
      ];

      // 收集已选择的长距离训练日
      const longDistanceDays = [];
      if (this.preferenceForm.runLongDays) {
        longDistanceDays.push(this.preferenceForm.runLongDays);
      }
      if (this.preferenceForm.cycleLongDays) {
        longDistanceDays.push(this.preferenceForm.cycleLongDays);
      }

      // 如果没有长距离训练日，返回所有日期
      if (longDistanceDays.length === 0) {
        return allDays;
      }

      // 过滤掉长距离训练日
      return allDays.filter((day) => !longDistanceDays.includes(day.value));
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val;
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
      this.$emit("input", val);
      if (val) {
        if (localStorage.getItem("loginType") === "2") {
          this.triUserId = this.data.triUserId;
        } else {
          this.triUserId = localStorage.getItem("triUserId") || "";
        }
        if (this.activeMainTab === "preference") {
          this.getPreferenceData();
        }
        this.getAthleticInfo();
        this.getThresholdData();

        // 检查当前选中的阈值类型是否可用
        this.$nextTick(() => {
          const availableTypes = this.getAvailableThresholdTypes(
            this.lastMatchType
          );
          if (!availableTypes.includes(this.activeSport)) {
            this.activeSport = 1;
          }
        });
      }
    },
    activeSport(val) {
      this.getThresholdData();
    },
    // 监听运动模式变化，自动切换到可用的阈值类型
    lastMatchType(newType) {
      // 检查当前选中的阈值类型是否在可用的类型中
      const availableTypes = this.getAvailableThresholdTypes(newType);
      if (!availableTypes.includes(this.activeSport)) {
        // 如果当前选中的类型不可用，切换到心率(1)
        this.activeSport = 1;
      }
    },
    // 监听休息日变化，自动清除与休息日冲突的长距离训练日
    "preferenceForm.restDays": {
      handler(newRestDays) {
        if (!newRestDays || newRestDays.length === 0) {
          return;
        }

        // 如果长距离跑步日在休息日中，清除它
        if (
          this.preferenceForm.runLongDays &&
          newRestDays.includes(this.preferenceForm.runLongDays)
        ) {
          this.preferenceForm.runLongDays = null;
        }

        // 如果长距离骑行日在休息日中，清除它
        if (
          this.preferenceForm.cycleLongDays &&
          newRestDays.includes(this.preferenceForm.cycleLongDays)
        ) {
          this.preferenceForm.cycleLongDays = null;
        }
      },
      deep: true,
    },
    // 监听长距离跑步日变化，从休息日中移除该日期
    "preferenceForm.runLongDays": function (newDay) {
      if (!newDay || !this.preferenceForm.restDays) {
        return;
      }

      // 如果新选择的长距离跑步日在休息日列表中，从休息日中移除
      const index = this.preferenceForm.restDays.indexOf(newDay);
      if (index > -1) {
        this.preferenceForm.restDays.splice(index, 1);
      }
    },
    // 监听长距离骑行日变化，从休息日中移除该日期
    "preferenceForm.cycleLongDays": function (newDay) {
      if (!newDay || !this.preferenceForm.restDays) {
        return;
      }

      // 如果新选择的长距离骑行日在休息日列表中，从休息日中移除
      const index = this.preferenceForm.restDays.indexOf(newDay);
      if (index > -1) {
        this.preferenceForm.restDays.splice(index, 1);
      }
    },
    // 监听是否有休息日的开关
    "preferenceForm.hasRestDay": function (newVal) {
      // 如果取消了休息日，不需要做任何处理
      // 长距离训练日可以保持原样
    },
  },
  methods: {
    handleHasRestDayChange(val) {
      if (!val) {
        this.preferenceForm.restDays = [];
      }
    },
    // 获取根据运动模式可用的阈值类型
    getAvailableThresholdTypes(matchType) {
      // 1: 心率, 2: 骑车, 3: 跑步, 4: 游泳
      const types = [1]; // 心率始终可用

      switch (matchType) {
        case 1: // 跑步模式
          types.push(3); // 跑步
          break;
        case 2: // 铁三模式
          types.push(4, 2, 3); // 游泳、骑车、跑步
          break;
        case 3: // 游泳模式
          types.push(4); // 游泳
          break;
        case 4: // 骑行模式
          types.push(2); // 骑车
          break;
      }

      return types;
    },
    handleTabClick(tab, event) {
      // this.activeMainTab = tab.name;
      if (this.activeMainTab === "preference") {
        this.getPreferenceData();
        this.getAthleticInfo();
      }
    },
    // 校验选择了有休息必须选择天数
    checkRestDayCount() {
      if (
        this.preferenceForm.hasRestDay &&
        this.preferenceForm.restDays.length === 0
      ) {
        this.$message.error("请选择休息天数");
        return false;
      }
      return true;
    },
    // 查询偏好数据
    getPreferenceData() {
      request({
        url: `/gateway/training/sport-preference/by-current-type?triUserId=${this.triUserId}`,
        method: "get",
        headers: {
          requestUserInfoId: this.triUserId,
        },
      }).then((res) => {
        if (res.result) {
          this.preferenceForm = res.result;
          if (
            this.preferenceForm.restDays &&
            this.preferenceForm.restDays.length > 0
          ) {
            this.$set(this.preferenceForm, "hasRestDay", true);
          } else {
            this.$set(this.preferenceForm, "hasRestDay", false);
          }
          if (
            res.result.cycleLongDays &&
            Array.isArray(res.result.cycleLongDays)
          ) {
            this.$set(
              this.preferenceForm,
              "cycleLongDays",
              res.result.cycleLongDays.length > 0
                ? res.result.cycleLongDays[0]
                : 0
            );
          }
          if (res.result.runLongDays && Array.isArray(res.result.runLongDays)) {
            this.$set(
              this.preferenceForm,
              "runLongDays",
              res.result.runLongDays.length > 0 ? res.result.runLongDays[0] : 0
            );
          }
        } else {
          this.preferenceForm = {
            swimTimes: 0,
            cycleTimes: 0,
            runTimes: 0,
            strengthTimes: 0,
            runLongDays: 0,
            cycleLongDays: 0,
            hasRestDay: false,
            restDays: [],
          };
        }
      });
    },
    // 查询preferenceForm没有id 数据时保存需创建运动偏好
    createPreferenceData() {
      if (!this.checkRestDayCount()) {
        return;
      }
      const params = JSON.parse(JSON.stringify(this.preferenceForm));
      params.runLongDays = params.runLongDays === 0 ? [] : [params.runLongDays];
      params.cycleLongDays =
        params.cycleLongDays === 0 ? [] : [params.cycleLongDays];
      params.totalTimes = this.totalTrainingCount;
      request({
        url: "/training/api/sport-preference/create",
        method: "post",
        data: params,
        headers: {
          requestUserInfoId: this.triUserId,
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success("运动偏好创建成功");
          this.getPreferenceData();
        }
      });
    },
    // 保存运动偏好
    savePreferenceData() {
      if (!this.checkRestDayCount()) {
        return;
      }
      const params = JSON.parse(JSON.stringify(this.preferenceForm));
      console.log(params);
      params.runLongDays = params.runLongDays === 0 ? [] : [params.runLongDays];
      params.cycleLongDays =
        params.cycleLongDays === 0 ? [] : [params.cycleLongDays];
      params.totalTimes = this.totalTrainingCount;
      request({
        url: `/training/api/sport-preference/${this.preferenceForm.id}`,
        method: "put",
        data: params,
        headers: {
          requestUserInfoId: this.triUserId,
        },
      }).then((res) => {
        if (res.success) {
          this.$message.success("运动偏好保存成功");
          this.getPreferenceData();
        }
      });
    },
    getAthleticInfo() {
      getData({
        url: "/consumer/wx/getUserProfile",
        triUserId: this.triUserId,
      }).then((res) => {
        if (res.success) {
          this.baseForm = res.result;
          this.lastMatchType = res.result.lastMatchType;
          // this.thresholds = res.result.thresholdRecordList
          // this.currentThreshold = this.thresholds.find(item => item.thresholdType === this.activeSport)
        }
      });
    },
    getThresholdData() {
      getData({
        url: "/consumer/wx/getThresholdDetail",
        type: this.activeSport,
        triUserId: this.triUserId,
      }).then((res) => {
        const result = res.result[0];
        // 处理时间格式转换
        if (this.activeSport === 4 || this.activeSport === 3) {
          result.thresholdTimeValue = secondsToMMSS(+result.threshold);
        }
        // 使用 Vue.set 确保响应式更新，或者直接赋值新对象
        this.thresholdData = {
          ...result,
          threshold: result.threshold ? +result.threshold : "",
          zone1: result.zone1 || [],
          zone2: result.zone2 || [],
          zone3: result.zone3 || [],
          zone4: result.zone4 || [],
          zone5A: result.zone5A || [],
          zone5B: result.zone5B || [],
          zone5C: result.zone5C || [],
        };
      });
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onSave() {
      if (this.activeMainTab === "preference") {
        if (this.preferenceForm.id) {
          this.savePreferenceData();
        } else {
          this.createPreferenceData();
        }
        return;
      }
      this.$confirm(
        "阈值更新将会影响运动员的相关设置及训练计划, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.loading = true;
          const params = {
            thresholdType: this.activeSport,
            param1: "",
            param2: "",
            threshold: "",
            triUserId: this.triUserId,
          };
          if (this.activeSport === 4 || this.activeSport === 3) {
            params.threshold = mmssToSeconds(
              this.thresholdData.thresholdTimeValue
            );
          } else if (this.activeSport === 2) {
            params.threshold = this.thresholdData.threshold;
          } else if (this.activeSport === 1) {
            params.param1 = this.thresholdData.param1;
            params.param2 = this.thresholdData.param2;
          }
          submitData({
            url: "/api/user/updateThreshold",
            requestData: params,
          })
            .then((res) => {
              if (res.success) {
                this.$message.success("阈值保存成功");
                this.$emit("save", res.result);
                this.loading = false;
              }
            })
            .finally(() => {
              this.loading = false;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消更新",
          });
        });
    },
    noopRequest() {},
    onAvatarChange(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.baseForm.avatar = e.target.result;
      };
      reader.readAsDataURL(file.raw);
    },
    handleSportChange(val) {
      console.log(val);
      this.activeSport = val;
    },
    // 阻止输入小数点和其他非数字字符
    preventDecimal(event) {
      // 允许的按键：数字键、退格、删除、方向键、Tab
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      // 允许 Ctrl/Cmd 组合键（复制、粘贴、全选等）
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      // 检查是否是允许的特殊键
      if (allowedKeys.includes(event.key)) {
        return;
      }

      // 阻止小数点、负号和其他非数字字符
      if (
        event.key === "." ||
        event.key === "-" ||
        event.key === "e" ||
        event.key === "E" ||
        event.key === "+"
      ) {
        event.preventDefault();
        return;
      }

      // 只允许数字0-9
      if (!/^\d$/.test(event.key)) {
        event.preventDefault();
      }
    },
    handleThresholdInput(field, value) {
      // 确保 value 是字符串类型
      const strValue = String(value || "");

      // 移除所有非数字字符（包括字母 e、小数点、负号等）
      let numericValue = strValue.replace(/\D/g, "");

      // 限制最大长度为7位
      if (numericValue.length > 7) {
        numericValue = numericValue.slice(0, 7);
      }

      // 移除前导零
      if (numericValue.length > 1 && numericValue[0] === "0") {
        numericValue = numericValue.replace(/^0+/, "");
      }

      // 如果输入为空或只有0，则清空
      if (numericValue === "" || numericValue === "0") {
        this.thresholdData[field] = "";
      } else {
        // 转换为正整数
        const intValue = parseInt(numericValue, 10);
        if (intValue > 0) {
          this.thresholdData[field] = intValue;
        } else {
          this.thresholdData[field] = "";
        }
      }
    },
  },
};
</script>

<style scoped >
.athletic-info-dialog ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.athletic-info-dialog ::v-deep(.el-dialog__body) {
  padding: 10px 36px 0 36px;
}
.athletic-info-dialog ::v-deep(.el-tabs__header) {
  margin-bottom: 16px;
}
.base-form .el-input.is-disabled .el-input__inner {
  background: #f5f5f7;
  color: #333;
  border-radius: 24px;
  border: none;
  height: 40px;
}
.base-form .el-form-item {
  margin-bottom: 18px;
}
.base-form ::v-deep(.el-radio.is-disabled) {
  opacity: 1;
}
.base-form ::v-deep(.el-radio__input.is-disabled .el-radio__inner) {
  border-color: #d9d9d9;
}
.base-form ::v-deep(.el-radio__input.is-disabled.is-checked .el-radio__inner) {
  border-color: #e74c3c;
}
.base-form
  ::v-deep(.el-radio__input.is-disabled.is-checked .el-radio__inner::after) {
  background: #e74c3c;
}
.athletic-info-dialog .avatar-uploader {
  display: inline-block;
}
.avatar-upload {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
.avatar-uploader-icon {
  font-size: 24px;
  color: #8c939d;
}
.inline-field {
  display: inline-flex;
  align-items: center;
}
.inline-field .unit {
  flex: 1 1 80px;
  margin-left: 8px;
  color: #666;
}
.threshold-form .row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.threshold-form .label {
  flex: 1 0 70px;
  margin-right: 6px;
  color: #333;
  font-weight: 500;
  max-width: 140px;
}
.threshold-form .suffix {
  flex: 1 0 40px;
  margin: 0 12px 0 6px;
  color: #666;
}
.right-gap {
  margin-left: 24px;
}
.required {
  color: #e65b55;
  margin-right: 4px;
}
.unit-red {
  color: #e65b55;
}
.sport-tabs ::v-deep(.el-tabs__nav-wrap::after) {
  height: 0;
}
.sport-tabs ::v-deep(.el-tabs__item) {
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  background: #f2f2f4;
  margin-right: 16px;
  color: #333;
  text-align: center;
  font-weight: 500;
  padding: 0 24px;
}
.sport-tabs ::v-deep(.el-tabs__item:nth-child(2)) {
  padding-left: 24px;
}
.sport-tabs ::v-deep(.el-tabs__item:last-child) {
  padding-right: 24px;
}
.sport-tabs ::v-deep(.el-tabs__item.is-active) {
  background: #e65b55;
  color: #fff;
}
.pill-input .el-input__inner {
  border-radius: 22px;
  height: 40px;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 0 16px;
}
.pill-input {
  width: 220px;
}
.zone-table ::v-deep(.el-table__row) {
  height: 44px;
}
.zone-table ::v-deep(.el-table) {
  background: transparent;
}
.zone-table ::v-deep(.el-table__body tr:hover > td) {
  background: transparent;
}
.zone-table ::v-deep(.el-table__cell) {
  border-bottom: none;
  font-size: 14px;
  color: #333;
}
.zone-table ::v-deep(.el-table__body) {
  font-weight: 500;
}
.zone-table ::v-deep(.cell) {
  padding-left: 0;
  padding-right: 0;
}
/* .dialog-footer {
  display: flex;
  justify-content: center; */
/* } */
/* .dialog-footer .el-button {
  min-width: 120px;
  border-radius: 22px;
} */
/* .dialog-footer .el-button--primary {
  background: #d83b36;
  border-color: #d83b36;
} */

.zoneTr {
  display: flex;
  flex-direction: row;
  line-height: 34px;
}
.LT {
  display: flex;
  flex-direction: row;
  line-height: 34px;
  color: #c7483e;
}
.zoneTd {
  flex: 0 0 80px;
}
.zoneTd:nth-child(1) {
  flex: 0 0 140px;
}

.preference-form {
  max-height: 500px;
  padding-bottom: 20px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-top: 24px;
}

.section-header:first-child {
  margin-top: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.count-value {
  font-size: 18px;
  font-weight: 600;
  color: #e65b55;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  flex: 0 0 auto;
  white-space: nowrap;
  color: #333;
  font-size: 14px;
}

.count-input {
  flex: 1;
  min-width: 0;
}

.count-input ::v-deep(.el-input__inner) {
  border-radius: 4px;
  height: 40px;
  border: 1px solid #e5e6eb;
  padding: 0 50px 0 16px;
}

.count-input ::v-deep(.el-input-number__increase),
.count-input ::v-deep(.el-input-number__decrease) {
  background: transparent;
  border: none;
}

.week-select {
  flex: 1;
  min-width: 0;
}

.week-select ::v-deep(.el-input__inner) {
  border-radius: 4px;
  height: 40px;
  border: 1px solid #e5e6eb;
  padding: 0 36px 0 16px;
}

.week-select-multiple {
  width: 100%;
}

.week-select-multiple ::v-deep(.el-input__inner) {
  border-radius: 4px;
  min-height: 40px;
  border: 1px solid #e5e6eb;
  padding: 4px 36px 4px 12px;
  line-height: 32px;
}

.week-select-multiple ::v-deep(.el-select__tags) {
  max-width: calc(100% - 40px);
  padding-left: 4px;
}

.week-select-multiple ::v-deep(.el-tag) {
  background: #e65b55;
  border-color: #e65b55;
  color: #fff;
  border-radius: 4px;
  height: 24px;
  line-height: 22px;
  margin: 4px 4px 4px 0;
  padding: 0 8px;
  font-size: 13px;
}

.week-select-multiple ::v-deep(.el-tag__close) {
  background-color: transparent;
  color: #fff;
  right: -2px;
}

.week-select-multiple ::v-deep(.el-tag__close:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

.rest-day-section {
  margin-top: 32px;
  margin-bottom: 16px;
}

.rest-day-radio {
  margin-bottom: 16px;
}

.rest-day-config {
  margin-top: 16px;
}

.preference-form ::v-deep(.el-radio) {
  margin-right: 30px;
}

.preference-form ::v-deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #e65b55;
  background: #e65b55;
}

.preference-form ::v-deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #e65b55;
}
</style>
