<template>
  <div class="schedule-scroll-demo">
    <div class="demo-toolbar">
      <h2 class="demo-title">日程滚动加载联调验证（Mock）</h2>
      <p class="demo-section-title">1. 周切换（与 WeekRangePicker 同构）</p>
      <div class="demo-week-picker">
        <span class="picker-label">{{ pickerYear }}年{{ pickerMonth }}月</span>
        <span class="picker-nav" @click="goPrevWeek">
          <img class="arrow" src="@/assets/addClass/arrow.png" alt="" />
        </span>
        <span class="picker-range">{{ pickerWeekLabel }}</span>
        <span class="picker-nav" @click="goNextWeek">
          <img class="arrow flip" src="@/assets/addClass/arrow.png" alt="" />
        </span>
        <el-button size="mini" @click="goThisWeek">当周</el-button>
      </div>

      <p class="demo-section-title">2. 运动员切换 → 清空区间并重拉首屏 4 周</p>
      <el-select
        v-model="mockAthleteId"
        size="small"
        style="width: 200px"
        @change="onAthleticChange"
      >
        <el-option label="运动员 A（mock）" value="a" />
        <el-option label="运动员 B（mock）" value="b" />
        <el-option label="运动员 C（mock）" value="c" />
      </el-select>

      <p class="demo-section-title">3. 选中日期联动</p>
      <div class="demo-meta">
        <span>当前选中：<code>{{ selectedDate || "（点击某日）" }}</code></span>
        <span>锚点周一起：<code>{{ anchorWeekStart }}</code></span>
      </div>

      <p class="demo-section-title">4. 加载与 vuedraggable 跨日拖拽（顶/底双向加载）</p>
      <div class="demo-meta">
        <span>已覆盖：<code>{{ loadedRangeText }}</code></span>
        <span>请求次数：<strong>{{ requestCount }}</strong></span>
        <el-checkbox v-model="useIntersection">IntersectionObserver</el-checkbox>
      </div>
      <p class="demo-hint">
        本 Demo 使用 <code>vuedraggable</code>（底层仍为 Sortable，但列表由 Vue 响应式驱动）。
        <strong>拖动中预加载出新日期时，新列会自动挂载新的 draggable，无需像原生 Sortable 那样手动 reinit</strong>，
        可验证「3/14 → 未加载的 2/16」类场景。正式页若沿用 dragMixin 原生 Sortable，需在加载后 <code>initAllDrag()</code>。
      </p>
    </div>

    <div
      ref="scrollRoot"
      class="demo-scroll-root schedule-table-container"
      @scroll.passive="onScroll"
    >
      <div ref="sentinelTop" class="demo-sentinel demo-sentinel--top" />

      <div
        v-for="(week, wIdx) in weeksGrouped"
        :key="week.key"
        class="demo-week-block"
        :data-week-monday="week.monday"
      >
        <div class="demo-week-label">
          第 {{ wIdx + 1 }} 周 · {{ week.rangeText }}
          <span v-if="week.monday === anchorWeekStart" class="tag-anchor">锚点周</span>
        </div>
        <div class="demo-week-row">
          <div
            v-for="d in week.days"
            :key="d.commonDate"
            class="demo-day-cell"
            :class="{ 'is-selected': selectedDate === d.commonDate }"
            @click="onDayClick(d.commonDate)"
          >
            <div class="demo-day-title">
              <span class="d">{{ d.dayNum }}</span>
              <span class="w">{{ d.weekday }}</span>
            </div>
            <div class="demo-day-body" @click.stop>
              <div
                class="schedule-table-cell-item js-schedule-drag-container js-class-drag-container"
                :data-date="d.commonDate"
              >
                <draggable
                  v-if="dayMap[d.commonDate]"
                  :list="dayMap[d.commonDate].classSchedule"
                  :group="dragGroup"
                  :animation="150"
                  :disabled="dragDisabled"
                  handle=".demo-mock-card-body"
                  ghost-class="is-drag-ghost"
                  chosen-class="is-drag-chosen"
                  :scroll="true"
                  :scroll-sensitivity="300"
                  :scroll-speed="40"
                  :bubble-scroll="true"
                  class="demo-draggable-list"
                  @start="onDraggableStart"
                  @end="onDraggableEnd"
                >
                  <div
                    v-for="c in dayMap[d.commonDate].classSchedule"
                    :key="c.id"
                    class="demo-class-sort-item"
                  >
                    <div
                      class="demo-mock-class-card classScheduleCard"
                      @click.stop
                    >
                      <div class="card-body class-drap-handle demo-mock-card-body">
                        {{ c.title }}
                      </div>
                    </div>
                  </div>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref="sentinel" class="demo-sentinel" />

      <div v-if="loadingInitial" class="demo-footer">首屏加载中…</div>
      <div v-else-if="loadingPrev" class="demo-footer">向上加载 2 周…</div>
      <div v-else-if="loadingMore" class="demo-footer">向下加载 2 周…</div>
      <div v-else class="demo-footer muted">{{ loadHintText }}</div>
    </div>
  </div>
