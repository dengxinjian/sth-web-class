<template>
  <div class="schedule-boxes-wrapper">
    <div class="week-header">第 {{ weekNumber }}周</div>
    <div class="schedule-boxes-container">
      <div
        v-for="(box, index) in boxes"
        :key="index"
        class="schedule-box-item"
        :class="{ 'last-item': index === boxes.length - 1 }"
      >
        <div class="box-header">
          <div class="box-day-text">
            Day {{ (weekNumber - 1) * 7 + box.number }}
          </div>
        </div>
        <div class="box-content-classes">
          <ClassCard
            v-for="(classItem, classIndex) in dayClassesMap[
              (weekNumber - 1) * 7 + box.number
            ] || []"
            :key="classIndex"
            :class-item="classItem"
            :date="''"
          />
          <div class="box-content" @click="handleBoxClick(box)">
            <div class="box-plus-circle">
              <div class="box-plus">+</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClassCard from "./classCard.vue";
export default {
  name: "ScheduleBoxes",
  components: {
    ClassCard,
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
    // 周数
    weekNumber: {
      type: Number,
      default: 1,
    },
    weekData: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    boxes() {
      return Array.from({ length: this.boxCount }, (_, index) => ({
        number: this.startNumber + index,
        index: index,
      }));
    },
    /**
     * 按天数组织的课程数据映射
     * key: 全局天数 (跨周的天数，如第1周是1-7，第2周是8-14), value: 处理后的课程列表
     * 注意：weekData 中的 day 字段已经是全局天数
     */
    dayClassesMap() {
      if (!this.weekData || !Array.isArray(this.weekData)) {
        return {};
      }

      const map = {};
      this.weekData.forEach((dayData) => {
        if (
          !dayData ||
          typeof dayData.day !== "number" ||
          !dayData.classes ||
          !Array.isArray(dayData.classes)
        ) {
          return;
        }

        // dayData.day 已经是全局天数，直接作为 key 使用
        // 处理每个课程，解析 classesJson 字符串为对象
        map[dayData.day] = dayData.classes.map((classItem) => {
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
      });

      return map;
    },
  },
  methods: {
    handleBoxClick(box) {
      this.$emit("box-click", box);
    },
  },
};
</script>

<style scoped lang="scss">
.schedule-boxes-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
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
</style>
