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
          v-for="(week, index) in classList"
          :key="index"
          :box-count="7"
          :start-number="1"
          :week-data="week"
          :week-number="index + 1"
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
  props: {
    classList: {
      type: Array,
      default: () => [
        [
          {
            day: 1,
            classes: [
              {
                classesJson:
                  '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
                classesTitle: "STH_轻松骑@2h30min",
                createTime: "2025-10-09T21:17:15",
                id: 398,
                label: "[]",
                sportType: "CYCLE",
                triUserId: "426bc17606074ed298580208f3ece3b1",
              },
            ],
          },
          {
            day: 4,
            classes: [
              {
                classesJson:
                  '{"id":"","sportType":"RUN","title":"STH_马拉松赛-H(补给分段)","groupId":6,"duration":"--:--:--","distance":21.3,"sth":"","mode":1,"summary":"马拉松比赛/比赛手表可选项","tags":[],"stages":[{"times":1,"sections":[{"title":"出发","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":7,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第一支胶","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":6,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第二支胶&盐丸","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":5,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第三支胶&尽力加速","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":3.3,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[95,98],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"出发"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第一支胶"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第二支胶&盐丸"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":96.5,"title":"第三支胶&尽力加速"}],"times":1}],"maxIntensity":96.5}',
                classesTitle: "STH_马拉松赛-H(补给分段)",
                createTime: "2025-10-01T11:22:34",
                id: 396,
                label: null,
                sportType: "RUN",
                triUserId: "426bc17606074ed298580208f3ece3b1",
              },
            ],
          },
        ],
        [
          {
            day: 8,
            classes: [
              {
                classesJson:
                  '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
                classesTitle: "STH_轻松骑@2h30min",
                createTime: "2025-10-09T21:17:15",
                id: 398,
                label: "[]",
                sportType: "CYCLE",
                triUserId: "426bc17606074ed298580208f3ece3b1",
              },
            ],
          },
        ],
        [],
        [],
      ],
    },
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
