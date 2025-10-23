<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    :before-close="handleClose"
    append-to-body
    class="athletic-info-dialog"
    :close-on-click-modal="false"
  >
    <span slot="title">运动员信息</span>
    <el-tabs v-model="activeMainTab" @tab-click="handleTabClick">
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
      <el-tab-pane label="阈值" name="threshold">
        <el-tabs v-model="activeSport" class="sport-tabs">
          <el-tab-pane label="心率" :name="1" />
          <el-tab-pane label="游泳" :name="4" />
          <el-tab-pane label="骑车" :name="2" />
          <el-tab-pane label="跑步" :name="3" />
        </el-tabs>
        <div class="threshold-form">
          <div v-if="activeSport === 1" class="row">
            <span class="label"><span class="required">*</span>阈值心率</span>
            <el-input
              v-model.number="thresholdData.param2"
              :key="'hr-param2-' + activeSport"
              step="1"
              class="pill-input"
            />
            <span class="suffix unit-red">bpm</span>
            <span class="label right-gap"
              ><span class="required">*</span>最大心率</span
            >
            <el-input
              v-model.number="thresholdData.param1"
              :key="'hr-param1-' + activeSport"
              step="1"
              class="pill-input"
            />
            <span class="suffix unit-red">bpm</span>
          </div>
          <div v-else-if="activeSport === 4" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <el-time-picker
              v-model="thresholdData.thresholdTimeValue"
              :key="'swim-' + activeSport"
              value-format="mm:ss"
              format="mm:ss"
              popper-class="hide-hour"
              class="pill-input"
            />
            <span class="suffix unit-red">min/100m</span>
          </div>
          <div v-else-if="activeSport === 2" class="row">
            <span class="label"><span class="required">*</span>阈值功率</span>
            <el-input
              v-model.number="thresholdData.threshold"
              :key="'bike-' + activeSport"
              step="1"
              class="pill-input"
            />
            <span class="suffix unit-red">w</span>
          </div>
          <div v-else-if="activeSport === 3" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <el-time-picker
              v-model="thresholdData.thresholdTimeValue"
              :key="'run-' + activeSport"
              value-format="mm:ss"
              format="mm:ss"
              popper-class="hide-hour"
              class="pill-input"
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
      <el-tab-pane label="运动偏好" name="preference">
        <div class="preference-form">
          <div class="section-title">{{ matchTypeToName[lastMatchType] }}</div>

          <div
            class="form-row"
            v-if="lastMatchType === '2' || lastMatchType === '3'"
          >
            <span class="form-label">游泳训练次数偏好设置</span>
            <el-input-number
              v-model="preferenceForm.swimTimes"
              :min="0"
              :max="14"
              controls-position="right"
              class="count-input"
            />
          </div>

          <div
            class="form-row"
            v-if="lastMatchType === '2' || lastMatchType === '4'"
          >
            <span class="form-label">骑行训练次数偏好设置</span>
            <el-input-number
              v-model="preferenceForm.cycleTimes"
              :min="0"
              :max="14"
              controls-position="right"
              class="count-input"
            />
          </div>

          <div
            class="form-row"
            v-if="lastMatchType === '1' || lastMatchType === '2'"
          >
            <span class="form-label">跑步训练次数偏好设置</span>
            <el-input-number
              v-model="preferenceForm.runTimes"
              :min="0"
              :max="14"
              controls-position="right"
              class="count-input"
            />
          </div>

          <div class="form-row">
            <span class="form-label">力量训练次数偏好设置</span>
            <el-input-number
              v-model="preferenceForm.strengthTimes"
              :min="0"
              :max="14"
              controls-position="right"
              class="count-input"
            />
          </div>

          <div class="form-row total-row">
            <span class="form-label">综合次数：</span>
            <span class="total-count">{{ totalTrainingCount }}</span>
          </div>

          <div
            class="section-title"
            v-if="
              lastMatchType === '1' ||
              lastMatchType === '2' ||
              lastMatchType === '4'
            "
          >
            长距离偏好设置
          </div>

          <div
            class="form-row"
            v-if="lastMatchType === '1' || lastMatchType === '2'"
          >
            <span class="form-label">长距离跑步</span>
            <el-select
              v-model="preferenceForm.longRunDay"
              placeholder="请选择"
              class="week-select"
            >
              <el-option label="周一" :value="1" />
              <el-option label="周二" :value="2" />
              <el-option label="周三" :value="3" />
              <el-option label="周四" :value="4" />
              <el-option label="周五" :value="5" />
              <el-option label="周六" :value="6" />
              <el-option label="周日" :value="7" />
            </el-select>
          </div>

          <div
            class="form-row"
            v-if="lastMatchType === '2' || lastMatchType === '4'"
          >
            <span class="form-label">长距离骑行</span>
            <el-select
              v-model="preferenceForm.longBikeDay"
              placeholder="请选择"
              class="week-select"
            >
              <el-option label="周一" :value="1" />
              <el-option label="周二" :value="2" />
              <el-option label="周三" :value="3" />
              <el-option label="周四" :value="4" />
              <el-option label="周五" :value="5" />
              <el-option label="周六" :value="6" />
              <el-option label="周日" :value="7" />
            </el-select>
          </div>

          <div class="section-title">休息日偏好</div>

          <div class="form-row">
            <el-radio-group v-model="preferenceForm.hasRestDay">
              <el-radio :label="false">无休息日</el-radio>
              <el-radio :label="true">有休息日</el-radio>
            </el-radio-group>
          </div>

          <div v-if="preferenceForm.hasRestDay" class="rest-day-config">
            <div class="form-row">
              <el-select
                v-model="preferenceForm.restDayCount"
                placeholder="请选择"
                class="week-select"
                @change="handleRestDayCountChange"
              >
                <el-option label="一天" :value="1" />
                <el-option label="两天" :value="2" />
              </el-select>
            </div>

            <div class="form-row">
              <el-select
                v-model="preferenceForm.restDays"
                multiple
                :multiple-limit="preferenceForm.restDayCount"
                placeholder="请选择休息日"
                class="week-select-multiple"
                collapse-tags
              >
                <el-option label="周一" :value="1" />
                <el-option label="周二" :value="2" />
                <el-option label="周三" :value="3" />
                <el-option label="周四" :value="4" />
                <el-option label="周五" :value="5" />
                <el-option label="周六" :value="6" />
                <el-option label="周日" :value="7" />
              </el-select>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import { secondsToMMSS, mmssToSeconds } from "@/utils/index";
