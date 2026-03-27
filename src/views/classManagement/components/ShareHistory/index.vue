<template>
  <div>
    <el-dialog
      :visible.sync="innerVisible"
      width="780px"
      append-to-body
      :before-close="onCancel"
      class="add-class-title-modal"
      :close-on-click-modal="false">
      <span slot="title">分享历史</span>

      <!-- 分享历史 -->
      <el-table
        :data="shareTableData"
        border
        style="width: 100%; margin-top: 10px">
        <el-table-column
          prop="shareToName"
          label="分享团队名称"
          align="center" />
        <el-table-column
          prop="shareTime"
          label="分享时间"
          width="180"
          align="center" />
        <el-table-column
          prop="permissionDesc"
          label="权限"
          width="120"
          align="center">
          <template slot-scope="scope">
            <span
              :style="{ color: scope.row.shareToAuth === 0 ? '' : '#e5423c' }">{{ scope.row.permissionDesc }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              :disabled="scope.row.shareToAuth === 0 || scope.row.shareUserId !== triUserId"
              @click="handleAdjustPermission(scope.row)">权限调整</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分享历史分页 -->
      <el-pagination v-if="shareTotal > sharePagination.limit"
        @size-change="handleShareSizeChange"
        @current-change="handleShareCurrentChange"
        :current-page="sharePagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="sharePagination.limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="shareTotal"
        style="margin-top: 20px; text-align: right;margin-bottom: 20px;" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="onCancel">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 权限调整弹框 -->
    <el-dialog title="权限调整" :visible.sync="permissionDialogVisible"
      width="420px" append-to-body class="permission-adjust-modal"
      @close="closePermissionDialog">
      <el-form ref="permissionFormRef" :model="permissionForm"
        label-width="80px">
        <el-form-item label="撤回:" required>
          <el-radio-group v-model="permissionForm.revoke">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限:" required
          v-if="!permissionForm.revoke">
          <el-radio-group v-model="permissionForm.shareToAuth">
            <el-radio :label="1">查看</el-radio>
            <el-radio :label="2">编辑</el-radio>
            <el-radio :label="3">共有</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closePermissionDialog">取消</el-button>
        <el-button type="primary"
          @click="confirmPermissionAdjust">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getData, submitData } from "@/api/common.js"
