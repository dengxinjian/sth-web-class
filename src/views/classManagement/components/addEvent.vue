<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    append-to-body
    :before-close="handleClose"
    :close-on-click-modal="false"
    :title="isEditMode ? '编辑赛事' : '新增赛事'"
  >
    <el-form
      ref="eventForm"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- 优先级 -->
      <el-form-item label="优先级" prop="priority" required>
        <el-radio-group
          v-model="formData.priority"
          class="priority-radio-group"
        >
          <el-radio-button label="PRIMARY">首要赛事</el-radio-button>
          <el-radio-button label="SECONDARY">次要赛事</el-radio-button>
          <el-radio-button label="FOCUS">关注赛事</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- 赛事名称 -->
      <el-form-item label="赛事名称" prop="eventName" required>
        <el-input
          v-model="formData.eventName"
          placeholder="请输入赛事名称"
          :maxlength="100"
        />
      </el-form-item>

      <!-- 赛事地点 -->
      <el-form-item label="赛事地点" prop="location" required>
        <el-cascader
          v-model="formData.location"
          :options="cityOptions"
          :props="cascaderProps"
          placeholder="请选择赛事地点"
          filterable
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <!-- 比赛类型 -->
      <el-form-item label="比赛类型" prop="competitionType" required>
        <el-select
          v-model="formData.competitionType"
          placeholder="请选择比赛类型"
          style="width: 100%"
          @change="handleCompetitionTypeChange"
        >
          <el-option
            v-for="item in competitionTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 距离 -->
      <el-form-item label="距离" prop="distance" required>
        <div style="display: flex; gap: 10px; width: 100%">
          <el-select
            v-model="formData.distance"
            placeholder="请选择距离"
            style="flex: 1"
            @change="handleDistanceChange"
          >
            <el-option
              v-for="item in distanceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-form-item
            v-if="showCustomDistance"
            prop="customDistance"
            style="flex: 1; margin-bottom: 0"
          >
            <el-input
              v-model="formData.customDistance"
              placeholder="请输入距离"
              @input="handleCustomDistanceInput"
            >
              <template slot="append">km</template>
            </el-input>
          </el-form-item>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { citys } from "@/views/classManagement/constants/citys";
import { competitionApi } from "@/views/classManagement/services/classManagement";

