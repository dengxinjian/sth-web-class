<template>
  <div class="planned-schedule-container">
    <div class="planned-schedule-header">
      <div class="planned-schedule-header-title">
        <div>Planned Schedule</div>
      </div>
    </div>
    <div class="planned-schedule-container-planned">
      <div class="planned-schedule-container-plan">
        <ScheduleBoxes
          v-for="week in 4"
          :key="week"
          :box-count="7"
          :start-number="1"
          :week-number="week"
          @box-click="handleBoxClick"
        />
      </div>
      <div class="planned-schedule-container-statistics"></div>
    </div>
  </div>
</template>

<script>
import ScheduleBoxes from "./ScheduleBoxes.vue";

export default {
  name: "PlannedSchedule",
  components: {
    ScheduleBoxes,
  },
  methods: {
    handleBoxClick(box) {
      console.log("Box clicked:", box);
      // 在这里处理框的点击事件
      this.$message.info(`点击了编号为 ${box.number} 的框`);
    },
  },
};
</script>

<style scoped lang="scss">
.planned-schedule-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100%;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);

  .planned-schedule-header {
    width: 100%;
    border-bottom: 1px solid rgba(228, 231, 237, 0.8);
    padding: 16px 20px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #409eff, transparent);
      opacity: 0.3;
    }

    .planned-schedule-header-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      text-align: center;
      letter-spacing: 0.5px;
      position: relative;

      div {
        display: inline-block;
        padding: 4px 0;
        position: relative;

        // &::after {
        //   content: "";
        //   position: absolute;
        //   bottom: 0;
        //   left: 50%;
        //   transform: translateX(-50%);
        //   width: 40px;
        //   height: 3px;
        //   background: linear-gradient(90deg, #409eff, #66b1ff);
        //   border-radius: 2px;
        // }
      }
    }
  }

  .planned-schedule-container-planned {
    width: 100%;
    flex: 1;
    display: flex;
    overflow: hidden;

    .planned-schedule-container-plan {
      flex: 1;
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

    .planned-schedule-container-statistics {
      width: 220px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-left: 1px solid rgba(228, 231, 237, 0.8);
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
