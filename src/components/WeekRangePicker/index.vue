<template>
  <div class="week-range-picker">
    <span style="white-space: nowrap;">日期：</span>
    <el-select v-model="selectedYear" size="mini" placeholder="选择年份" @change="handleSelectionChange" class="mr-8" style="width: 100px">
      <el-option
        v-for="year in yearOptions"
        :key="year"
        :label="year + '年'"
        :value="year"
      />
    </el-select>

    <el-select v-model="selectedMonth" size="mini" placeholder="选择月份" @change="handleMonthChange" class="mr-8" style="width: 100px">
      <el-option
        v-for="m in 12"
        :key="m"
        :label="m + '月'"
        :value="m"
      />
    </el-select>

    <el-select class="mr-8" v-model="selectedWeekIndex" size="mini" placeholder="选择第几周" @change="handleSelectionChange" style="width: 100px">
      <el-option
        v-for="(w, idx) in monthWeeks"
        :key="idx"
        :label="'第' + (idx + 1) + '周'"
        :value="idx"
      />
    </el-select>
    <el-button type="text" size="mini" class="mr-8" @click="goPrevWeek">前一周</el-button>
    <el-button type="text" size="mini" class="mr-8" @click="goThisWeek">当周</el-button>
    <el-button type="text" size="mini" @click="goNextWeek">下一周</el-button>
  </div>

</template>

