<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="800px"
    :before-close="handleClose"
    append-to-body
    :close-on-click-modal="false"
    class="month-statistic-dialog"
  >
    <span slot="title">月度统计</span>

    <div class="statistic-content">

      <!-- 统计数据展示 -->
      <div v-for="item in statisticData" :key="item.title" class="month-data-item">
        <div class="month-data-text">
          <span>{{ item.title }}:</span>
          <div>
            <span>{{ item.actualValue }} {{ item.key === 'totalSTH' ? '万' : item.unit }}</span>
            <span style="padding-left: 5px;">{{ item.planValue || 0 }} {{ item.key === 'totalSTH' ? '万' : item.unit }}</span>
          </div>
        </div>
        <el-progress :percentage="item.percent || 0" :color="item.color" :show-text="false"></el-progress>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">关闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData } from '@/api/common.js'
import { statisticKeyToTitle, unitConversion } from "../../statisticKeyToTitle";

export default {
  name: 'MonthStatisticDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      // 兼容 v-model 用法
      type: Boolean,
      default: undefined
    },
    // 运动员ID
    triUserId: {
      type: String,
      default: ''
    },
    // 当前月份 (yyyy-MM格式)
    currentMonth: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      selectedMonth: '',
      sthData: {},
      statisticData: []
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    value(val) {
      if (typeof val !== 'undefined') this.innerVisible = val
    },
    innerVisible(val) {
      this.$emit('update:visible', val)
      this.$emit('input', val)
      if (val) {
        // 使用传入的currentMonth，如果没有则使用当前月份
        this.selectedMonth = this.currentMonth || this.getCurrentMonth()
        this.getMonthStatisticData()
      }
    },
    currentMonth(val) {
      // 当传入的月份变化时，更新selectedMonth并重新获取数据
      if (val && this.innerVisible) {
        this.selectedMonth = val
        this.getMonthStatisticData()
      }
    }
  },
  methods: {
    // 获取当前月份
    getCurrentMonth() {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    // 获取月度统计数据
    getMonthStatisticData() {
      if (!this.selectedMonth) return

      // 计算月份的开始和结束日期
      const [year, month] = this.selectedMonth.split('-')
      const startDate = `${year}-${month}-01`
      // 计算月份最后一天
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`

      getData({
        url: '/api/classSchedule/getStatistics',
        begin: startDate,
        end: endDate,
        triUserId: this.triUserId || 'ba10bb5a47f24cdda9f20a49492c3cb3'
      }).then(res => {
        if (res.success) {
          this.statisticData = res.result.statisticsVoList.map(item => {
            const actualValue = item.key === 'totalSTH' ? Math.round(item.actualValue / 100) / 100 : item.actualValue
            const planValue = item.key === 'totalSTH' ? Math.round(item.planValue / 100) / 100 : item.planValue
            return {
              ...item,
              actualValue: unitConversion(actualValue, statisticKeyToTitle[item.key]?.unit),
              title: statisticKeyToTitle[item.key]?.title,
              color: statisticKeyToTitle[item.key]?.color,
              icon: statisticKeyToTitle[item.key]?.icon,
              unit: statisticKeyToTitle[item.key]?.unit,
              planValue
            }
          })
          this.sthData = res.result.avgSthRespDto
        }
      }).catch(error => {
        console.error('获取月度统计数据失败:', error)
        this.$message.error('获取月度统计数据失败')
      })
    },
    // 月份变化处理
    onMonthChange() {
      this.getMonthStatisticData()
    },
    handleClose() {
      this.onCancel()
    },
    onCancel() {
      this.innerVisible = false
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.month-statistic-dialog ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}

.month-statistic-dialog ::v-deep(.el-dialog__body) {
  padding: 20px 36px;
}

.month-selector {
  margin-bottom: 20px;
  text-align: center;
}

.month-picker {
  width: 200px;
}

.statistic-content {
  padding: 20px 0;
}

.month-data-sth {
  display: flex;
  flex-direction: row;
  gap: 2px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.month-data-sth > div {
  width: 100px;
  text-align: center;
  color: #fff;
  font-size: 12px;
  line-height: 22px;
  display: flex;
  flex-direction: column;
}

.month-data-sth > div span:nth-child(1) {
  background-color: rgba(255, 255, 255, 0.46);
}

.month-data-sth > div:nth-child(1) {
  padding: 4px 0 0 4px;
  border-radius: 6px 0 0 6px;
  background-color: rgba(93, 187, 246, 1);
}

.month-data-sth > div:nth-child(1) span:nth-child(1) {
  border-radius: 6px 0 0 6px;
}

.month-data-sth > div:nth-child(2) {
  padding: 4px 4px 6px 4px;
  border-radius: 6px;
  background-color: rgba(204, 35, 35, 1);
}

.month-data-sth > div:nth-child(2) span:nth-child(1) {
  border-radius: 6px;
}

.month-data-sth > div:nth-child(3) {
  padding: 4px 4px 0 0;
  border-radius: 0 6px 6px 0;
  background-color: rgba(255, 181, 105, 1);
}

.month-data-sth > div:nth-child(3) span:nth-child(1) {
  border-radius: 0 6px 6px 0;
}

.month-data-item {
  margin-bottom: 15px;
}

.month-data-text {
  display: flex;
  flex-direction: row;
  gap: 5px;
  margin-bottom: 4px;
}

.month-data-text div {
  text-align: right;
}

.month-data-text span,
.month-data-text div {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.month-data-text span:nth-child(2) {
  color: #999;
}

.month-data-text > span {
  font-family: PingFangSC, PingFang SC;
  font-weight: 500;
  color: #000000;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

.dialog-footer .el-button {
  min-width: 120px;
  border-radius: 22px;
}
</style>
