<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="680px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">应用</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="团队选择" prop="groupId">
        <el-select
          v-model="form.groupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.classesGroupName"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="人员选择" prop="groupId">
        <el-select
          v-model="form.groupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.classesGroupName"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="类型" prop="groupId">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">批量设置</el-radio>
          <el-radio :label="2">单独设置</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-row>
        <el-col :span="24">
          <el-row>
            <el-col :span="8">成员</el-col>
            <el-col :span="8">方式</el-col>
            <el-col :span="8">时间</el-col>
          </el-row>
        </el-col>
        <el-col :span="24">
          <el-row>
            <el-col :span="4">成员1</el-col>
            <el-col :span="6">
              <el-select
                v-model="form.type"
                placeholder="请选择方式"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option :label="1" :value="1">以开始时间</el-option>
                <el-option :label="1" :value="1">以结束时间</el-option>
              </el-select>
            </el-col>
            <el-col :span="10">
              <el-date-picker
                v-model="value1"
                type="date"
                placeholder="选择日期"
              >
              </el-date-picker>
            </el-col>
            <el-col :span="4">
              <el-button type="primary" @click="onConfirm">保存</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";

export default {
  name: "SummaryPreview",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        title: this.defaultTitle,
        groupId: this.defaultGroupId,
      },
      rules: {
        title: [
          { required: true, message: "请输入课程标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到50个字符", trigger: "blur" },
        ],
        groupId: [
          { required: false, message: "请选择分组", trigger: "change" },
        ],
      },
      groups: [],
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
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
        // reset form when opening
        this.resetForm();
        this.getGroupList();
      } else {
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
  },
  methods: {
    getGroupList() {
      getData({
        url: "/api/classesGroup/user/getClassesGroupsByUserId",
      }).then((res) => {
        this.groups = res.result;
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
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
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
  },
};
</script>

<style scoped>
.add-class-title-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.add-class-title-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
.statistics-divider-wrapper {
  margin: 8px 0;
}
.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}
</style>