</template>

<script>
/**
 * 联调要点：
 * 1) 周切换、运动员切换、滚动预加载逻辑不变。
 * 2) 跨日拖拽改用 vuedraggable + group：新加载的日期在 dayMap 中出现后，Vue 会渲染对应 draggable，
 *    解决「拖动中加载出的列，原生 Sortable 未挂载导致无法 drop」的问题。
 */
import draggable from "vuedraggable"

function pad2(n) {
  return String(n).padStart(2, "0")
}

function formatYMD(date) {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  return `${y}-${m}-${d}`
}

function startOfWeekMonday(dateStr) {
  const d = new Date(dateStr.replace(/-/g, "/"))
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return formatYMD(d)
}

function addDays(dateStr, n) {
  const d = new Date(dateStr.replace(/-/g, "/"))
  d.setDate(d.getDate() + n)
  return formatYMD(d)
}

function parseYMD(s) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

function mockFetchRange(beginDate, endDate, requestSeq, athleteId) {
  const out = []
  let cur = beginDate
  while (cur <= endDate) {
    const dt = parseYMD(cur)
    const wd = WEEKDAY_LABELS[dt.getDay()]
    const seed = cur.split("-").join("")
    const n = (Number(seed) % 3) + (requestSeq % 2)
    const classSchedule = []
    for (let i = 0; i < n; i++) {
      classSchedule.push({
        id: `${cur}-${i}-${athleteId}`,
        title: `[${String(athleteId).toUpperCase()}] 课表 ${i + 1} · 请求#${requestSeq}`,
      })
    }
    out.push({
      dataDate: cur,
      commonDate: cur,
      weekday: wd,
      dayNum: dt.getDate(),
      classSchedule,
    })
    cur = addDays(cur, 1)
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, result: out }), 280)
  })
}

function mergeDayMap(prevMap, list) {
  const map = { ...prevMap }
  list.forEach((row) => {
    map[row.commonDate] = {
      ...row,
      classSchedule: Array.isArray(row.classSchedule) ? row.classSchedule : [],
    }
  })
  return map
}

