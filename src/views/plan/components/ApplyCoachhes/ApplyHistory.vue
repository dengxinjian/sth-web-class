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

    <el-table
      v-if="loginType === '2'"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column prop="teamName" label="团队名称" width="180" />
      <el-table-column prop="applyNickname" label="昵称" width="180" />
      <el-table-column prop="applyTimeRange" label="应用时间" width="260" />
    </el-table>
    <el-table v-else :data="tableData" style="width: 100%">
      <el-table-column prop="applyNickname" label="昵称" />
      <el-table-column prop="applyTimeRange" label="应用时间" />
    </el-table>
    <el-pagination
      v-if="loginType === '2' || total > 10"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.page"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: right;"
    />
    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
export default {
  name: "ApplyHistory",
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
        return "500px";
      }
    },
    getApplyHistory() {
      const params = {
        url: "/api/applyPlanClassesHistory/listByPlanId",
        planClassesId: this.planInfo.id,
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
      };

      // console.log("请求参数:", params);

      getData(params).then((res) => {
        console.log("接口返回数据:", res);

        const allRecords = (res.result.records || []).map(el => {
          return {
            ...el,
            teamName: el.teamName || '/',
          }
        });

        const totalFromApi = res.result.total || allRecords.length;
        const recordsCount = allRecords.length;

        console.log("总记录数:", totalFromApi, "返回记录数:", recordsCount, "当前页:", this.pagination.page, "每页条数:", this.pagination.limit);

        // 如果返回的记录数大于每页条数，说明接口可能没有正确分页，需要前端分页
        if (recordsCount > this.pagination.limit) {
          // 前端分页：根据当前页和每页条数截取数据
          const start = (this.pagination.page - 1) * this.pagination.limit;
          const end = start + this.pagination.limit;
          this.tableData = allRecords.slice(start, end);
          this.total = totalFromApi;
          console.log("前端分页处理，显示第", start + 1, "到", end, "条数据");
        } else {
          // 接口已正确分页，直接使用返回的数据
          this.tableData = allRecords;
          this.total = totalFromApi;
        }
      }).catch((error) => {
        console.error("获取应用历史失败:", error);
        this.tableData = [];
        this.total = 0;
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
      // 重置分页到第一页
      this.pagination = {
        page: 1,
        limit: 10,
      };
      this.tableData = [];
      this.total = 0;
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    handleSizeChange(val) {
      // 每页条数改变
      this.pagination.limit = val;
      this.pagination.page = 1; // 重置到第一页
      this.getApplyHistory();
    },
    handleCurrentChange(val) {
      // 当前页改变
      this.pagination.page = val;
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
