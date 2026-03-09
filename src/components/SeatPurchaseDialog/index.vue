<template>
  <div>
    <div class="vip-dialog-mask seat-purchase-mask" v-if="innerVisible">
      <div class="mask-container mask-container--pro">
        <div class="container-top-box">
          <div class="container-top-box-title">购买席位</div>
          <img
            src="~@/assets/plan/close.png"
            alt=""
            class="close-icon"
            @click="onCancel" />
        </div>
        <div class="container-content seat-purchase-content">
          <div class="seat-layout">
            <!-- 左栏：席位选择 -->
            <aside class="seat-column seat-column--left">
              <!-- <h3 class="column-title">席位选择</h3> -->
              <div class="left-stack">
                <div class="seat-block">
                  <div class="seat-block-title">当前席位数</div>
                  <div class="seat-values seat-values--current">
                    <div class="seat-line">
                      <span class="seat-label">教练席位：</span>
                      <span class="seat-num">{{ currentCoach }}</span>
                    </div>
                    <div class="seat-line">
                      <span class="seat-label">运动员席位：</span>
                      <span class="seat-num">{{ currentAthlete }}</span>
                    </div>
                  </div>
                </div>
                <div class="seat-block">
                  <div class="seat-row-head">
                    <span class="seat-label">教练席位</span>
                    <span class="seat-price">¥99/永久席位</span>
                  </div>
                  <div class="seat-stepper">
                    <button
                      type="button"
                      class="stepper-btn"
                      :disabled="purchaseCoach <= 0"
                      @click="stepCoach(-1)">
                      −
                    </button>
                    <input
                      v-model.number="purchaseCoach"
                      type="number"
                      min="0"
                      max="99"
                      class="stepper-input"
                      @input="onCoachInput" />
                    <button
                      type="button"
                      class="stepper-btn"
                      :disabled="purchaseCoach >= 99"
                      @click="stepCoach(1)">
                      +
                    </button>
                  </div>
                </div>
                <div class="seat-block">
                  <div class="seat-row-head">
                    <span class="seat-label">运动员席位</span>
                    <span class="seat-price">¥50/永久席位</span>
                  </div>
                  <div class="seat-stepper">
                    <button
                      type="button"
                      class="stepper-btn"
                      :disabled="purchaseAthlete <= 0"
                      @click="stepAthlete(-1)">
                      −
                    </button>
                    <input
                      v-model.number="purchaseAthlete"
                      type="number"
                      min="0"
                      max="99"
                      class="stepper-input"
                      @input="onAthleteInput" />
                    <button
                      type="button"
                      class="stepper-btn"
                      :disabled="purchaseAthlete >= 99"
                      @click="stepAthlete(1)">
                      +
                    </button>
                  </div>
                </div>
                <div class="seat-block">
                  <div class="seat-block-title">购买后席位数</div>
                  <div class="seat-values seat-values--after">
                    <div class="seat-line">
                      <span class="seat-label">教练席位：</span>
                      <span class="seat-num">{{ coachAfter }}</span>
                    </div>
                    <div class="seat-line">
                      <span class="seat-label">运动员席位：</span>
                      <span class="seat-num">{{ athleteAfter }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            <!-- 右栏：订单与支付 -->
            <aside class="seat-column seat-column--right">
              <!-- <h3 class="column-title">订单与支付</h3> -->
              <div class="right-stack">
                <div class="payment-detail payment-detail--compact">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">类型</span>
                      <span class="detail-value">订阅</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">版本</span>
                      <span class="detail-value">专业版</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">预期生效时间</span>
                      <span class="detail-value">即时生效</span>
                    </div>
                  </div>
                </div>

                <div class="payment-methods payment-methods--row">
                  <span
                    class="method-item wechat"
                    :class="{ active: selectedPaymentMethod === 'wechat' }"
                    @click="selectedPaymentMethod = 'wechat'">
                    <img
                      src="~@/assets/Payment/wx.svg"
                      alt="微信支付"
                      class="method-icon" />
                    微信支付
                  </span>
                  <span
                    class="method-item alipay"
                    :class="{ active: selectedPaymentMethod === 'alipay' }"
                    @click="selectedPaymentMethod = 'alipay'">
                    <img
                      src="~@/assets/Payment/zfb.svg"
                      alt="支付宝"
                      class="method-icon" />
                    支付宝
                  </span>
                </div>

                <div class="qr-amount-row">
                  <div class="payment-qr-module payment-qr-module--compact">
                    <div class="payment-qr-placeholder">
                      <template v-if="payOrderLoading">
                        <span class="qr-hint">正在生成订单...</span>
                      </template>
                      <template v-else-if="payCodeUrl">
                        <img
                          :src="payCodeUrl"
                          alt="微信支付二维码"
                          class="payment-qr-img" />
                      </template>
                      <template v-else>
                        <span class="qr-hint">{{
                          selectedPaymentMethod === "wechat"
                            ? "请先勾选下方协议以显示支付二维码"
                            : "支付宝无需二维码，点击下方支付"
                        }}</span>
                      </template>
                    </div>
                  </div>
                  <div class="amount-inline">
                    <span class="amount-label">订单金额</span>
                    <span class="amount-value">¥{{ totalAmount }}</span>
                  </div>
                </div>

                <!-- 微信支付：不显示按钮，勾选协议后自动出码扫码支付；支付宝：显示按钮跳转支付 -->
                <button
                  v-if="selectedPaymentMethod !== 'wechat'"
                  class="subscribe-btn pay-btn"
                  :disabled="totalAmount <= 0"
                  @click="handlePay">
                  支付
                </button>
                <label class="agreement-wrap agreement-wrap--right">
                  <input
                    v-model="agreementChecked"
                    type="checkbox"
                    class="agreement-checkbox" />
                  <span class="agreement-text">
                    已阅读同意
                    <a
                      href="javascript:;"
                      class="agreement-link"
                      @click.stop.prevent="agreementDialogVisible = true">
                      《服务协议》
                    </a>
                  </span>
                </label>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      :visible.sync="agreementDialogVisible"
      width="720px"
      class="vip-agreement-dialog"
      append-to-body>
      <div class="vip-agreement-content">
        <h3 class="title">会员订阅服务协议</h3>
        <p>本协议由您与「STH 平台」就精英版会员、专业版会员订阅服务所订立，请您在勾选前仔细阅读并理解各条款。</p>
        <p>1. 协议主体：当您在页面勾选“同意并支付”并完成支付，即视为您已阅读并同意本协议全部内容。</p>
        <p>2. 会员类型与订阅周期：平台提供精英版会员、专业版会员两种会员服务，可单独订阅，也可同时订阅。订阅周期以页面展示的包月、包年等方式为准。</p>
        <p>3. 服务内容：会员开通后，即可在平台内使用相应版本所包含的功能与权益，具体以页面展示为准。</p>
        <p>4. 付费与退款规则：会员服务属于数字化虚拟商品，自您支付成功且服务开通之时起，不支持退款、转让或变更套餐，法律法规另有规定的除外。</p>
        <p>5. 有效期：会员有效期自支付成功之日起按所选周期自动计算；同时订阅多个会员版本的，有效期分别独立计算。</p>
        <p>6. 用户义务：您应保证所填写的账户、身份等信息真实有效，并妥善保管账号与密码，如因您自身原因造成账号被盗、丢失等，由您自行承担责任。</p>
        <p>7. 平台权利：若您存在违规使用、恶意套利、侵权等行为，平台有权视情节对您的会员资格进行限制、暂停或终止，且不予退款。</p>
        <p>8. 其他：平台有权根据业务需要对本协议进行调整，更新后的协议将在页面公示，若您继续使用会员服务，即视为接受更新后的协议。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcode"
import { submitData, getData } from "@/api/common"

const COACH_PRICE = 99
const ATHLETE_PRICE = 50

export default {
  name: "SeatPurchaseDialog",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: false },
    /** 当前教练席位数 */
    coachTotal: { type: Number, default: 0 },
    /** 当前运动员席位数 */
    athleteTotal: { type: Number, default: 0 },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      purchaseCoach: 0,
      purchaseAthlete: 0,
      selectedPaymentMethod: "wechat",
      agreementChecked: false,
      agreementDialogVisible: false,
      payOrderLoading: false,
      payCodeUrl: "",
      outTradeNo: "",
      payPollTimer: null,
    }
  },
  computed: {
    currentCoach() {
      return Number(this.coachTotal) || 0
    },
    currentAthlete() {
      return Number(this.athleteTotal) || 0
    },
    coachAfter() {
      return this.currentCoach + (Number(this.purchaseCoach) || 0)
    },
    athleteAfter() {
      return this.currentAthlete + (Number(this.purchaseAthlete) || 0)
    },
    /** 订单金额（元） */
    totalAmount() {
      const c = Math.min(99, Math.max(0, Number(this.purchaseCoach) || 0))
      const a = Math.min(99, Math.max(0, Number(this.purchaseAthlete) || 0))
      return c * COACH_PRICE + a * ATHLETE_PRICE
    },
    /** 订单金额（分），用于接口 */
    orderAmountCents() {
      return this.totalAmount * 100
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val
      if (val) {
        this.purchaseCoach = 0
        this.purchaseAthlete = 0
        this.resetPayState()
      }
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val
      if (this.innerVisible) {
        this.purchaseCoach = 0
        this.purchaseAthlete = 0
        this.resetPayState()
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val)
      this.$emit("input", val)
      if (!val) this.resetPayState()
    },
    agreementChecked(val) {
      if (
        val &&
        this.selectedPaymentMethod === "wechat" &&
        !this.payCodeUrl &&
        !this.payOrderLoading &&
        this.totalAmount > 0
      ) {
        this.createWeChatOrder()
      }
    },
    selectedPaymentMethod(val) {
      this.resetPayState()
      if (
        val === "wechat" &&
        this.agreementChecked &&
        !this.payOrderLoading &&
        this.totalAmount > 0
      ) {
        this.createWeChatOrder()
      }
    },
    totalAmount() {
      this.resetPayState()
      if (
        this.agreementChecked &&
        this.selectedPaymentMethod === "wechat" &&
        !this.payOrderLoading &&
        this.totalAmount > 0
      ) {
        this.createWeChatOrder()
      }
    },
  },
  methods: {
    onCancel() {
      this.innerVisible = false
    },
    clamp(v, min, max) {
      const n = Number(v)
      if (Number.isNaN(n)) return min
      return Math.min(max, Math.max(min, Math.floor(n)))
    },
    stepCoach(delta) {
      this.purchaseCoach = this.clamp(
        (Number(this.purchaseCoach) || 0) + delta,
        0,
        99
      )
    },
    stepAthlete(delta) {
      this.purchaseAthlete = this.clamp(
        (Number(this.purchaseAthlete) || 0) + delta,
        0,
        99
      )
    },
    onCoachInput() {
      this.purchaseCoach = this.clamp(this.purchaseCoach, 0, 99)
    },
    onAthleteInput() {
      this.purchaseAthlete = this.clamp(this.purchaseAthlete, 0, 99)
    },
    resetPayState() {
      this.stopPayPoll()
      this.payCodeUrl = ""
      this.outTradeNo = ""
      this.payOrderLoading = false
    },
    stopPayPoll() {
      if (this.payPollTimer) {
        clearInterval(this.payPollTimer)
        this.payPollTimer = null
      }
    },
    startPayPoll() {
      this.stopPayPoll()
      const poll = async () => {
        if (!this.outTradeNo) return
        try {
          const res = await getData({
            url: "consumer/api/vipPay/queryPayStatus",
            outTradeNo: this.outTradeNo,
          })
          if (res && res.success && res.result) {
            const status = res.result.payStatus ?? res.result.status
            if (status === 1 || status === "SUCCESS" || status === "PAID") {
              this.stopPayPoll()
              this.$message.success("支付成功")
              this.$emit("success")
              setTimeout(() => {
                window.location.reload()
              }, 600)
            }
          }
        } catch (e) {
          // 单次轮询失败忽略
        }
      }
      poll()
      this.payPollTimer = setInterval(poll, 2000)
    },
    async createWeChatOrder() {
      if (this.totalAmount <= 0) return
      this.payOrderLoading = true
      this.payCodeUrl = ""
      this.outTradeNo = ""
      try {
        const res = await submitData({
          url: "consumer/api/vipPay/createOrder",
          method: "post",
          requestData: {
            triUserId: "",
            openId: "",
            payType: 1,
            payMode: 2,
            tradeType: 3, // 购买席位
            identityType: "C",
            subscribeType: 0,
            coachSeat: Number(this.purchaseCoach) || 0,
            athleteSeat: Number(this.purchaseAthlete) || 0,
            orderAmount: this.orderAmountCents,
          },
        })
        if (res && res.success && res.result) {
          const codeUrl = res.result.codeUrl || res.result.code_url
          this.outTradeNo = res.result.outTradeNo || res.result.out_trade_no
          if (codeUrl && this.outTradeNo) {
            this.payCodeUrl = await QRCode.toDataURL(codeUrl, {
              width: 200,
              margin: 1,
            })
            this.startPayPoll()
          } else {
            this.$message.error(res.message || "未返回支付二维码")
          }
        } else {
          this.$message.error(res?.message || "创建订单失败")
        }
      } catch (e) {
        this.$message.error(e?.message || "创建订单失败")
      } finally {
        this.payOrderLoading = false
      }
    },
    async createAliPayPagePay() {
      if (this.totalAmount <= 0) return
      this.payOrderLoading = true
      this.payCodeUrl = ""
      this.outTradeNo = ""
      try {
        const returnUrl = location.href
        const res = await submitData({
          url: `consumer/api/aliPay/createOrderPagePay?returnUrl=${encodeURIComponent(returnUrl)}`,
          method: "post",
          requestData: {
            triUserId: "",
            openId: "",
            payType: 2,
            payMode: 3,
            tradeType: 3,
            identityType: "C",
            subscribeType: 0,
            coachSeat: Number(this.purchaseCoach) || 0,
            athleteSeat: Number(this.purchaseAthlete) || 0,
            orderAmount: this.orderAmountCents,
          },
        })
        if (!res || !res.success) {
          this.$message.error(res?.message || "创建支付宝订单失败")
          return
        }
        const result = res.result || {}
        const pageUrl =
          (typeof result === "string" ? result : "") ||
          result.pagePayFormBody ||
          result.page_pay_form_body ||
          ""
        if (!pageUrl) {
          this.$message.error(res.message || "未返回支付宝支付链接")
          return
        }
        window.location.href = pageUrl
      } catch (e) {
        this.$message.error(e?.message || "创建支付宝订单失败")
      } finally {
        this.payOrderLoading = false
      }
    },
    handlePay() {
      if (this.totalAmount <= 0) {
        this.$message.warning("请选择要购买的席位数")
        return
      }
      if (!this.agreementChecked) {
        this.$message.warning("请先阅读并同意《服务协议》")
        return
      }
      if (this.selectedPaymentMethod === "alipay") {
        this.createAliPayPagePay()
        return
      }
      this.createWeChatOrder()
    },
  },
}
</script>

