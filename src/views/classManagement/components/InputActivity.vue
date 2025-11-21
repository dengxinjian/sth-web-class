<template>
  <el-dialog
    class="input-activity-dialog"
    :visible.sync="innerVisible"
    width="520px"
    append-to-body
    :close-on-click-modal="false"
    :before-close="handleClose"
    title="录入运动"
  >
    <el-form
      ref="activityForm"
      :model="formData"
      :rules="rules"
      label-width="92px"
      label-position="left"
      class="input-activity-form"
    >
      <el-form-item label="运动日期：">
        <el-input
          v-model="formData.activityDate"
          disabled
          class="is-readonly"
        />
      </el-form-item>

      <el-form-item label="运动类型：" prop="activityType">
        <el-select
          v-model="formData.activityType"
          placeholder="请选择运动类型"
          filterable
          style="width: 100%"
          @change="handleActivityTypeChange"
        >
          <el-option
            v-for="item in sportTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="总时长：" prop="duration">
        <TimeInput v-model="formData.duration" placeholder="请输入总时长" />
      </el-form-item>

      <el-form-item label="运动时长：" prop="activityDuration">
        <TimeInput
          v-model="formData.activityDuration"
          placeholder="请输入运动时长"
        />
      </el-form-item>

      <el-form-item label="运动距离：" prop="distance">
        <div class="distance-field">
          <el-input
            v-model.number="formData.distance"
            placeholder="请输入距离"
            type="number"
            :min="0"
          >
            <template slot="append">
              <el-select
                placeholder="请选择距离单位"
                style="width: 80px"
                v-model="formData.distanceUnit"
                class="unit-select"
                :disabled="distanceUnitOptions.length === 1"
              >
                <el-option
                  v-for="unit in distanceUnitOptions"
                  :key="unit.value"
                  :label="unit.label"
                  :value="unit.value"
                />
              </el-select>
            </template>
          </el-input>
          <!-- <el-select
            v-model="formData.distanceUnit"
            class="unit-select"
            :disabled="distanceUnitOptions.length === 1"
          >
            <el-option
              v-for="unit in distanceUnitOptions"
              :key="unit.value"
              :label="unit.label"
              :value="unit.value"
            />
          </el-select> -->
        </div>
      </el-form-item>

      <el-form-item label="STH：" prop="sthValue">
        <el-input
          v-model.number="formData.sthValue"
          placeholder="请输入 STH"
          type="number"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="消耗：" prop="calories">
        <el-input
          v-model.number="formData.calories"
          placeholder="请输入消耗（千卡）"
          type="number"
          :min="0"
        />
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
        :loading="confirmLoading"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {
  ACTIVITY_TYPE_DICT,
  SPORT_TYPE_NAMES,
} from "@/views/classManagement/constants";
import TimeInput from "@/views/classManagement/components/timeInpt";
import { hhmmssToSeconds } from "@/utils/index";