export default {
  name: "AddEvent",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 编辑模式时传入的赛事数据
    eventData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      innerVisible: this.visible,
      formData: {
        priority: "PRIMARY",
        eventName: "",
        location: [],
        competitionType: "",
        distance: "",
        customDistance: "",
      },
      rules: {
        priority: [
          { required: true, message: "请选择优先级", trigger: "change" },
        ],
        eventName: [
          { required: true, message: "请输入赛事名称", trigger: "blur" },
        ],
        location: [
          { required: true, message: "请选择赛事地点", trigger: "change" },
        ],
        competitionType: [
          { required: true, message: "请选择比赛类型", trigger: "change" },
        ],
        distance: [
          { required: true, message: "请选择距离", trigger: "change" },
        ],
        customDistance: [
          {
            validator: (rule, value, callback) => {
              if (this.formData.distance === "OTHER") {
                if (!value || !value.trim()) {
                  callback(new Error("请输入自定义距离"));
                } else {
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    callback(new Error("请输入有效的距离值"));
                  } else {
                    callback();
                  }
                }
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },
      cityOptions: citys,
      cascaderProps: {
        value: "value",
        label: "label",
        children: "children",
        expandTrigger: "hover",
      },
      competitionTypeOptions: [],
      distanceOptions: [],
      distancesByType: {},
      showCustomDistance: false,
    };
  },
  computed: {
    isEditMode() {
      return !!this.eventData && !!this.eventData.id;
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
      if (val) {
        this.initData();
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
    },
    eventData: {
      handler(val) {
        if (val && this.visible) {
          this.initData();
        }
      },
      deep: true,
    },
  },
  mounted() {
    if (this.visible) {
      this.initData();
    }
  },
  methods: {
    async initData() {
      // 先获取下拉框数据
      await this.fetchDropdownOptions();

      // 如果是编辑模式，回填数据
      if (this.isEditMode && this.eventData) {
        // 等待下拉数据加载完成后再回填
        await this.$nextTick();
        this.fillFormData(this.eventData);
      } else {
        // 重置表单
        this.resetForm();
      }
    },
    resetForm() {
      this.formData = {
        priority: "PRIMARY",
        eventName: "",
        location: [],
        competitionType: "",
        distance: "",
        customDistance: "",
      };
      this.showCustomDistance = false;
      this.distanceOptions = [];
      this.$nextTick(() => {
        this.$refs.eventForm && this.$refs.eventForm.clearValidate();
      });
    },
    fillFormData(data) {
      // 回填表单数据
      this.formData.priority = data.priority || "PRIMARY";
      this.formData.eventName = data.eventName || "";

      // 处理比赛类型：如果接口返回的是 displayValue，需要转换为 value
      let competitionTypeValue = "";
      if (data.competitionType) {
        // 先尝试通过 displayValue 查找
        const foundByDisplayValue = this.competitionTypeOptions.find(
          (item) => item.displayValue === data.competitionType
        );
        if (foundByDisplayValue) {
          competitionTypeValue = foundByDisplayValue.value;
        } else {
          // 如果没有找到，可能是 value 格式，直接使用
          competitionTypeValue = data.competitionType;
        }
      }
      this.formData.competitionType = competitionTypeValue;

      // 处理地点数据（如果是字符串格式，需要转换为数组）
      if (data.location) {
        if (typeof data.location === "string") {
          // 字符串格式，需要根据城市数据找到对应的 value 数组
          this.formData.location = this.parseLocationString(data.location);
        } else if (Array.isArray(data.location)) {
          this.formData.location = data.location;
        }
      } else {
        this.formData.location = [];
      }

      // 设置比赛类型后，更新距离选项（不重置距离）
      if (this.formData.competitionType) {
        // 更新距离选项
        if (this.distancesByType[this.formData.competitionType]) {
          this.distanceOptions = this.distancesByType[
            this.formData.competitionType
          ].map((item) => ({
            label: item.label,
            value: item.value,
            displayValue: item.displayValue,
          }));
        }

        // 设置距离
        this.$nextTick(() => {
          if (data.distance) {
            this.formData.distance = data.distance;
            // 如果是自定义距离，设置自定义距离值
            if (data.distance === "OTHER") {
              this.showCustomDistance = true;
              if (data.customDistance) {
                this.formData.customDistance = data.customDistance;
              }
            } else {
              this.showCustomDistance = false;
              this.formData.customDistance = "";
            }
          }
        });
      }
    },
    parseLocationString(locationStr) {
      // 将字符串格式的地点（如：湖北/武汉）转换为级联选择器的 value 数组
      if (!locationStr) return [];

      const parts = locationStr.split("/");
      const result = [];
      let currentOptions = this.cityOptions;

      for (const part of parts) {
        const option = currentOptions.find((opt) => opt.label === part);
        if (option) {
          result.push(option.value);
          currentOptions = option.children || [];
        } else {
          break;
        }
      }

      return result;
    },
    async fetchDropdownOptions() {
      try {
        const response = await competitionApi.getDropdownOptions();

        if (response && response.result) {
          const { CompetitionType, distancesByType } = response.result;

          // 处理比赛类型选项
          this.competitionTypeOptions = CompetitionType.map((item) => ({
            label: item.label,
            value: item.value,
            displayValue: item.displayValue,
          }));

          // 保存距离数据
          this.distancesByType = distancesByType || {};
        }
      } catch (error) {
        console.error("获取下拉框数据失败:", error);
        this.$message.error("获取下拉框数据失败，请稍后重试");
      }
    },
    handleCompetitionTypeChange(value) {
      // 重置距离选择
      this.formData.distance = "";
      this.formData.customDistance = "";
      this.showCustomDistance = false;

      // 根据比赛类型更新距离选项
      if (value && this.distancesByType[value]) {
        this.distanceOptions = this.distancesByType[value].map((item) => ({
          label: item.label,
          value: item.value,
          displayValue: item.displayValue,
        }));
      } else {
        this.distanceOptions = [];
      }
    },
    handleDistanceChange(value) {
      // 如果选择的是"其他距离"，显示自定义输入框
      if (value === "OTHER") {
        this.showCustomDistance = true;
        // 清空自定义距离值
        if (!this.formData.customDistance) {
          this.formData.customDistance = "";
        }
        // 触发表单验证
        this.$nextTick(() => {
          this.$refs.eventForm.validateField("customDistance");
        });
      } else {
        this.showCustomDistance = false;
        this.formData.customDistance = "";
        // 清除自定义距离的验证错误
        this.$nextTick(() => {
          this.$refs.eventForm.clearValidate("customDistance");
        });
      }
    },
    handleCustomDistanceInput() {
      // 自定义距离输入时的处理
    },
    handleClose() {
      this.innerVisible = false;
      this.$refs.eventForm && this.$refs.eventForm.resetFields();
      this.$emit("cancel");
    },
    async handleConfirm() {
      this.$refs.eventForm.validate(async (valid) => {
        if (valid) {
          try {
            // 处理地点数据，转换为字符串格式（如：湖北/武汉）
            let locationStr = "";
            if (this.formData.location && this.formData.location.length > 0) {
              const selectedLabels = this.getLocationLabels(
                this.formData.location,
                this.cityOptions
              );
              locationStr = selectedLabels.join("/");
            }

            // 获取比赛类型的 displayValue
            const selectedCompetitionType = this.competitionTypeOptions.find(
              (item) => item.value === this.formData.competitionType
            );
            const competitionTypeDisplayValue = selectedCompetitionType
              ? selectedCompetitionType.displayValue
              : this.formData.competitionType;

            const priority =
              this.formData.priority === "PRIMARY"
                ? 1
                : this.formData.priority === "SECONDARY"
                  ? 2
                  : 3;

            // 获取距离的 displayValue（如果不是 OTHER）
            const competitionDistance = this.distanceOptions.find(
              (item) => item.value === this.formData.distance
            ).displayValue;
            console.log(competitionDistance, "competitionDistance");
            console.log(this.formData, "this.formData");
            // 构建提交数据（按照 API 文档的字段名称）
            const submitData = {
              competitionDistance: competitionDistance,
              competitionLocation: locationStr,
              competitionName: this.formData.eventName,
              competitionType: competitionTypeDisplayValue,
              priority: priority,
            };
            // 如果是编辑模式，添加 id
            if (this.isEditMode && this.eventData.id) {
              submitData.id = this.eventData.id;
            }

            this.$emit("confirm", submitData);
            this.handleClose();
          } catch (error) {
            console.error("保存赛事失败:", error);
            this.$message.error(
              this.isEditMode ? "更新赛事失败" : "创建赛事失败"
            );
          }
        } else {
          this.$message.warning("请完善表单信息");
        }
      });
    },
    getLocationLabels(values, options) {
      const labels = [];
      let currentOptions = options;

      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const option = currentOptions.find((opt) => opt.value === value);
        if (option) {
          labels.push(option.label);
          currentOptions = option.children || [];
        } else {
          break;
        }
      }

      return labels;
    },
  },
};
</script>

<style scoped>
::v-deep .el-dialog__body {
  padding: 20px 24px;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 优先级选择器样式 */
.priority-radio-group ::v-deep .el-radio-button__inner {
  padding: 10px 20px;
  border-color: #dcdfe6;
}

.priority-radio-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  background-color: #fff;
  border-color: #f56c6c;
  color: #f56c6c;
  box-shadow: -1px 0 0 0 #f56c6c;
}

.priority-radio-group
  ::v-deep
  .el-radio-button:first-child
  .el-radio-button__inner {
  border-left: 1px solid #dcdfe6;
}

.priority-radio-group
  ::v-deep
  .el-radio-button:first-child
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  border-left-color: #f56c6c;
}
</style>
