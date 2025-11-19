/**
 * 拖拽功能混入
 * 封装Sortable.js的拖拽逻辑
 */

import Sortable from "sortablejs";

export default {
  data() {
    return {};
  },
  methods: {
    /**
     * 初始化课程列表拖拽（从课程库拖到日历）
     */
    initClassDrag() {
      this.$nextTick(() => {
        document.querySelectorAll(".js-class-drag-container").forEach((el) => {
          new Sortable(el, {
            group: { name: "classDrag", put: false, pull: "clone" },
            animation: 150,
            dataIdAttr: "data-id",
            scroll: true,
            swapThreshold: 0.6,
            scrollSpeed: 10,
            easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            onStart: (e) => {},
            onEnd: (e) => {
              console.log(e, "e");
              // 只有拖到日历容器(.js-schedule-drag-container)时才处理
              // 避免拖到运动卡片(.js-sport-container-put)时也触发
              if (
                e.item.dataset.id &&
                e.to.dataset.date &&
                e.to.classList.contains("js-schedule-drag-container")
              ) {
                this.handleClassDragToSchedule(e);
              }
            },
          });
        });
      });
    },

    /**
     * 初始化日历容器拖拽（课表排序和移动）
     */
    initScheduleDrag() {
      this.$nextTick(() => {
        const _this = this;
        const scrollContainerEl = document.querySelector(
          ".schedule-table-container"
        );
        document
          .querySelectorAll(".js-schedule-drag-container")
          .forEach((el) => {
            new Sortable(el, {
              group: { name: "classDrag" },
              animation: 150,
              dataIdAttr: "data-id",
              scroll: true,
              scrollContainer: scrollContainerEl, // 指定滚动容器为课表外层容器
              swapThreshold: 0.6,
              scrollSpeed: 20,
              scrollSensitivity: 200, // 增加敏感度
              bubbleScroll: true,
              forceFallback: false,
              scrollFn: function (
                offsetX,
                offsetY,
                originalEvent,
                touchEvt,
                hoverTargetEl
              ) {
                console.log(
                  offsetX,
                  offsetY,
                  originalEvent,
                  touchEvt,
                  hoverTargetEl,
                  "offsetX, offsetY, originalEvent, touchEvt, hoverTargetEl"
                );
              },
              easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              // 过滤掉健康数据卡片 赛事卡片，使其不可拖拽
              filter: ".js-health-data-no-drag,.js-event-drag-no-drag,.js-schedule-drag-no-drag",
              onStart: (e) => {
                console.log("onStart", e);
              },
              onEnd: (e) => {
                console.log("onEnd", e);
              },
              onChoose: (e) => {
                console.log("onChoose - 开始选择元素", e);
              },
              onUnchoose: (e) => {
                console.log("onUnchoose - 取消选择", e);
              },
              onMove: (evt, originalEvent) => {
                console.log("onMove event triggered", {
                  related: evt.related,
                  dragged: evt.dragged,
                  relatedRect: evt.relatedRect,
                  draggedRect: evt.draggedRect,
                  willInsertAfter: evt.willInsertAfter,
                  originalEvent: originalEvent,
                });
                // onMove 需要返回值：返回 -1 取消移动，返回 1 允许移动
                // 返回 true 或 1 表示允许移动
                return true;
              },
              onChange: (evt) => {
                console.log("onChange - 元素位置发生变化", {
                  item: evt.item,
                  oldIndex: evt.oldIndex,
                  newIndex: evt.newIndex,
                });
              },
              onUpdate: (e) => {
                // 同一容器内排序时触发
                console.log("onUpdate - 同一容器内排序", e);
              },
              onAdd: (e) => {
                console.log("onAdd - 元素添加到容器", e);
                // 防止拖拽错误元素
                if (e.item.className.indexOf("card-body") > -1) {
                  _this.getScheduleData();
                  return;
                }
                _this.handleScheduleDragAdd(e);
              },
              onRemove: (e) => {
                console.log("onRemove - 元素从容器移除", e);
              },
            });
          });
      });
    },

    /**
     * 初始化运动卡片拖拽（运动匹配）
     */
    initActivityDrag() {
      this.$nextTick(() => {
        const _this = this;
        const scrollContainerEl = document.querySelector(
          ".schedule-table-container"
        );
        document.querySelectorAll(".js-sport-container-put").forEach((el) => {
          new Sortable(el, {
            sort: false,
            filter: ".js-sport-card-noDrag",
            group: {
              name: "classDrag",
              pull: "clone",
            },
            animation: 150,
            dataIdAttr: "data-id",
            scroll: true,
            scrollContainer: scrollContainerEl, // 指定滚动容器为课表外层容器
            scrollSpeed: 20,
            scrollSensitivity: 30, // 增加敏感度
            bubbleScroll: true,
            onStart: (e) => {},
            onMove: (evt) => {},
            onAdd(e) {
              console.log(e, "e");
              if (e.item.className === "card-body") {
                _this.getScheduleData();
                return;
              }
              // 移除拖拽产生的DOM元素，避免显示重复的课表
              if (e.item && e.item.parentNode) {
                e.item.parentNode.removeChild(e.item);
              }
              _this.handleMatchClass({
                classId: e.item.dataset.id,
                activityId: e.to.dataset.activityid,
                manualActivityId: e.to.dataset.manualactivityid,
                type: e.item.dataset.type,
              });
            },
            onEnd: (e) => {
              // 清理拖拽产生的克隆运动卡片DOM
              // 当运动卡片被拖拽时（pull: "clone"），会产生克隆元素
              // 拖拽结束后，需要清理残留的克隆元素
              if (e.pullMode === "clone") {
                _this.$nextTick(() => {
                  // 检查克隆元素是否还在 DOM 中
                  if (e.item && document.body.contains(e.item)) {
                    // 如果元素不在源容器中（说明是克隆元素）
                    if (!e.from.contains(e.item)) {
                      // 并且父节点存在，则删除克隆元素
                      if (e.item.parentNode) {
                        console.log("清理残留的克隆运动卡片", e.item);
                        e.item.parentNode.removeChild(e.item);
                      }
                    }
                  }
                });
              }
            },
          });
        });
      });
    },

    /**
     * 初始化课表卡片拖拽（运动拖到课表匹配）
     */
    initClassScheduleCardDrag() {
      this.$nextTick(() => {
        const _this = this;
        document.querySelectorAll(".js-class-schedule-card").forEach((el) => {
          new Sortable(el, {
            group: {
              name: "classDrag",
              pull: "clone",
              put: function (e, b) {
                // 只允许同一天的运动拖到课表
                if (
                  e.el.dataset.date === b.el.dataset.date &&
                  b.el.className.indexOf("sportScheduleCard") !== -1
                ) {
                  return true;
                } else {
                  return false;
                }
              },
            },
            animation: 150,
            dataIdAttr: "data-activityId",
            scroll: true,
            scrollSpeed: 20,
            scrollSensitivity: 30,
            bubbleScroll: true,
            onStart: (e) => {},
            onAdd(e) {
              console.log(e, "e");
              // 移除拖拽产生的DOM元素，避免显示重复的运动卡片
              if (e.item && e.item.parentNode) {
                e.item.parentNode.removeChild(e.item);
              }
              _this.handleMatchClass({
                classId: e.to.dataset.id,
                activityId: e.item.dataset.activityid,
                manualActivityId: e.item.dataset.manualactivityid,
                type: "",
              });
            },
            onEnd: (e) => {
              // 清理拖拽产生的克隆元素
              // 当从课表卡片拖出运动卡片时（pull: "clone"），会产生克隆元素
              if (e.pullMode === "clone") {
                _this.$nextTick(() => {
                  // 检查克隆元素是否还在 DOM 中
                  if (e.item && document.body.contains(e.item)) {
                    // 如果元素不在源容器中（说明是克隆元素）
                    if (!e.from.contains(e.item)) {
                      // 并且父节点存在，则删除克隆元素
                      if (e.item.parentNode) {
                        console.log(
                          "清理残留的克隆运动卡片（从课表卡片）",
                          e.item
                        );
                        e.item.parentNode.removeChild(e.item);
                      }
                    }
                  }
                });
              }
            },
          });
        });
      });
    },

    /**
     * 初始化所有拖拽功能
     */
    initAllDrag() {
      this.initClassDrag();
      this.initScheduleDrag();
      this.initActivityDrag();
      this.initClassScheduleCardDrag();
    },
  },
};
