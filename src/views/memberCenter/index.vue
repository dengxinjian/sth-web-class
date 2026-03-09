<template>
  <div class="member-center-page">
    <Vip1 :visible.sync="showVip1" :tradeType="vip1TradeType" />
    <Vip2 :visible.sync="showVip2" :tradeType="vip2TradeType" />
    <RenewManageDialog
      :visible.sync="showRenewManage"
      :identityType="renewIdentityType" />
    <SeatPurchaseDialog
      :visible.sync="showSeatPurchase"
      :coachTotal="seatsView.coachTotal"
      :athleteTotal="seatsView.athleteTotal"
      @success="fetchSubscribeInfo" />
    <div class="member-center-container" v-loading="loading">
      <div class="page-toolbar">
        <el-button class="back-btn" size="small"
          icon="el-icon-arrow-left" @click="handleBack">
          返回
        </el-button>
      </div>
      <!-- 精英版 -->
      <section class="plan-section plan-section--elite">
        <div class="plan-header">
          <div class="plan-name">精英版</div>
        </div>
        <div class="plan-meta">
          <div class="meta-row">
            <span class="meta-label">订阅方式：</span>
            <span class="meta-value">{{ eliteView.subscribeText }}</span>
          </div>
          <div class="meta-row" v-if="eliteView.showRenewManage">
            <span class="meta-label">续费管理：</span>
            <a class="meta-link" href="#" @click.prevent="openRenewManage('R')">去管理</a>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ eliteView.timeLabel }}：</span>
            <span class="meta-value">{{ eliteView.timeValue }}</span>
          </div>
        </div>

        <div class="block-title">精英版权益</div>
        <div class="benefit-box">
          <div class="benefit-box-title">{{ elitePlan.benefitTitle }}
          </div>
          <div class="benefit-box-desc"
            v-for="(t, i) in elitePlan.benefitLines"
            :key="`elite-${i}`">
            {{ t }}
          </div>
        </div>

        <div class="block-actions">
          <el-button type="primary" size="small"
            @click="openEliteDialog(eliteView.actionLabel === '续费' ? '2' : '')">{{
            eliteView.actionLabel
          }}</el-button>
          <el-button type="text" size="small"
            class="muted-btn">激活码兑换</el-button>
        </div>
      </section>

      <!-- 专业版 -->
      <section
        class="plan-section plan-section--pro plan-section--spaced">
        <div class="plan-header">
          <div class="plan-name">专业版</div>
        </div>
        <div class="plan-meta">
          <div class="meta-row">
            <span class="meta-label">订阅方式：</span>
            <span class="meta-value">{{ proView.subscribeText }}</span>
          </div>
          <div class="meta-row" v-if="proView.showRenewManage">
            <span class="meta-label">续费管理：</span>
            <a class="meta-link" href="#" @click.prevent="openRenewManage('C')">去管理</a>
          </div>
          <div class="meta-row">
            <span class="meta-label">{{ proView.timeLabel }}：</span>
            <span class="meta-value">{{ proView.timeValue }}</span>
          </div>
        </div>

        <div class="block-title">专业版权益</div>
        <div class="benefit-box">
          <div class="benefit-box-title">{{ proPlan.benefitTitle }}
          </div>
          <div class="benefit-box-desc"
            v-for="(t, i) in proPlan.benefitLines" :key="`pro-${i}`">
            {{ t }}
          </div>
        </div>

        <div v-if="showSeatBox" class="block-title block-title--tight">
          席位包
        </div>
        <div v-if="showSeatBox" class="seat-box">
          <div class="seat-row">
            <span class="seat-label">运动员席位数：</span>
            <span class="seat-value">{{ seatsView.athleteTotal }}</span>
            <span class="seat-note">（包含已付费席位{{
              seatsView.athletePurchased
            }}个）</span>
          </div>
          <div class="seat-row">
            <span class="seat-label">教练席位数：</span>
            <span class="seat-value">{{ seatsView.coachTotal }}</span>
            <span class="seat-note">（包含已付费席位{{
              seatsView.coachPurchased
            }}个）</span>
          </div>
        </div>

        <div class="block-actions">
          <el-button type="primary" size="small"
            @click="openProDialog(proView.actionLabel === '续费' ? '2' : '')">{{
            proView.actionLabel
          }}</el-button>
          <el-button v-if="showSeatBox" size="small" type="primary"
            @click="showSeatPurchase = true">购买席位</el-button>
          <el-button type="text" size="small"
            class="muted-btn">激活码兑换</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Vip1 from "@/components/Vip1"