export default {
  name: "ScheduleScrollDemo",
  components: { draggable },
  data() {
    return {
      pickerWeekMonday: "",
      anchorWeekStart: "",
      selectedDate: "",
      mockAthleteId: "a",
      dayMap: {},
      loadedStart: "",
      loadedEnd: "",
      loadingInitial: false,
      loadingMore: false,
      loadingPrev: false,
      hasMore: true,
      requestCount: 0,
      requestSeq: 0,
      maxFutureDays: 365,
      maxPastDays: 365,
      useIntersection: true,
      io: null,
      ioTop: null,
      scrollTimer: null,
      hasUserScrolledDown: false,
      lastPrevLoadAt: 0,
      lastMoreLoadAt: 0,
      /** 拖拽中边缘预加载（不依赖 Sortable 手动 init） */
      isDragging: false,
      dragPointerAttached: false,
      lastDragEdgePrefetchAt: 0,
      dragScrollPrefetchTimer: null,
    }
  },
  computed: {
    dragGroup() {
      return { name: "classDrag", pull: true, put: true }
    },
    dragDisabled() {
      return this.loadingInitial || this.loadingMore || this.loadingPrev
    },
    pickerYear() {
      if (!this.pickerWeekMonday) return ""
      return Number(this.pickerWeekMonday.slice(0, 4))
    },
    pickerMonth() {
      if (!this.pickerWeekMonday) return ""
      return Number(this.pickerWeekMonday.slice(5, 7))
    },
    pickerWeekLabel() {
      if (!this.pickerWeekMonday) return ""
      const sun = addDays(this.pickerWeekMonday, 6)
      return `${this.pickerWeekMonday} ~ ${sun}`
    },
    loadedRangeText() {
      if (!this.loadedStart || !this.loadedEnd) return "—"
      return `${this.loadedStart} ~ ${this.loadedEnd}`
    },
    canLoadPast() {
      if (!this.loadedStart || !this.anchorWeekStart) return false
      const minBound = addDays(this.anchorWeekStart, -this.maxPastDays)
      return this.loadedStart > minBound
    },
    loadHintText() {
      const up = this.canLoadPast ? "可向上加载 2 周" : "向上已到演示边界"
      const down = this.hasMore ? "可向下加载 2 周" : "向下已到演示边界"
      return `${up}；${down}（vuedraggable：拖动中加载的新日期可直接拖入）`
    },
    sortedDates() {
      return Object.keys(this.dayMap).sort()
    },
    weeksGrouped() {
      if (!this.sortedDates.length) return []
      const weeks = []
      let current = []
      let blockMonday = null

      this.sortedDates.forEach((ds) => {
        const day = this.dayMap[ds]
        const monday = startOfWeekMonday(ds)
        if (blockMonday === null) {
          blockMonday = monday
        }
        if (monday !== blockMonday) {
          weeks.push(this.packWeek(blockMonday, current))
          current = []
          blockMonday = monday
        }
        current.push(day)
      })
      if (current.length) {
        weeks.push(this.packWeek(blockMonday, current))
      }
      return weeks
    },
  },
  watch: {
    useIntersection(val) {
      if (val) this.setupIntersection()
      else if (this.io) {
        this.io.disconnect()
        this.io = null
      }
    },
  },
  mounted() {
    const monday = startOfWeekMonday(formatYMD(new Date()))
    this.pickerWeekMonday = monday
    this.applyWeekAnchorAndReload(false)
  },
  beforeDestroy() {
    this.clearDragPrefetch()
    if (this.io) {
      this.io.disconnect()
      this.io = null
    }
    if (this.ioTop) {
      this.ioTop.disconnect()
      this.ioTop = null
    }
  },
  methods: {
    clearDragPrefetch() {
      document.removeEventListener("pointermove", this.handleDragPointerMove)
      if (this.dragScrollPrefetchTimer) {
        clearInterval(this.dragScrollPrefetchTimer)
        this.dragScrollPrefetchTimer = null
      }
      this.dragPointerAttached = false
      this.isDragging = false
    },
    onDraggableStart() {
      if (this.dragPointerAttached) return
      this.dragPointerAttached = true
      this.isDragging = true
      document.addEventListener("pointermove", this.handleDragPointerMove, {
        passive: true,
      })
      this.dragScrollPrefetchTimer = setInterval(() => {
        if (!this.isDragging) return
        const root = this.$refs.scrollRoot
        if (!root) return
        const nearTop = root.scrollTop < 220
        if (nearTop && this.canLoadPast && !this.loadingPrev) {
          this.loadPreviousTwoWeeks()
        }
        const nearBottom =
          root.scrollHeight - (root.scrollTop + root.clientHeight) < 220
        if (nearBottom && this.hasMore && !this.loadingMore) {
          this.loadMoreTwoWeeks()
        }
      }, 200)
    },
    onDraggableEnd() {
      this.clearDragPrefetch()
    },
    handleDragPointerMove(e) {
      if (!this.isDragging) return
      const now = Date.now()
      if (now - this.lastDragEdgePrefetchAt < 450) return
      const root = this.$refs.scrollRoot
      if (!root) return
      const r = root.getBoundingClientRect()
      const margin = 180
      if (e.clientY < r.top + margin && this.canLoadPast && !this.loadingPrev) {
        this.lastDragEdgePrefetchAt = now
        this.loadPreviousTwoWeeks()
      } else if (
        e.clientY > r.bottom - margin &&
        this.hasMore &&
        !this.loadingMore
      ) {
        this.lastDragEdgePrefetchAt = now
        this.loadMoreTwoWeeks()
      }
    },
    packWeek(weekMonday, days) {
      const last = days[days.length - 1]
      return {
        monday: weekMonday,
        key: `${weekMonday}_${last.commonDate}`,
        rangeText: `${days[0].commonDate.slice(5)} ~ ${last.commonDate.slice(5)}`,
        days: days.map((d) => ({
          commonDate: d.commonDate,
          dayNum: d.dayNum,
          weekday: d.weekday,
        })),
      }
    },
    emitMockWeekChange() {
      this.applyWeekAnchorAndReload(true)
    },
    goPrevWeek() {
      this.pickerWeekMonday = addDays(this.pickerWeekMonday, -7)
      this.emitMockWeekChange()
    },
    goNextWeek() {
      this.pickerWeekMonday = addDays(this.pickerWeekMonday, 7)
      this.emitMockWeekChange()
    },
    goThisWeek() {
      this.pickerWeekMonday = startOfWeekMonday(formatYMD(new Date()))
      this.emitMockWeekChange()
    },
    async applyWeekAnchorAndReload(scrollTop) {
      this.anchorWeekStart = this.pickerWeekMonday
      this.dayMap = {}
      this.loadedStart = ""
      this.loadedEnd = ""
      this.hasMore = true
      this.requestSeq = 0
      this.requestCount = 0
      this.selectedDate = this.pickerWeekMonday
      this.hasUserScrolledDown = false
      await this.loadInitialFourWeeks()
      this.$nextTick(() => {
        if (scrollTop && this.$refs.scrollRoot) {
          this.$refs.scrollRoot.scrollTop = 0
        }
        this.setupIntersection()
      })
    },
    onDayClick(commonDate) {
      this.selectedDate = commonDate
      const mon = startOfWeekMonday(commonDate)
      if (mon !== this.pickerWeekMonday) {
        this.pickerWeekMonday = mon
      }
    },
    async onAthleticChange() {
      this.dayMap = {}
      this.loadedStart = ""
      this.loadedEnd = ""
      this.hasMore = true
      this.requestSeq = 0
      this.requestCount = 0
      this.hasUserScrolledDown = false
      await this.loadInitialFourWeeks()
      this.$nextTick(() => this.setupIntersection())
    },
    async loadInitialFourWeeks() {
      this.loadingInitial = true
      const begin = this.anchorWeekStart
      const end = addDays(begin, 27)
      await this.fetchAndMerge(begin, end)
      this.loadedStart = begin
      this.loadedEnd = end
      this.loadingInitial = false
    },
    async fetchAndMerge(begin, end) {
      this.requestSeq += 1
      this.requestCount += 1
      const seq = this.requestSeq
      const res = await mockFetchRange(begin, end, seq, this.mockAthleteId)
      if (!res.success || !res.result) return
      const mapped = res.result.map((r) => ({
        commonDate: r.commonDate,
        dataDate: r.dataDate,
        dayNum: r.dayNum,
        weekday: r.weekday,
        classSchedule: r.classSchedule || [],
      }))
      this.dayMap = mergeDayMap(this.dayMap, mapped)
    },
    async loadMoreTwoWeeks() {
      if (!this.loadedEnd || this.loadingMore || this.loadingPrev || this.loadingInitial || !this.hasMore) {
        return
      }
      const now = Date.now()
      if (now - this.lastMoreLoadAt < 400) return
      this.lastMoreLoadAt = now

      const nextBegin = addDays(this.loadedEnd, 1)
      const limitEnd = addDays(this.anchorWeekStart, this.maxFutureDays)
      if (nextBegin > limitEnd) {
        this.hasMore = false
        return
      }
      const nextEnd = addDays(nextBegin, 13)
      this.loadingMore = true
      await this.fetchAndMerge(nextBegin, nextEnd)
      this.loadedEnd = nextEnd
      this.loadingMore = false
      this.$nextTick(() => this.setupIntersection())
    },
    /**
     * 与 loadMoreTwoWeeks 对称：每次并入 14 天（2 周），prepend 后补偿 scrollTop。
     */
    async loadPreviousTwoWeeks() {
      const now = Date.now()
      if (now - this.lastPrevLoadAt < 400) return
      if (
        !this.loadedStart ||
        this.loadingPrev ||
        this.loadingMore ||
        this.loadingInitial ||
        !this.canLoadPast
      ) {
        return
      }
      const minBound = addDays(this.anchorWeekStart, -this.maxPastDays)
      const prevEnd = addDays(this.loadedStart, -1)
      let prevBegin = addDays(this.loadedStart, -14)
      if (prevBegin < minBound) {
        prevBegin = minBound
      }
      if (prevBegin > prevEnd) {
        return
      }

      const el = this.$refs.scrollRoot
      if (!el) return
      const prevScrollHeight = el.scrollHeight
      const prevScrollTop = el.scrollTop

      this.loadingPrev = true
      await this.fetchAndMerge(prevBegin, prevEnd)
      this.loadedStart = prevBegin
      this.loadingPrev = false
      this.lastPrevLoadAt = Date.now()

      this.$nextTick(() => {
        const root = this.$refs.scrollRoot
        if (root) {
          const delta = root.scrollHeight - prevScrollHeight
          root.scrollTop = prevScrollTop + delta
        }
        this.setupIntersection()
      })
    },
    onScroll() {
      const el = this.$refs.scrollRoot
      if (el && el.scrollTop > 60) {
        this.hasUserScrolledDown = true
      }
      if (this.useIntersection) return
      if (this.scrollTimer) clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        const root = this.$refs.scrollRoot
        if (!root) return
        const { scrollTop, clientHeight, scrollHeight } = root
        if (scrollHeight - scrollTop - clientHeight < 120) {
          this.loadMoreTwoWeeks()
        }
        if (this.hasUserScrolledDown && scrollTop < 120) {
          this.loadPreviousTwoWeeks()
        }
      }, 150)
    },
    setupIntersection() {
      if (!this.useIntersection) return
      this.$nextTick(() => {
        if (this.io) {
          this.io.disconnect()
          this.io = null
        }
        if (this.ioTop) {
          this.ioTop.disconnect()
          this.ioTop = null
        }
        const root = this.$refs.scrollRoot
        const bottom = this.$refs.sentinel
        const top = this.$refs.sentinelTop
        if (!root || !bottom || !window.IntersectionObserver) return

        this.io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) this.loadMoreTwoWeeks()
            })
          },
          { root, rootMargin: "80px", threshold: 0 }
        )
        this.io.observe(bottom)

        if (top) {
          this.ioTop = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return
                if (!this.hasUserScrolledDown) return
                this.loadPreviousTwoWeeks()
              })
            },
            { root, rootMargin: "80px", threshold: 0 }
          )
          this.ioTop.observe(top)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.schedule-scroll-demo {
  padding: 16px 20px 32px;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f0f2f5;
}

