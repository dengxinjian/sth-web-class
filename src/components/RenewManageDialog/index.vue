<template>
  <div class="vip-dialog-mask renew-manage-mask" v-if="innerVisible">
    <div class="mask-container" :class="editionMaskClass">
      <div class="container-top-box">
        <div class="container-top-box-title">续费管理</div>
        <img
          src="~@/assets/plan/close.png"
          alt=""
          class="close-icon"
          @click="onCancel" />
      </div>
      <div class="container-content renew-manage-content">
        <div v-loading="loading" class="renew-manage-body">
          <div class="edition-header" :class="editionHeaderClass">
            {{ editionName }}
          </div>
          <div v-if="summary.payType != null" class="summary-row">
            <span class="summary-item">
              <span class="summary-label">支付方式：</span>
              <span class="summary-value">{{ formatPayType(summary.payType) }}</span>
            </span>
            <span class="summary-item">
              <span class="summary-label">支付金额：</span>
              <span class="summary-value">¥{{ formatAmount(summary.orderAmount) }}</span>
            </span>
            <span class="summary-item">
              <span class="summary-label">到期时间：</span>
              <span class="summary-value">{{ formatDate(summary.expireTime) }}</span>
            </span>
          </div>
          <div v-else-if="!loading && records.length === 0" class="summary-empty">
            暂无付款记录
          </div>

          <div class="table-title">付款记录</div>
          <el-table
            :data="records"
            border
            stripe
            size="small"
            class="record-table">
            <el-table-column prop="outTradeNo" label="订单号" min-width="140" show-overflow-tooltip />
            <el-table-column label="订单类型" width="90">
              <template slot-scope="{ row }">{{ formatTradeType(row.tradeType) }}</template>
            </el-table-column>
            <el-table-column label="时长" width="90">
              <template slot-scope="{ row }">{{ formatSubscribeType(row.subscribeType) }}</template>
            </el-table-column>
            <el-table-column label="生效时间" width="165">
              <template slot-scope="{ row }">{{ formatDate(row.effectTime) }}</template>
            </el-table-column>
            <el-table-column label="失效时间" width="165">
              <template slot-scope="{ row }">{{ formatDate(row.expireTime) }}</template>
            </el-table-column>
            <el-table-column label="订单状态" width="100">
              <template slot-scope="{ row }">{{ formatPayStatus(row.payStatus) }}</template>
            </el-table-column>
            <el-table-column label="订单金额(元)" width="110" align="right">
          <template slot-scope="{ row }">{{ formatAmount(row.orderAmount) }}</template>
            </el-table-column>
            <el-table-column label="下单时间" width="165">
              <template slot-scope="{ row }">{{ formatDate(row.orderTime) }}</template>
            </el-table-column>
            <el-table-column label="支付时间" width="165">
              <template slot-scope="{ row }">{{ formatDate(row.payTime) }}</template>
            </el-table-column>
          </el-table>

          <div class="dialog-footer-row">
            <div class="footer-note">
              说明：开票请前往相关开票页面
            </div>
            <el-pagination
              v-if="pagination.total > 0"
              :current-page="pagination.pageNo"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              layout="prev, pager, next"
              prev-text="上一页"
              next-text="下一页"
              class="renew-pagination"
              :class="editionPaginationClass"
              @current-change="onPageChange" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getData } from "@/api/common"

