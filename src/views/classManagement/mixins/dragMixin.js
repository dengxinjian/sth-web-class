/**
 * 拖拽功能混入
 * 封装Sortable.js的拖拽逻辑
 */

import Sortable from "sortablejs";

export default {
  data() {
    return {
      // 拖拽是否已准备好（Sortable 实例是否已完全初始化）
      isDragReady: false,
      // 拖拽初始化中的标记
      isDragInitializing: false,
    };
  },
  methods: {
    /**
     * 清理残留的 ghost 元素
     */
    cleanupGhostElements() {
      const ghostElements = document.querySelectorAll(
        ".is-drag-ghost, .is-drag-chosen, .sortable-ghost, .sortable-chosen"
      );
      ghostElements.forEach((ghost) => {
        if (ghost && ghost.parentNode) {
          ghost.classList.remove(
            "is-drag-ghost",
            "is-drag-chosen",
            "sortable-ghost",
            "sortable-chosen"
          );
          // 如果元素完全脱离了正常文档流，尝试移除
          const computedStyle = window.getComputedStyle(ghost);
          if (
            computedStyle.position === "fixed" ||
            computedStyle.position === "absolute"
          ) {
            console.log("发现悬浮的 ghost 元素，尝试移除", ghost);
            ghost.style.display = "none";
          }
        }
      });
    },

    /**
     * 选中时设置浅红色背景
     */
    setDragBg(e) {
      // const cardElement =
      //   e.item.closest(
      //     ".ActivityCard,.classScheduleCard,.sportScheduleCard,.class-schedule-card-container",
      //   ) || e.item;
      // if (cardElement) {
      //   cardElement.dataset.originalBg =
      //     cardElement.style.backgroundColor || "";
      //   cardElement.style.backgroundColor = "#f7d7d7";
      // }
      // console.log(cardElement, "cardElement");
      // console.log(
      //   cardElement.style.backgroundColor,
      //   "cardElement.style.backgroundColor"
      // );
      // const cardBody =
      //   (e.item.classList &&
      //     (e.item.classList.contains("card-body") ||
      //       e.item.classList.contains("sport-drap-handle") ||
      //       e.item.classList.contains("class-drap-handle"))) ||
      //   !cardElement
      //     ? e.item
      //     : cardElement.querySelector(".card-body");
      // if (cardElement) {
      //   cardElement.dataset.originalBg =
      //     cardElement.style.backgroundColor || "";
      //   cardElement.style.backgroundColor = "#F92B3033";
      // }
      // if (cardBody && cardBody !== cardElement) {
      //   cardBody.dataset.originalBg = cardBody.style.backgroundColor || "";
      //   cardBody.style.backgroundColor = "#F92B3033";
      // }
      // console.log(cardBody, "cardBody");
    },

    /**
     * 恢复原始背景
     */
    restoreDragBg(e) {
      const cardElement =
        e.item.closest(
          ".classScheduleCard, .sportScheduleCard, .class-schedule-card-container"
        ) || e.item;
      const cardBody =
        (e.item.classList &&
          (e.item.classList.contains("card-body") ||
            e.item.classList.contains("sport-drap-handle") ||
            e.item.classList.contains("class-drap-handle"))) ||
        !cardElement
          ? e.item
          : cardElement.querySelector(".card-body");
      if (cardElement && cardElement.dataset.originalBg !== undefined) {
        cardElement.style.backgroundColor = cardElement.dataset.originalBg;
        delete cardElement.dataset.originalBg;
      }
      if (
        cardBody &&
        cardBody !== cardElement &&
        cardBody.dataset.originalBg !== undefined
      ) {
        cardBody.style.backgroundColor = cardBody.dataset.originalBg;
        delete cardBody.dataset.originalBg;
      }
    },

    findDataset(e, newlevel) {
      let level = newlevel || 0;
      if (level === 0) {
        if (
          e.originalEvent.srcElement.offsetParent &&
          e.originalEvent.srcElement.offsetParent.dataset &&
          e.originalEvent.srcElement.offsetParent.dataset.type
        ) {
          return e.originalEvent.srcElement.offsetParent.dataset;
        } else {
          level++;
          return this.findDataset(
            e.originalEvent.srcElement.offsetParent,
            level
          );
        }
      } else {
        if (
          e.offsetParent &&
          e.offsetParent.dataset &&
          e.offsetParent.dataset.type
        ) {
          return e.offsetParent.dataset;
        } else {
          level++;
          if (e.offsetParent) {
            return this.findDataset(e.offsetParent, level);
          } else {
            level++;
            return null;
          }
        }
      }
    },

    /**
     * 初始化日历容器拖拽（课表排序和移动）
     */
    initScheduleDrag() {
      // 标记开始初始化，拖拽暂时不可用
      this.isDragInitializing = true;
      this.isDragReady = false;

      // 清理之前可能残留的 ghost 元素
      this.cleanupGhostElements();

      this.$nextTick(() => {
        const _this = this;
        const scrollContainerEl = document.querySelector(
          ".schedule-table-container"
        );
        // 用于保存拖动过程中的目标赛事容器
        let lastEventDropTarget = null;

        const containers = document.querySelectorAll(
          ".js-schedule-drag-container"
        );
        let initializedCount = 0;
        const totalContainers = containers.length;

        containers.forEach((el) => {
          new Sortable(el, {
            group: { name: "classDrag" },
            animation: 150,
            dataIdAttr: "data-id",
            scroll: true,
            scrollContainer: scrollContainerEl, // 指定滚动容器为课表外层容器
            scrollSpeed: 40,
            scrollSensitivity: 300, // 增加敏感度
            bubbleScroll: true,
            ghostClass: "is-drag-ghost",
            chosenClass: "is-drag-chosen",
            forceFallback: false, // 忽略 HTML5拖拽行为，强制回调进行
            // 过滤掉健康数据卡片 赛事卡片，使其不可拖拽
            filter:
              ".js-health-data-no-drag,.js-event-drag-no-drag,.js-schedule-drag-no-drag",
            onStart: (e) => {
              console.log("onStart", e);
              _this.setDragBg(e);
              lastEventDropTarget = null; // 重置
            },
            onEnd: (e) => {
              console.log("onEnd", e);
              // 检查拖拽是否已准备就绪
              _this.restoreDragBg(e);

              // 清理可能残留的 ghost 元素
              _this.cleanupGhostElements();

              lastEventDropTarget = null; // 清理
              // 课程 ，课表 移动到运动
              if (e.item.firstChild.dataset.type === "classSchedule") {
                console.log(e.item.firstChild, "e.item.firstChild");
                if (
                  e.originalEvent.srcElement.offsetParent &&
                  e.originalEvent.srcElement.offsetParent.dataset &&
                  e.originalEvent.srcElement.offsetParent.dataset.type &&
                  e.originalEvent.srcElement.offsetParent.dataset.type ===
                    "activity"
                ) {
                  console.log(
                    e.originalEvent.srcElement.offsetParent,
                    "e.originalEvent.srcElement.offsetParent"
                  );
                  console.log(
                    e.originalEvent.srcElement.offsetParent.dataset,
                    "e.originalEvent.srcElement.offsetParent.dataset"
                  );
                  console.log({
                    classId: e.item.firstChild.dataset.id,
                    activityId:
                      e.originalEvent.srcElement.offsetParent.dataset
                        .activityid,
                    manualActivityId:
                      e.originalEvent.srcElement.offsetParent.dataset
                        .manualactivityid,
                    type: "activity",
                  });
                  _this.handleMatchClass({
                    classId: e.item.firstChild.dataset.id,
                    activityId:
                      e.originalEvent.srcElement.offsetParent.dataset
                        .activityid,
                    manualActivityId:
                      e.originalEvent.srcElement.offsetParent.dataset
                        .manualactivityid,
                    type: e.originalEvent.srcElement.offsetParent.dataset.type,
                  });
                }
                // 运动移动
              } else if (e.item.firstChild.dataset.type === "activity") {
                console.log(e.item.firstChild, "e.item.firstChild");
                const dataset = _this.findDataset(e);
                console.log(dataset, "dataset");
                // 运动移动到课表
                if (dataset && dataset.type === "classSchedule") {
                  _this.handleMatchClass({
                    classId: dataset.id,
                    activityId: e.item.firstChild.dataset.activityid,
                    manualActivityId:
                      e.item.firstChild.dataset.manualactivityid,
                    type: e.item.firstChild.dataset.type,
                  });
                  // 运动移动到赛事
                } else if (dataset && dataset.type === "event") {
                  console.log("移动到赛事了===================");
                  _this.handleMatchEvent({
                    eventId: dataset.id,
                    eventDate: dataset.date,
                    activityId: e.item.firstChild.dataset.activityid,
                    manualActivityId:
                      e.item.firstChild.dataset.manualactivityid,
                    activityDate: e.item.firstChild.dataset.date,
                  });
                } else {
                  _this.getScheduleData();
                }
              }
            },
            onChoose: (e) => {
              console.log("onChoose - 开始选择元素", e);
            },
            onUnchoose: (e) => {
              console.log("onUnchoose - 取消选择", e);
              _this.restoreDragBg(e);
            },
            onChange: (evt) => {},
            onUpdate: (e) => {
              // 同一容器内排序时触发
              console.log("onUpdate - 同一容器内排序", e);
              if (
                e.item.firstChild &&
                e.item.firstChild.dataset.type === "classSchedule" &&
                e.originalEvent.srcElement.offsetParent &&
                e.originalEvent.srcElement.offsetParent.dataset &&
                e.originalEvent.srcElement.offsetParent.dataset.type &&
                e.originalEvent.srcElement.offsetParent.dataset.type !==
                  "activity"
              ) {
                _this.handleScheduleDragAdd(e);
              } else {
                _this.getScheduleData();
              }
            },
            onAdd: (e) => {
              console.log("onAdd - 元素添加到容器", e);
              console.log("onAdd - e.related:", e.related);
              console.log("onAdd - e.to:", e.to);
              console.log("onAdd - e.item:", e.item);
              console.log("onAdd - lastEventDropTarget:", lastEventDropTarget);
              // 清理可能残留的 ghost 元素
              _this.cleanupGhostElements();
              if (
                e.item.firstChild &&
                e.item.firstChild.dataset.type === "activity"
              ) {
                // 移除当前拖拽产生的DOM元素
                if (e.item && e.item.parentNode) {
                  e.item.parentNode.removeChild(e.item);
                  // 调用 getScheduleData 重新加载数据，确保视图更新
                  // 使用 $nextTick 确保在下一个事件循环中执行，避免与拖拽事件冲突
                  _this.$nextTick(() => {
                    _this.getScheduleData();
                  });

                  return;
                }
              }
              if (
                e.item.firstChild.dataset.type === "classSchedule" &&
                e.originalEvent.srcElement.offsetParent &&
                e.originalEvent.srcElement.offsetParent.dataset &&
                e.originalEvent.srcElement.offsetParent.dataset.type &&
                e.originalEvent.srcElement.offsetParent.dataset.type ===
                  "activity"
              ) {
                return;
              } else {
                console.log(e, "e===================");
                _this.handleScheduleDragAdd(e);
              }
            },
            onRemove: (e) => {
              console.log("onRemove - 元素从容器移除", e);
            },
          });

          // 记录已初始化的容器数量
          initializedCount++;

          // 如果所有容器都已初始化，标记拖拽为就绪状态
          if (initializedCount === totalContainers) {
            _this.$nextTick(() => {
              _this.isDragReady = true;
              _this.isDragInitializing = false;
              console.log("✅ 拖拽初始化完成，现在可以拖动了");
            });
          }
        });
      });
    },

    /**
     * 初始化所有拖拽功能
     */
    initAllDrag() {
      // this.initClassDrag();
      this.initScheduleDrag();
      // this.initActivityDrag();
      // this.initClassScheduleCardDrag();
    },
  },
};