.demo-toolbar {
  margin-bottom: 16px;
}

.demo-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.demo-section-title {
  margin: 12px 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.demo-week-picker {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;

  .picker-label {
    font-size: 14px;
    color: #303133;
  }

  .picker-range {
    font-size: 13px;
    color: #409eff;
    min-width: 200px;
  }

  .picker-nav {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    padding: 4px;

    .arrow {
      width: 14px;
      height: 14px;
      display: block;
    }

    .flip {
      transform: rotate(180deg);
    }
  }
}

.demo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;

  code {
    font-size: 12px;
    background: #fff;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #e4e7ed;
  }
}

.demo-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;

  code {
    font-size: 11px;
    background: #f4f4f5;
    padding: 0 4px;
    border-radius: 2px;
  }
}

.demo-scroll-root {
  max-width: 1200px;
  height: calc(100vh - 420px);
  min-height: 280px;
  overflow: auto;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.demo-week-block {
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 8px;
  }
}

.demo-week-label {
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  .tag-anchor {
    font-size: 11px;
    font-weight: 500;
    color: #e6a23c;
    background: #fdf6ec;
    padding: 2px 6px;
    border-radius: 4px;
  }
}

.demo-week-row {
  display: flex;
  flex-direction: row;
  width: 100%;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}

.demo-day-cell {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e5e5;
  background: #fafafa;
  cursor: pointer;

  &:first-child {
    border-left: none;
  }

  &.is-selected {
    background: #ecf5ff;
    box-shadow: inset 0 0 0 2px #409eff;
  }
}

