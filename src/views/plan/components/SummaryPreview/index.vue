<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="680px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">概要</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="计划名称" prop="title">
        <el-input
          v-model="form.title"
          maxlength="50"
          show-word-limit
          placeholder="请输入课程标题"
          clearable
        />
      </el-form-item>

      <el-form-item label="分组" prop="groupId">
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

      <el-form-item label="团队" prop="groupId">
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

      <el-form-item label="计划源" prop="groupId">
        <span>计划源</span>
      </el-form-item>

      <el-form-item label="拥有者" prop="groupId">
        <span>拥有者</span>
      </el-form-item>

      <el-form-item label="邮箱" prop="groupId">
        <el-input placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="微信号" prop="groupId">
        <el-input placeholder="请输入微信号" />
      </el-form-item>

      <el-form-item label="描述" prop="groupId">
        <el-input type="textarea" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="计划周期" prop="groupId">
        <span>4周</span>
      </el-form-item>

      <el-form-item label="统计">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">类型</el-col>
              <el-col :span="8">时长</el-col>
              <el-col :span="8">距离</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">游泳</el-col>
              <el-col :span="8">00:00:00/周</el-col>
              <el-col :span="8">2000 m/周</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">跑步</el-col>
              <el-col :span="8">00:00:00/周</el-col>
              <el-col :span="8">2000 m/周</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">力量</el-col>
              <el-col :span="8">00:00:00/周</el-col>
              <el-col :span="8">2000 m/周</el-col>
            </el-row>
          </el-col>
          <el-col :span="24" style="border-top: 1px dashed #e5e6eb;">
            <el-row>
              <el-col :span="8">总计</el-col>
              <el-col :span="8">01:50:00 /周</el-col>
              <el-col :span="8">12 km/周</el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">下一步</el-button>
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
