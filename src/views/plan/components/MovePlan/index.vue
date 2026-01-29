<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    :before-close="onCancel"
    class="move-plan-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">移动计划到分组</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
    >
      <el-form-item label="目标分组" prop="planGroupId">
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
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";

export default {
  name: "MovePlanDialog",
  props: {
    // v-model
    value: { type: Boolean, default: undefined },
    visible: { type: Boolean, default: false },
    // 当前计划详情（需要至少包含 id、planGroupId 等字段）
    planInfo: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        planGroupId: null,
      },
      rules: {
        planGroupId: [
          { required: true, message: "请选择目标分组", trigger: "change" },
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
        this.resetForm();
        this.getGroupList();
      } else {
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
    planInfo: {
      deep: true,
      handler() {
        // 当计划信息变化时，同步默认分组
        if (this.planInfo && this.planInfo.planGroupId != null) {
          this.form.planGroupId = this.planInfo.planGroupId;
        }
      },
    },
  },
  methods: {
    resetForm() {
      this.form = {
        planGroupId:
          this.planInfo && this.planInfo.planGroupId != null
            ? this.planInfo.planGroupId
            : null,
      };
      this.$nextTick(() => {
        if (this.$refs.formRef && this.$refs.formRef.clearValidate) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    getGroupList() {
      getData({
        url: "/training/api/planClassesGroup/option",
      }).then((res) => {
        this.groups = res.result || [];
        // 如果当前 planGroupId 为空或不在列表中，则默认选中第一个
        const currentId =
          this.form.planGroupId ||
          (this.planInfo && this.planInfo.planGroupId) ||
          null;
        const exists =
          currentId &&
          this.groups.some((g) => String(g.id) === String(currentId));
        if (!exists && this.groups.length > 0) {
          this.form.planGroupId = this.groups[0].id;
        }
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        if (!this.planInfo || !this.planInfo.id) {
          this.$message.error("未找到要移动的计划");
          return;
        }
        const params = {
          ...this.planInfo,
          planGroupId: this.form.planGroupId,
        };
        submitData({
          url: "/training/api/planClasses/updatePlanClasses",
          requestData: params,
        }).then((res) => {
          if (res && res.success) {
            this.$message.success("移动成功");
            this.innerVisible = false;
            this.$emit("save", { planGroupId: this.form.planGroupId });
          } else {
            this.$message.error(res?.message || "移动失败，请稍后重试");
          }
        });
      });
    },
  },
};
</script>

<style scoped>
.move-plan-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.move-plan-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