<style scoped lang="scss">
$primary-red: #b81300;
$primary-red-hover: #9a0f00;
$primary-red-light: #fff5f4;
$wechat-green: #07c160;
$wechat-green-bg: #e8f8f0;
$border-light: #e8e8e8;
$text-primary: #1a1a1a;
$text-secondary: #666;
$radius-md: 10px;
$radius-sm: 8px;
$shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06);
$shadow-btn: 0 4px 12px rgba(184, 19, 0, 0.35);

.seat-purchase-mask .mask-container {
  background-image: url("~@/assets/professional_vip.png");
  background-repeat: no-repeat;
  background-position: top center;
  background-size: 100% auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.seat-purchase-content {
  min-height: 420px;
}

/* 严格左右两栏布局 */
.seat-layout {
  display: flex;
  align-items: stretch;
  min-height: 420px;
  background: #fff;
  border-radius: 0;
  overflow: hidden;
}

.seat-column {
  display: flex;
  flex-direction: column;
  padding: 20px 30px 24px;
  overflow-y: auto;

  &--left {
    flex: 0 0 400px;
    min-width: 400px;
    background: #fff;
    border-right: 1px solid #f0f0f0;
  }

  &--right {
    flex: 1;
    min-width: 0;
    background: #fff;
  }
}

.column-title {
  font-size: 14px;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 16px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid $primary-red;
  letter-spacing: 0.02em;
  line-height: 1.3;
}

.left-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seat-block-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 10px;
  letter-spacing: 0.02em;
}