import request from "@/utils/request";

export default {
  name: "AthleticInfoDialog",
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
      activeMainTab: "base",
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
        longRunDay: null,
        longBikeDay: null,
        hasRestDay: true,
        restDayCount: 1,
        restDays: [],
      },
      triUserId: "",
      loginType: localStorage.getItem("loginType"),
      lastMatchType: localStorage.getItem("lastMatchType"),
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
      if (this.lastMatchType === "1") {
        totalTimes =
          (this.preferenceForm.runTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === "2") {
        totalTimes =
          (this.preferenceForm.swimTimes || 0) +
          (this.preferenceForm.cycleTimes || 0) +
          (this.preferenceForm.runTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === "3") {
        totalTimes =
          (this.preferenceForm.swimTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      } else if (this.lastMatchType === "4") {
        totalTimes =
          (this.preferenceForm.cycleTimes || 0) +
          (this.preferenceForm.strengthTimes || 0);
      }
      return totalTimes;
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
        this.lastMatchType = localStorage.getItem("lastMatchType");
        if (this.activeMainTab === "preference") {
          this.getPreferenceData();
        }
        this.getAthleticInfo();
        this.getThresholdData();
      }
    },
    activeSport(val) {
      this.getThresholdData();
    },
  },
  methods: {
    handleTabClick(tab, event) {
      // this.activeMainTab = tab.name;
      if (this.activeMainTab === "preference") {
        this.getPreferenceData();
      }
    },
    // 查询偏好数据
    getPreferenceData() {
      request({
        url: "/sport-preference/by-current-type",
        method: "get",
        headers: {
          requestUserInfoId: this.triUserId,
        },
      }).then((res) => {
        if (res.result) {
          this.preferenceForm = res.result;
        } else {
          this.preferenceForm = {};
        }
      });
    },
    getAthleticInfo() {
      getData({
        url: "/api/classSchedule/getUserProfile",
        triUserId: this.triUserId,
      }).then((res) => {
        if (res.success) {
          this.baseForm = res.result;
          // this.thresholds = res.result.thresholdRecordList
          // this.currentThreshold = this.thresholds.find(item => item.thresholdType === this.activeSport)
        }
      });
    },
    getThresholdData() {
      getData({
        url: "/api/classSchedule/getThresholdDetail",
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
      this.loading = true;
      const params = {
        thresholdType: this.activeSport,
        param1: "",
        param2: "",
        threshold: "",
        triUserId: this.triUserId,
      };
      if (this.activeSport === 4 || this.activeSport === 3) {
        params.threshold = mmssToSeconds(this.thresholdData.thresholdTimeValue);
      } else if (this.activeSport === 2) {
        params.threshold = this.thresholdData.threshold;
      } else if (this.activeSport === 1) {
        params.param1 = this.thresholdData.param1;
        params.param2 = this.thresholdData.param2;
      }
      submitData({
        url: "/api/classSchedule/updateThreshold",
        requestData: params,
      }).then((res) => {
        if (res.success) {
          this.$message.success("阈值保存成功");
          this.$emit('save', res.result);
          this.loading = false;
        }
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
    handleRestDayCountChange(val) {
      // 当改变休息日数量时，如果已选择的天数超过新的限制，只保留前面的几个
      if (this.preferenceForm.restDays.length > val) {
        this.preferenceForm.restDays = this.preferenceForm.restDays.slice(
          0,
          val
        );
      }
    },
  },
};
</script>

<style scoped>
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
.dialog-footer {
  display: flex;
  justify-content: center;
}
.dialog-footer .el-button {
  min-width: 120px;
  border-radius: 22px;
}
.dialog-footer .el-button--primary {
  background: #d83b36;
  border-color: #d83b36;
}

.zoneTr {
  display: flex;
  flex-direction: row;
  line-height: 34px;
}
.zoneTd {
  flex: 0 0 80px;
}
.zoneTd:nth-child(1) {
  flex: 0 0 140px;
}

.preference-form {
  padding: 10px 0;
  max-height: 400px;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  margin-top: 24px;
}

.section-title:first-child {
  margin-top: 0;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.form-label {
  flex: 0 0 200px;
  color: #333;
  font-size: 14px;
}

.count-input {
  width: 240px;
}

.count-input ::v-deep(.el-input__inner) {
  border-radius: 22px;
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
  width: 240px;
}

.week-select ::v-deep(.el-input__inner) {
  border-radius: 22px;
  height: 40px;
  border: 1px solid #e5e6eb;
  padding: 0 36px 0 16px;
}

.week-select-multiple {
  width: 300px;
}

.week-select-multiple ::v-deep(.el-input__inner) {
  border-radius: 22px;
  min-height: 40px;
  border: 1px solid #e5e6eb;
  padding: 0 36px 0 16px;
  line-height: 38px;
}

.week-select-multiple ::v-deep(.el-select__tags) {
  max-width: calc(100% - 40px);
  padding-left: 8px;
}

.week-select-multiple ::v-deep(.el-tag) {
  background: #e65b55;
  border-color: #e65b55;
  color: #fff;
  border-radius: 12px;
  height: 24px;
  line-height: 24px;
  margin: 7px 4px 7px 0;
}

.week-select-multiple ::v-deep(.el-tag__close) {
  background-color: transparent;
  color: #fff;
}

.week-select-multiple ::v-deep(.el-tag__close:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

.total-row {
  margin-top: 12px;
  margin-bottom: 24px;
}

.total-count {
  font-size: 18px;
  font-weight: 600;
  color: #e65b55;
}

.rest-day-config {
  margin-left: 20px;
  margin-top: 12px;
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
