/**
 * 拖拽功能混入
 * 封装Sortable.js的拖拽逻辑
 */

import Sortable from 'sortablejs'

export default {
  methods: {
    /**
     * 初始化课程列表拖拽（从课程库拖到日历）
     */
    initClassDrag() {
      this.$nextTick(() => {
        document.querySelectorAll('.js-class-drag-container').forEach((el) => {
          new Sortable(el, {
            group: { name: 'classDrag', put: false, pull: 'clone' },
            animation: 150,
            dataIdAttr: 'data-id',
            scroll: true,
            swapThreshold: 0.6,
            scrollSpeed: 10,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            onEnd: (e) => {
              if (e.item.dataset.id && e.to.dataset.date) {
                this.handleClassDragToSchedule(e)
              }
            }
          })
        })
      })
    },

    /**
     * 初始化日历容器拖拽（课表排序和移动）
     */
    initScheduleDrag() {
      this.$nextTick(() => {
        const _this = this
        document.querySelectorAll('.js-schedule-drag-container').forEach((el) => {
          new Sortable(el, {
            group: { name: 'classDrag' },
            animation: 150,
            dataIdAttr: 'data-id',
            scroll: true,
            swapThreshold: 0.6,
            scrollSpeed: 10,
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            onAdd: (e) => {
              // 防止拖拽错误元素
              if (e.item.className.indexOf('card-body') > -1) {
                _this.getScheduleData()
                return
              }
              _this.handleScheduleDragAdd(e)
            }
          })
        })
      })
    },

    /**
     * 初始化运动卡片拖拽（运动拖到课表匹配）
     */
    initActivityDrag() {
      this.$nextTick(() => {
        const _this = this
        document.querySelectorAll('.js-sport-container-put').forEach((el) => {
          new Sortable(el, {
            sort: false,
            group: {
              name: 'classDrag',
              pull: 'clone',
              put: function(to, from) {
                // 只允许从课表拖到运动
                console.log(from, "to, from");
                if (from.el.className.indexOf('js-sport-container-put') > -1) {
                  return false
                } else {
                  return true
                }
              }
            },
            animation: 150,
            dataIdAttr: 'data-id',
            onAdd(e) {
              if (e.item.className === 'card-body') {
                _this.getScheduleData()
                return
              }
              if (!e.item.dataset.id || !e.to.dataset.id) {
                return
              }
              _this.handleMatchClass({
                classId: e.item.dataset.id,
                activityId: e.to.dataset.id,
                type: e.item.dataset.type
              })
            }
          })
        })
      })
    },

    /**
     * 初始化课表卡片拖拽（运动拖到课表匹配）
     */
    initClassScheduleCardDrag() {
      this.$nextTick(() => {
        const _this = this
        document.querySelectorAll('.js-class-schedule-card').forEach((el) => {
          new Sortable(el, {
            group: {
              name: 'classDrag',
              put: function(e, b) {
                // 只允许同一天的运动拖到课表
                if (
                  b.el.dataset.id &&
                  e.el.dataset.date === b.el.dataset.date &&
                  b.el.className.indexOf('sportScheduleCard') !== -1
                ) {
                  return true
                } else {
                  return false
                }
              }
            },
            animation: 150,
            dataIdAttr: 'data-id',
            onAdd(e) {
              _this.handleMatchClass({
                classId: e.to.dataset.id,
                activityId: e.item.dataset.id,
                type: ''
              })
            }
          })
        })
      })
    },

    /**
     * 初始化所有拖拽功能
     */
    initAllDrag() {
      this.initClassDrag()
      this.initScheduleDrag()
      this.initActivityDrag()
      this.initClassScheduleCardDrag()
    }
  }
}