.seat-values {
  padding: 14px 16px;
  border-radius: $radius-md;
  font-size: 14px;
  transition: box-shadow 0.2s ease;

  &.seat-values--current,
  &.seat-values--after {
    background: linear-gradient(135deg, #fff5f4 0%, #ffebea 100%);
    border: 1px solid rgba(184, 19, 0, 0.12);
    color: $primary-red;
    .seat-num {
      font-weight: 700;
      font-size: 15px;
    }
  }
}

.seat-line {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:last-child {
    margin-bottom: 0;
  }
}

.seat-row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  .seat-label {
    color: $text-primary;
    font-weight: 500;
  }
  .seat-price {
    color: $primary-red;
    font-weight: 700;
    font-size: 15px;
  }
}

.seat-stepper {
  display: inline-flex;
  align-items: stretch;
  border-radius: $radius-sm;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  .stepper-btn {
    width: 40px;
    height: 40px;
    border: 1px solid $border-light;
    background: #fff;
    cursor: pointer;
    font-size: 20px;
    font-weight: 300;
    line-height: 1;
    color: $text-secondary;
    transition: all 0.2s ease;
    &:first-child {
      border-right: none;
      border-radius: $radius-sm 0 0 $radius-sm;
    }
    &:last-child {
      border-left: none;
      border-radius: 0 $radius-sm $radius-sm 0;
      color: $primary-red;
      font-weight: 500;
      &:hover:not(:disabled) {
        background: $primary-red-light;
        color: $primary-red;
        border-color: rgba(184, 19, 0, 0.25);
      }
    }
    &:hover:not(:disabled):first-child {
      background: #f7f8fa;
      color: $text-primary;
    }
    &:disabled {
      cursor: not-allowed;
      color: #c0c4cc;
      background: #f5f7fa;
    }
  }
  .stepper-input {
    width: 52px;
    height: 40px;
    border: 1px solid $border-light;
    border-left: none;
    border-right: none;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    outline: none;
    transition: border-color 0.2s ease;
    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    &:focus {
      border-color: rgba(184, 19, 0, 0.4);
    }
  }
}

