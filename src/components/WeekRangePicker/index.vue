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
      monthWeeks: [],
      // 内部程序切换年份时，避免 watcher 重置周索引
      skipYearWatch: false
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
      if (this.skipYearWatch) {
        console.log('skipYearWatch=true, 跳过年份watcher')
        return
      }
      console.log('年份watcher触发，重置为第1周')
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
    setYearMonth(year, month, after) {
      // 标记跳过年份 watcher，防止重置周索引
      this.skipYearWatch = true
      console.log('setYearMonth 开始，skipYearWatch=true')
      this.selectedYear = year
      this.selectedMonth = month
      this.recomputeWeeks(() => {
        if (typeof after === 'function') after()
        // 使用 $nextTick 确保 watcher 在 skipYearWatch=false 之前执行
        this.$nextTick(() => {
          this.skipYearWatch = false
          console.log('setYearMonth 完成，skipYearWatch=false')
        })
      })
    },
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
      // 优先使用「周一所在的年月」显示，找不到再回退到「今天所在的年月」
      const mondayYear = thisMonday.getFullYear()
      const mondayMonth = thisMonday.getMonth() + 1
      const todayYear = today.getFullYear()
      const todayMonth = today.getMonth() + 1

      console.log('===== goThisWeek 调试 =====')
      console.log('today:', this.formatDate(today))
      console.log('thisMonday:', this.formatDate(thisMonday))
      console.log('mondayYear:', mondayYear, 'mondayMonth:', mondayMonth)
      console.log('todayYear:', todayYear, 'todayMonth:', todayMonth)
      console.log('当前选择:', this.selectedYear, '年', this.selectedMonth, '月', '第', this.selectedWeekIndex + 1, '周')

      this.navigateToDateWithFallback(thisMonday, mondayYear, mondayMonth, todayYear, todayMonth)
    },
    navigateToDateWithFallback(targetDate, preferredYear, preferredMonth, fallbackYear = null, fallbackMonth = null) {
      const targetStr = this.formatDate(targetDate)
      console.log('navigateToDateWithFallback 调试:')
      console.log('  targetDate:', targetStr)
      console.log('  preferredYear:', preferredYear, 'preferredMonth:', preferredMonth)
      console.log('  fallbackYear:', fallbackYear, 'fallbackMonth:', fallbackMonth)

      // 先在首选的年月中查找目标周
      this.setYearMonth(preferredYear, preferredMonth, () => {
        console.log('  首选月份周列表:', this.monthWeeks.map(w => `${w.monday}~${w.sunday}`).join(' | '))
        let idx = this.findWeekIndexContainingDate(targetDate)
        console.log('  字符串匹配结果 idx:', idx)
        if (idx < 0) {
          // 兜底：使用时间戳比较，避免字符串比较边界问题
          idx = this.findWeekIndexByDateValue(targetDate)
          console.log('  时间戳兜底匹配结果 idx:', idx)
        }
        // 如果找不到且提供了后备年月，则尝试后备
        if (idx < 0 && fallbackYear !== null && fallbackMonth !== null) {
          if (fallbackYear !== preferredYear || fallbackMonth !== preferredMonth) {
            console.log('  切换到后备年月:', fallbackYear, fallbackMonth)
            this.setYearMonth(fallbackYear, fallbackMonth, () => {
              console.log('  后备月份周列表:', this.monthWeeks.map(w => `${w.monday}~${w.sunday}`).join(' | '))
              idx = this.findWeekIndexContainingDate(targetDate)
              if (idx < 0) {
                idx = this.findWeekIndexByDateValue(targetDate)
              }
              console.log('  后备月份最终 idx:', idx)
              this.selectedWeekIndex = idx >= 0 ? idx : 0
              console.log('  最终选择:', this.selectedYear, '年', this.selectedMonth, '月', '第', this.selectedWeekIndex + 1, '周')
              this.emitWeekChange()
            })
            return
          }
        }
        this.selectedWeekIndex = idx >= 0 ? idx : 0
        console.log('  最终选择:', this.selectedYear, '年', this.selectedMonth, '月', '第', this.selectedWeekIndex + 1, '周')
        this.emitWeekChange()
      })
    },
    navigateToDate(targetDate) {
      // 根据目标日期更新 年/月/周
      const targetYear = targetDate.getFullYear()
      const targetMonth = targetDate.getMonth() + 1
      // 只有当目标年份/月份与当前选择不同时才更新
      if (this.selectedYear !== targetYear || this.selectedMonth !== targetMonth) {
        this.setYearMonth(targetYear, targetMonth, () => {
          let idx = this.findWeekIndexContainingDate(targetDate)
          if (idx < 0) {
            idx = this.findWeekIndexByDateValue(targetDate)
          }
          this.selectedWeekIndex = idx >= 0 ? idx : 0
          this.emitWeekChange()
        })
      } else {
        // 如果年份月份相同，只需要更新周索引
        let idx = this.findWeekIndexContainingDate(targetDate)
        if (idx < 0) {
          idx = this.findWeekIndexByDateValue(targetDate)
        }
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
    },
    // 使用时间戳比较，避免字符串比较边界问题
    findWeekIndexByDateValue(date) {
      const ts = date.getTime()
      for (let i = 0; i < this.monthWeeks.length; i += 1) {
        const w = this.monthWeeks[i]
        const start = this.parseDate(w.monday).getTime()
        const end = this.parseDate(w.sunday).getTime()
        if (ts >= start && ts <= end) return i
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

