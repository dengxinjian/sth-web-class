<template>
  <el-dialog
    :visible.sync="innerVisible"
    :width="getDialogWidth()"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">历史</span>

    <custom-table
      v-if="loginType === '2'"
      :data="tableData"
      :columns="getColumns()"
      :total="total"
      :getList="getApplyHistory"
      :pagination="pagination"
      @pagination-change="handlePaginationChange"
    />
    <el-table v-else :data="tableData" style="width: 100%">
      <el-table-column prop="applyTimeRange" label="应用时间" />
    </el-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import CustomTable from "@/components/customTable/index.vue";
export default {
  name: "ApplyHistory",
  components: {
    CustomTable,
  },
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    type: { type: String, default: "" },
    planInfo: { type: Object, default: () => {} },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      tableData: [],
      total: 0,
      columns: [
        { prop: "teamName", label: "团队名称", width: 180 },
        { prop: "applyNickname", label: "昵称", width: 180 },
        { prop: "applyTimeRange", label: "应用时间", width: 260 },
      ],
      pagination: {
        page: 1,
        limit: 10,
      },
      loginType: localStorage.getItem("loginType") || '1',
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
        // reset form when opening
        this.resetForm();
        this.getApplyHistory();
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
    getDialogWidth() {
      const loginType = localStorage.getItem("loginType");
      if (loginType === "2") {
        return "680px";
      } else {
        return "280px";
      }
    },
    getColumns() {
      const loginType = localStorage.getItem("loginType");
      if (loginType === "2") {
        return [
          { prop: "teamName", label: "团队名称", width: 180 },
          { prop: "applyNickname", label: "昵称", width: 180 },
          { prop: "applyTimeRange", label: "应用时间", width: 260 },
        ];
      } else {
        return [
          // { prop: "applyNickname", label: "昵称", width: 180 },
          { prop: "applyTimeRange", label: "应用时间", width: 260 },
        ];
      }
    },
    getApplyHistory() {
      getData({
        url: "/api/applyPlanClassesHistory/listByPlanId",
        planClassesId: this.planInfo.id,
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
      }).then((res) => {
        this.tableData = res.result.records;
        this.total = res.result.total;
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
    handlePaginationChange(page, limit) {
      this.pagination.page = page;
      this.pagination.limit = limit;
      this.getApplyHistory();
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
