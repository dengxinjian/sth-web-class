<template>
  <div class="stage-details">
    <div
      v-for="(stage, index) in classData.stages"
      :key="index"
      class="stage-item"
    >
      <div v-for="(part, idx) in stage.sections" :key="idx">
        <div>{{ part.title }}</div>
        <!-- 模式1: 阈值配速 范围 -->
        <div v-if="classData.mode === 1 && part.range === 'range'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ secondsToMMSS(part.thresholdSpeedRangeNum[0]) }}~{{
            secondsToMMSS(part.thresholdSpeedRangeNum[1])
          }}/km
          <span v-if="part.thresholdSpeedRangeNumZone">
            {{ part.thresholdSpeedRangeNumZone[0] }}~{{
              part.thresholdSpeedRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式2: 阈值心率 范围 -->
        <div v-if="classData.mode === 2 && part.range === 'range'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.thresholdHeartRateRangeNum[0] }}~{{
            part.thresholdHeartRateRangeNum[1]
          }}bpm
          <span v-if="part.thresholdHeartRateRangeNumZone">
            {{ part.thresholdHeartRateRangeNumZone[0] }}~{{
              part.thresholdHeartRateRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式1: 阈值配速 目标 -->
        <div v-if="classData.mode === 1 && part.range === 'target'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ secondsToMMSS(part.thresholdSpeedNum) }}/km
          <span v-if="part.thresholdSpeedNumZone">
            {{ part.thresholdSpeedNumZone }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式2: 阈值心率 目标 -->
        <div v-if="classData.mode === 2 && part.range === 'target'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.thresholdHeartRateNum }}bpm
          <span v-if="part.thresholdHeartRateNumZone">
            {{ part.thresholdHeartRateNumZone }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式3: 目标配速 范围 -->
        <div v-if="classData.mode === 3 && part.range === 'range'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.targetSpeedRange[0] }}~{{ part.targetSpeedRange[1] }}/km
          <span v-if="part.targetSpeedRangeNumZone">
            {{ part.targetSpeedRangeNumZone[0] }}~{{
              part.targetSpeedRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式4: 目标心率 范围 -->
        <div v-if="classData.mode === 4 && part.range === 'range'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.targetHeartRateRange[0] }}~{{
            part.targetHeartRateRange[1]
          }}bpm
          <span v-if="part.targetHeartRateRangeNumZone">
            {{ part.targetHeartRateRangeNumZone[0] }}~{{
              part.targetHeartRateRangeNumZone[1]
            }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式3: 目标配速 目标 -->
        <div v-if="classData.mode === 3 && part.range === 'target'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.targetSpeed }}/km
          <span v-if="part.targetSpeedNumZone">
            {{ part.targetSpeedNumZone }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
        <!-- 模式4: 目标心率 目标 -->
        <div v-if="classData.mode === 4 && part.range === 'target'">
          {{
            part.capacity === 'time'
              ? part.target
              : part.targetDistance + part.targetUnit
          }}
          @ {{ part.targetHeartRate }}bpm
          <span v-if="part.targetHeartRateNumZone">
            {{ part.targetHeartRateNumZone }}
          </span>
          <span v-if="part.hasCadence">
            步频{{ part.cadence[0] }}~{{ part.cadence[1] }}
          </span>
        </div>
      </div>
      <div v-if="stage.times > 1">重复{{ stage.times }}次</div>
    </div>
  </div>
</template>

<script>
import { secondsToMMSS } from '@/utils/index'

export default {
  name: 'RunStageDetails',
  props: {
    classData: {
      type: Object,
      required: true
    }
  },
  methods: {
    secondsToMMSS
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