.demo-day-title {
  padding: 8px 6px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
  display: flex;
  align-items: baseline;
  gap: 4px;

  .d {
    font-weight: 700;
    font-size: 14px;
    color: #303133;
  }

  .w {
    color: #909399;
    font-size: 11px;
  }
}

.demo-day-body {
  flex: 1;
  padding: 6px;
  min-height: 72px;
}

::v-deep .js-class-drag-container {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-height: 40px;
  position: relative;
}

.demo-draggable-list {
  min-height: 48px;
}

.demo-class-sort-item {
  margin-bottom: 6px;
}

.demo-mock-class-card {
  font-size: 11px;
  color: #606266;
  background: #ecf5ff;
  border-radius: 6px;
  overflow: hidden;
}

.demo-mock-card-body {
  padding: 6px 8px;
  word-break: break-all;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

::v-deep .is-drag-chosen {
  background-color: #fff !important;
}

::v-deep .is-drag-ghost {
  position: relative;
  background: #f92b30 !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(204, 35, 35, 0.3) !important;
  opacity: 0.95 !important;
  min-height: 10px !important;
  height: 10px !important;

  * {
    opacity: 0 !important;
    visibility: hidden !important;
  }
}

.demo-sentinel {
  height: 1px;
  margin: 0;
  pointer-events: none;

  &--top {
    flex-shrink: 0;
  }
}

.demo-footer {
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #409eff;

  &.muted {
    color: #909399;
  }
}
</style>