export default {
  name: "InputActivity",
  components: {
    TimeInput,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    activityDate: {
      type: String,
      default: "",
    },
    confirmLoading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      innerVisible: this.visible,
      formData: this.getInitialFormData(),
      rules: {
        activityType: [
          { required: true, message: "请选择运动类型", trigger: "change" },
        ],
        distance: [{ validator: this.validatePositiveNumber, trigger: "blur" }],
        sthValue: [{ validator: this.validatePositiveNumber, trigger: "blur" }],
        calories: [{ validator: this.validatePositiveNumber, trigger: "blur" }],
      },
    };
  },
  computed: {
    sportTypeOptions() {
      const excludedTypes = ["REMARK", "REST", "OTHER"];
      return Object.keys(ACTIVITY_TYPE_DICT).map((key) => ({
        value: ACTIVITY_TYPE_DICT[key],
        label: SPORT_TYPE_NAMES[ACTIVITY_TYPE_DICT[key]],
      }));
    },
    distanceUnitOptions() {
      return [
        { label: "km", value: "km" },
        { label: "m", value: "m" },
      ];
    },
  },
  watch: {
    visible(value) {
      this.innerVisible = value;
      if (value) {
        this.initializeForm();
      }
    },
    innerVisible(value) {
      this.$emit("update:visible", value);
      if (!value) {
        this.resetForm();
      }
    },
    activityDate: {
      immediate: true,
      handler(value) {
        this.$set(this.formData, "activityDate", value || "");
      },
    },
  },
  methods: {
    handleActivityTypeChange(value) {
      // console.log(value, "value");
      if (value === "SWIM") {
        this.formData.distanceUnit = "m";
      } else {
        this.formData.distanceUnit = "km";
      }
    },
    getInitialFormData() {
      return {
        activityDate: this.activityDate || "",
        activityType: "",
        duration: "",
        activityDuration: "",
        distance: null,
        distanceUnit: "km",
        sthValue: null,
        calories: null,
      };
    },
    initializeForm() {
      this.formData = {
        ...this.getInitialFormData(),
        activityDate: this.activityDate || "",
      };
      this.$nextTick(() => {
        this.$refs.activityForm && this.$refs.activityForm.clearValidate();
      });
    },
    handleCancel() {
      this.handleClose();
      this.$emit("cancel");
    },
    handleClose() {
      this.innerVisible = false;
      this.$emit("close");
    },
    resetForm() {
      this.formData = this.getInitialFormData();
      this.$nextTick(() => {
        this.$refs.activityForm && this.$refs.activityForm.clearValidate();
      });
    },
    validatePositiveNumber(rule, value, callback) {
      if (value === null || value === undefined || value === "") {
        callback();
        return;
      }
      if (Number(value) < 0) {
        callback(new Error("请输入不小于 0 的数值"));
        return;
      }
      callback();
    },
    parseDurationToSeconds(value) {
      if (!value) return 0;
      if (typeof value !== "string") {
        const numeric = Number(value);
        return Number.isNaN(numeric) ? 0 : numeric;
      }
      const parts = value.split(":");
      if (parts.length === 3) {
        return hhmmssToSeconds(value) || 0;
      }
      if (parts.length === 2) {
        const minutes = Number(parts[0]) || 0;
        const seconds = Number(parts[1]) || 0;
        return minutes * 60 + seconds;
      }
      const numeric = Number(value);
      return Number.isNaN(numeric) ? 0 : numeric;
    },
    handleConfirm() {
      if (!this.$refs.activityForm) {
        return;
      }
      this.$refs.activityForm.validate((valid) => {
        if (!valid) return;
        const payload = {
          activityDate: this.formData.activityDate + " 00:00:00",
          duration: this.parseDurationToSeconds(this.formData.duration),
          activityDuration: this.parseDurationToSeconds(
            this.formData.activityDuration
          ),
          distance:
            this.formData.distanceUnit === "km"
              ? this.formData.distance * 1000
              : this.formData.distance,
          distanceUnit: this.formData.distanceUnit,
          sthValue: this.formData.sthValue || 0,
          calories: this.formData.calories || 0,
          activityType: this.formData.activityType,
          sportType: this.formData.activityType,
        };
        this.$emit("submit", payload);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.input-activity-dialog {
  ::v-deep .el-dialog {
    border-radius: 16px;
    padding-bottom: 12px;
  }

  ::v-deep .el-dialog__header {
    text-align: center;
    border-bottom: none;
    padding-top: 24px;
  }

  ::v-deep .el-dialog__body {
    padding: 12px 32px 0;
  }
}

.input-activity-form {
  .el-form-item {
    margin-bottom: 16px;
  }

  .is-readonly .el-input__inner {
    background-color: #f7f7f7;
    cursor: not-allowed;
  }
}

.distance-field {
  display: flex;
  align-items: center;
  gap: 8px;

  .unit-select {
    width: 88px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 10px;
}
</style>