export default {
  name: "RenewManageDialog",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: false },
    /** 身份类型：R 精英版，C 专业版 */
    identityType: { type: String, default: "C" },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      loading: false,
      records: [],
      summary: {},
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0,
      },
      outTradeNo: "",
    }
  },
  computed: {
    editionName() {
      return this.identityType === "R" ? "精英版" : "专业版"
    },
    editionHeaderClass() {
      return this.identityType === "R"
        ? "edition-header--elite"
        : "edition-header--pro"
    },
    editionMaskClass() {
      return this.identityType === "R"
        ? "mask-container--elite"
        : "mask-container--pro"
    },
    editionPaginationClass() {
      return this.identityType === "R"
        ? "renew-pagination--elite"
        : "renew-pagination--pro"
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val
      if (val) {
        this.fetchLatestRecord()
        this.fetchList()
      }
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val
      if (this.innerVisible) {
        this.fetchLatestRecord()
        this.fetchList()
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val)
      this.$emit("input", val)
    },
  },
  methods: {
    onCancel() {
      this.innerVisible = false
    },
    formatDate(val) {
      if (val == null || val === "") return "-"
      let d
      if (typeof val === "number") {
        d = new Date(val < 1e12 ? val * 1000 : val)
      } else if (typeof val === "string") {
        // 接口返回 ISO 字符串，如 2026-03-09T10:45:23
        // 直接用 Date 解析；若失败再尝试替换 T / -
        d = new Date(val)
        if (Number.isNaN(d.getTime())) {
          d = new Date(val.replace("T", " ").replace(/-/g, "/"))
        }
      } else {
        return "-"
      }
      if (Number.isNaN(d.getTime())) return "-"
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const h = String(d.getHours()).padStart(2, "0")
      const min = String(d.getMinutes()).padStart(2, "0")
      const s = String(d.getSeconds()).padStart(2, "0")
      return `${y}-${m}-${day} ${h}:${min}:${s}`
    },
    formatPayType(v) {
      const n = Number(v)
      if (n === 1) return "微信"
      if (n === 2) return "支付宝"
      return "-"
    },
    formatSubscribeType(v) {
      const n = Number(v)
      if (n === 1) return "月卡"
      if (n === 2) return "连续包月"
      if (n === 3) return "年卡"
      if (n === 4) return "连续包年"
      return "-"
    },
    formatTradeType(v) {
      const n = Number(v)
      if (n === 1) return "订阅"
      if (n === 2) return "续费"
      if (n === 3) return "购买席位"
      return "-"
    },
    formatPayStatus(v) {
      const n = Number(v)
      if (n === 1) return "支付成功"
      if (n === 0) return "待支付"
      if (n === 2) return "支付失败"
      if (n === 3) return "退款成功"
      return "-"
    },
    formatAmount(v) {
      if (v == null) return "0.00"
      const n = Number(v)
      if (Number.isNaN(n)) return "0.00"
      // 后端金额以分为单位，统一转成元展示
      return (n / 100).toFixed(2)
    },
    async fetchLatestRecord() {
      if (!this.identityType) return
      try {
        const params = {
          url: "consumer/api/vipPay/getLatestTradeRecord",
          identityType: this.identityType,
        }
        const res = await getData(params)
        if (res && res.success && res.result) {
          const latest = res.result
          this.summary = {
            payType: latest.payType,
            orderAmount: latest.orderAmount,
            expireTime: latest.expireTime,
          }
        } else {
          this.summary = {}
        }
      } catch (e) {
        this.summary = {}
      }
    },
    async fetchList() {
      if (!this.identityType) return
      this.loading = true
      try {
        const params = {
          url: "consumer/api/vipPay/listTradeRecords",
          identityType: this.identityType,
          pageNo: this.pagination.pageNo,
          pageSize: this.pagination.pageSize,
        }
        if (this.outTradeNo) params.outTradeNo = this.outTradeNo
        const res = await getData(params)
        if (res && res.success && res.result) {
          const result = res.result
          this.records = result.records || []
          this.pagination.total = Number(result.total) || 0
          this.pagination.pageNo = Number(result.pageNo) || 1
          this.pagination.pageSize = Number(result.pageSize) || 10
        } else {
          this.records = []
          this.pagination.total = 0
        }
      } catch (e) {
        this.records = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },
    onPageChange(page) {
      this.pagination.pageNo = page
      this.fetchList()
    },
  },
}
</script>

<style scoped lang="scss">
.vip-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .mask-container {
    width: 980px;
    min-height: 460px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 100% auto;

    &.mask-container--pro {
      background-image: url("~@/assets/professional_vip.png");
    }

    &.mask-container--elite {
      background-image: url("~@/assets/Rectangle3031.png");
    }

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
      min-height: 360px;
      background: #fff;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      padding: 16px 24px 24px;
      box-sizing: border-box;
      position: relative;
    }
  }
}
.renew-manage-body {
  min-height: 200px;
}
.edition-header {
  font-size: 16px;
  font-weight: 700;
  color: #101010;
  margin-bottom: 12px;
  padding-left: 10px;
  position: relative;
}
.edition-header::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  width: 4px;
  height: 18px;
  border-radius: 2px;
}
.edition-header--elite::before {
  background: linear-gradient(180deg, #008867 0%, #2bb673 100%);
}
.edition-header--pro::before {
  background: linear-gradient(180deg, #b81300 0%, #f92b30 100%);
}
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: #fafbff;
  border-radius: 8px;
  font-size: 14px;
}
.summary-item {
  .summary-label {
    color: #666;
  }
  .summary-value {
    color: #101010;
    font-weight: 600;
  }
}
.summary-empty {
  color: #999;
  font-size: 14px;
  margin-bottom: 16px;
}
.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #101010;
  margin-bottom: 10px;
}
.record-table {
  margin-bottom: 16px;
}
.dialog-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.footer-note {
  font-size: 12px;
  color: #999;
}
.renew-pagination {
  display: flex;
  justify-content: flex-end;
}
.renew-pagination ::v-deep(.el-pagination) {
  font-weight: normal;
}
// .renew-pagination--pro ::v-deep(.el-pager li.active) {
//   background-color: #b81300;
// }
.renew-pagination--elite ::v-deep(.el-pager li.active) {
  color: #008867;
}
</style>
