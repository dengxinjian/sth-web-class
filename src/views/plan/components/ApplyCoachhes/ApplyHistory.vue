<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="540px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">历史</span>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="teamName" label="团队名称" width="180" />
      <el-table-column prop="nickname" label="昵称" width="180" />
      <el-table-column prop="applyTime" label="应用时间" />
    </el-table>

    <el-row>
      <el-col>应用时间</el-col>
      <el-col v-for="item in tableData" :key="item.teamName">{{ item.applyTime }}</el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">关闭</el-button>
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
    type: { type: String, default: "" },
    defaultTitle: { type: String, default: "" },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      tableData: [
        { teamName: '团队1', nickname: '昵称1', applyTime: '2025-01-01 10:00:00' },
        { teamName: '团队2', nickname: '昵称2', applyTime: '2025-01-01 10:00:00' },
        { teamName: '团队3', nickname: '昵称3', applyTime: '2025-01-01 10:00:00' },
      ]
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
