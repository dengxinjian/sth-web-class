<template>
  <div class="week-range-picker-wrapper">
    <!-- 触发器 - 日期导航条 -->
    <div class="picker-trigger">
      <div class="trigger-left" @click="toggleCalendar">
        <span class="date-display"
          >{{ selectedYear }}年{{ selectedMonth }}月</span
        >
        <i class="el-icon-caret-top" v-if="showCalendar"></i>
        <i class="el-icon-caret-bottom" v-else></i>
      </div>
      <div class="trigger-right">
        <span class="nav-arrow" @click.stop="goPrevWeek">&lt;</span>
        <span class="nav-arrow" @click.stop="goNextWeek">&gt;</span>

        <button class="today-button" @click.stop="goThisWeek">当周</button>
      </div>
    </div>

    <!-- 日历弹窗 -->
    <div v-if="showCalendar" class="calendar-popup" @click.stop>
      <div class="week-range-picker-calendar">
        <!-- 日历标题 -->
        <div class="calendar-title">
          <span class="nav-arrow" @click.stop="goPrevMonthInCalendar"
            >&lt;</span
          >
          <div class="date-text">
            <select
              class="year-select"
              :value="selectedYear"
              @change="handleYearChangeInCalendar"
              @click.stop
            >
              <option v-for="year in yearOptions" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
            <select
              class="month-select"
              :value="selectedMonth"
              @change="handleMonthChangeInCalendar"
              @click.stop
            >
              <option v-for="month in monthOptions" :key="month" :value="month">
                {{ month }}月
              </option>
            </select>
          </div>
          <span class="nav-arrow" @click.stop="goNextMonthInCalendar"
            >&gt;</span
          >
        </div>

        <!-- 星期表头 -->
        <div class="calendar-weekdays">
          <div class="weekday">一</div>
          <div class="weekday">二</div>
          <div class="weekday">三</div>
          <div class="weekday">四</div>
          <div class="weekday">五</div>
          <div class="weekday">六</div>
          <div class="weekday">日</div>
        </div>

        <!-- 日期网格 -->
        <div class="calendar-dates">
          <div
            v-for="(date, index) in calendarDates"
            :key="index"
            :class="[
              'date-cell',
              {
                'is-other-month': !date.isCurrentMonth,
                'is-today': date.isToday,
                'is-selected': date.isSelected,
                'is-in-range': date.isInRange,
              },
            ]"
            @click="handleDateClick(date)"
          >
            {{ date.day }}
          </div>
        </div>

        <!-- 底部信息栏 -->
        <div class="calendar-footer">
          <div class="week-info">
            <span v-if="selectedWeekRange.start && selectedWeekRange.end">
              已选择：{{ selectedWeekRange.start }} 至
              {{ selectedWeekRange.end }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "WeekRangePicker",
  props: {
    minYear: {
      type: Number,
      default: () => new Date().getFullYear() - 10,
    },
    maxYear: {
      type: Number,
      default: () => new Date().getFullYear() + 10,
    },
    valueFormat: {
      // 返回日期的格式，暂仅支持 'YYYY-MM-DD'
      type: String,
      default: "YYYY-MM-DD",
    },
  },
  data() {
    const now = new Date();
    return {
      selectedYear: now.getFullYear(),
      selectedMonth: now.getMonth() + 1, // 1-12
      selectedWeekIndex: 0,
      monthWeeks: [],
      selectedWeekRange: {
        start: null,
        end: null,
      },
      selectedDates: [], // 选中的日期列表
      showCalendar: false, // 控制日历显示/隐藏
      // 内部程序切换年份时，避免 watcher 重置周索引
      skipYearWatch: false,
    };
  },
  computed: {
    // 显示在输入框中的值
    displayValue() {
      if (this.selectedWeekRange.start && this.selectedWeekRange.end) {
        return `${this.selectedWeekRange.start} 至 ${this.selectedWeekRange.end}`;
      }
      return "";
    },
    yearOptions() {
      const options = [];
      for (let y = this.minYear; y <= this.maxYear; y += 1) {
        options.push(y);
      }
      return options;
    },
    monthOptions() {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    },
    // 计算日历日期数组
    calendarDates() {
      const dates = [];
      const year = this.selectedYear;
      const month = this.selectedMonth;

      // 获取当月第一天和最后一天
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);

      // 获取当月第一天是星期几（0-6，0是周日）
      let firstDayOfWeek = firstDay.getDay();
      // 转换为周一开始（0-6，0是周一）
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      // 获取今天的日期用于比较
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 填充上个月的日期
      const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 2, day);
        const dateStr = this.formatDate(date);
        const isToday = date.getTime() === today.getTime();
        const isSelected = this.selectedDates.includes(dateStr);
        const isInRange = this.isDateInSelectedWeek(dateStr);

        dates.push({
          day,
          date,
          dateStr,
          isCurrentMonth: false,
          isToday,
          isSelected,
          isInRange,
        });
      }

      // 填充当月的日期
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const dateStr = this.formatDate(date);
        const isToday = date.getTime() === today.getTime();
        const isSelected = this.selectedDates.includes(dateStr);
        const isInRange = this.isDateInSelectedWeek(dateStr);

        dates.push({
          day,
          date,
          dateStr,
          isCurrentMonth: true,
          isToday,
          isSelected,
          isInRange,
        });
      }

      // 填充下个月的日期，确保总共显示6周（42天）
      const remainingDays = 42 - dates.length;
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = this.formatDate(date);
        const isToday = date.getTime() === today.getTime();
        const isSelected = this.selectedDates.includes(dateStr);
        const isInRange = this.isDateInSelectedWeek(dateStr);

        dates.push({
          day,
          date,
          dateStr,
          isCurrentMonth: false,
          isToday,
          isSelected,
          isInRange,
        });
      }

      return dates;
    },
  },
  watch: {
    selectedYear() {
      // 如果是在日历弹窗中修改，不触发 watch
      if (this.skipYearWatch || this.showCalendar) {
        return;
      }
      this.recomputeWeeks(() => {
        // 年份改变后，默认选择第1周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },
  },
  mounted() {
    this.recomputeWeeks(() => {
      // 将当前日期对应的周设为默认
      const today = new Date();
      if (
        this.selectedYear === today.getFullYear() &&
        this.selectedMonth === today.getMonth() + 1
      ) {
        const currentIndex = this.findWeekIndexContainingDate(today);
        if (currentIndex >= 0) {
          this.selectedWeekIndex = currentIndex;
        }
      }
      this.updateSelectedWeek();
    });
  },
  beforeDestroy() {
    // 清理事件监听器
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    // 切换日历显示/隐藏
    toggleCalendar() {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        // 显示日历时，添加全局点击监听来关闭日历
        this.$nextTick(() => {
          document.addEventListener("click", this.handleClickOutside);
        });
      } else {
        document.removeEventListener("click", this.handleClickOutside);
      }
    },

    // 点击外部关闭日历
    handleClickOutside(event) {
      const wrapper = this.$el;
      if (wrapper && !wrapper.contains(event.target)) {
        this.showCalendar = false;
        document.removeEventListener("click", this.handleClickOutside);
      }
    },

    // 日期点击处理
    handleDateClick(dateObj) {
      if (!dateObj.isCurrentMonth) {
        // 如果点击的是其他月份的日期，跳转到对应月份
        const clickedDate = dateObj.date;
        this.selectedYear = clickedDate.getFullYear();
        this.selectedMonth = clickedDate.getMonth() + 1;
        // 重新计算周，但不关闭日历
        this.recomputeWeeks(() => {
          const monday = this.getMonday(dateObj.date);
          this.selectWeekByDate(monday);
        });
        return;
      }

      // 获取点击日期所在的周
      const monday = this.getMonday(dateObj.date);
      this.selectWeekByDate(monday);

      // 选择完成后关闭日历
      this.showCalendar = false;
      document.removeEventListener("click", this.handleClickOutside);
    },

    // 根据日期选择对应的周
    selectWeekByDate(date) {
      const dateStr = this.formatDate(date);
      const weekIndex = this.findWeekIndexContainingDate(date);

      if (weekIndex >= 0) {
        this.selectedWeekIndex = weekIndex;
        const week = this.monthWeeks[weekIndex];
        this.selectedWeekRange = {
          start: week.monday,
          end: week.sunday,
        };
        this.selectedDates = week.days;
        this.emitWeekChange();
      }
    },

    // 判断日期是否在选中的周内
    isDateInSelectedWeek(dateStr) {
      return this.selectedDates.includes(dateStr);
    },

    // 前一年
    goPrevYear() {
      this.selectedYear--;
      this.recomputeWeeks(() => {
        this.updateSelectedWeek();
      });
    },

    // 后一年
    goNextYear() {
      this.selectedYear++;
      this.recomputeWeeks(() => {
        this.updateSelectedWeek();
      });
    },

    // 前一月
    goPrevMonth() {
      if (this.selectedMonth === 1) {
        this.selectedYear--;
        this.selectedMonth = 12;
      } else {
        this.selectedMonth--;
      }
      this.recomputeWeeks(() => {
        this.updateSelectedWeek();
      });
    },

    // 后一月
    goNextMonth() {
      if (this.selectedMonth === 12) {
        this.selectedYear++;
        this.selectedMonth = 1;
      } else {
        this.selectedMonth++;
      }
      this.recomputeWeeks(() => {
        this.updateSelectedWeek();
      });
    },

    // 日历中的前一月
    goPrevMonthInCalendar() {
      if (this.selectedMonth === 1) {
        this.selectedYear--;
        this.selectedMonth = 12;
      } else {
        this.selectedMonth--;
      }
      this.recomputeWeeks(() => {
        // 切换月份后，选择该月的第一周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },

    // 日历中的后一月
    goNextMonthInCalendar() {
      if (this.selectedMonth === 12) {
        this.selectedYear++;
        this.selectedMonth = 1;
      } else {
        this.selectedMonth++;
      }
      this.recomputeWeeks(() => {
        // 切换月份后，选择该月的第一周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },

    // 处理日历中年份选择变化
    handleYearChangeInCalendar(event) {
      this.selectedYear = parseInt(event.target.value, 10);
      this.recomputeWeeks(() => {
        // 切换年份后，选择该月的第一周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },

    // 处理日历中月份选择变化
    handleMonthChangeInCalendar(event) {
      this.selectedMonth = parseInt(event.target.value, 10);
      this.recomputeWeeks(() => {
        // 切换月份后，选择该月的第一周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },

    // 更新选中的周
    updateSelectedWeek() {
      if (this.monthWeeks.length > 0) {
        // 确保 selectedWeekIndex 在有效范围内
        if (this.selectedWeekIndex >= this.monthWeeks.length) {
          this.selectedWeekIndex = 0;
        }
        const week = this.monthWeeks[this.selectedWeekIndex];
        this.selectedWeekRange = {
          start: week.monday,
          end: week.sunday,
        };
        this.selectedDates = week.days;
        this.emitWeekChange();
      }
    },

    setYearMonth(year, month, after) {
      // 标记跳过年份 watcher，防止重置周索引
      this.skipYearWatch = true;
      this.selectedYear = year;
      this.selectedMonth = month;
      this.recomputeWeeks(() => {
        if (typeof after === "function") after();
        // 使用 $nextTick 确保 watcher 在 skipYearWatch=false 之前执行
        this.$nextTick(() => {
          this.skipYearWatch = false;
        });
      });
    },
    handleMonthChange() {
      this.recomputeWeeks(() => {
        // 调整后默认选择第1周
        this.selectedWeekIndex = 0;
        this.updateSelectedWeek();
      });
    },
    handleSelectionChange() {
      this.updateSelectedWeek();
    },
    goPrevWeek() {
      if (!this.monthWeeks.length) return;
      const currentWeek = this.monthWeeks[this.selectedWeekIndex];
      const prevMonday = this.addDays(this.parseDate(currentWeek.monday), -7);
      this.navigateToDate(prevMonday);
    },
    goNextWeek() {
      if (!this.monthWeeks.length) return;
      const currentWeek = this.monthWeeks[this.selectedWeekIndex];
      const nextMonday = this.addDays(this.parseDate(currentWeek.monday), 7);
      this.navigateToDate(nextMonday);
    },
    goThisWeek() {
      const today = new Date();
      const thisMonday = this.getMonday(today);
      const targetYear = thisMonday.getFullYear();
      const targetMonth = thisMonday.getMonth() + 1;

      // 直接定位到「周一所在的年月」，避免需要點兩次
      this.setYearMonth(targetYear, targetMonth, () => {
        let idx = this.findWeekIndexContainingDate(thisMonday);
        if (idx < 0) {
          idx = this.findWeekIndexByDateValue(thisMonday);
        }
        this.selectedWeekIndex = idx >= 0 ? idx : 0;
        this.updateSelectedWeek();
      });
    },
    navigateToDateWithFallback(
      targetDate,
      preferredYear,
      preferredMonth,
      fallbackYear = null,
      fallbackMonth = null
    ) {
      const targetStr = this.formatDate(targetDate);
      console.log("navigateToDateWithFallback 调试:");
      console.log("  targetDate:", targetStr);
      console.log(
        "  preferredYear:",
        preferredYear,
        "preferredMonth:",
        preferredMonth
      );
      console.log(
        "  fallbackYear:",
        fallbackYear,
        "fallbackMonth:",
        fallbackMonth
      );

      // 先在首选的年月中查找目标周
      this.setYearMonth(preferredYear, preferredMonth, () => {
        console.log(
          "  首选月份周列表:",
          this.monthWeeks.map((w) => `${w.monday}~${w.sunday}`).join(" | ")
        );
        let idx = this.findWeekIndexContainingDate(targetDate);
        console.log("  字符串匹配结果 idx:", idx);
        if (idx < 0) {
          // 兜底：使用时间戳比较，避免字符串比较边界问题
          idx = this.findWeekIndexByDateValue(targetDate);
          console.log("  时间戳兜底匹配结果 idx:", idx);
        }
        // 如果找不到且提供了后备年月，则尝试后备
        if (idx < 0 && fallbackYear !== null && fallbackMonth !== null) {
          if (
            fallbackYear !== preferredYear ||
            fallbackMonth !== preferredMonth
          ) {
            console.log("  切换到后备年月:", fallbackYear, fallbackMonth);
            this.setYearMonth(fallbackYear, fallbackMonth, () => {
              console.log(
                "  后备月份周列表:",
                this.monthWeeks
                  .map((w) => `${w.monday}~${w.sunday}`)
                  .join(" | ")
              );
              idx = this.findWeekIndexContainingDate(targetDate);
              if (idx < 0) {
                idx = this.findWeekIndexByDateValue(targetDate);
              }
              console.log("  后备月份最终 idx:", idx);
              this.selectedWeekIndex = idx >= 0 ? idx : 0;
              console.log(
                "  最终选择:",
                this.selectedYear,
                "年",
                this.selectedMonth,
                "月",
                "第",
                this.selectedWeekIndex + 1,
                "周"
              );
              this.updateSelectedWeek();
            });
            return;
          }
        }
        this.selectedWeekIndex = idx >= 0 ? idx : 0;
        console.log(
          "  最终选择:",
          this.selectedYear,
          "年",
          this.selectedMonth,
          "月",
          "第",
          this.selectedWeekIndex + 1,
          "周"
        );
        this.updateSelectedWeek();
      });
    },
    navigateToDate(targetDate) {
      // 根据目标日期更新 年/月/周
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;
      // 只有当目标年份/月份与当前选择不同时才更新
      if (
        this.selectedYear !== targetYear ||
        this.selectedMonth !== targetMonth
      ) {
        this.setYearMonth(targetYear, targetMonth, () => {
          let idx = this.findWeekIndexContainingDate(targetDate);
          if (idx < 0) {
            idx = this.findWeekIndexByDateValue(targetDate);
          }
          this.selectedWeekIndex = idx >= 0 ? idx : 0;
          this.updateSelectedWeek();
        });
      } else {
        // 如果年份月份相同，只需要更新周索引
        let idx = this.findWeekIndexContainingDate(targetDate);
        if (idx < 0) {
          idx = this.findWeekIndexByDateValue(targetDate);
        }
        if (idx >= 0 && this.selectedWeekIndex !== idx) {
          this.selectedWeekIndex = idx;
          this.updateSelectedWeek();
        }
      }
    },
    emitWeekChange() {
      if (!this.monthWeeks.length) return;
      const currentWeek = this.monthWeeks[this.selectedWeekIndex];
      const nextWeekStart = this.addDays(this.parseDate(currentWeek.monday), 7);
      const nextWeekDates = this.getWeekDates(nextWeekStart);
      this.$emit("week-change", {
        currentWeek: {
          list: this.getWeekDates(this.parseDate(currentWeek.monday)),
          monday: currentWeek.monday,
          sunday: currentWeek.sunday,
        },
        nextWeek: {
          list: nextWeekDates,
          monday: nextWeekDates[0],
          sunday: nextWeekDates[6],
        },
        meta: {
          year: this.selectedYear,
          month: this.selectedMonth,
          weekIndex: this.selectedWeekIndex,
        },
      });
    },
    recomputeWeeks(after) {
      this.monthWeeks = this.computeWeeksForMonth(
        this.selectedYear,
        this.selectedMonth
      );
      if (typeof after === "function") after();
    },
    computeWeeksForMonth(year, month) {
      // month: 1-12
      const firstDayOfMonth = new Date(year, month - 1, 1);
      const lastDayOfMonth = new Date(year, month, 0);
      const firstMonday = this.getMonday(firstDayOfMonth);
      const weeks = [];
      let weekStart = new Date(firstMonday);
      while (weekStart <= lastDayOfMonth || weeks.length === 0) {
        const days = this.getWeekDates(weekStart);
        weeks.push({
          monday: days[0],
          sunday: days[6],
          days,
        });
        weekStart = this.addDays(weekStart, 7);
        // 保障至少覆盖到当月最后一天所在的周
        if (
          weekStart > lastDayOfMonth &&
          weeks[weeks.length - 1].sunday >= this.formatDate(lastDayOfMonth)
        ) {
          break;
        }
      }
      return weeks;
    },
    getWeekDates(mondayDate) {
      const days = [];
      for (let i = 0; i < 7; i += 1) {
        const d = this.addDays(mondayDate, i);
        days.push(this.formatDate(d));
      }
      return days;
    },
    getMonday(date) {
      const d = new Date(date);
      const day = d.getDay(); // 0-6, 0 为周日
      const diff = day === 0 ? -6 : 1 - day; // 移动到周一
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d;
    },
    addDays(date, n) {
      const d = new Date(date);
      d.setDate(d.getDate() + n);
      return d;
    },
    formatDate(date) {
      if (this.valueFormat !== "YYYY-MM-DD") {
        // 目前仅实现 YYYY-MM-DD
      }
      const y = date.getFullYear();
      const m = `${date.getMonth() + 1}`.padStart(2, "0");
      const dd = `${date.getDate()}`.padStart(2, "0");
      return `${y}-${m}-${dd}`;
    },
    parseDate(yyyyMMdd) {
      const [y, m, d] = yyyyMMdd.split("-").map((n) => parseInt(n, 10));
      return new Date(y, m - 1, d);
    },
    findWeekIndexContainingDate(date) {
      const target = this.formatDate(date);
      for (let i = 0; i < this.monthWeeks.length; i += 1) {
        const w = this.monthWeeks[i];
        if (target >= w.monday && target <= w.sunday) return i;
      }
      return -1;
    },
    // 使用时间戳比较，避免字符串比较边界问题
    findWeekIndexByDateValue(date) {
      const ts = date.getTime();
      for (let i = 0; i < this.monthWeeks.length; i += 1) {
        const w = this.monthWeeks[i];
        const start = this.parseDate(w.monday).getTime();
        const end = this.parseDate(w.sunday).getTime();
        if (ts >= start && ts <= end) return i;
      }
      return -1;
    },
  },
};
</script>

<style scoped>
/* 外层容器 */
.week-range-picker-wrapper {
  position: relative;
  display: inline-block;
}

/* 触发器 - 日期导航条 */
.picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #fff;
  border-radius: 4px;
  transition: all 0.3s;
  user-select: none;
}

.trigger-left {
  display: flex;
  align-items: center;
  /* gap: 12px; */
  cursor: pointer;
  margin-right: 10px;
  .el-icon-caret-top {
    font-size: 12px;
    color: #666;
  }
  .el-icon-caret-bottom {
    font-size: 12px;
     color: #666;
  }
}

.trigger-right {
  display: flex;
  align-items: center;
  gap: 12px;
  .nav-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    color: #999;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    background: #fafafa;
  }
  .nav-arrow:hover {
    background: #f92b301a;
    color: #f92b30;
  }
}

.date-display {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 90px;
  text-align: center;
}

.today-button {
  padding: 5px 12px;
  font-size: 13px;
  color: #666;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.today-button:hover {
  color: #1890ff;
  border-color: #40a9ff;
  background: #f0f7ff;
}

.temperature-display {
  font-size: 14px;
  color: #ff4d4f;
  font-weight: 500;
}

/* 日历弹窗 */
.calendar-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.week-range-picker-calendar {
  width: 312px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  padding-left: 0;
  padding-right: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

/* 日历标题 */
.calendar-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  .nav-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    color: #999;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .nav-arrow:hover {
    background: #f92b301a;
    color: #f92b30;
  }

  .date-text {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .year-select,
  .month-select {
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s;
    outline: none;
  }

  .year-select:hover,
  .month-select:hover {
    border-color: #40a9ff;
  }

  .year-select:focus,
  .month-select:focus {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }

  .year-select {
    min-width: 80px;
  }

  .month-select {
    min-width: 65px;
  }
}

/* 星期表头 */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.weekday {
  text-align: center;
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

/* 日期网格 */
.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 5px;
}

.date-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
  color: #333;
}

.date-cell:hover {
  background: #f5f5f5;
}

.date-cell.is-other-month {
  color: #bbb;
}

.date-cell.is-today {
  color: #ff4d4f;
  font-weight: 600;
}

.date-cell.is-selected {
  background: #1890ff;
  color: #fff;
  font-weight: 600;
}

.date-cell.is-in-range {
  background: #e6f7ff;
  color: #1890ff;
}

.date-cell.is-in-range:hover {
  background: #bae7ff;
}

/* 底部信息栏 */
.calendar-footer {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.week-info {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.week-info span {
  color: #1890ff;
}
</style>
