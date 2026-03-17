<template>
  <el-dialog
    title="激活码兑换"
    :visible.sync="innerVisible"
    width="400px"
    :close-on-click-modal="false"
    append-to-body
    custom-class="activate-code-dialog"
    @close="onClose">
    <el-input
      v-model.trim="activateCode"
      placeholder="请输入激活码"
      clearable
      maxlength="50"
      @keyup.enter.native="onConfirm" />
    <div slot="footer">
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!activateCode"
        @click="onConfirm">
        确认
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { submitData } from "@/api/common.js"

export default {
  name: "ActivateCodeDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activateCode: "",
      loading: false,
    }
  },
  computed: {
    innerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit("update:visible", val)
      },
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.activateCode = ""
      }
    },
  },
  methods: {
    onClose() {
      this.activateCode = ""
      this.loading = false
    },
    async onConfirm() {
      if (!this.activateCode) return
      this.loading = true
      try {
        const res = await submitData({
          url: "/operate/api/activate/redeem",
          requestData: {
            activateCode: this.activateCode,
            clientType: 2,
          },
        })
        if (res && res.success) {
          this.$message.success("兑换成功")
          this.innerVisible = false
          this.$emit("success")
        } else {
          this.$message.error(res?.message || "兑换失败，请检查激活码")
        }
      } catch (err) {
        this.$message.error(err?.message || "兑换失败，请稍后重试")
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep .activate-code-dialog {
  border-radius: 12px;
  margin-top: 30vh !important;

  .el-dialog__header {
    text-align: center;
    padding: 24px 20px 16px;
  }

  .el-dialog__body {
    padding: 10px 32px 20px;
  }

  .el-dialog__footer {
    text-align: center;
    padding: 0 32px 24px;
    border-top: none;

    .el-button--primary {
      width: 160px;
    }
  }
}
</style>
