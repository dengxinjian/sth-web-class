<template>
  <el-dialog
    title="激活码兑换"
    :visible.sync="innerVisible"
    width="400px"
    :close-on-click-modal="false"
    append-to-body
    custom-class="activate-code-dialog"
    @close="onClose">
    <div class="code-input-group">
      <el-input
        ref="segment0"
        :value="codeSegments[0]"
        placeholder="4位"
        maxlength="4"
        @input="handleSegmentInput(0, $event)"
        @paste.native.prevent="handlePaste(0, $event)"
        @keydown.native.backspace="handleBackspace(0)"
        @keyup.enter.native="onConfirm" />
      <span class="code-separator">-</span>
      <el-input
        ref="segment1"
        :value="codeSegments[1]"
        placeholder="2位"
        maxlength="2"
        @input="handleSegmentInput(1, $event)"
        @paste.native.prevent="handlePaste(1, $event)"
        @keydown.native.backspace="handleBackspace(1)"
        @keyup.enter.native="onConfirm" />
      <span class="code-separator">-</span>
      <el-input
        ref="segment2"
        :value="codeSegments[2]"
        placeholder="8位"
        maxlength="8"
        @input="handleSegmentInput(2, $event)"
        @paste.native.prevent="handlePaste(2, $event)"
        @keydown.native.backspace="handleBackspace(2)"
        @keyup.enter.native="onConfirm" />
    </div>
    <div
      v-if="activateCodeMeta"
      class="code-preview">
      已识别：{{ activateCodeMeta.name }} /
      {{ activateCodeMeta.daysLabel }}
    </div>
    <div
      v-else-if="codeSegments[1].length === segmentLengths[1]"
      class="code-preview code-preview--error">
      无法识别激活码类型，请检查激活码
    </div>
    <div slot="footer">
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!isCodeComplete"
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
  ACTIVATE_CODE_RULES: {
    R7: { name: "精英版", type: 11, days: 7, benefitLabel: "精英版会员权益" },
    RM: { name: "精英版", type: 11, days: 30, benefitLabel: "精英版会员权益" },
    RQ: { name: "精英版", type: 11, days: 90, benefitLabel: "精英版会员权益" },
    RY: { name: "精英版", type: 11, days: 365, benefitLabel: "精英版会员权益" },
    RF: { name: "精英版", type: 11, days: -1, benefitLabel: "精英版会员权益" },
    C7: { name: "专业版", type: 12, days: 7, benefitLabel: "专业版会员权益" },
    CM: { name: "专业版", type: 12, days: 30, benefitLabel: "专业版会员权益" },
    CQ: { name: "专业版", type: 12, days: 90, benefitLabel: "专业版会员权益" },
    CY: { name: "专业版", type: 12, days: 365, benefitLabel: "专业版会员权益" },
    CF: { name: "专业版", type: 12, days: -1, benefitLabel: "专业版会员权益" },
    AF: { name: "精英天使用户", type: 13, days: -1, benefitLabel: "精英天使用户权益" },
    BF: { name: "专业天使用户", type: 14, days: -1, benefitLabel: "专业天使用户权益" },
    EY: { name: "PRO 版", type: 15, days: 365, benefitLabel: "PRO 版会员权益" },
    FY: { name: "认证教练", type: 16, days: 365, benefitLabel: "认证教练权益" },
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      codeSegments: ["", "", ""],
      loading: false,
      segmentLengths: [4, 2, 8],
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
    activateCode() {
      return this.codeSegments.join("-")
    },
    isCodeComplete() {
      return this.codeSegments.every((segment, index) => segment.length === this.segmentLengths[index])
    },
    activateCodeMeta() {
      const segment = this.codeSegments[1]
      if (segment.length !== this.segmentLengths[1]) return null
      const rule = this.$options.ACTIVATE_CODE_RULES[segment]
      if (!rule) return null
      return {
        ...rule,
        daysLabel: rule.days === -1 ? "永久" : `${rule.days}天`,
      }
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.resetDialog()
        this.$nextTick(() => {
          this.focusSegment(0)
          this.ensureWrapperZIndex()
        })
      }
    },
  },
  methods: {
    resetDialog() {
      this.codeSegments = ["", "", ""]
      this.loading = false
    },
    onClose() {
      this.resetDialog()
    },
    normalizeSegmentValue(value) {
      return String(value || "")
        .replace(/[^0-9a-zA-Z]/g, "")
        .toUpperCase()
    },
    splitCodeSegments(value) {
      const normalizedValue = this.normalizeSegmentValue(value)
      const segments = []
      let start = 0

      this.segmentLengths.forEach((length) => {
        segments.push(normalizedValue.slice(start, start + length))
        start += length
      })

      return segments
    },
    handleSegmentInput(index, value) {
      const normalizedValue = this.normalizeSegmentValue(value)
      const nextSegments = [...this.codeSegments]
      const currentMaxLength = this.segmentLengths[index]
      nextSegments[index] = normalizedValue.slice(0, currentMaxLength)

      let remainingValue = normalizedValue.slice(currentMaxLength)
      let nextIndex = index + 1
      while (remainingValue && nextIndex < this.segmentLengths.length) {
        const nextMaxLength = this.segmentLengths[nextIndex]
        nextSegments[nextIndex] = remainingValue.slice(0, nextMaxLength)
        remainingValue = remainingValue.slice(nextMaxLength)
        nextIndex += 1
      }

      this.codeSegments = nextSegments

      if (nextSegments[index].length === currentMaxLength && index < this.segmentLengths.length - 1) {
        this.$nextTick(() => {
          this.focusSegment(index + 1)
        })
      }
    },
    handlePaste(index, event) {
      const pastedText = event?.clipboardData?.getData("text") || ""
      const normalizedValue = this.normalizeSegmentValue(pastedText)
      if (!normalizedValue) return

      const totalLength = this.segmentLengths.reduce((sum, length) => sum + length, 0)
      const shouldFillAllSegments = pastedText.includes("-") || normalizedValue.length >= totalLength

      if (shouldFillAllSegments) {
        this.codeSegments = this.splitCodeSegments(normalizedValue)
        this.$nextTick(() => {
          const nextEmptyIndex = this.codeSegments.findIndex(
            (segment, segmentIndex) => segment.length < this.segmentLengths[segmentIndex]
          )
          this.focusSegment(nextEmptyIndex === -1 ? this.segmentLengths.length - 1 : nextEmptyIndex)
        })
        return
      }

      this.handleSegmentInput(index, normalizedValue)
    },
    handleBackspace(index) {
      if (!this.codeSegments[index] && index > 0) {
        this.$nextTick(() => {
          this.focusSegment(index - 1)
        })
      }
    },
    focusSegment(index) {
      const inputRef = this.$refs[`segment${index}`]
      inputRef && inputRef.focus && inputRef.focus()
    },
    getConfirmMessage(meta) {
      const rightsText = meta.days === -1
        ? `永久${meta.benefitLabel}`
        : `${meta.daysLabel}${meta.benefitLabel}`
      return [
        `当前为${meta.name}激活码，包含${rightsText}，确认兑换吗？`,
      ].join("")
    },
    async showConfirmDialog(meta) {
      await this.$confirm(this.getConfirmMessage(meta), "确认兑换", {
        confirmButtonText: "确认兑换",
        cancelButtonText: "取消",
        dangerouslyUseHTMLString: true,
        type: "warning",
      })
    },
    async onConfirm() {
      if (!this.isCodeComplete) {
        this.$message.warning("请输入完整的激活码")
        return
      }
      if (!this.activateCodeMeta) {
        this.$message.error("未识别的激活码类型，请检查后重试")
        return
      }
      try {
        await this.showConfirmDialog(this.activateCodeMeta)
      } catch (err) {
        return
      }
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
        // this.$message.error(err?.message || "兑换失败，请稍后重试")
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

  .code-input-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .el-input {
      width: 92px;
    }

    .el-input:last-of-type {
      width: 156px;
    }

    .el-input__inner {
      text-align: center;
      letter-spacing: 1px;
    }
  }

  .code-separator {
    color: #606266;
    font-size: 18px;
    font-weight: 600;
  }

  .code-example {
    margin-top: 12px;
    color: #909399;
    font-size: 12px;
    text-align: center;
  }

  .code-preview {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f4f8ff;
    color: #409eff;
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
  }

  .code-preview--error {
    background: #fef0f0;
    color: #f56c6c;
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
