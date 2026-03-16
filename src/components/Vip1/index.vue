<template>
  <div class="vip-dialog-mask" v-if="innerVisible">
    <div class="mask-container">
      <div class="container-top-box">
        <div class="container-top-box-title">
          {{ tradeType === '2' || tradeType === 2 ? '续费' : '订阅' }}
        </div>
        <img src="~@/assets/plan/close.png" alt="" class="close-icon"
          @click="onCancel" />
      </div>
      <div class="container-content">
        <div class="container-content-title-box">
          <div class="container-content-title">
            <img src="~@/assets/vip/per_title.svg" alt=""
              class="container-content-title-img" />
            <img src="~@/assets/vip/jiao.png" alt=""
              class="container-content-title-bg" />
          </div>
        </div>
        <!-- 左右两栏：左侧会员专属权益，右侧订阅方式与支付 -->
        <div class="content-layout">
          <!-- 左侧：会员专属权益 -->
          <div class="content-left">
            <div class="content-box-title">会员专属权益</div>
            <ul class="benefit-list">
              <li class="benefit-item" v-for="item in vipInfoList"
                :key="item.subTitle">
                <img :src="item.img" alt="" class="benefit-icon" />
                <el-tooltip placement="right" effect="light"
                  popper-class="vip-benefit-tooltip">
                  <span
                    class="benefit-title">{{ item.subTitle }}</span>
                  <div slot="content" class="benefit-tooltip-content">
                    <div
                      v-for="child in item.children"
                      :key="child.idx"
                      class="benefit-tooltip-item">• {{ child.label }}
                    </div>
                  </div>
                </el-tooltip>
              </li>
            </ul>
          </div>
          <!-- 右侧：订阅方式 + 支付 -->
          <div class="content-right">
            <div class="subscribe-section">
              <div class="section-title">订阅方式</div>
              <div class="subscribe-cards">
                <div v-for="plan in plans" :key="plan.type"
                  class="subscribe-card"
                  :class="{ active: selectedPlanType === plan.type }"
                  @click="selectedPlanType = plan.type">
                  <div class="card-type">{{ plan.label }}</div>
                  <div class="card-price-wrap">
                    <span class="card-price">¥<em>{{ plan.price }}</em></span>
                    <div class="card-original">原价 {{ plan.originalPrice }}</div>
                  </div>
                  <!-- <div class="card-discount-bar">促销折扣文案</div> -->
                </div>
              </div>
            </div>
            <div class="payment-section">
              <!-- 左侧模块：二维码 + 价格 -->
              <div class="payment-qr-module">
                <div class="payment-qr-placeholder">
                  <template v-if="payOrderLoading">
                    <span class="qr-hint">正在生成订单...</span>
                  </template>
                  <template v-else-if="payCodeUrl">
                    <img :src="payCodeUrl" alt="微信支付二维码"
                      class="payment-qr-img" />
                  </template>
                  <template v-else>
                    <span class="qr-hint">{{
                      selectedPaymentMethod === 'wechat'
                        ? '请先勾选下方协议以显示支付二维码'
                        : '支付宝无需二维码，点击右侧去订阅'
                    }}</span>
                  </template>
                </div>
                <div class="payment-amount">¥{{ selectedPlanPrice }}</div>
              </div>
              <!-- 右侧模块：订阅详情 + 支付方式 + 订阅按钮 + 协议 -->
              <div class="payment-content-module">
                <div class="payment-detail">
                  <div class="detail-row">
                    <span class="detail-label">类型</span>
                    <span
                      class="detail-value">{{ tradeType === '2' || tradeType === 2 ? '续费' : '订阅' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">版本</span>
                    <span class="detail-value">专业版</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">预期生效时间</span>
                    <span class="detail-value">即时生效</span>
                  </div>
                  <div class="payment-methods">
                    <span class="method-item wechat"
                      :class="{ active: selectedPaymentMethod === 'wechat' }"
                      @click="selectedPaymentMethod = 'wechat'">
                      <img src="~@/assets/Payment/wx.svg" alt="微信支付"
                        class="method-icon" />
                      微信支付
                    </span>
                    <span class="method-item alipay"
                      :class="{ active: selectedPaymentMethod === 'alipay' }"
                      @click="selectedPaymentMethod = 'alipay'">
                      <img src="~@/assets/Payment/zfb.svg" alt="支付宝"
                        class="method-icon" />
                      支付宝
                    </span>
                  </div>
                </div>
                <!-- 微信支付时不显示订阅按钮，勾选协议后自动出现二维码 -->
                <button v-if="selectedPaymentMethod !== 'wechat'"
                  class="subscribe-btn" @click="handleSubscribeVip">
                  {{
                    selectedPaymentMethod === 'alipay'
                      ? (tradeType === '2' || tradeType === 2 ? '去续费' : '去订阅')
                      : (tradeType === '2' || tradeType === 2 ? '续费' : '订阅')
                  }}
                </button>
                <label class="agreement-wrap">
                  <input
                    type="checkbox"
                    v-model="agreementChecked"
                    class="agreement-checkbox" />
                  <span class="agreement-text">
                    已阅读同意
                    <a
                      href="javascript:;"
                      class="agreement-link"
                      @click.stop.prevent="agreementDialogVisible = true">
                      《会员订阅服务协议》
                    </a>
                  </span>
                </label>
              </div>
            </div>
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
      <p class="lead">本协议由你与【STH 平台】（以下简称“平台”）就精英版会员、专业版会员订阅服务所订立。</p>

      <h4 class="section-title">1. 协议主体</h4>
      <p>本协议由你与平台就精英版会员、专业版会员订阅服务所订立。</p>

      <h4 class="section-title">2. 会员类型与订阅周期</h4>
      <p>
        平台提供两种会员服务：精英版会员、专业版会员。两种会员相互独立，可单独订阅，可同时订阅，权益、有效期、计费互不影响。订阅周期包括：包月、包年。
      </p>

      <h4 class="section-title">3. 服务内容</h4>
      <p>会员为平台内虚拟数字服务，开通后立即生效，提供对应功能权限。</p>

      <h4 class="section-title">4. 付费与退款规则</h4>
      <ul class="bullet">
        <li>会员服务属于数字化虚拟商品，一经支付开通、权益已即时生效，不支持退款、不支持折现、不支持转让。</li>
        <li>因用户个人原因（误购、不再使用、设备更换、账号问题等）申请退款的，平台不予受理。</li>
        <li>因平台故障、服务重大瑕疵导致完全无法使用的，按实际无法使用时长进行补偿或退款。</li>
      </ul>

      <h4 class="section-title">5. 有效期</h4>
      <ul class="bullet">
        <li>按用户选择周期自动计算，从支付成功时刻起算。</li>
        <li>同时订阅精英版 + 专业版时，两个会员有效期独立计算。</li>
      </ul>

      <h4 class="section-title">6. 用户义务</h4>
      <ul class="bullet">
        <li>保证支付信息真实有效。</li>
        <li>妥善保管账号，因账号共享、被盗产生的损失由用户承担。</li>
      </ul>

      <h4 class="section-title">7. 平台权利</h4>
      <ul class="bullet">
        <li>平台有权调整会员权益（不影响已购周期）。</li>
        <li>平台对违规使用、恶意套利、侵权行为有权暂停/终止服务，不予退款。</li>
      </ul>

      <h4 class="section-title">8. 其他</h4>
      <ul class="bullet">
        <li>本协议自用户点击“同意协议”或勾选“我已充分阅读并同意【会员订阅服务协议】”时生效。</li>
        <li>平台有权更新协议，更新后公示 7 日生效，用户继续使用视为同意新版本。</li>
      </ul>
    </div>
    </el-dialog>
  </div>
</template>

<script>
import QRCode from "qrcode"
import { submitData, getData } from "@/api/common"

export default {
  name: "Vip1",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: false },
    tradeType: { type: String, default: "" },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      selectedPlanType: "monthly", // monthly | yearly
      selectedPaymentMethod: "wechat", // wechat | alipay
      agreementChecked: false,
      agreementDialogVisible: false,
      plans: [
        { type: "monthly", label: "月卡", price: 80, subscribeType: 1, originalPrice: 118 },
        { type: "yearly", label: "年卡", price: 648, subscribeType: 3, originalPrice: 1136 },
      ],
      payOrderLoading: false,
      payCodeUrl: "",
      outTradeNo: "",
      payPollTimer: null,
      vipInfoList: [
        {
          title: "会员标识",
          subTitle: "会员专属图标",
          img: require("@/assets/vip/vip_1.png"),
          children: [{ idx: 1, label: "专业版专属头像框" }],
        },
        {
          title: "运动员高阶数据",
          subTitle: "数据分析/运动峰值表现可见",
          img: require("@/assets/vip/vip_2.png"),
          children: [
            { idx: 1, label: "从数据出发，深入了解你的运动员" },
          ],
        },
        {
          title: "一站式团队管理",
          subTitle: "科学管理",
          img: require("@/assets/vip/vip_3.png"),
          children: [
            { idx: 1, label: "身份切换可用(可切换至教练身份)" },
            { idx: 2, label: "运动员管理" },
            { idx: 3, label: "执教管理" },
            { idx: 4, label: "团队课程管理" },
            { idx: 5, label: "团队计划管理" },
          ],
        },
        {
          title: "数据总览",
          subTitle: "可视化分析",
          img: require("@/assets/vip/vip_4.png"),
          children: [
            { idx: 1, label: "成员日程/数据可视化，掌握团队全局训练情况。" },
          ],
        },
        {
          title: "训练计划",
          subTitle: "示例计划可用",
          img: require("@/assets/vip/vip_5.png"),
          children: [
            { idx: 1, label: "定期更新高效示例计划库可用" },
          ],
        },
      ],
    }
  },
  computed: {
    selectedPlan() {
      return this.plans.find((p) => p.type === this.selectedPlanType) || this.plans[0]
    },
    selectedPlanPrice() {
      return this.selectedPlan?.price ?? 0
    },
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
      if (!val) {
        this.stopPayPoll()
        this.payCodeUrl = ""
        this.outTradeNo = ""
      }
    },
    agreementChecked(val) {
      if (val && this.selectedPaymentMethod === "wechat" && !this.payCodeUrl && !this.payOrderLoading) {
        this.createWeChatOrder()
      }
    },
    selectedPlanType() {
      // 切换价格（订阅类型）时：若已勾选协议且为微信支付，则重新生成二维码
      this.resetPayState()
      if (this.agreementChecked && this.selectedPaymentMethod === "wechat" && !this.payOrderLoading) {
        this.createWeChatOrder()
      }
    },
    selectedPaymentMethod(val) {
      // 切换支付方式时清理旧二维码/轮询；切回微信且已勾选协议时重新出码
      this.resetPayState()
      if (val === "wechat" && this.agreementChecked && !this.payOrderLoading) {
        this.createWeChatOrder()
      }
    },
  },
  methods: {
    onCancel() {
      this.$emit("update:visible", false)
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
    extractOutTradeNoFromFormHtml(formHtml) {
      try {
        const doc = new DOMParser().parseFromString(formHtml, "text/html")
        const form = doc.querySelector("form")
        if (!form) return ""
        const candidates = [
          "outTradeNo",
          "out_trade_no",
          "outtradeno",
          "out_trade_no",
          "outTradeNo",
        ]
        for (const name of candidates) {
          const el = form.querySelector(`input[name=\"${name}\"]`)
          if (el && el.value) return el.value
        }
        return ""
      } catch (e) {
        return ""
      }
    },
    startPayPoll() {
      this.stopPayPoll()
      const poll = async () => {
        if (!this.outTradeNo) return
        try {
          const res = await getData({
            url: "operate/api/vipPay/queryPayStatus",
            outTradeNo: this.outTradeNo,
          })
          if (res && res.success && res.result) {
            const status = res.result.payStatus ?? res.result.status
            if (status === 1 || status === "SUCCESS" || status === "PAID") {
              this.stopPayPoll()
              this.$message.success("支付成功")
              // this.onCancel()
              // 支付成功后强制刷新，确保页面状态/权限立即更新
              setTimeout(() => {
                window.location.reload()
              }, 600)
            }
          }
        } catch (e) {
          // 单次轮询失败忽略，继续下次
        }
      }
      poll()
      this.payPollTimer = setInterval(poll, 2000)
    },
    getPayParams() {
      const subscribeType = this.selectedPlan?.subscribeType ?? 1
      // 订单金额：单位分（按接口文档）
      const orderAmount = this.selectedPlanType === "yearly" ? 64800 : 8000
      // const orderAmount = 1
      return { subscribeType, orderAmount }
    },
    async createWeChatOrder() {
      const { subscribeType, orderAmount } = this.getPayParams()
      this.payOrderLoading = true
      this.payCodeUrl = ""
      this.outTradeNo = ""
      try {
        const res = await submitData({
          url: "operate/api/vipPay/createOrder",
          method: "post",
          requestData: {
            triUserId: "",
            openId: "",
            // 支付方式：1 微信 2 支付宝
            payType: 1,
            // 支付模式：2 二维码支付
            payMode: 2,
            tradeType: Number(this.tradeType) || 1,
            identityType: "C",
            subscribeType,
            coachSeat: 0,
            athleteSeat: 0,
            orderAmount,
            clientType: 2,
          },
        })
        if (res && res.success && res.result) {
          const codeUrl = res.result.codeUrl || res.result.code_url
          this.outTradeNo = res.result.outTradeNo || res.result.out_trade_no
          if (codeUrl && this.outTradeNo) {
            this.payCodeUrl = await QRCode.toDataURL(codeUrl, { width: 200, margin: 1 })
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
      const { subscribeType, orderAmount } = this.getPayParams()
      this.payOrderLoading = true
      this.payCodeUrl = ""
      this.outTradeNo = ""
      try {
        const { origin, pathname, hash } = window.location
        // 过滤掉所有参数：包括 ?query 以及 hash 路由里的 ?query
        const cleanHash = (hash || "").split("?")[0]
        const returnUrl = `${origin}${pathname}${cleanHash}`
        const res = await submitData({
          url: `operate/api/aliPay/createOrderPagePay?returnUrl=${encodeURIComponent(returnUrl)}`,
          method: "post",
          requestData: {
            triUserId: "",
            openId: "",
            payType: 2,
            // 网页支付
            payMode: 3,
            tradeType: Number(this.tradeType) || 1,
            identityType: "C",
            subscribeType,
            coachSeat: 0,
            athleteSeat: 0,
            orderAmount,
            clientType: 2,
          },
        })

        if (!res || !res.success) {
          this.$message.error(res?.message || "创建支付宝订单失败")
          return
        }

        const result = res.result || {}
        // 当前后端返回 pagePayFormBody 为支付宝跳转 URL
        const pageUrl =
          (typeof result === "string" ? result : "") ||
          result.pagePayFormBody ||
          result.page_pay_form_body ||
          ""

        if (!pageUrl) {
          this.$message.error(res.message || "未返回支付宝支付链接")
          return
        }

        // 覆盖当前页面，直接跳转到支付宝收银台
        window.location.assign(pageUrl)
        // window.open(pageUrl, "_blank")
      } catch (e) {
        this.$message.error(e?.message || "创建支付宝订单失败")
      } finally {
        this.payOrderLoading = false
      }
    },
    async handleSubscribeVip() {
      if (!this.agreementChecked) {
        this.$message.warning("请先阅读并同意《会员订阅服务协议》")
        return
      }
      if (this.selectedPaymentMethod === "alipay") {
        await this.createAliPayPagePay()
        return
      }
      await this.createWeChatOrder()
    },
  },
}
</script>

<style scoped lang="scss">
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

.statistics-divider-wrapper {
  margin: 8px 0;
}

.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}

/* 僅針對下方團隊列使用 flex，避免影響上方多選刪除時的排版 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__content) {
  margin-left: 0;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

/* 分享團隊名稱不換行，過長以省略號顯示 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 團隊選擇下拉框內標籤不換行 */
.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag) {
  max-width: 100%;
}

.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag .el-select__tags-text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

::v-deep(.el-select .el-tag__close.el-icon-close) {
  top: -5px;
}

.vip-dialog-mask {
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
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    // 背景图 从顶部，不变形，高度不变，宽度自适应
    background-image: url("~@/assets/professional_vip.png");
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 100% auto;

    .container-top-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;

      .container-top-box-title {
        font-size: 16px;
        font-weight: bold;
        color: #101010;
      }

      .close-icon {
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
    }

    .container-content {
      width: 100%;
      min-height: 480px;
      background: #fff;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      padding: 16px 24px 32px;
      box-sizing: border-box;
      position: relative;
    }

    .container-content .container-content-title-box {
      width: 750px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      left: 50px;
      top: -38px;
    }

    .container-content .container-content-title {
      width: 120px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      position: relative;
    }

    .container-content .container-content-title-img {
      width: 57px;
      height: 16px;
    }

    .container-content .container-content-title-bg {
      width: 144px;
      height: 12px;
      position: absolute;
      left: -12px;
      bottom: 0;
    }

    /* 左右两栏布局 */
    .content-layout {
      display: flex;
      gap: 15px;
      margin-top: 8px;
      min-height: 380px;
    }

    .content-left {
      flex: 0 0 240px;
      border: 1px solid #f8e7e5;
      background: linear-gradient(180deg, #fef8f7 0%, #ffffff 25%);
      border-radius: 8px;
      padding: 20px 16px 24px;
      box-sizing: border-box;

      .content-box-title {
        text-align: center;
        color: #101010;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .benefit-list {
        list-style: none;
        margin: 0;
        padding: 0;

        .benefit-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          color: #666;
          font-size: 13px;

          .benefit-icon {
            width: 28px;
            height: 28px;
            margin-right: 12px;
            flex-shrink: 0;
          }

          .benefit-title {
            cursor: default;
            border-bottom: 1px dashed transparent;

            &:hover {
              border-bottom-color: #ccc;
            }
          }
        }
      }
    }

    .content-right {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #101010;
        margin-bottom: 12px;
      }

      .subscribe-section {
        margin-bottom: 20px;
      }

      .subscribe-cards {
        display: flex;
        gap: 12px;
      }

      .subscribe-card {
        flex: 1;
        min-width: 100px;
        background: #fff;
        border: 1.5px solid #e8e8e8;
        border-radius: 8px;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.2s, box-shadow 0.2s;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        /* 选中态：1.5px 渐变边框（用双 background 实现，兼容圆角） */
        &.active {
          border: 2px solid transparent;
          background:
            linear-gradient(#fff, #fff) padding-box,
            linear-gradient(143.7deg, #2a2a2a 0%, #b81300 50%, #2a2a2a 100%) border-box;
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          box-shadow: none;

          .card-price,
          .card-price em {
            display: inline-block;
            background-image: linear-gradient(143.7deg, #2a2a2a 0%, #b81300 50%, #2a2a2a 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
          }
        }

        .card-type {
          font-size: 13px;
          color: #2a2a2a;
          padding: 12px 0 6px;
        }

        .card-price-wrap {
          padding: 4px 12px 10px;
        }

        .card-price {
          font-size: 14px;
          color: #b81300;
          display: block;
          margin-bottom: 4px;

          em {
            font-size: 22px;
            font-weight: 700;
            font-style: normal;
          }
        }

        .card-original {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }

        /* 折扣文案区域：底部渐变条 */
        .card-discount-bar {
          margin-top: auto;
          padding: 8px 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.95);
          background: linear-gradient(94.07deg, #2a2a2a 0%, #b81300 25%, #2a2a2a 50%);
          border-radius: 0 0 6px 6px;
        }
      }

      .payment-section {
        display: flex;
        flex-direction: row;
        gap: 32px;
        align-items: center;
        padding: 16px;
        border: 1px solid #00000026;
        background: #ffffff;
        border-radius: 8px;
      }

      /* 左侧模块：二维码 + 价格 */
      .payment-qr-module {
        flex-shrink: 0;
        width: 140px;
        text-align: center;

        .payment-qr-placeholder {
          width: 140px;
          height: 140px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
        }

        .payment-qr-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-hint {
          font-size: 12px;
          color: #999;
        }

        .payment-amount {
          font-size: 18px;
          font-weight: 600;
          color: #b81300;
          line-height: 1.2;
        }
      }

      /* 右侧模块：订阅详情 + 支付方式 + 按钮 + 协议 */
      .payment-content-module {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .payment-detail {
        flex: 1;
        min-width: 0;
        font-size: 14px;
        color: #333;
        display: flex;
        flex-direction: column;
        gap: 5px;

        .detail-row {
          display: flex;
          align-items: center;
          min-height: 28px;
          line-height: 28px;

          .detail-label {
            flex: 0 0 100px;
            color: #666;
            font-size: 14px;
          }

          .detail-value {
            flex: 1;
            font-weight: 600;
            color: #101010;
          }
        }

        .payment-methods {
          margin-top: 20px;
          padding-top: 30px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          gap: 20px;
          align-items: center;

          .method-item {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            line-height: 1.5;
            padding: 10px 16px;
            border: 2px solid #e8e8e8;
            border-radius: 8px;
            background: #ffffff;
            cursor: pointer;
            transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
            min-width: 120px;
            white-space: nowrap;

            &:hover:not(.active) {
              border-color: #c0c4cc;
              background: #f7f8fa;
            }

            &.active.wechat {
              border-color: #07c160;
              background: #e8f8f0;
              color: #0a6e42;
              box-shadow: 0 0 0 1px rgba(7, 193, 96, 0.2);
            }

            &.active.alipay {
              border-color: #1677ff;
              background: #eef4ff;
              color: #0b3f9b;
              box-shadow: 0 0 0 1px rgba(22, 119, 255, 0.18);
            }

            .method-icon {
              width: 24px;
              height: 24px;
              margin-right: 8px;
              border-radius: 4px;
              flex-shrink: 0;
              object-fit: contain;
              vertical-align: middle;
            }
          }
        }
      }

      .subscribe-btn {
        width: 100%;
        height: 32px;
        border: none;
        border-radius: 8px;
        background: linear-gradient(90.94deg, #2a2a2a 10%, #b81300 50%, #2a2a2a 90%);
        color: #fff;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 16px;
        transition: opacity 0.2s;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

        &:hover {
          opacity: 0.95;
        }
      }

      .agreement-wrap {
        display: flex;
        align-items: flex-start;
        cursor: pointer;
        font-size: 12px;
        color: #666;

        .agreement-checkbox {
          margin: 2px 8px 0 0;
          flex-shrink: 0;
        }

        .agreement-link {
          color: #1677ff;
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
/* 权益悬停说明：popper 挂载在 body，需非 scoped */
.vip-benefit-tooltip {
  max-width: 320px;
  padding: 12px 14px !important;

  .benefit-tooltip-content {
    .benefit-tooltip-item {
      font-size: 12px;
      line-height: 1.6;
      color: #666;
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
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
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    text-align: center;
  }

  .lead {
    color: #555;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 14px 0 6px;
    color: #111;
  }

  .bullet {
    padding-left: 18px;
    margin: 6px 0 10px;

    li {
      margin: 6px 0;
    }
  }

  p {
    margin-bottom: 8px;
  }
}
</style>