<script>
export default {
  name: 'WeekRangePicker',
  props: {
    minYear: {
      type: Number,
      default: () => new Date().getFullYear() - 5
    },
    maxYear: {
      type: Number,
      default: () => new Date().getFullYear() + 5
    },
    valueFormat: {
      // 返回日期的格式，暂仅支持 'YYYY-MM-DD'
      type: String,
      default: 'YYYY-MM-DD'
    }
  },
  data() {
    const now = new Date()
    return {
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1, // 1-12
      selectedWeekIndex: 0,
      monthWeeks: []
    }
  },
  computed: {
    yearOptions() {
      const options = []
      for (let y = this.minYear; y <= this.maxYear; y += 1) {
        options.push(y)
      }
      return options
    }
  },
  watch: {
    selectedYear() {
      this.recomputeWeeks(() => {
        // 年份改变后，默认选择第1周
        this.selectedWeekIndex = 0
        this.emitWeekChange()
      })
    }
  },
  mounted() {
    this.recomputeWeeks(() => {
      // 将当前日期对应的周设为默认
      const today = new Date()
      if (
        this.selectedYear === today.getFullYear() &&
        this.selectedMonth === today.getMonth() + 1
      ) {
        const currentIndex = this.findWeekIndexContainingDate(today)
        if (currentIndex >= 0) {
          this.selectedWeekIndex = currentIndex
        }
      }
      this.emitWeekChange()
    })
  },
  methods: {
    handleMonthChange() {
      this.recomputeWeeks(() => {
        // 调整后默认选择第1周
        this.selectedWeekIndex = 0
        this.emitWeekChange()
      })
    },
    handleSelectionChange() {
      this.emitWeekChange()
    },
    goPrevWeek() {
      if (!this.monthWeeks.length) return
      const currentWeek = this.monthWeeks[this.selectedWeekIndex]
      const prevMonday = this.addDays(this.parseDate(currentWeek.monday), -7)
      this.navigateToDate(prevMonday)
    },
    goNextWeek() {
      if (!this.monthWeeks.length) return
      const currentWeek = this.monthWeeks[this.selectedWeekIndex]
      const nextMonday = this.addDays(this.parseDate(currentWeek.monday), 7)
      this.navigateToDate(nextMonday)
    },
    goThisWeek() {
      const today = new Date()
      const thisMonday = this.getMonday(today)
      this.navigateToDate(thisMonday)
    },
    navigateToDate(targetDate) {
      // 根据目标日期更新 年/月/周
      const targetYear = targetDate.getFullYear()
      const targetMonth = targetDate.getMonth() + 1
      // 只有当目标年份/月份与当前选择不同时才更新
      if (this.selectedYear !== targetYear || this.selectedMonth !== targetMonth) {
        this.selectedYear = targetYear
        this.selectedMonth = targetMonth
        this.recomputeWeeks(() => {
          const idx = this.findWeekIndexContainingDate(targetDate)
          this.selectedWeekIndex = idx >= 0 ? idx : 0
          this.emitWeekChange()
        })
      } else {
        // 如果年份月份相同，只需要更新周索引
        const idx = this.findWeekIndexContainingDate(targetDate)
        if (idx >= 0 && this.selectedWeekIndex !== idx) {
          this.selectedWeekIndex = idx
          this.emitWeekChange()
        }
      }
    },
    emitWeekChange() {
      if (!this.monthWeeks.length) return
      const currentWeek = this.monthWeeks[this.selectedWeekIndex]
      const nextWeekStart = this.addDays(this.parseDate(currentWeek.monday), 7)
      const nextWeekDates = this.getWeekDates(nextWeekStart)
      this.$emit('week-change', {
        currentWeek: {
          list: this.getWeekDates(this.parseDate(currentWeek.monday)),
          monday: currentWeek.monday,
          sunday: currentWeek.sunday
        },
        nextWeek: {
          list: nextWeekDates,
          monday: nextWeekDates[0],
          sunday: nextWeekDates[6]
        },
        meta: {
          year: this.selectedYear,
          month: this.selectedMonth,
          weekIndex: this.selectedWeekIndex
        }
      })
    },
    recomputeWeeks(after) {
      this.monthWeeks = this.computeWeeksForMonth(this.selectedYear, this.selectedMonth)
      if (typeof after === 'function') after()
    },
    computeWeeksForMonth(year, month) {
      // month: 1-12
      const firstDayOfMonth = new Date(year, month - 1, 1)
      const lastDayOfMonth = new Date(year, month, 0)
      const firstMonday = this.getMonday(firstDayOfMonth)
      const weeks = []
      let weekStart = new Date(firstMonday)
      while (weekStart <= lastDayOfMonth || weeks.length === 0) {
        const days = this.getWeekDates(weekStart)
        weeks.push({
          monday: days[0],
          sunday: days[6],
          days
        })
        weekStart = this.addDays(weekStart, 7)
        // 保障至少覆盖到当月最后一天所在的周
        if (weekStart > lastDayOfMonth && weeks[weeks.length - 1].sunday >= this.formatDate(lastDayOfMonth)) {
          break
        }
      }
      return weeks
    },
    getWeekDates(mondayDate) {
      const days = []
      for (let i = 0; i < 7; i += 1) {
        const d = this.addDays(mondayDate, i)
        days.push(this.formatDate(d))
      }
      return days
    },
    getMonday(date) {
      const d = new Date(date)
      const day = d.getDay() // 0-6, 0 为周日
      const diff = (day === 0 ? -6 : 1 - day) // 移动到周一
      d.setDate(d.getDate() + diff)
      d.setHours(0, 0, 0, 0)
      return d
    },
    addDays(date, n) {
      const d = new Date(date)
      d.setDate(d.getDate() + n)
      return d
    },
    formatDate(date) {
      if (this.valueFormat !== 'YYYY-MM-DD') {
        // 目前仅实现 YYYY-MM-DD
      }
      const y = date.getFullYear()
      const m = `${date.getMonth() + 1}`.padStart(2, '0')
      const dd = `${date.getDate()}`.padStart(2, '0')
      return `${y}-${m}-${dd}`
    },
    parseDate(yyyyMMdd) {
      const [y, m, d] = yyyyMMdd.split('-').map(n => parseInt(n, 10))
      return new Date(y, m - 1, d)
    },
    findWeekIndexContainingDate(date) {
      const target = this.formatDate(date)
      for (let i = 0; i < this.monthWeeks.length; i += 1) {
        const w = this.monthWeeks[i]
        if (target >= w.monday && target <= w.sunday) return i
      }
      return -1
    }
  }
}
</script>

<style scoped>
.week-range-picker {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}
.mr-8 {
  margin-right: 8px;
}
</style>

