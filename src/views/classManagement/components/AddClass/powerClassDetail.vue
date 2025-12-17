<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="960px"
    :before-close="handleClose"
    append-to-body
    class="add-swim-class-dialog"
    :close-on-click-modal="false"
  >
    <span slot="title">{{
      type === "add" ? "新增力量课程" : "编辑力量课程"
    }}</span>

    <div class="form-section">
      <el-form ref="titleRef" :rules="rules" :model="form" label-width="70px">
        <el-form-item label="标题：" prop="title">
          <el-input type="text" placeholder="标题" v-model="form.title" :disabled="originalType === 'official'" :maxlength="50" />
        </el-form-item>

        <div class="row">
          <div class="row-item icon-box">
            <img src="~@/assets/addClass/icon-power.png" width="30" alt="" />
          </div>
          <div class="row-item">
            <span class="label">距离</span>
            <el-input-number
              :step="distanceStep"
              :min="0"
              :precision="distancePrecision"
              :step-strictly="true"
              :controls="false"
              v-model="form.distance"
              :disabled="originalType === 'official'"
              placeholder=""
              class="pill-input short"
            />
          </div>
          <div class="row-item">
            <el-select
              v-model="form.distanceUnit"
              :disabled="originalType === 'official'"
              class="pill-select short"
              @change="handleDistanceUnitChange"
            >
              <el-option label="m" value="m" />
              <el-option label="km" value="km" />
            </el-select>
          </div>
          <div class="row-item">
            <span class="label">时长</span>
            <!-- <el-time-picker
              v-model="form.duration"
              value-format="HH:mm:ss"
              format="HH:mm:ss"
              placeholder="00:00:00"
              class="pill-time"
            /> -->
            <TimeInput
              v-model="form.duration"
              size="small"
              :disabled="originalType === 'official'"
            />
          </div>
          <div class="row-item">
            <span class="label">STH</span>
            <el-input-number
              :step="1"
              :min="0"
              :step-strictly="true"
              :controls="false"
              v-model="form.sth"
              placeholder=""
              class="pill-input short"
              :disabled="originalType === 'official'"
            />
          </div>
        </div>

        <div class="summary">
          <div class="summary-title">概要</div>
          <div class="editor-wrapper">
            <el-input
              type="textarea"
              v-model="form.summary"
              :rows="8"
              maxlength="500"
              show-word-limit
              placeholder="请输入概要"
              class="summary-textarea"
              :disabled="originalType === 'official'"
            />
          </div>
        </div>
        <div class="summary">
          <div class="summary-title">训练建议</div>
          <div class="editor-wrapper">
            <el-input
              type="textarea"
              v-model="form.trainingAdvice"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="请输入训练建议"
              class="summary-textarea"
              :disabled="originalType === 'official'"
            />
          </div>
        </div>
        <el-form-item label="标签" class="label-top">
          <el-select
            v-model="form.tags"
            placeholder="选择或输入标签内容"
            class="tag-input"
            multiple
            allow-create
            filterable
            style="width: 100%"
            :disabled="originalType === 'official'"
          >
            <el-option
              v-for="tag in existingTags"
              :key="tag.label"
              :label="tag.label"
              :value="tag.label"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button
        v-if="originalType !== 'official'"
        @click="onDelete"
        :disabled="originalType === 'my'"
        >删除</el-button
      >
      <el-button @click="onCancel">取消</el-button>
      <el-button
        v-if="originalType !== 'official'"
        type="warning"
        @click="onSave(false)"
        >保存</el-button
      >
      <el-button
        v-if="originalType !== 'official'"
        type="danger"
        @click="onSave(true)"
        >保存并关闭</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import TimeInput from "@/views/classManagement/components/timeInpt";