import Vip2 from "@/components/Vip2"
import RenewManageDialog from "@/components/RenewManageDialog"
import SeatPurchaseDialog from "@/components/SeatPurchaseDialog"
import { getData } from "@/api/common"

export default {
  name: "MemberCenter",
  components: { Vip1, Vip2, RenewManageDialog, SeatPurchaseDialog },
  data() {
    return {
      loading: false,
      identityType: localStorage.getItem("webIdentityType") || "",
      subscribeInfoMap: { R: null, C: null },
      subscribeInfo: null,
      showVip1: false,
      showVip2: false,
      showRenewManage: false,
      renewIdentityType: "C",
      showSeatPurchase: false,
      vip1TradeType: "",
      vip2TradeType: "",
      elitePlan: {
        subscribeText: "年卡",
        expireDate: "2026-10-01",
        benefitTitle: "",
        benefitLines: [
          "精英版会员专属头像框",
          "运动数据分析/运动峰值表现可见",
          "运动峰值表现可见，包含强者之心统计，多维度峰值统计，历史峰值对比",
          "定期更新高效示例计划库可用",
        ],
      },
      proPlan: {
        subscribeText: "连续包月",
        nextRenewDate: "2026-10-01",
        benefitTitle: "",
        benefitLines: [
          "专业版会员专属头像框",
          "运动数据分析、运动峰值表现可见",
          "可切换至教练身份，可管理团队运动员、执教、团队课程、团队计划",
          "成员日程/数据可视化，掌握团队全局训练情况",
          "定期更新高效示例计划库可用",
        ],
      },
      seats: {
        athlete: 25,
        athletePaid: 10,
        coach: 6,
        coachPaid: 3,
      },
    }
  },
  computed: {
    eliteInfo() {
      return this.subscribeInfoMap?.R || null
    },
    proInfo() {
      return this.subscribeInfoMap?.C || null
    },
    eliteView() {
      return this.buildIdentityView(this.eliteInfo)
    },
    proView() {
      return this.buildIdentityView(this.proInfo)
    },
    seatsView() {
      const info = this.proInfo || {}
      return {
        athleteTotal: Number(info.athleteSeatTotal ?? 0),
        coachTotal: Number(info.coachSeatTotal ?? 0),
        athletePurchased: Number(info.athleteSeatPurchased ?? 0),
        coachPurchased: Number(info.coachSeatPurchased ?? 0),
      }
    },
    showSeatBox() {
      const hasAnySeat =
        Number(this.seatsView.athleteTotal) > 0 ||
        Number(this.seatsView.coachTotal) > 0 ||
        Number(this.seatsView.athletePurchased) > 0 ||
        Number(this.seatsView.coachPurchased) > 0
      return this.identityType === "C" || hasAnySeat
    },
  },
  watch: {
    showVip1(val) {
      if (!val) this.fetchSubscribeInfo()
    },
    showVip2(val) {
      if (!val) this.fetchSubscribeInfo()
    },
  },
  mounted() {
    this.fetchSubscribeInfo()
  },
  methods: {
    openEliteDialog(tradeType) {
      this.vip2TradeType = tradeType || ""
      this.showVip2 = true
    },
    openProDialog(tradeType) {
      this.vip1TradeType = tradeType || ""
      this.showVip1 = true
    },
    openRenewManage(identityType) {
      this.renewIdentityType = identityType || "C"
      this.showRenewManage = true
    },
    async fetchSubscribeInfo() {
      this.loading = true
      try {
        const params = { url: "consumer/api/vipSubscribe/getUserSubscribeInfo" }
        const res = await getData(params)
        if (res && res.success) {
          const result = res.result
          const map = { R: null, C: null }
          if (Array.isArray(result)) {
            result.forEach((it) => {
              const key = it?.identityType
              if (key === "R" || key === "C") map[key] = it
            })
          } else if (result && (result.identityType === "R" || result.identityType === "C")) {
            map[result.identityType] = result
          }
          this.subscribeInfoMap = map
          // 兼容旧逻辑（如果外部仍依赖 subscribeInfo）
          this.subscribeInfo = map[this.identityType] || (Array.isArray(result) ? result[0] : result)
        } else {
          this.subscribeInfo = null
          this.subscribeInfoMap = { R: null, C: null }
        }
      } catch (e) {
        this.subscribeInfo = null
        this.subscribeInfoMap = { R: null, C: null }
      } finally {
        this.loading = false
      }
    },
    formatDate(val) {
      if (!val && val !== 0) return "-"
      const toDate = (v) => {
        if (v instanceof Date) return v
        if (typeof v === "number") return new Date(v < 1e12 ? v * 1000 : v)
        if (typeof v === "string") {
          const direct = new Date(v)
          if (!Number.isNaN(direct.getTime())) return direct
          const fallback = new Date(v.replace(/-/g, "/"))
          return Number.isNaN(fallback.getTime()) ? null : fallback
        }
        return null
      }
      const d = toDate(val)
      if (!d) return "-"
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const h = String(d.getHours()).padStart(2, "0")
      const min = String(d.getMinutes()).padStart(2, "0")
      const s = String(d.getSeconds()).padStart(2, "0")
      return `${y}-${m}-${day} ${h}:${min}:${s}`
    },
    getRecordTime(record) {
      const r = record || {}
      return {
        expire: r.expireTime ?? r.expireDate ?? r.endTime ?? r.serviceExpireTime,
        nextRenew: r.nextRenewTime ?? r.nextRenewDate ?? r.renewTime,
      }
    },
    isExpired(record) {
      const { expire } = this.getRecordTime(record)
      if (!expire) return false
      const d =
        typeof expire === "number"
          ? new Date(expire < 1e12 ? expire * 1000 : expire)
          : (() => {
            const direct = new Date(String(expire))
            if (!Number.isNaN(direct.getTime())) return direct
            return new Date(String(expire).replace(/-/g, "/"))
          })()
      if (Number.isNaN(d.getTime())) return false
      return d.getTime() < Date.now()
    },
    subscribeTypeText(subscribeType) {
      const v = Number(subscribeType)
      if (v === 1) return "月卡"
      if (v === 2) return "连续包月"
      if (v === 3) return "年卡"
      if (v === 4) return "连续包年"
      return "-"
    },
    buildIdentityView(info) {
      const subscribeType = info?.subscribeType
      const expire = info?.expireTime
      const hasSubscribe = subscribeType !== null && typeof subscribeType !== "undefined" && !!expire

      const expired = hasSubscribe ? this.isExpired({ expireTime: expire }) : false
      const isSubscribed = hasSubscribe && !expired

      const subscribeText = !hasSubscribe
        ? "未订阅"
        : expired
          ? "已过期"
          : this.subscribeTypeText(subscribeType)

      const actionLabel = isSubscribed ? "续费" : "订阅"
      const showRenewManage = isSubscribed

      const isAuto = [2, 4].includes(Number(subscribeType))
      const timeLabel = isAuto ? "下次续费时间" : "服务到期时间"
      const timeValue = expire ? this.formatDate(expire) : "-"

      return { subscribeText, actionLabel, showRenewManage, timeLabel, timeValue }
    },
    handleBack() {
      // 仅当上一页是本站页面时才 history.back，避免从支付宝等外部页面返回
      try {
        const ref = document.referrer || ""
        const sameOrigin =
          ref &&
          ref.indexOf(window.location.origin) === 0

        if (window.history.length > 1 && sameOrigin) {
          this.$router.back()
          return
        }
      } catch (e) {
        // ignore
      }
      const pushResult = this.$router.push("/timeTable/class")
      if (pushResult && typeof pushResult.catch === "function") {
        pushResult.catch(() => {})
      }
    },
  },
}
</script>

