<template>
  <div class="week-statistic">
    <!-- 设备同步设置 -->
    <div class="schedule-table-header-cell-data">
      <el-popover placement="bottom-end" width="180" trigger="hover">
        <div
          v-for="item in deviceList"
          :key="item.id"
          style="display: flex; flex-direction: row; gap: 10px; margin: 10px 0"
        >
          <img
            :src="getDeviceBrandIcon(item.deviceType)"
            alt=""
            class="device-brand-icon"
          />
          <el-switch
            v-model="item.enabled"
            :inactive-text="getDeviceName(item.deviceType)"
            @change="handleDeviceChange(item)"
          ></el-switch>
        </div>
        <span slot="reference" class="device-filter-reference">
          <span>运动员课程同步设置</span>
          <img
            class="device-filter-icon"
            src="~@/assets/addClass/icon-filter.png"
            alt=""
          />
        </span>
      </el-popover>
    </div>

    <!-- STH数据 -->
    <div class="schedule-table-cell-data">
      <div class="week-data-sth">
        <div>
          <span>{{ sthData.avgLong || 0 }}</span>
          <span>长期STH</span>
        </div>
        <div>
          <span>{{ sthData.avgShort || 0 }}</span>
          <span>短期STH</span>
        </div>
        <div>
          <span>
            {{
              sthData.avgBalanceBig
                ? sthData.avgBalanceBig - sthData.avgBalanceSmall
                : 0
            }}
          </span>
          <span>STH平衡</span>
        </div>
      </div>

      <!-- 统计数据列表 -->
      <div
        v-for="item in statisticData"
        :key="item.title"
        class="week-data-item"
      >
        <div class="week-data-text">
          <div style="display: flex; align-items: center">
            <img
              v-if="item.icon"
              style="width: 20px; margin-right: 10px"
              :src="item.icon"
              alt=""
            />
            <p>{{ item.title }}:</p>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <span>{{ item.actualValue }} {{ item.unit }}</span>
              <span>{{ item.planValue }} {{ item.unit }}</span>
            </div>
          </div>
        </div>
        <el-progress
          :percentage="item.percent || 0"
          :color="item.color"
          :show-text="false"
        ></el-progress>
      </div>
    </div>
  </div>
</template>

<script>
import { DEVICE_TYPE_DICT } from '../constants'
import { getDeviceBrandIcon } from '../utils/helpers'

export default {
  name: 'StatisticsPanel',
  props: {
    sthData: {
      type: Object,
      default: () => ({})
    },
    statisticData: {
      type: Array,
      default: () => []
    },
    deviceList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getDeviceBrandIcon,
    getDeviceName(deviceType) {
      return DEVICE_TYPE_DICT[deviceType] || '未知设备'
    },
    handleDeviceChange(item) {
      this.$emit('device-change', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.week-statistic {
  flex: 0 0 220px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px);
  overflow-y: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2.5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2.5px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.schedule-table-header-cell-data {
  background-color: #fff;
  padding: 0 10px;
  flex: 0 0 auto;
  text-align: right;
}

.schedule-table-cell-data {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.device-filter-icon {
  width: 28px;
  cursor: pointer;
}

.device-brand-icon {
  width: 22px;
  margin-right: 10px;
}

.device-filter-reference {
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.week-data-sth {
  display: flex;
  flex-direction: row;
  gap: 2px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;

  > div {
    width: 60px;
    text-align: center;
    color: #fff;
    font-size: 12px;
    line-height: 22px;
    display: flex;
    flex-direction: column;

    span:nth-child(1) {
      background-color: rgba(255, 255, 255, 0.46);
    }
  }

  > div:nth-child(1) {
    padding: 4px 0 0 4px;
    border-radius: 6px 0 0 6px;
    background-color: rgba(93, 187, 246, 1);

    span:nth-child(1) {
      border-radius: 6px 0 0 6px;
    }
  }

  > div:nth-child(2) {
    padding: 4px 4px 6px 4px;
    border-radius: 6px;
    background-color: rgba(204, 35, 35, 1);

    span:nth-child(1) {
      border-radius: 6px;
    }
  }

  > div:nth-child(3) {
    padding: 4px 4px 0 0;
    border-radius: 0 6px 6px 0;
    background-color: rgba(255, 181, 105, 1);

    span:nth-child(1) {
      border-radius: 0 6px 6px 0;
    }
  }
}

.week-data-item {
  margin-bottom: 10px;

  .week-data-text {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;

    div {
      text-align: right;
    }

    span,
    div {
      flex: 1;
      font-size: 12px;
      color: #333;

      span:nth-child(2) {
        color: #999;
      }
    }

    > span {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      color: #000000;
    }
  }
}
</style>