.right-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seat-column--right .payment-qr-module {
  .payment-qr-placeholder {
    width: 150px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: #fafafa;
    border: 1px dashed $border-light;
    border-radius: $radius-md;
    font-size: 12px;
    color: $text-secondary;
    line-height: 1.5;
    text-align: center;
  }
  .payment-qr-img {
    width: 150px;
    height: 150px;
    display: block;
    border-radius: $radius-sm;
  }
}

.seat-column--right .payment-detail--compact {
  padding: 0;
  background: transparent;
  border-radius: 0;
  border: none;
}

.seat-column--right .payment-detail {
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 56px;
    row-gap: 12px;
    align-items: center;
  }

  .detail-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    min-width: 0;
  }

  .detail-label {
    color: $text-secondary;
    width: 92px;
    flex-shrink: 0;
  }

  .detail-value {
    color: $text-primary;
    font-weight: 600;
    min-width: 0;
    white-space: nowrap;
  }
}

.payment-methods--row {
  display: flex;
  gap: 12px;
}
.payment-methods--row .method-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 5px 10px;
  border: 2px solid $border-light;
  border-radius: $radius-md;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  background: #fff;
  transition: all 0.2s ease;
  min-width: 108px;
  white-space: nowrap;
  .method-icon {
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
  }
  &.active.wechat {
    border-color: $wechat-green;
    background: $wechat-green-bg;
    color: #0a6e42;
    box-shadow: 0 0 0 1px rgba(7, 193, 96, 0.2);
  }
  &.active.alipay {
    border-color: #1677ff;
    background: #eef4ff;
    color: #0b3f9b;
    box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.18);
  }
  &:hover:not(.active) {
    border-color: #c0c4cc;
    background: #f7f8fa;
  }
}

