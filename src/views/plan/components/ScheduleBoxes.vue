<template>
  <div class="schedule-boxes-wrapper">
    <div class="week-header">
      <span class="week-text">Week {{ weekNumber }}</span>
    </div>
    <div class="schedule-boxes-container">
      <div
        v-for="(box, index) in boxes"
        :key="index"
        class="schedule-box-item"
        :class="{ 'last-item': index === boxes.length - 1 }"
      >
      <div class="box-header">
        <div class="box-day-text">Day {{ box.number }}</div>
      </div>
      <div class="box-content">
        <div class="box-plus-circle" @click="handleBoxClick(box)">
          <div class="box-plus">+</div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScheduleBoxes",
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
  },
  computed: {
    boxes() {
      return Array.from({ length: this.boxCount }, (_, index) => ({
        number: this.startNumber + index,
        index: index,
      }));
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

  .week-text {
    font-size: 14px;
    color: #c24a43;
    font-weight: 500;
    margin-left: 5.5%;
  }
}

.schedule-boxes-container {
  display: flex;
  align-items: flex-start;
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

  .box-content {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 20px;
    transition: all 0.2s ease;

    &:hover {
      .box-plus-circle {
        border-color: #409eff;

        .box-plus {
          color: #409eff;
        }
      }
    }

    &:active {
      opacity: 0.8;
    }

    .box-plus-circle {
      width: 40px;
      height: 40px;
      border: 1px solid #303133;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

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
