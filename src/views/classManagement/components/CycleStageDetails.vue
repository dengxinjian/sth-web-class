<template>
  <div class="stage-details">
    <div
      v-for="(stage, index) in classData.stages"
      :key="index"
      class="stage-item"
    >
      <div v-for="(part, idx) in stage.sections" :key="idx">
        <div>{{ part.title }}</div>
        <!-- 模式1: 阈值功率 范围 -->
        <div v-if="classData.mode === 1 && part.range === 'range'">
          {{ part.target }} @ {{ part.thresholdFtpRangeNum[0] }}~{{
            part.thresholdFtpRangeNum[1]
          }}w
          <span v-if="part.thresholdFtpRangeNumZone">
            {{ part.thresholdFtpRangeNumZone[0] }}~{{
              part.thresholdFtpRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式2: 阈值心率 范围 -->
        <div v-if="classData.mode === 2 && part.range === 'range'">
          {{ part.target }} @ {{ part.thresholdHeartRateRangeNum[0] }}~{{
            part.thresholdHeartRateRangeNum[1]
          }}bpm
          <span v-if="part.thresholdHeartRateRangeNumZone">
            {{ part.thresholdHeartRateRangeNumZone[0] }}~{{
              part.thresholdHeartRateRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式1: 阈值功率 目标 -->
        <div v-if="classData.mode === 1 && part.range === 'target'">
          {{ part.target }} @ {{ part.thresholdFtpNum }}w
          <span v-if="part.thresholdFtpNumZone">
            {{ part.thresholdFtpNumZone }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式2: 阈值心率 目标 -->
        <div v-if="classData.mode === 2 && part.range === 'target'">
          {{ part.target }} @ {{ part.thresholdHeartRateNum }}bpm
          <span v-if="part.thresholdHeartRateNumZone">
            {{ part.thresholdHeartRateNumZone }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式3: 目标功率 范围 -->
        <div v-if="classData.mode === 3 && part.range === 'range'">
          {{ part.target }} @ {{ part.targetFtpRange[0] }}~{{
            part.targetFtpRange[1]
          }}w
          <span v-if="part.targetFtpRangeNumZone">
            {{ part.targetFtpRangeNumZone[0] }}~{{
              part.targetFtpRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式4: 目标心率 范围 -->
        <div v-if="classData.mode === 4 && part.range === 'range'">
          {{ part.target }} @ {{ part.targetHeartRateRange[0] }}~{{
            part.targetHeartRateRange[1]
          }}bpm
          <span v-if="part.targetHeartRateRangeNumZone">
            {{ part.targetHeartRateRangeNumZone[0] }}~{{
              part.targetHeartRateRangeNumZone[1]
            }}
          </span>
        </div>
        <!-- 模式3: 目标功率 目标 -->
        <div v-if="classData.mode === 3 && part.range === 'target'">
          {{ part.target }} @ {{ part.targetFtp }}w
          <span v-if="part.targetFtpNumZone">
            {{ part.targetFtpNumZone }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式4: 目标心率 目标 -->
        <div v-if="classData.mode === 4 && part.range === 'target'">
          {{ part.target }} @ {{ part.targetHeartRate }}bpm
          <span v-if="part.targetHeartRateNumZone">
            {{ part.targetHeartRateNumZone }}
          </span>
          <span v-if="part.hasCadence">
            踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <div v-if="part.lap">按LAP进入下一段落</div>
      </div>
      <div v-if="stage.times > 1">重复{{ stage.times }}次</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CycleStageDetails',
  props: {
    classData: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.stage-details {
  font-size: 12px;
  color: #999;
  padding: 5px 5px 0;
  line-height: 16px;

  .stage-item {
    margin-bottom: 5px;
    padding-bottom: 5px;
    border-bottom: 1px solid #e5e5e5;

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>