export default {
  name: "AddSwimClassDialog",
  components: {
    TimeInput,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      // 兼容 v-model
      type: Boolean,
      default: undefined,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: "add",
    },
    originalType: {
      type: String,
      default: "my",
    },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      existingTags: [], // 现有的标签
      form: Object.assign(
        {
          id: this.data.id || "",
          title: this.data.title || "",
          groupId: this.data.groupId || "",
          sportType: "STRENGTH",
          distance: "",
          distanceUnit: "km",
          duration: "",
          sth: "",
          summary: "",
          tags: [],
        },
        this.data || {}
      ),
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'change' }],
      },
    };
  },
  computed: {
    canDelete() {
      return !!(this.data && this.data.id);
    },
    summaryLength() {
      return (this.form.summary || "").length;
    },
    distancePrecision() {
      return this.form.distanceUnit === "km" ? 2 : 0;
    },
    distanceStep() {
      return this.form.distanceUnit === "km" ? 0.01 : 1;
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
      // 当弹框打开时清空表单
      if (val) {
        this.getTagList();
        if (this.data.id && this.originalType === "my") {
          // 如果数据已经包含完整的 classesJson，直接使用，不需要调用 API
          if (this.data.classesJson) {
            const classesJson = typeof this.data.classesJson === 'string'
              ? JSON.parse(this.data.classesJson)
              : this.data.classesJson;
            this.form = classesJson;
            this.form.id = this.data.id;
            this.form.groupId = this.data.classesGroupId || this.data.groupId;
          } else {
            // 只有 id 没有 classesJson 时，才调用 API 获取完整数据
            this.getClassInfo(this.data.id);
          }
        } else if (this.originalType === "my") {
          this.resetForm();
        } else {
          this.form = this.data.classesJson;
        }
      }
    },
    data(val) {
      this.getTagList();
      if (this.data.id && this.originalType === "my") {
        // 如果数据已经包含完整的 classesJson，直接使用，不需要调用 API
        if (this.data.classesJson) {
          const classesJson = typeof this.data.classesJson === 'string'
            ? JSON.parse(this.data.classesJson)
            : this.data.classesJson;
          this.form = classesJson;
          this.form.id = this.data.id;
          this.form.groupId = this.data.classesGroupId || this.data.groupId;
        } else {
          // 只有 id 没有 classesJson 时，才调用 API 获取完整数据
          this.getClassInfo(this.data.id);
        }
      } else if (this.originalType === "my") {
        this.resetForm();
      } else {
        this.form = this.data.classesJson;
      }
    },
  },
  mounted() {
    if (this.innerVisible) {
      this.getTagList();
    }
  },
  methods: {
    handleDistanceUnitChange(value) {
      const distanceValue = Number(this.form.distance) || 0;
      if (value === "km") {
        this.form.distance = Number((distanceValue / 1000).toFixed(2));
      } else {
        this.form.distance = Math.round(distanceValue * 1000);
      }
    },
    // 获取标签列表
    getTagList() {
      getData({
        url: "/training/api/classesLabel/user/getLabelsByUserId",
      }).then((res) => {
        if (res.success) {
          this.existingTags = res.result || [];
        } else {
          this.existingTags = [];
        }
      });
    },
    // 编辑进入弹框时，查询课程数据
    getClassInfo(id) {
      getData({
        url: "/api/classes/getClassesById",
        id,
      }).then((res) => {
        if (res.success) {
          this.form = JSON.parse(res.result.classesJson);
          this.form.groupId = res.result.classesGroupId;
          this.form.id = res.result.id;
        }
      });
    },
    // 新增课程
    submitNewClass(flag) {
      const saveData = {
        classesTitle: this.form.title,
        classesGroupId: this.form.groupId,
        labels: this.form.tags,
        sportType: "STRENGTH",
        classesJson: JSON.stringify({
          ...this.form,
        }),
      };

      this.$emit("save", saveData, flag);
    },
    // 更新课程
    submitUpdateClass(flag) {
      console.log(this.form, "this.form");
      const saveData = {
        id: this.form.id,
        classesTitle: this.form.title,
        classesGroupId: this.form.groupId,
        labels: this.form.tags,
        sportType: "STRENGTH",
        classesJson: JSON.stringify({
          ...this.form,
        }),
      };

      this.$emit("save", saveData, flag);
    },
    // 删除课程
    submitDeleteClass() {
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classes/deleteClasses?id=" + this.form.id,
          }).then((res) => {
            if (res.success) {
              this.resetForm();
              this.$emit("save", { ...this.form });
              this.$message.success("课程删除成功");
              this.onCancel();
            }
          });
        })
        .catch(() => {});
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    async onSave(closeAfter) {
      await this.$refs.titleRef.validate();
      const payload = { ...this.form };
      if (this.form.id) {
        this.submitUpdateClass(closeAfter);
      } else {
        this.submitNewClass(closeAfter);
      }
    },
    onDelete() {
      this.$emit("delete");
    },
    resetForm() {
      // 清空表单数据，但保留传入的title
      this.form = {
        id: this.data?.id || "",
        title: this.data?.title || "",
        groupId: this.data?.groupId || "",
        sportType: "STRENGTH",
        distance: "",
        distanceUnit: "m",
        duration: "",
        sth: "",
        summary: "",
        tips: "",
      };
    },
  },
};
</script>

<style scoped>
.add-swim-class-dialog ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.add-swim-class-dialog ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.pill-input .el-input__inner {
  border-radius: 22px;
  height: 40px;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 0 16px;
}
.pill-input.short {
  width: 120px;
}
.pill-select ::v-deep(.el-input__inner) {
  height: 40px;
}
.pill-time ::v-deep(.el-input__inner) {
  height: 40px;
}
.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.row-item {
  margin-right: 16px;
  display: flex;
  align-items: center;
}
.row-item .label {
  margin-right: 8px;
  color: #666;
  width: 30px;
}
.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f2f2f4;
  display: flex;
  align-items: center;
  justify-content: center;
}
.summary {
  margin-top: 10px;
  margin-bottom: 10px;
}
.summary-title {
  margin: 10px 0;
  font-weight: 600;
  color: rgb(96, 98, 102);
  text-indent: 6px;
}
.editor-wrapper {
  position: relative;
}
.word-limit {
  position: absolute;
  right: 8px;
  bottom: 6px;
  color: #999;
  font-size: 12px;
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
.label-top ::v-deep(.el-form-item__label) {
  display: block;
  float: none;
  text-align: left;
  padding: 0 0 8px 0;
  line-height: 1.5;
}
.label-top ::v-deep(.el-form-item__content) {
  margin-left: 0 !important;
}
</style>
