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

    <el-table v-if="loginType === '2'" :data="tableData" style="width: 100%">
      <el-table-column prop="teamName" label="团队名称" width="180" />
      <el-table-column prop="applyNickname" label="昵称" width="180" />
      <el-table-column prop="applyTimeRange" label="应用时间" width="260" />
      <el-table-column prop="applyStatusDesc" label="应用状态" width="120">
        <template slot-scope="scope">
          <span :class="getStatusClass(scope.row.applyStatus)">
            {{ scope.row.applyStatusDesc }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <el-table v-else :data="tableData" style="width: 100%">
      <el-table-column prop="applyNickname" label="昵称" />
      <el-table-column prop="applyTimeRange" label="应用时间" />
      <el-table-column prop="applyStatusDesc" label="应用状态" width="120">
        <template slot-scope="scope">
          <span :class="getStatusClass(scope.row.applyStatus)">
            {{ scope.row.applyStatusDesc }}
          </span>
        </template>
      </el-table-column>
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
      style="margin-top: 20px; text-align: right"
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
      loginType: localStorage.getItem("loginType") || "1",
      timer: null,
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
        // 弹窗关闭时清除定时器
        this.clearTimer();
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
    tableData(newVal) {
      // 设置新定时器前先清除旧的
      this.clearTimer();
      if (newVal.length > 0) {
        if (newVal.some((item) => item.applyStatus === 0)) {
          this.timer = setTimeout(() => {
            // 执行前再次检查弹窗是否还打开
            if (this.innerVisible) {
              this.getApplyHistory();
            }
          }, 10000);
        }
      }
    },
  },
  // 关闭弹窗，清除定时器
  beforeDestroy() {
    this.clearTimer();
    this.tableData = [];
    this.total = 0;
    this.pagination = {
      page: 1,
      limit: 10,
    };
  },
  methods: {
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    getDialogWidth() {
      const loginType = localStorage.getItem("loginType");
      if (loginType === "2") {
        return "800px";
      } else {
        return "580px";
      }
    },
    getApplyHistory() {
      const params = {
        url: "/gateway/training/planClasses/listApplyHistoryByPlanId",
        planClassesId: this.planInfo.id,
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
      };

      // console.log("请求参数:", params);

      getData(params)
        .then((res) => {
          // console.log("接口返回数据:", res);

          const allRecords = (res.result.records || []).map((el) => {
            return {
              ...el,
              teamName: el.teamName || "/",
            };
          });

          const totalFromApi = res.result.total || allRecords.length;
          const recordsCount = allRecords.length;

          // console.log(
          //   "总记录数:",
          //   totalFromApi,
          //   "返回记录数:",
          //   recordsCount,
          //   "当前页:",
          //   this.pagination.page,
          //   "每页条数:",
          //   this.pagination.limit
          // );

          // 如果返回的记录数大于每页条数，说明接口可能没有正确分页，需要前端分页
          if (recordsCount > this.pagination.limit) {
            // 前端分页：根据当前页和每页条数截取数据
            const start = (this.pagination.page - 1) * this.pagination.limit;
            const end = start + this.pagination.limit;
            this.tableData = allRecords.slice(start, end);
            this.total = totalFromApi;
            // console.log("前端分页处理，显示第", start + 1, "到", end, "条数据");
          } else {
            // 接口已正确分页，直接使用返回的数据
            this.tableData = allRecords;
            this.total = totalFromApi;
          }
        })
        .catch((error) => {
          console.error("获取应用历史失败:", error);
          this.tableData = [];
          this.total = 0;
        });
    },
    onCancel() {
      this.clearTimer();
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
      // 清除定时器
      this.clearTimer();
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
    // 根据状态值返回对应的 CSS 类名
    getStatusClass(status) {
      if (status === 0) {
        return "status-success"; // 应用中 - 蓝色
      } else if (status === 1) {
        return "status-applying"; // 成功 - 绿色
      } else if (status === 2) {
        return "status-failed"; // 失败 - 红色
      }
      return "";
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

/* 应用状态颜色 */
.status-applying {
  color: #409eff; /* 蓝色 - 应用中 */
}

.status-success {
  color: #67c23a; /* 绿色 - 成功 */
}

.status-failed {
  color: #f56c6c; /* 红色 - 失败 */
}
</style>