<style scoped lang="scss">
.member-center-page {
  min-height: calc(100vh - 60px);
  background: #f6f7fb;
}

.member-center-container {
  padding: 20px 24px 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.back-btn {
  border-radius: 10px;
  border: 1px solid #eef0f4;
  background: #ffffff;
  color: #101010;
  box-shadow: 0 4px 14px rgba(16, 24, 40, 0.06);
}

.plan-section {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 14px;
  padding: 20px 22px 18px;
  box-shadow: 0 8px 24px rgba(16, 24, 40, 0.06);
  display: flex;
  flex-direction: column;
}

.plan-section--spaced {
  margin-top: 28px;
}

.plan-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
}

.plan-name {
  font-size: 16px;
  font-weight: 800;
  color: #101010;
  line-height: 24px;
  flex-shrink: 0;
  position: relative;
  padding-left: 12px;
}

.plan-name::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  width: 4px;
  height: 16px;
  border-radius: 4px;
  background: #e5e7eb;
}

.plan-section--elite .plan-name::before {
  background: linear-gradient(180deg, #008867 0%, #2bb673 100%);
}

.plan-section--pro .plan-name::before {
  background: linear-gradient(180deg, #b81300 0%, #f92b30 100%);
}

.plan-meta {
  flex: 1;
  min-width: 0;
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fafbff 0%, #ffffff 100%);
  border: 1px solid #f0f2f7;
}

.meta-row {
  font-size: 13px;
  line-height: 22px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-label {
  color: #8c8c8c;
  min-width: 90px;
}

.meta-value {
  color: #101010;
  font-weight: 600;
}

.meta-link {
  color: #1677ff;
  text-decoration: none;
  font-weight: 600;
}

.meta-link:hover {
  text-decoration: underline;
}

.block-title {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 800;
  color: #101010;
}

.block-title--tight {
  margin-top: 18px;
}

.benefit-box {
  margin-top: 10px;
  width: 520px;
  max-width: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 10px;
  padding: 14px 16px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
}

.benefit-box-title {
  font-size: 13px;
  font-weight: 800;
  color: #101010;
  margin-bottom: 8px;
}

.benefit-box-desc {
  position: relative;
  padding-left: 12px;
  font-size: 12px;
  line-height: 20px;
  color: #666;
}

.benefit-box-desc::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 4px;
  height: 4px;
  border-radius: 4px;
  background: #c0c4cc;
}

.seat-box {
  margin-top: 10px;
  width: 520px;
  max-width: 100%;
  border: 1px dashed #dcdfe6;
  border-radius: 10px;
  padding: 14px 16px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fbfcff 0%, #ffffff 100%);
}

.seat-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  line-height: 20px;
  color: #666;
}

.seat-row+.seat-row {
  margin-top: 8px;
}

.seat-label {
  color: #666;
}

.seat-value {
  color: #101010;
  font-weight: 700;
}

.seat-note {
  color: #999;
}

.block-actions {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.muted-btn {
  color: #666 !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .member-center-container {
    padding: 14px 12px 28px;
  }

  .page-toolbar {
    margin-bottom: 10px;
  }

  .plan-section {
    padding: 16px 14px 14px;
    border-radius: 12px;
  }

  .plan-header {
    flex-direction: column;
    gap: 8px;
  }

  .benefit-box,
  .seat-box {
    width: 100%;
  }
}
</style>
