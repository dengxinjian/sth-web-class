<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    :before-close="onCancel"
    class="add-group-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">{{ form.id ? "编辑分组" : "新增分组" }}</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
    >
      <el-form-item label="分组名称" prop="groupName">
        <el-input
          v-model="form.groupName"
          maxlength="20"
          show-word-limit
          placeholder="请输入分组名称"
          clearable
        />
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
  name: "AddGroupDialog",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    // data: { id, classesGroupName }
    data: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        id: this.data?.id || "",
        groupName: this.data?.groupName || "",
      },
      rules: {
        groupName: [
          { required: true, message: "请输入分组名称", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到20个字符", trigger: "blur" },
        ],
      },
    };
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
      } else {
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
    data: {
      deep: true,
      handler() {
        // 当传入数据变化时，同步更新表单
        this.form = {
          id: this.data?.id || "",
          groupName: this.data?.groupName || "",
        };
      },
    },
  },
  methods: {
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        // 由父组件决定具体新增/编辑接口，此处只派发规范化数据
        if (this.form.id) {
          submitData({
            url: "/training/api/planClassesGroup/updatePlanClassesGroup",
            requestData: { ...this.form },
          }).then((res) => {
            if (res.success) {
              this.$emit("save", { ...this.form });
              this.$message.success("编辑分组成功");
            }
          });
        } else {
          submitData({
            url: "/training/api/planClassesGroup/createPlanClassesGroup",
            requestData: { ...this.form },
          }).then((res) => {
            if (res.success) {
              this.$emit("save", { ...this.form });
              this.$message.success("新增分组成功");
            }
          });
        }
      });
    },
    resetForm() {
      this.form = {
        id: this.data?.id || "",
        groupName: this.data?.groupName || "",
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    }
  },
};
</script>

<style scoped>
.add-group-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.add-group-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