.qr-amount-row {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-top: 6px;
}

.payment-qr-module--compact .payment-qr-placeholder {
  width: 200px;
  height: 200px;
}
.payment-qr-module--compact .payment-qr-img {
  width: 200px;
  height: 200px;
}

.amount-inline {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: flex-start;
  padding: 0;
}
.amount-label {
  color: $text-secondary;
  font-size: 13px;
}
.amount-value {
  color: $primary-red;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.pay-btn {
  width: 100%;
  margin-top: 20px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(180deg, #c91616 0%, $primary-red 50%, $primary-red-hover 100%);
  color: #fff;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  box-shadow: $shadow-btn;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  letter-spacing: 0.05em;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(184, 19, 0, 0.4);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled {
    background: #c0c4cc;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.agreement-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  font-size: 12px;
  color: $text-secondary;
  .agreement-checkbox {
    margin-top: 3px;
    cursor: pointer;
  }
  .agreement-text {
    line-height: 1.5;
  }
  .agreement-link {
    color: #409eff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

.agreement-wrap--right {
  margin-top: 6px;
}
</style>

<style lang="scss">
.seat-purchase-mask .container-top-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  .container-top-box-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.03em;
  }
  .close-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.2s ease;
    &:hover {
      opacity: 1;
    }
  }
}

.seat-purchase-mask .container-content {
  width: 100%;
  min-height: 360px;
  background: #fff;
  border-radius: 12px 12px 15px 15px;
  padding: 20px 28px 28px;
  box-sizing: border-box;
}

.seat-purchase-mask.vip-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  .mask-container {
    width: 880px;
    min-height: 460px;
    background: #fff;
    border-radius: 12px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

.vip-agreement-dialog ::v-deep(.el-dialog__body) {
  max-height: 520px;
  overflow-y: auto;
}
.vip-agreement-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
  }
  p {
    margin-bottom: 8px;
  }
}
</style>
