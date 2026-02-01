<template>
  <el-dialog
    title="权限调整"
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    class="permission-adjust-modal"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="撤回:" required>
        <el-radio-group v-model="form.revoke">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="权限:" required>
        <el-radio-group v-model="form.shareToAuth">
          <el-radio :label="1">查看</el-radio>
          <el-radio :label="2">编辑</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { submitData } from "@/api/common.js"

export default {
  name: "SharePlanPersion",
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    /** v-model 绑定显示状态（与 visible 二选一） */
    value: {
      type: Boolean,
      default: false,
    },
    /** .sync 绑定显示状态（与 value 二选一） */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 当前操作的分享记录行数据，需包含 id，用于提交时 shareRecordId 与初始表单 shareToAuth */
    shareRecord: {
      type: Object,
      default: null,
    },
    /** 同 shareRecord，planView 中传 planInfo 时使用 */
    planInfo: {
      type: Object,
      default: null,
    },
    shareAuth: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      innerVisible: false,
      submitting: false,
      form: {
        revoke: false,
        shareToAuth: 1,
      },
      shareRecordList: [],
    }
  },
  computed: {
    record() {
      return this.planInfo || null
    },
    isOpen() {
      return this.value || this.visible
    },
  },
  watch: {
    isOpen: {
      handler(val) {
        this.innerVisible = !!val
        if (val && this.record) {
          console.log(this.record, "this.record====操作权限");
          console.log(this.shareAuth, "this.shareAuth====操作权限");
          this.getCurrentShareRecord()
          this.form = {
            revoke: false,
            shareToAuth: this.shareAuth != null ? Number(this.shareAuth) : 1,
          }
        }
      },
      immediate: true,
    },
    innerVisible(val) {
      this.$emit("input", val)
      this.$emit("update:visible", val)
    },
  },
  methods: {
    getCurrentShareRecord() {
      const requestUserId = localStorage.getItem("triUserId")
      if (!requestUserId) {
        return
      }
      submitData({
        url: "/gateway/training/share/queryShareRecords",
        requestData: {
          requestUserId,
          shareDataId: this.record.sourceClassId,
          shareDataType: 1, // 1=团队课程 2=计划
          shareUserId: this.record.shareUserId,
          pageNum: 1,
          pageSize: 10,
        },
      })
        .then((res) => {
          this.shareRecordList = res.result.records || []
        })
        .catch((err) => {
          console.error("获取分享历史失败:", err)
          this.shareRecordList = []
        })
    },
    handleClose() {
      this.innerVisible = false
      this.$emit("close", this.form)
      this.form = { revoke: false, shareToAuth: 1 }
      this.shareRecordList = []
    },
    async handleConfirm() {
      const record = this.shareRecordList[0]
      if (!record || (record.id == null && record.shareRecordId == null)) {
        this.$message.warning("未找到分享记录")
        return
      }
      const shareRecordId = record.shareRecordId != null ? record.shareRecordId : record.id
      const requestUserId = localStorage.getItem("triUserId")
      this.submitting = true
      try {
        const res = await submitData({
          url: "/training/api/share/updatePermission",
          requestData: {
            requestUserId,
            shareRecordId,
            revoke: this.form.revoke,
            shareToAuth: this.form.shareToAuth,
          },
        })
        if (res && res.success) {
          this.$message.success("权限已更新")
          this.handleClose()
          this.$emit("success")
        } else {
          this.$message.error(res?.message || "更新失败，请稍后重试")
        }
      } catch (err) {
        console.error("更新分享权限失败:", err)
        this.$message.error("更新失败，请稍后重试")
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
