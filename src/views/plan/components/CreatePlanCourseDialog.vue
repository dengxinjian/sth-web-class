<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="520px"
    append-to-body
    :before-close="handleCancel"
    class="plan-create-course-dialog"
    :close-on-click-modal="false"
  >
    <span slot="title">新增课程</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="activeRules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="课程名称" prop="title">
        <el-input
          v-model="form.title"
          maxlength="50"
          show-word-limit
          placeholder="请输入课程名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="方式">
        <el-radio-group v-model="form.mode" @change="handleModeChange">
          <el-radio :label="MODE.SAVE">保存</el-radio>
          <el-radio :label="MODE.TEMP">临时</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="分组选择" prop="groupId" v-if="!isTemporary">
        <el-select
          v-model="form.groupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="group in groupOptions"
            :key="group.id"
            :label="group.classesGroupName"
            :value="group.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">下一步</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData } from "@/api/common.js";

const MODE = Object.freeze({
  SAVE: "SAVE",
  TEMP: "TEMP",
});

export default {
  name: "CreatePlanCourseDialog",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [Number, String], default: undefined },
    defaultMode: {
      type: String,
      default: MODE.SAVE,
      validator: (val) => Object.values(MODE).includes(val),
    },
  },
  data() {
    return {
      MODE,
      innerVisible: this.visible || this.value || false,
      groups: [],
      form: {
        title: this.defaultTitle,
        groupId: this.defaultGroupId,
        mode: this.defaultMode,
      },
      rules: {
        title: [
          { required: true, message: "请输入课程名称", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到50个字符", trigger: "blur" },
        ],
        groupId: [{ required: true, message: "请选择分组", trigger: "change" }],
      },
    };
  },
  computed: {
    isTemporary() {
      return this.form.mode === MODE.TEMP;
    },
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
    },
    activeRules() {
      if (this.isTemporary) {
        return {
          title: this.rules.title,
        };
      }
      return this.rules;
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") {
        this.innerVisible = val;
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
      this.$emit("input", val);
      if (val) {
        this.resetForm();
        this.fetchGroups();
      } else {
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
          }
        });
      }
    },
  },
  methods: {
    fetchGroups() {
      getData({
        url: "/training/api/classesGroup/user/getClassesGroupsByUserId",
      }).then((res) => {
        this.groups = Array.isArray(res.result) ? res.result : [];
      });
    },
    handleModeChange() {
      if (this.isTemporary) {
        this.form.groupId = undefined;
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      }
    },
    handleCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    handleConfirm() {
      if (!this.$refs.formRef) {
        this.$emit("save", { ...this.form });
        this.innerVisible = false;
        return;
      }
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        this.$emit("save", { ...this.form });
        this.innerVisible = false;
      });
    },
    resetForm() {
      this.form = {
        title: this.defaultTitle,
        groupId: this.defaultGroupId,
        mode: this.defaultMode,
      };
      if (this.isTemporary) {
        this.handleModeChange();
      }
    },
  },
};
</script>

<style scoped>
.plan-create-course-dialog ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.plan-create-course-dialog ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
