<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="520px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">新增计划</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="计划标题" prop="planTitle">
        <el-input
          v-model="form.planTitle"
          maxlength="50"
          show-word-limit
          placeholder="请输入课程标题"
          clearable
        />
      </el-form-item>

      <el-form-item label="分组选择" prop="planGroupId">
        <el-select
          v-model="form.planGroupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.planClassesGroup"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="团队" prop="teamId">
        <el-select
          v-model="form.teamId"
          placeholder="请选择团队"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in teamOptions"
            :key="g.id"
            :label="g.teamName"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input placeholder="请输入邮箱" v-model="form.email" />
      </el-form-item>

      <el-form-item label="微信号" prop="weChat">
        <el-input placeholder="请输入微信号" v-model="form.weChat" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          type="textarea"
          placeholder="请输入描述"
          v-model="form.description"
        />
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
  name: "AddPlan",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        planTitle: undefined,
        planGroupId: undefined,
        teamId: undefined,
        email: undefined,
        weChat: undefined,
        description: undefined,
      },
      rules: {
        planTitle: [
          { required: true, message: "请输入计划标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到50个字符", trigger: "blur" },
        ],
        planGroupId: [
          { required: true, message: "请选择分组", trigger: "change" },
        ],
        teamId: [{ required: true, message: "请选择团队", trigger: "change" }],
      },
      groups: [],
      teams: [],
      emptyPlanClasses: [[], [], [], []],
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
    },
    teamOptions() {
      return Array.isArray(this.teams) ? this.teams : [];
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
        this.getTeamList();
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
        url: "/api/planClassesGroup/option",
      }).then((res) => {
        this.groups = res.result;
      });
    },
    getTeamList() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = res.result;
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        console.log(this.form, "form");
        const params = {
          ...this.form,
          dayDetails: this.emptyPlanClasses,
        };
        // 将 params 保存到 planStore 中的 planData
        this.$store.dispatch("plan/savePlanData", params);
        // 跳转到 planEdit 页面
        this.$router.push({
          path: "/timeTable/plan/add",
          query: {
            type: "add",
          },
        });
      });
    },
    resetForm() {
      this.form = {
        planTitle: undefined,
        planGroupId: undefined,
        teamId: undefined,
        email: undefined,
        weChat: undefined,
        description: undefined,
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
</style>
