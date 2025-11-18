<template>
  <div class="plan-table-scroll-container">
    <div
      class="schedule-boxes-wrapper plan-table-container"
      :style="{ height: containerHeight, overflowY: 'auto' }"
    >
      <div
        v-for="(item, index) in planListWithId"
        :key="item.id || `week-${index}`"
        :data-index="index"
        style="display: flex"
      >
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
                class="box-content-classes js-plan-drag-container"
                :data-week-index="item.weekIndex"
                :data-day-index="boxIndex"
                :data-global-day="item.weekIndex * 7 + boxIndex + 1"
                @contextmenu.stop.prevent="
                  showContextMenu(
                    $event,
                    item.weekIndex * 7 + boxIndex + 1,
                    item.weekIndex,
                    boxIndex
                  )
                "
              >
                <EventCard
                  v-for="(eventItem, eventIndex) in getDayEvents(
                    item.weekData,
                    item.weekIndex * 7 + boxIndex + 1
                  )"
                  :key="`${item.weekIndex * 7 + boxIndex + 1}-${eventIndex}-${
                    eventItem.competitionName || eventIndex
                  }`"
                  :event-item="eventItem"
                  :date="String(item.weekIndex * 7 + boxIndex + 1)"
                  @edit="
                    $emit(
                      'edit-event',
                      eventItem,
                      eventIndex,
                      item.weekIndex + 1,
                      item.weekIndex * 7 + boxIndex + 1
                    )
                  "
                  @delete="
                    handleDeleteEvent(
                      eventItem,
                      eventIndex,
                      item.weekIndex + 1,
                      item.weekIndex * 7 + boxIndex + 1
                    )
                  "
                />
                <draggable
                  :key="`draggable-${item.weekIndex}-${boxIndex}`"
                  :list="
                    getDayDetailsArray(
                      item.weekData,
                      item.weekIndex * 7 + boxIndex + 1
                    )
                  "
                  :group="{
                    name: 'plan-classes',
                    put: true,
                  }"
                  :force-fallback="true"
                  :fallback-on-body="true"
                  :fallback-tolerance="10"
                  :scroll="true"
                  :scroll-sensitivity="80"
                  :scroll-speed="20"
                  :empty-insert-threshold="50"
                  :swap-threshold="0.65"
                  :invert-swap="false"
                  :filter="'.js-plan-drag-no-drag .box-content'"
                  :ghost-class="'is-plan-drag-ghost'"
                  :chosen-class="'is-plan-drag-chosen'"
                  :drag-class="'is-plan-drag-drag'"
                  tag="div"
                  :emptyInsertThreshold="10"
                  class="draggable-classes-container"
                  @start="handleDragStart"
                  @end="handleDragEnd"
                >
                  <ClassCard
                    v-for="(classItem, classIndex) in getDayDetailsArray(
                      item.weekData,
                      item.weekIndex * 7 + boxIndex + 1
                    )"
                    :key="`${item.weekIndex * 7 + boxIndex + 1}-${classIndex}-${
                      classItem.createTime ||
                      classItem.classesTitle ||
                      classItem.id ||
                      classIndex
                    }`"
                    :class-item="classItem"
                    :date="String(item.weekIndex * 7 + boxIndex + 1)"
                    :is-dragging="isDragging"
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
                  <div
                    class="box-content"
                    :class="{ 'is-dragging': isDragging }"
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
                </draggable>
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
                  secondsToHHMMSS(getweekSwimmingDuration(item.weekIndex)) ===
                  "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekSwimmingDuration(item.weekIndex))
                }}
                /
                {{
                  getweekSwimmingDistance(item.weekIndex) > 1000
                    ? getweekSwimmingDistance(item.weekIndex) / 1000 || "--"
                    : getweekSwimmingDistance(item.weekIndex) || "--"
                }}{{
                  getweekSwimmingDistance(item.weekIndex) > 1000 ? "km" : "m"
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
    </div>
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
import EventCard from "../../classManagement/components/eventCard.vue";
import draggable from "vuedraggable";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils/index";
export default {
  name: "ScheduleBoxes",
  components: {
    ClassCard,
    draggable,
    EventCard,
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
      draggingClass: null, // 当前拖拽的课程
      dragSourceWeekIndex: null, // 拖拽源周索引
      dragSourceGlobalDay: null, // 拖拽源全局天数
      dragSourceClassIndex: null, // 拖拽源课程索引
      isDragging: false, // 是否正在拖动
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
      // 处理 planList，确保每个周都有正确的数据结构
      const data = this.planList.map((week, index) => {
        // 如果周是空数组或未定义，初始化为空数组
        const weekData = Array.isArray(week) ? week : [];

        return {
          id: `week-${index}`,
          weekIndex: index,
          weekData: weekData,
        };
      });

      // 处理 classesJson，确保它是对象格式
      data.forEach((item) => {
        // weekData 是天的数组，可能为空数组 []
        if (item.weekData && Array.isArray(item.weekData)) {
          item.weekData.forEach((day) => {
            // day 可能没有 details 属性（新增的天）
            if (day && day.details && Array.isArray(day.details)) {
              day.details.forEach((classItem) => {
                if (classItem && classItem.classesJson) {
                  // 如果 classesJson 是字符串，解析为对象
                  if (typeof classItem.classesJson === "string") {
                    try {
                      classItem.classesJson = JSON.parse(classItem.classesJson);
                    } catch (error) {
                      console.error(
                        "planListWithId: JSON parse error",
                        error,
                        classItem.classesJson
                      );
                      // 解析失败时设置为空对象
                      classItem.classesJson = {};
                    }
                  }
                  // 如果已经是对象，保持不变
                }
              });
            }
            // 如果 day 没有 details，保持原样（会在 getDayDetailsArray 中处理）
          });
        }
        // 如果 weekData 是空数组，保持原样（会显示空的 7 天容器）
      });
      return data;
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
            if (
              classesJson.sportType === "SWIM" &&
              classesJson.distanceUnit === "m"
            ) {
              return classAcc + Number(classesJson.distance) / 1000;
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
            if (
              classesJson.sportType === "SWIM" &&
              classesJson.distanceUnit === "km"
            ) {
              return classAcc + Number(classesJson.distance) * 1000;
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
    /**
     * 获取指定天的课程数组引用（用于 vuedraggable）
     * @param {Array} weekData - 周数据数组
     * @param {Number} globalDay - 全局天数
     * @returns {Array} 课程数组引用
     */
    getDayDetailsArray(weekData, globalDay) {
      if (!weekData || !Array.isArray(weekData)) {
        return [];
      }

      // 查找该天的数据对象
      let dayData = weekData.find((item) => item && item.day === globalDay);

      if (!dayData) {
        // 如果不存在，创建一个新的，使用 Vue.set 确保响应式
        dayData = {
          day: globalDay,
          details: [],
        };
        // 使用 $set 确保响应式
        const index = weekData.length;
        this.$set(weekData, index, dayData);
      }

      // 确保 details 是数组且是响应式的
      if (!Array.isArray(dayData.details)) {
        this.$set(dayData, "details", []);
      }

      // 返回数组引用，确保 vuedraggable 可以正确追踪
      // 这个引用是稳定的，因为 dayData 对象是响应式的
      return dayData.details;
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
    /**
     * 获取指定天的赛事列表
     * @param {Array} week - 周数据数组
     * @param {Number} globalDay - 全局天数
     * @returns {Array} 处理后的赛事列表
     */
    getDayEvents(week, globalDay) {
      if (!week || !Array.isArray(week)) {
        return [];
      }

      // 查找该天的数据对象
      const dayData = week.find((item) => item && item.day === globalDay);

      if (
        !dayData ||
        !dayData.competitionDtoList ||
        !Array.isArray(dayData.competitionDtoList)
      ) {
        return [];
      }
      console.log(dayData.competitionDtoList, "dayData.competitionDtoList");

      return dayData.competitionDtoList;
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
    handleDeleteEvent(eventItem, eventIndex, weekNumber, globalDay) {
      this.$emit("delete-event", eventItem, eventIndex, weekNumber, globalDay);
    },
    handleEditEvent(eventItem, eventIndex, weekNumber, globalDay) {
      this.$emit("edit-event", eventItem, eventIndex, weekNumber, globalDay);
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

    /**
     * 拖拽变化事件（包括克隆元素的添加）
     */
    handleDragChange(evt) {
      // 当克隆元素被添加到目标容器时，可以在这里处理
      // 由于不再使用虚拟滚动，不需要特殊处理
    },
    /**
     * 拖拽移除（从源容器移除时）
     */
    handleDragRemove(evt) {
      // 由于使用了 pull: 'clone'，源数组不会被自动删除
      // 删除操作已经在 handleDragAdd 中手动处理了
      // 这里只需要清理克隆对象（如果有的话）
      // 实际上，由于我们已经在 handleDragAdd 中手动删除了源对象
      // 这个事件可能不会触发，或者触发时源对象已经被删除了
      // 所以这里可以什么都不做
    },
    /**
     * 拖拽开始事件
     */
    handleDragStart(evt) {
      this.isDragging = true;
    },
    /**
     * 拖拽结束事件
     */
    handleDragEnd(evt) {
      this.isDragging = false;
    },
  },
};
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
    min-height: 50px;
    background-color: #fff;
    position: relative;
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

    &:hover:not(.is-dragging) {
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

    &.is-dragging {
      pointer-events: none;
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

::v-deep .is-plan-drag-chosen {
  opacity: 0.8;
}

::v-deep .is-plan-drag-drag {
  opacity: 0.8;
  transform: rotate(2deg);
}

::v-deep .is-plan-dragging {
  opacity: 0.6;
  cursor: grabbing !important;
}

::v-deep .js-plan-drag-container {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  min-height: 50px;
}

::v-deep .js-plan-drag-container.is-plan-drop-target {
  background-color: rgba(64, 158, 255, 0.08);
}

::v-deep .js-plan-drag-container.is-plan-drop-active {
  background-color: rgba(64, 158, 255, 0.16);
  box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.25);
}

::v-deep .draggable-classes-container {
  min-height: 50px;
  flex: 1;
  width: 100%;
  position: relative;
}

::v-deep .class-drap-handle {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
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
