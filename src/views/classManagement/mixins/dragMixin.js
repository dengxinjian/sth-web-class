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
     * 选中时设置浅红色背景
     */
    setDragBg(e) {
      const cardElement =
        e.item.closest(
          ".classScheduleCard, .sportScheduleCard, .class-schedule-card-container"
        ) || e.item;
      if (cardElement) {
        cardElement.dataset.originalBg =
          cardElement.style.backgroundColor || "";
        cardElement.style.backgroundColor = "#f7d7d7";
      }
      console.log(cardElement, "cardElement");
      console.log(
        cardElement.style.backgroundColor,
        "cardElement.style.backgroundColor"
      );

      const cardBody =
        (e.item.classList &&
          (e.item.classList.contains("card-body") ||
            e.item.classList.contains("sport-drap-handle") ||
            e.item.classList.contains("class-drap-handle"))) ||
        !cardElement
          ? e.item
          : cardElement.querySelector(".card-body");

      if (cardElement) {
        cardElement.dataset.originalBg =
          cardElement.style.backgroundColor || "";
        cardElement.style.backgroundColor = "#F92B3033";
      }
      if (cardBody && cardBody !== cardElement) {
        cardBody.dataset.originalBg = cardBody.style.backgroundColor || "";
        cardBody.style.backgroundColor = "#F92B3033";
      }
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
            scrollSpeed: 20,
            scrollSensitivity: 30, // 增加敏感度
            bubbleScroll: true,
            ghostClass: "is-drag-ghost",
            chosenClass: "is-drag-chosen",
            onStart: (e) => {
              this.setDragBg(e);
            },
            onEnd: (e) => {
              console.log(e, "e");
              this.restoreDragBg(e);
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
        // 用于保存拖动过程中的目标赛事容器
        let lastEventDropTarget = null;

        document
          .querySelectorAll(".js-schedule-drag-container")
          .forEach((el) => {
            new Sortable(el, {
              group: { name: "classDrag" },
              animation: 150,
              dataIdAttr: "data-id",
              scroll: true,
              scrollContainer: scrollContainerEl, // 指定滚动容器为课表外层容器
              scrollSpeed: 20,
              scrollSensitivity: 30, // 增加敏感度
              bubbleScroll: true,
              ghostClass: "is-drag-ghost",
              chosenClass: "is-drag-chosen",
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
                _this.restoreDragBg(e);
                lastEventDropTarget = null; // 清理
              },
              onChoose: (e) => {
                console.log("onChoose - 开始选择元素", e);
              },
              onUnchoose: (e) => {
                console.log("onUnchoose - 取消选择", e);
                _this.restoreDragBg(e);
              },
              onMove: (evt, originalEvent) => {
                console.log("onMove 触发", {
                  dragged: evt.dragged,
                  related: evt.related,
                  target: originalEvent?.target,
                  to: evt.to,
                });

                const isActivityDrag =
                  evt.dragged &&
                  evt.dragged.classList &&
                  evt.dragged.classList.contains("sport-drap-handle");

                console.log("isActivityDrag:", isActivityDrag);

                if (isActivityDrag) {
                  // 尝试多种方式查找赛事容器
                  let eventDropEl = null;

                  // 方式1: 从 originalEvent.target 查找
                  if (originalEvent && originalEvent.target) {
                    console.log("originalEvent.target:", originalEvent.target);
                    eventDropEl = originalEvent.target.closest(
                      ".js-event-drop-container"
                    );
                    if (eventDropEl) {
                      console.log("从 originalEvent.target 找到赛事容器");
                    }
                  }

                  // 方式2: 从 evt.related 查找
                  if (!eventDropEl && evt.related) {
                    console.log("evt.related:", evt.related);
                    eventDropEl = evt.related.closest(
                      ".js-event-drop-container"
                    );
                    if (eventDropEl) {
                      console.log("从 evt.related 找到赛事容器");
                    }
                  }

                  // 方式3: 检查 evt.related 本身是否是赛事容器
                  if (
                    !eventDropEl &&
                    evt.related &&
                    evt.related.classList?.contains("js-event-drop-container")
                  ) {
                    eventDropEl = evt.related;
                    console.log("evt.related 本身就是赛事容器");
                  }

                  console.log("最终 eventDropEl:", eventDropEl);

                  // 保存目标赛事容器，供 onAdd 使用
                  if (eventDropEl) {
                    lastEventDropTarget = eventDropEl;
                    console.log(
                      "onMove - 检测到赛事容器:",
                      eventDropEl,
                      "eventId:",
                      eventDropEl.dataset.id
                    );
                  } else {
                    lastEventDropTarget = null;
                  }
                }

                // 允许拖放继续，在 onAdd 中处理
                return true;
              },
              onChange: (evt) => {},
              onUpdate: (e) => {
                // 同一容器内排序时触发
                console.log("onUpdate - 同一容器内排序", e);
              },
              onAdd: (e) => {
                console.log("onAdd - 元素添加到容器", e);
                console.log("onAdd - e.related:", e.related);
                console.log("onAdd - e.to:", e.to);
                console.log("onAdd - e.item:", e.item);
                console.log(
                  "onAdd - lastEventDropTarget:",
                  lastEventDropTarget
                );

                // 检查是否拖到了赛事容器
                // 如果拖到了赛事容器，直接处理匹配逻辑
                const isActivityDrag =
                  e.item &&
                  (e.item.classList.contains("sport-drap-handle") ||
                    e.item.dataset?.activityid ||
                    e.item.dataset?.manualactivityid);
                console.log(isActivityDrag, "isActivityDrag");

                if (isActivityDrag) {
                  // 使用在 onMove 中保存的目标赛事容器
                  let eventDropContainer = lastEventDropTarget;

                  // 如果 onMove 没有保存目标，尝试其他方法获取
                  if (!eventDropContainer) {
                    console.log("尝试查找赛事容器...");

                    // 方法1: 从 e.related 查找
                    if (e.related) {
                      console.log("尝试从 e.related 查找");
                      eventDropContainer =
                        e.related.closest(".js-event-drop-container") ||
                        (e.related.classList?.contains(
                          "js-event-drop-container"
                        )
                          ? e.related
                          : null);
                      if (eventDropContainer) {
                        console.log("从 e.related 找到赛事容器");
                      }
                    }

                    // 方法2: 查找 e.to 的所有赛事容器子元素
                    if (!eventDropContainer && e.to) {
                      console.log("尝试从 e.to 查找所有赛事容器");
                      const allEventContainers = e.to.querySelectorAll(
                        ".js-event-drop-container"
                      );
                      console.log(
                        "找到的赛事容器数量:",
                        allEventContainers.length
                      );

                      // 如果只有一个赛事容器，直接使用
                      if (allEventContainers.length === 1) {
                        eventDropContainer = allEventContainers[0];
                        console.log("只有一个赛事容器，直接使用");
                      } else if (allEventContainers.length > 1) {
                        // 如果有多个赛事容器，需要找到运动卡片被插入到哪个赛事的后面
                        console.log("有多个赛事容器，检查运动卡片的位置");

                        // 获取 e.item 在 DOM 中的位置
                        const itemIndex = Array.from(e.to.children).indexOf(
                          e.item
                        );
                        console.log("运动卡片在容器中的索引:", itemIndex);

                        // 向前查找最近的赛事容器
                        for (let i = itemIndex - 1; i >= 0; i--) {
                          const sibling = e.to.children[i];
                          if (
                            sibling.classList.contains(
                              "js-event-drop-container"
                            )
                          ) {
                            eventDropContainer = sibling;
                            console.log("找到前面的赛事容器，索引:", i);
                            break;
                          }
                          const nestedEvent = sibling.querySelector(
                            ".js-event-drop-container"
                          );
                          if (nestedEvent) {
                            eventDropContainer = nestedEvent;
                            console.log("找到前面兄弟元素内的赛事容器");
                            break;
                          }
                        }
                      }
                    }
                    // 方法3: 从 e.to 本身查找
                    if (!eventDropContainer) {
                      console.log("尝试从 e.to 本身查找");
                      eventDropContainer =
                        e.to.closest(".js-event-drop-container") ||
                        (e.to.classList?.contains("js-event-drop-container")
                          ? e.to
                          : null);
                      if (eventDropContainer) {
                        console.log("从 e.to 本身找到赛事容器");
                      }
                    }
                  }

                  console.log("eventDropContainer:", eventDropContainer);

                  if (eventDropContainer) {
                    console.log(
                      "运动卡片拖到赛事容器，直接处理匹配逻辑",
                      eventDropContainer,
                      "eventId:",
                      eventDropContainer.dataset.id
                    );

                    // 立即移除元素，避免显示
                    if (e.item && e.item.parentNode) {
                      e.item.parentNode.removeChild(e.item);
                    }

                    // 直接调用匹配逻辑
                    if (typeof _this.handleMatchEvent === "function") {
                      // 获取运动数据
                      const originalItem = e.from.querySelector(
                        `[data-activityid="${e.item.dataset.activityid}"], [data-manualactivityid="${e.item.dataset.manualactivityid}"]`
                      );

                      const activityId =
                        e.item.dataset.activityid ||
                        originalItem?.dataset?.activityid ||
                        null;
                      const manualActivityId =
                        e.item.dataset.manualactivityid ||
                        originalItem?.dataset?.manualactivityid ||
                        null;
                      const activityDate =
                        e.item.dataset.date ||
                        originalItem?.dataset?.date ||
                        e.from.dataset?.date ||
                        null;

                      // 触发匹配逻辑
                      _this.handleMatchEvent({
                        eventId: eventDropContainer.dataset.id,
                        eventDate:
                          eventDropContainer.dataset.date || e.to.dataset.date,
                        activityId: activityId,
                        manualActivityId: manualActivityId,
                        activityDate: activityDate,
                      });
                    } else {
                      console.warn("handleMatchEvent is not implemented");
                    }

                    return; // 阻止 initScheduleDrag 处理
                  } else {
                    return _this.getScheduleData();
                  }
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
            swapThreshold: 0, // 禁用交换阈值
            invertSwap: false, // 禁用反转交换
            animation: 0, // 禁用动画，避免闪动
            forceFallback: false, // 使用 HTML5 拖拽
            dataIdAttr: "data-id",
            scroll: true,
            scrollContainer: scrollContainerEl, // 指定滚动容器为课表外层容器
            scrollSpeed: 20,
            scrollSensitivity: 30, // 增加敏感度
            bubbleScroll: true,
            ghostClass: "is-drag-ghost",
            chosenClass: "is-drag-chosen",
            onStart: (e) => {
              _this.setDragBg(e);
            },
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
              _this.restoreDragBg(e);
              // 清理拖拽产生的克隆运动卡片DOM
              // 当运动卡片被拖拽时（pull: "clone"），会产生克隆元素
              // 拖拽结束后，需要清理残留的克隆元素
              console.log(e, "e");
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
            dataIdAttr: "data-id",
            scroll: true,
            scrollSpeed: 20,
            scrollSensitivity: 30, // 增加敏感度
            bubbleScroll: true,
            ghostClass: "is-drag-ghost",
            chosenClass: "is-drag-chosen",
            onStart: (e) => {
              _this.setDragBg(e);
            },
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
              _this.restoreDragBg(e);
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