export default {
  name: "ApplyHistory",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    type: { type: String, default: "" },
    planInfo: { type: Object, default: () => { } },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      activeTab: "apply",
      tableData: [],
      total: 0,
      pagination: {
        page: 1,
        limit: 10,
      },
      // 分享历史数据
      shareTableData: [],
      shareTotal: 0,
      sharePagination: {
        page: 1,
        limit: 10,
      },
      // 权限调整弹框
      permissionDialogVisible: false,
      permissionForm: {
        revoke: false,
        shareToAuth: 1,
      },
      currentShareRow: null,
      loginType: localStorage.getItem("loginType") || "1",
      timer: null,
      triUserId: localStorage.getItem("triUserId"),
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val
    },
    innerVisible(val) {
      this.$emit("update:visible", val)
      this.$emit("input", val)
      if (val) {
        // reset form when opening
        this.resetForm()
        this.getShareHistory()
      } else {
        // 弹窗关闭时清除定时器
        this.clearTimer()
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        )
      }
    },
    tableData(newVal) {
      // 设置新定时器前先清除旧的
      this.clearTimer()
      if (newVal.length > 0) {
        if (newVal.some((item) => item.applyStatus === 0)) {
          this.timer = setTimeout(() => {
            // 执行前再次检查弹窗是否还打开
            if (this.innerVisible) {
              this.getApplyHistory()
            }
          }, 10000)
        }
      }
    },
  },
  // 关闭弹窗，清除定时器
  beforeDestroy() {
    this.clearTimer()
    this.tableData = []
    this.total = 0
    this.pagination = {
      page: 1,
      limit: 10,
    }
  },
  methods: {
    handleTabChange(tab) {
      // el-tabs @tab-click 回調的 tab 是一個對象，需要取 name
      const name = tab.name || this.activeTab
      if (name === "apply") {
        this.getApplyHistory()
      } else if (name === "share") {
        this.getShareHistory()
      }
    },
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    // getDialogWidth() {
    //   const loginType = localStorage.getItem("loginType")
    //   if (loginType === "2") {
    //     return "900px"
    //   } else {
    //     return "580px"
    //   }
    // },
    getApplyHistory() {
      const params = {
        url: "/gateway/training/planClasses/listApplyHistoryByPlanId",
        planClassesId: this.planInfo.id,
        pageNo: this.pagination.page,
        pageSize: this.pagination.limit,
      }

      // console.log("请求参数:", params);

      getData(params)
        .then((res) => {
          // console.log("接口返回数据:", res);

          const allRecords = (res.result.records || []).map((el) => {
            return {
              ...el,
              teamName: el.teamName || "/",
              applyTimeRange: this.formatDateRange(el.applyTimeRange),
            }
          })

          const totalFromApi = res.result.total || allRecords.length
          const recordsCount = allRecords.length

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
            const start = (this.pagination.page - 1) * this.pagination.limit
            const end = start + this.pagination.limit
            this.tableData = allRecords.slice(start, end)
            this.total = totalFromApi
            // console.log("前端分页处理，显示第", start + 1, "到", end, "条数据");
          } else {
            // 接口已正确分页，直接使用返回的数据
            this.tableData = allRecords
            this.total = totalFromApi
          }
        })
        .catch((error) => {
          console.error("获取应用历史失败:", error)
          this.tableData = []
          this.total = 0
        })
    },
    onCancel() {
      this.clearTimer()
      this.innerVisible = false
      this.$emit("cancel")
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        this.$emit("save", { ...this.form })
        this.innerVisible = false
      })
    },
    resetForm() {
      // 清除定时器
      this.clearTimer()
      // 重置分页到第一页
      this.pagination = {
        page: 1,
        limit: 10,
      }
      this.tableData = []
      this.total = 0
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    handleSizeChange(val) {
      // 每页条数改变
      this.pagination.limit = val
      this.pagination.page = 1 // 重置到第一页
      this.getApplyHistory()
    },
    handleCurrentChange(val) {
      // 当前页改变
      this.pagination.page = val
      this.getApplyHistory()
    },
    // 同步：根据历史记录ID重新同步课表到设备
    async syncApply(row) {
      if (!row || !row.id) {
        this.$message.error("未找到有效的历史记录")
        return
      }
      try {
        await this.$confirm(
          "确认根据该历史记录重新同步课程信息到设备？",
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
      } catch (e) {
        // 用户取消
        return
      }

      try {
        const res = await submitData({
          url: "/gateway/training/planClasses/resyncClassSchedulesByHistoryId",
          historyId: row.id,
        })
        if (res && res.success) {
          this.$message.success("已发起重新同步，请稍后在设备上查看")
          this.getApplyHistory()
        } else {
          this.$message.error(res?.message || "同步失败，请稍后重试")
        }
      } catch (err) {
        console.error("同步失败:", err)
        this.$message.error("同步失败，请稍后重试")
      }
    },
    // 取消：根据历史记录ID取消应用计划
    async cancelApply(row) {
      if (!row || !row.id) {
        this.$message.error("未找到有效的历史记录")
        return
      }
      try {
        await this.$confirm("确认取消该次应用计划？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
      } catch (e) {
        // 用户取消
        return
      }

      try {
        const res = await submitData({
          url: "/gateway/training/planClasses/cancelApplyPlanClassesHistory",
          historyId: row.id,
        })
        if (res && res.success) {
          this.$message.success("取消成功")
          this.getApplyHistory()
        } else {
          this.$message.error(res?.message || "取消失败，请稍后重试")
        }
      } catch (err) {
        console.error("取消失败:", err)
        this.$message.error("取消失败，请稍后重试")
      }
    },
    // 分享历史：查询 /gateway/training/planClasses 分享记录（示例：/api/share/query）
    // 分享历史：分页查询分享记录 POST /gateway/training/share/queryShareRecords
    getShareHistory() {
      const requestUserId = localStorage.getItem("triUserId")
      if (!requestUserId) {
        this.shareTableData = []
        this.shareTotal = 0
        return
      }
      submitData({
        url: "/gateway/training/share/queryShareRecords",
        requestData: {
          requestUserId,
          shareDataId: this.planInfo.id,
          shareDataType: 1, // 1=团队课程 2=计划
          pageNum: this.sharePagination.page,
          pageSize: this.sharePagination.limit,
        },
      })
        .then((res) => {
          if (!res || !res.success) {
            this.shareTableData = []
            this.shareTotal = 0
            return
          }
          const result = res.result || {}
          const list = Array.isArray(result.records) ? result.records : []
          const total = result.total != null ? result.total : list.length
          const mapped = list.map((item) => ({
            ...item,
            shareTeamName: item.shareToName || item.groupName || item.shareToId || "-",
            shareTime: this.formatShareTime(item.shareTime),
            permissionDesc: this.getSharePermissionDesc(item.shareToAuth),
          }))
          this.shareTableData = mapped
          this.shareTotal = total
        })
        .catch((err) => {
          console.error("获取分享历史失败:", err)
          this.shareTableData = []
          this.shareTotal = 0
        })
    },
    // 分享时间：接口返回 "2026-01-28T17:19:17"，展示为 "2026-01-28 17:19:17"
    formatShareTime(val) {
      if (val == null || val === "") return "-"
      const s = String(val).trim()
      if (!s) return "-"
      return s.replace("T", " ").substring(0, 19)
    },
    getSharePermissionDesc(auth) {
      const map = {
        0: "无",
        1: "查看",
        2: "编辑",
        3: "共有",
      }
      return map[auth] || "无"
    },
    handleShareSizeChange(val) {
      this.sharePagination.limit = val
      this.sharePagination.page = 1
      this.getShareHistory()
    },
    handleShareCurrentChange(val) {
      this.sharePagination.page = val
      this.getShareHistory()
    },
    handleAdjustPermission(row) {
      if (!row || row.id == null) {
        this.$message.warning("未找到分享记录")
        return
      }
      this.currentShareRow = row
      this.permissionForm = {
        revoke: false,
        shareToAuth: row.shareToAuth != null ? Number(row.shareToAuth) : 1,
      }
      this.permissionDialogVisible = true
    },
    closePermissionDialog() {
      this.permissionDialogVisible = false
      this.currentShareRow = null
      this.permissionForm = { revoke: false, shareToAuth: 1 }
    },
    async confirmPermissionAdjust() {
      if (!this.currentShareRow || this.currentShareRow.id == null) {
        this.$message.warning("未找到分享记录")
        return
      }
      const requestUserId = localStorage.getItem("triUserId")
      try {
        const res = await submitData({
          url: "/training/api/share/updatePermission",
          requestData: {
            requestUserId,
            shareRecordId: this.currentShareRow.id,
            revoke: this.permissionForm.revoke,
            shareToAuth: this.permissionForm.shareToAuth,
          },
        })
        if (res && res.success) {
          this.$message.success("权限已更新")
          this.closePermissionDialog()
          this.getShareHistory()
        } else {
          this.$message.error(res?.message || "更新失败，请稍后重试")
        }
      } catch (err) {
        console.error("更新分享权限失败:", err)
        this.$message.error("更新失败，请稍后重试")
      }
    },
    // 根据状态值返回对应的 CSS 类名
    getStatusClass(status) {
      if (status === 0) {
        return "status-success" // 应用中 - 蓝色
      } else if (status === 1) {
        return "status-applying" // 成功 - 绿色
      } else if (status === 2) {
        return "status-failed" // 失败 - 红色
      } else if (status === 3) {
        return "status-canceled" // 取消 - 灰色
      }
      return ""
    },
    // 格式化日期范围为中文年月日格式
    formatDateRange(dateRange) {
      if (!dateRange) return dateRange
      // 格式: "2026-01-10 ~ 2026-01-13" -> "2026年1月10日 ~ 2026年1月13日"
      return dateRange.replace(/(\d{4})-(\d{1,2})-(\d{1,2})/g, (match, year, month, day) => {
        return `${year}年${parseInt(month)}月${parseInt(day)}日`
      })
    },
  },
}
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
  justify-content: flex-end;
}

.history-cancel-btn {
  color: #000 !important;
}

.history-cancel-btn:hover {
  color: #111 !important;
}

.statistics-divider-wrapper {
  margin: 8px 0;
}

.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}

/* 应用状态颜色 */
.status-applying {
  font-size: 12px;
  color: #385DFF;
  /* 蓝色 - 应用中 */
  background: #385DFF1F;
  padding: 6px 6px;
  border-radius: 3px;
}

.status-success {
  font-size: 12px;
  color: #00A781;
  /* 绿色 - 成功 */
  background: #00A7811F;
  padding: 6px 6px;
  border-radius: 3px;
}

.status-failed {
  font-size: 12px;
  color: #F92B30;
  /* 红色 - 失败 */
  background: #F92B301F;
  padding: 6px 6px;
  border-radius: 3px;
}

.status-canceled {
  font-size: 12px;
  color: #000;
  /* 灰色 - 取消 */
  background: #999;
  padding: 6px 6px;
  border-radius: 3px;
}
</style>
