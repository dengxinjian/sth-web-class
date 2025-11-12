<template>
  <div class="plan-table-scroll-container">
    <DynamicScroller
      class="schedule-boxes-wrapper plan-table-container"
      :items="planListWithId"
      :min-item-size="400"
      key-field="id"
      :style="{ height: containerHeight }"
      :emitUpdate="true"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index">
          <div style="display: flex">
            <div class="schedule-boxes-wrapper-content">
              <div class="week-header">第 {{ item.weekIndex + 1 }}周</div>
              <div class="schedule-boxes-container">
                <div
                  v-for="(box, boxIndex) in boxes"
                  :key="boxIndex"
                  class="schedule-box-item"
                  :class="{ 'last-item': boxIndex === boxes.length - 1 }"
                >
                  <div class="box-header">
                    <div class="box-day-text">
                      Day {{ item.weekIndex * 7 + boxIndex + 1 }}
                    </div>
                  </div>
                  <div
                    class="box-content-classes"
                    @contextmenu.stop.prevent="
                      showContextMenu(
                        $event,
                        item.weekIndex * 7 + boxIndex + 1,
                        item.weekIndex,
                        boxIndex
                      )
                    "
                  >
                    <draggable
                      class="js-plan-drag-container"
                      :list="
                        getDayClassesArray(
                          item.weekIndex,
                          item.weekIndex * 7 + boxIndex + 1
                        )
                      "
                      :group="{ name: 'planDrag', pull: true, put: true }"
                      :animation="180"
                      :handle="'.class-drap-handle'"
                      :force-fallback="true"
                      :fallback-on-body="true"
                      :fallback-tolerance="5"
                      :scroll="true"
                      :scroll-sensitivity="60"
                      :scroll-speed="20"
                      :empty-insert-threshold="10"
                      ghost-class="is-plan-drag-ghost"
                      chosen-class="is-plan-drag-chosen"
                      drag-class="is-plan-drag-dragging"
                      :data-week-index="item.weekIndex"
                      :data-week-number="item.weekIndex + 1"
                      :data-day="item.weekIndex * 7 + boxIndex + 1"
                      @choose="
                        handleDragChoose($event, item.weekIndex, boxIndex)
                      "
                      @add="handleDragAdd($event, item.weekIndex, boxIndex)"
                      @unchoose="handleDragUnchoose"
                    >
                      <ClassCard
                        v-for="(classItem, classIndex) in getDayClasses(
                          item.weekData,
                          item.weekIndex * 7 + boxIndex + 1
                        )"
                        :key="`${
                          item.weekIndex * 7 + boxIndex + 1
                        }-${classIndex}-${
                          classItem.createTime ||
                          classItem.classesTitle ||
                          classIndex
                        }`"
                        :class-item="classItem"
                        :date="String(item.weekIndex * 7 + boxIndex + 1)"
                        @delete="
                          handleDeleteClass(
                            classItem,
                            classIndex,
                            item.weekIndex + 1,
                            item.weekIndex * 7 + boxIndex + 1
                          )
                        "
                        @edit="
                          handleEditClass(
                            classItem,
                            classIndex,
                            item.weekIndex + 1,
                            item.weekIndex * 7 + boxIndex + 1
                          )
                        "
                        @copy="handleCopyClass"
                      />
                    </draggable>
                    <div
                      class="box-content"
                      @click="
                        handleBoxClick(
                          item.weekIndex * 7 + boxIndex + 1,
                          item.weekIndex
                        )
                      "
                    >
                      <div class="box-plus-circle">
                        <div class="box-plus">+</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="schedule-boxes-wrapper-content-right">
              <div class="activity-item">
                <div class="activity">
                  <span class="label">STH:</span>
                  <span class="value">{{
                    getweekSth(item.weekIndex) || "--"
                  }}</span>
                </div>
                <div class="activity">
                  <span class="label">时长/距离:</span>
                  <span class="value"
                    >{{
                      secondsToHHMMSS(getweekDuration(item.weekIndex)) ===
                      "00:00:00"
                        ? "--:--:--"
                        : secondsToHHMMSS(getweekDuration(item.weekIndex))
                    }}
                    / {{ getweekDistance(item.weekIndex) || "--" }}km</span
                  >
                </div>
                <div class="activity">
                  <span class="label">游泳时长/距离:</span>
                  <span class="value"
                    >{{
                      secondsToHHMMSS(
                        getweekSwimmingDuration(item.weekIndex)
                      ) === "00:00:00"
                        ? "--:--:--"
                        : secondsToHHMMSS(
                            getweekSwimmingDuration(item.weekIndex)
                          )
                    }}
                    /
                    {{
                      getweekSwimmingDistance(item.weekIndex) > 1000
                        ? getweekSwimmingDistance(item.weekIndex) / 1000 || "--"
                        : getweekSwimmingDistance(item.weekIndex) || "--"
                    }}{{
                      getweekSwimmingDistance(item.weekIndex) > 1000
                        ? "km"
                        : "m"
                    }}</span
                  >
                </div>
                <div class="activity">
                  <span class="label">骑行时长/距离:</span>
                  <span class="value"
                    >{{
                      secondsToHHMMSS(getweekCycleDuration(item.weekIndex)) ===
                      "00:00:00"
                        ? "--:--:--"
                        : secondsToHHMMSS(getweekCycleDuration(item.weekIndex))
                    }}
                    / {{ getweekCycleDistance(item.weekIndex) || "--" }}km</span
                  >
                </div>
                <div class="activity">
                  <span class="label">跑步时长/距离:</span>
                  <span class="value"
                    >{{
                      secondsToHHMMSS(getweekRunDuration(item.weekIndex)) ||
                      "00:00:00"
                        ? "--:--:--"
                        : secondsToHHMMSS(getweekRunDuration(item.weekIndex))
                    }}
                    / {{ getweekRunDistance(item.weekIndex) || "--" }}km</span
                  >
                </div>
                <div class="activity">
                  <span class="label">力量时长:</span>
                  <span class="value">{{
                    secondsToHHMMSS(getweekPowerDuration(item.weekIndex)) ===
                    "00:00:00"
                      ? "--:--:--"
                      : secondsToHHMMSS(getweekPowerDuration(item.weekIndex))
                  }}</span>
                </div>
                <div class="activity">
                  <span class="label">其他时长:</span>
                  <span class="value">{{
                    secondsToHHMMSS(getweekOtherDuration(item.weekIndex)) ||
                    "00:00:00"
                      ? "--:--:--"
                      : secondsToHHMMSS(getweekOtherDuration(item.weekIndex))
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <transition name="context-menu-fade">
      <div
        v-if="contextMenuVisible && hasCopiedClass"
        class="context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click.stop
      >
        <div
          v-if="hasCopiedClass"
          class="context-menu-item"
          @click="handlePaste(contextMenuWeekIndex)"
        >
          <i class="el-icon-document-copy"></i>
          <span>粘贴</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import ClassCard from "./classCard.vue";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import draggable from "vuedraggable";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils/index";
export default {
  name: "ScheduleBoxes",
  components: {
    ClassCard,
    DynamicScroller,
    DynamicScrollerItem,
    draggable,
  },
  props: {
    // 起始编号
    startNumber: {
      type: Number,
      default: 1,
    },
    // 框的数量
    boxCount: {
      type: Number,
      default: 7,
    },
    planList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      contextMenuVisible: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuGlobalDay: null,
      hasCopiedClass: false,
      copiedClass: null,
      contextMenuWeekIndex: null,
      containerHeight: "600px",
      lastUpdateStart: null,
      dragSourceInfo: null, // 保存拖拽源信息
    };
  },
  computed: {
    boxes() {
      return Array.from({ length: this.boxCount }, (_, index) => ({
        number: this.startNumber + index,
        index: index,
      }));
    },
    /**
     * 为 planList 中的每个周数据添加唯一 id
     * RecycleScroller 需要每个 item 有唯一的 key 字段
     */
    planListWithId() {
      return this.planList.map((week, index) => ({
        id: `week-${index}`,
        weekIndex: index,
        weekData: week,
      }));
    },
  },
  mounted() {
    document.addEventListener("click", this.hideContextMenu);
    this.calculateContainerHeight();
    window.addEventListener("resize", this.calculateContainerHeight);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideContextMenu);
    window.removeEventListener("resize", this.calculateContainerHeight);
  },
  methods: {
    secondsToHHMMSS,
    //  计算周运动sth总值
    getweekSth(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }

      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson || typeof classesJson.sth !== "number") {
              return classAcc;
            }

            return classAcc + classesJson.sth;
          }, 0)
        );
      }, 0);
    },
    // 计算周运动时长总和
    getweekDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }

      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    // 计算周运动距离总和
    getweekDistance(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson.distance) {
              return classAcc;
            }
            return classAcc + Number(classesJson.distance);
          }, 0)
        );
      }, 0);
    },
    // 计算周运动游泳时长总和
    getweekSwimmingDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "SWIM"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    // 计算周游泳距离总和
    getweekSwimmingDistance(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson.distance || classItem.sportType !== "SWIM") {
              return classAcc;
            }
            return classAcc + Number(classesJson.distance);
          }, 0)
        );
      }, 0);
    },
    // 计算周骑行时长总和
    getweekCycleDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "CYCLE"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    // 计算周骑行距离总和
    getweekCycleDistance(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }
            if (!classesJson.distance || classItem.sportType !== "CYCLE") {
              return classAcc;
            }
            return classAcc + Number(classesJson.distance);
          }, 0)
        );
      }, 0);
    },
    // 计算周跑步时长总和
    getweekRunDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "RUN"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    // 计算周跑步距离总和
    getweekRunDistance(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }
            if (!classesJson.distance || classItem.sportType !== "RUN") {
              return classAcc;
            }
            return classAcc + Number(classesJson.distance);
          }, 0)
        );
      }, 0);
    },
    // 计算周力量时长总和
    getweekPowerDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }
        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }
            if (
              !classItem.classesJson.duration ||
              classItem.classesJson.duration === "00:00:00" ||
              classItem.classesJson.duration === "--:--:--" ||
              classItem.sportType !== "STRENGTH"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classItem.classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    // 计算周其他时长总和
    getweekOtherDuration(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }
        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }
            if (
              !classItem.classesJson.duration ||
              classItem.classesJson.duration === "00:00:00" ||
              classItem.classesJson.duration === "--:--:--" ||
              classItem.sportType !== "OTHER"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classItem.classesJson.duration);
          }, 0)
        );
      }, 0);
    },
    handleDragChoose(evt, weekIndex, boxIndex) {
      // 拖拽开始时的处理
      // 保存拖拽源信息，用于后续处理
      console.log(evt, "evt");
      if (evt && evt.item) {
        const itemEl = evt.item;
        const fromEl = evt.from;
        this.dragSourceInfo = {
          weekIndex: fromEl ? parseNumber(fromEl.dataset.weekIndex) : null,
          day: fromEl ? parseNumber(fromEl.dataset.day) : null,
          index: typeof evt.oldIndex === "number" ? evt.oldIndex : null,
          isClone: evt.pullMode === "clone",
          sourceItem: itemEl, // 保存源 DOM 元素引用
          sourceContainer: fromEl, // 保存源容器引用
        };
      }
    },
    handleDragUnchoose() {
      // 拖拽取消时的处理
      this.dragSourceInfo = null;
    },
    handleDragAdd(evt, weekIndex, boxIndex) {
      // 计算目标天的全局天数
      const targetGlobalDay = weekIndex * 7 + boxIndex + 1;

      // 如果没有拖拽源信息，说明可能是从外部拖入（如从课程库），直接触发事件
      if (!this.dragSourceInfo) {
        this.$emit("plan-item-move", {
          evt,
          targetWeekIndex: weekIndex,
          targetDay: targetGlobalDay,
          targetIndex: evt.newIndex,
        });
        return;
      }

      const sourceInfo = this.dragSourceInfo;
      const sourceWeekIndex = sourceInfo.weekIndex;
      const sourceDay = sourceInfo.day;
      const sourceIndex = sourceInfo.index;
      const isClone = sourceInfo.isClone;

      // 检查是否是跨周拖拽
      const isCrossWeek =
        sourceWeekIndex !== null && sourceWeekIndex !== weekIndex;
      // 检查是否是跨天拖拽（即使是同一周，不同天之间也是跨数组操作）
      const isCrossDay = sourceDay !== null && sourceDay !== targetGlobalDay;

      // 如果是跨数组拖拽（跨周或跨天）且不是克隆模式，需要从源位置删除
      // 注意：vuedraggable 已经将数据添加到目标数组，但不会自动从源数组删除（因为是不同的数组引用）
      if (
        (isCrossWeek || isCrossDay) &&
        !isClone &&
        sourceWeekIndex !== null &&
        sourceDay !== null &&
        sourceIndex !== null
      ) {
        // 先移除源位置的 DOM 元素（如果还存在）
        const sourceItem = sourceInfo.sourceItem;
        const sourceContainer = sourceInfo.sourceContainer;

        if (sourceItem && sourceContainer) {
          // 检查源元素是否还在源容器中（可能已经被 vuedraggable 移动了）
          if (sourceContainer.contains(sourceItem) && sourceItem.parentNode) {
            try {
              sourceItem.parentNode.removeChild(sourceItem);
            } catch (error) {
              console.warn("移除源 DOM 元素失败:", error);
            }
          }
        }

        // 使用 nextTick 确保 vuedraggable 完成 DOM 更新后再删除源数据
        this.$nextTick(() => {
          // 获取源周的数据
          const sourceWeek = this.planList[sourceWeekIndex];
          if (sourceWeek && Array.isArray(sourceWeek)) {
            // 查找源天的数据对象
            const sourceDayData = sourceWeek.find(
              (item) => item && item.day === sourceDay
            );

            if (sourceDayData && Array.isArray(sourceDayData.details)) {
              // 从源位置删除课程
              // 注意：由于 vuedraggable 可能已经修改了数组，我们需要确保删除正确的索引
              // 如果源索引仍然有效，则删除
              if (
                sourceIndex >= 0 &&
                sourceIndex < sourceDayData.details.length
              ) {
                // Vue 2 会自动检测数组的 splice 操作，触发响应式更新
                sourceDayData.details.splice(sourceIndex, 1);

                // 如果删除后该天的 details 数组为空，可以选择删除该天的数据对象
                if (sourceDayData.details.length === 0) {
                  const dayIndex = sourceWeek.findIndex(
                    (item) => item && item.day === sourceDay
                  );
                  if (dayIndex !== -1) {
                    sourceWeek.splice(dayIndex, 1);
                  }
                }
              }
            }
          }

          // 再次尝试移除源位置的 DOM 元素（确保清理）
          if (sourceContainer) {
            // 查找源容器中对应索引的 ClassCard 元素
            const sourceCards = sourceContainer.querySelectorAll(
              ".plan-class-card-wrapper"
            );
            if (sourceCards.length > sourceIndex && sourceCards[sourceIndex]) {
              try {
                const cardToRemove = sourceCards[sourceIndex];
                if (cardToRemove.parentNode) {
                  cardToRemove.parentNode.removeChild(cardToRemove);
                }
              } catch (error) {
                console.warn("移除源 DOM 元素失败:", error);
              }
            }
          }

          // 强制更新视图，确保删除操作被正确反映
          this.$forceUpdate();
        });
      }

      // 获取被拖拽的课程项（vuedraggable 已经添加到目标数组）
      const targetWeek = this.planList[weekIndex];
      let movedClassItem = null;
      if (targetWeek && Array.isArray(targetWeek)) {
        const targetDayData = targetWeek.find(
          (item) => item && item.day === targetGlobalDay
        );
        if (
          targetDayData &&
          Array.isArray(targetDayData.details) &&
          evt.newIndex !== undefined
        ) {
          movedClassItem = targetDayData.details[evt.newIndex];
        }
      }

      // 触发事件，通知父组件
      this.$emit("plan-item-move", {
        evt,
        sourceWeekIndex,
        sourceDay,
        sourceIndex,
        targetWeekIndex: weekIndex,
        targetDay: targetGlobalDay,
        targetIndex: evt.newIndex,
        isClone,
        isCrossWeek,
        isCrossDay,
        movedClassItem,
      });

      // 清除拖拽源信息
      this.dragSourceInfo = null;
    },

    /**
     * 计算容器高度
     * 根据视口高度减去头部高度来计算
     */
    calculateContainerHeight() {
      // 获取视口高度
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // 减去头部高度（Planned Schedule 头部大约80px）
      const headerHeight = 80;
      // 计算可用高度
      const availableHeight = viewportHeight - headerHeight;
      // 最小高度为400px
      this.containerHeight = `${Math.max(400, availableHeight)}px`;
    },
    /**
     * 获取指定天的课程数组引用（用于 vuedraggable）
     * @param {Number} weekIndex - 周索引
     * @param {Number} globalDay - 全局天数
     * @returns {Array} 课程数组引用
     */
    getDayClassesArray(weekIndex, globalDay) {
      const week = this.planList[weekIndex];
      if (!Array.isArray(week)) {
        return [];
      }

      // 查找该天的数据对象
      let dayData = week.find((item) => item && item.day === globalDay);

      if (!dayData) {
        // 如果不存在，创建一个新的
        dayData = {
          day: globalDay,
          details: [],
        };
        week.push(dayData);
      }

      if (!Array.isArray(dayData.details)) {
        this.$set(dayData, "details", []);
      }

      // 处理每个课程，解析 classesJson 字符串为对象
      dayData.details.forEach((classItem) => {
        if (typeof classItem.classesJson === "string") {
          try {
            classItem.classesJson = JSON.parse(classItem.classesJson);
          } catch (error) {
            console.error(
              "解析 classesJson 失败:",
              error,
              classItem.classesJson
            );
            classItem.classesJson = {};
          }
        }
      });

      return dayData.details;
    },
    /**
     * 获取指定天的课程列表
     * @param {Array} week - 周数据数组
     * @param {Number} globalDay - 全局天数
     * @returns {Array} 处理后的课程列表
     */
    getDayClasses(week, globalDay) {
      if (!week || !Array.isArray(week)) {
        return [];
      }

      // 查找该天的数据对象
      const dayData = week.find((item) => item && item.day === globalDay);

      if (!dayData || !dayData.details || !Array.isArray(dayData.details)) {
        return [];
      }

      // 处理每个课程，解析 classesJson 字符串为对象
      return dayData.details.map((classItem) => {
        const processedItem = { ...classItem };

        // 如果 classesJson 是字符串，解析为对象
        if (typeof classItem.classesJson === "string") {
          try {
            processedItem.classesJson = JSON.parse(classItem.classesJson);
          } catch (error) {
            console.error(
              "解析 classesJson 失败:",
              error,
              classItem.classesJson
            );
            processedItem.classesJson = {};
          }
        }

        return processedItem;
      });
    },
    handleBoxClick(globalDay, weekIndex) {
      this.$emit("box-click", {
        weekNumber: weekIndex + 1,
        globalDay: globalDay,
      });
    },
    handleDeleteClass(classItem, classIndex, weekNumber, globalDay) {
      this.$emit("delete-class", classItem, classIndex, weekNumber, globalDay);
    },
    handleEditClass(classItem, classIndex, weekNumber, globalDay) {
      this.$emit("edit-class", classItem, classIndex, weekNumber, globalDay);
    },
    showContextMenu(event, globalDay, weekIndex, boxIndex) {
      // 使用 nextTick 确保在隐藏旧菜单后再显示新菜单
      this.$nextTick(() => {
        this.contextMenuVisible = true;
        this.contextMenuX = event.clientX;
        this.contextMenuY = event.clientY;
        this.contextMenuGlobalDay = globalDay;
        this.contextMenuWeekIndex = weekIndex;
      });
    },
    hideContextMenu() {
      this.contextMenuVisible = false;
      this.contextMenuGlobalDay = null;
      this.contextMenuWeekIndex = null;
      // 不要清除 copiedClass 和 hasCopiedClass，这样复制状态会保留
    },
    handlePaste(weekIndex) {
      const weekNumber = weekIndex + 1;
      this.$emit(
        "paste-class",
        this.contextMenuGlobalDay,
        weekNumber,
        this.copiedClass
      );
      this.hideContextMenu();
      // 粘贴完成后清除复制状态
      this.hasCopiedClass = false;
      this.copiedClass = null;
    },
    handleCopyClass(classItem) {
      this.copiedClass = { ...classItem };
      this.hasCopiedClass = true;
      this.$message({
        message: "课表已复制，右键点击目标日期可粘贴",
        type: "success",
        duration: 2000,
      });
    },
  },
};

function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
</script>

<style scoped lang="scss">
.schedule-boxes-wrapper {
  background-color: transparent;
  overflow-y: auto;
  overflow-x: hidden;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 4px;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #c0c4cc 0%, #909399 100%);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);

    &:hover {
      background: linear-gradient(180deg, #909399 0%, #606266 100%);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
    }

    &:active {
      background: linear-gradient(180deg, #606266 0%, #303133 100%);
    }
  }

  /* Firefox 滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc rgba(0, 0, 0, 0.02);
}
// .schedule-boxes-wrapper {
//   width: 100%;
// }
.schedule-boxes-wrapper-content {
  flex: 0.85;
  border-right: 1px solid #e5e5e5;
}

.week-header {
  width: 100%;
  background-color: #f9f0ef;
  padding: 10px 0;
  border-bottom: 1px solid #fff;
  margin-bottom: 10px;
  text-align: center;
}

.schedule-boxes-container {
  display: flex;
  align-items: stretch;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
}

.schedule-box-item {
  flex: 1;
  padding: 0;
  position: relative;
  border-left: 1px solid #e5e5e5;
  border-right: 1px solid #e5e5e5;
  background-color: #f8f8f8;
  min-height: 200px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  .box-header {
    width: 100%;
    padding: 12px 0 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    background-color: #f5f5f5;

    .box-day-text {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }

    .box-divider {
      width: 80%;
      height: 1px;
      background-color: #e5e5e5;
    }
  }
  .box-content-classes {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .box-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 20px;
    border: 2px solid #e5e5e5;
    background-color: #fff;
    transition: all 0.3s ease;
    opacity: 0;
    margin-bottom: 60px;

    &:hover {
      opacity: 1;
      .box-plus-circle {
        border-color: #bc362e;

        .box-plus {
          color: #bc362e;
        }
      }
    }

    &:active {
      opacity: 0.8;
    }

    .box-plus-circle {
      .box-plus {
        font-size: 22px;
        color: #303133;
        font-weight: 300;
        user-select: none;
        line-height: 1;
        margin-bottom: 5px;
        transition: all 0.2s ease;
      }
    }
  }
}

::v-deep .is-plan-drag-ghost {
  opacity: 0.5;
  transform: scale(0.98);
}

::v-deep .js-plan-drag-container {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

::v-deep .js-plan-drag-container.is-plan-drop-target {
  background-color: rgba(64, 158, 255, 0.08);
}

::v-deep .js-plan-drag-container.is-plan-drop-active {
  background-color: rgba(64, 158, 255, 0.16);
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.25);
}
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 99999;
  padding: 4px 0;
  min-width: 120px;

  .context-menu-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;

    i {
      font-size: 16px;
    }

    &:hover {
      background-color: #f5f7fa;
      color: #cc2323;
    }
  }
}

.context-menu-fade-enter-active,
.context-menu-fade-leave-active {
  transition: opacity 0.2s ease;
}

.context-menu-fade-enter,
.context-menu-fade-leave-to {
  opacity: 0;
}

.schedule-boxes-wrapper-content-right {
  flex: 0.15;
  background-color: #fff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.activity-summary-header {
  width: 100%;
  padding: 10px 0;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 10px;

  .summary-title {
    font-size: 14px;
    color: #303133;
    text-align: left;
    white-space: nowrap;
  }
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  padding-top: 20px;

  &:last-child {
    border-bottom: none;
  }

  > div {
    font-size: 13px;
    color: #606266;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 1.8;
    white-space: nowrap;

    .label {
      flex: 0 0 auto;
      margin-right: 8px;
    }

    .value {
      flex: 0 0 auto;
      text-align: right;
    }
  }

  .activity {
    margin-bottom: 2px;

    .label {
      font-weight: 500;
      color: #303133;
    }
  }
}
</style>
