<template>
  <div class="health-view-container">
    <div class="health-header">
      <h3 class="health-title">健康数据</h3>
      <div class="date-info"> {{ date }}</div>
      <el-select
        v-model="selectedDeviceId"
        placeholder="请选择设备"
        size="small"
        class="device-select"
        @change="handleDeviceChange"
      >
        <el-option
          v-for="device in deviceList"
          :key="device.id"
          :label="getDeviceLabel(device.deviceType)"
          :value="device.id"
        ></el-option>
      </el-select>
    </div>

    <div class="health-content">
      <!-- 图表区域 -->
      <div class="charts-section">
        <div class="chart-wrapper">
          <div ref="hrvChart" class="chart-item"></div>
        </div>
        <div class="chart-wrapper">
          <div ref="rhrChart" class="chart-item"></div>
        </div>
        <div class="chart-wrapper">
          <div ref="sleepChart" class="chart-item"></div>
        </div>
      </div>
    </div>

    <!-- 健康指标详情 -->
    <div class="health-metrics">
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">静息心率</div>
          <div class="metric-value">{{ healthMetrics.rhr || "--" }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">HRV</div>
          <div class="metric-value">{{ healthMetrics.hrv || "--" }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">睡眠时长</div>
          <div class="metric-value">{{ healthMetrics.sleepTime || "--" }}</div>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">深度睡眠时长</div>
          <div class="metric-value">
            {{ healthMetrics.deepSleepTime || "--" }}
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">浅睡眠时长</div>
          <div class="metric-value">
            {{ healthMetrics.lightSleepTime || "--" }}
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">快速眼动睡眠时间</div>
          <div class="metric-value">
            {{ healthMetrics.remSleepTime || "--" }}
          </div>
        </div>
      </div>
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-label">清醒时长</div>
          <div class="metric-value">{{ healthMetrics.awakeTime || "--" }}</div>
        </div>
        <div class="metric-item">
          <div class="metric-label">身体电量</div>
          <div class="metric-value">
            {{ healthMetrics.bodyBattery || "--" }}
          </div>
        </div>
        <div class="metric-item">
          <div class="metric-label">压力水平</div>
          <div class="metric-value">
            {{ healthMetrics.stressLevel || "--" }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="health-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { scheduleApi } from "../services/classManagement";
import { DEVICE_TYPE_DICT } from '../constants'

export default {
  name: "HealthView",
  props: {
    healthData: {
      type: Object,
      default: () => ({}),
    },
    date: {
      type: String,
      required: true,
    },
    deviceList: {
      type: Array,
      default: () => [],
    },
    deviceType: {
      type: Number,
      default: null,
    },
    triUserId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      selectedDeviceId: null,
      healthMetrics: {},
      hrvChart: null,
      rhrChart: null,
      sleepChart: null,
    };
  },
  mounted() {
    this.initCharts();
    this.selectInitialDevice();
  },
  beforeDestroy() {
    if (this.hrvChart) {
      this.hrvChart.dispose();
    }
    if (this.rhrChart) {
      this.rhrChart.dispose();
    }
    if (this.sleepChart) {
      this.sleepChart.dispose();
    }
  },
  methods: {
    /**
     * 初始化图表
     */
    initCharts() {
      this.hrvChart = echarts.init(this.$refs.hrvChart);
      this.rhrChart = echarts.init(this.$refs.rhrChart);
      this.sleepChart = echarts.init(this.$refs.sleepChart);

      // 监听窗口大小变化
      window.addEventListener("resize", this.handleResize);
    },

    /**
     * 获取健康数据
     */
    async fetchHealthData() {
      const currentDevice = this.deviceList.find(
        (d) => d.id === this.selectedDeviceId
      );
      if (!currentDevice) {
        console.error("未找到选中的设备");
        return;
      }

      if (!currentDevice.deviceUserId) {
        console.error("设备用户ID不存在:", currentDevice);
        this.$message.error("设备用户ID不存在");
        return;
      }

      try {
        const params = {
          deviceType: currentDevice.deviceType,
          date: this.date,
          triUserId: this.triUserId,
        };
        console.log("请求健康数据参数:", params);

        const res = await scheduleApi.getHealthData(params);

        if (res.success && res.result) {
          this.healthMetrics = res.result;
          this.updateCharts(res.result);
        } else {
          console.error("获取健康数据失败:", res);
        }
      } catch (error) {
        console.error("获取健康数据失败:", error);
        this.$message.error("获取健康数据失败");
      }
    },

    /**
     * 选择初始设备
     */
    selectInitialDevice() {
      console.log(this.deviceList, "this.deviceList");
      if (this.deviceList.length === 0) return;

      // 如果传入了 deviceType，根据 deviceType 选择设备
      if (this.deviceType) {
        const targetDevice = this.deviceList.find(
          (d) => d.deviceType === this.deviceType
        );
        if (targetDevice) {
          this.selectedDeviceId = targetDevice.id;
        } else {
          // 如果找不到对应的设备，选择第一个
          this.selectedDeviceId = this.deviceList[0].id;
        }
      } else {
        // 如果没有传入 deviceType，默认选择第一个设备
        this.selectedDeviceId = this.deviceList[0].id;
      }

      this.fetchHealthData();
    },

    /**
     * 设备切换
     */
    handleDeviceChange() {
      this.fetchHealthData();
    },

    /**
     * 获取设备显示名称
     */
    getDeviceLabel(deviceType) {
      return DEVICE_TYPE_DICT[deviceType] || "未知设备";
    },

    /**
     * 更新图表
     */
    updateCharts(data) {
      // 处理日期格式 - x轴显示简写月/日
      const hrvBarChatData = (data.hrvBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      const rhrBarChatData = (data.rhrBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      const sleepTimeBarChatData = (data.sleepTimeBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      // tooltip显示完整年/月/日
      const hrvBarChatDataAll = (data.hrvBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      });
      const rhrBarChatDataAll = (data.rhrBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      });
      const sleepTimeBarChatDataAll = (data.sleepTimeBarChatData || []).map((item) => {
        const date = new Date(item.date);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      });
      // HRV 图表
      const hrvData = (data.hrvBarChatData || []).map((item) => item.value);
      const hrvAvg = (data.hrvBarChatData || []).map((item) => item.aveValue);

      this.hrvChart.setOption({
        title: {
          text: "HRV",
          left: "10",
          top: "10",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        legend: {
          data: ["HRV", "7天平均"],
          top: 10,
          right: 10,
          textStyle: {
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const dataIndex = params[0].dataIndex;
            let result = hrvBarChatDataAll[dataIndex] + "<br/>";
            params.forEach((item) => {
              const value =
                item.value !== null && item.value !== undefined
                  ? item.value
                  : "--";
              result += `${item.seriesName}: ${value}<br/>`;
            });
            return result;
          },
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%",
          top: "20%",
        },
        xAxis: {
          type: "category",
          data: hrvBarChatData,
          axisLabel: {
            rotate: 45,
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          splitNumber: 5,
        },
        series: [
          {
            name: "HRV",
            type: "bar",
            data: hrvData,
            itemStyle: {
              color: "#9aa6b8",
            },
          },
          {
            name: "7天平均",
            type: "line",
            data: hrvAvg,
            smooth: true,
            itemStyle: {
              color: "#5470c6",
            },
            lineStyle: {
              width: 2,
            },
          },
        ],
      });

      // 静息心率图表
      const rhrData = (data.rhrBarChatData || []).map((item) => item.value);
      const rhrAvg = (data.rhrBarChatData || []).map((item) => item.aveValue);

      this.rhrChart.setOption({
        title: {
          text: "静息心率",
          left: "10",
          top: "10",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        legend: {
          data: ["静息心率", "7天平均"],
          top: 10,
          right: 10,
          textStyle: {
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const dataIndex = params[0].dataIndex;
            let result = rhrBarChatDataAll[dataIndex] + "<br/>";
            params.forEach((item) => {
              const value =
                item.value !== null && item.value !== undefined
                  ? item.value
                  : "--";
              result += `${item.seriesName}: ${value}<br/>`;
            });
            return result;
          },
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%",
          top: "20%",
        },
        xAxis: {
          type: "category",
          data: rhrBarChatData,
          axisLabel: {
            rotate: 45,
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          splitNumber: 5,
        },
        series: [
          {
            name: "静息心率",
            type: "bar",
            data: rhrData,
            itemStyle: {
              color: "#9aa6b8",
            },
          },
          {
            name: "7天平均",
            type: "line",
            data: rhrAvg,
            smooth: true,
            itemStyle: {
              color: "#5470c6",
            },
            lineStyle: {
              width: 2,
            },
          },
        ],
      });

      // 睡眠时长图表
      const sleepData = (data.sleepTimeBarChatData || []).map(
        (item) => item.value
      );
      const sleepAvg = (data.sleepTimeBarChatData || []).map(
        (item) => item.aveValue
      );

      this.sleepChart.setOption({
        title: {
          text: "睡眠时长",
          left: "10",
          top: "10",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        legend: {
          data: ["睡眠时长", "7天平均"],
          top: 10,
          right: 10,
          textStyle: {
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const dataIndex = params[0].dataIndex;
            let result = sleepTimeBarChatDataAll[dataIndex] + "<br/>";
            params.forEach((item) => {
              if (item.value !== null && item.value !== undefined) {
                result += `${item.seriesName}: ${parseFloat(item.value).toFixed(
                  2
                )}小时<br/>`;
              } else {
                result += `${item.seriesName}: --<br/>`;
              }
            });
            return result;
          },
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "15%",
          top: "20%",
        },
        xAxis: {
          type: "category",
          data: sleepTimeBarChatData,
          axisLabel: {
            rotate: 45,
            fontSize: 10,
          },
        },
        yAxis: {
          type: "value",
          splitNumber: 5,
        },
        series: [
          {
            name: "睡眠时长",
            type: "bar",
            data: sleepData,
            itemStyle: {
              color: "#9aa6b8",
            },
          },
          {
            name: "7天平均",
            type: "line",
            data: sleepAvg,
            smooth: true,
            itemStyle: {
              color: "#5470c6",
            },
            lineStyle: {
              width: 2,
            },
          },
        ],
      });
    },

    /**
     * 处理窗口大小变化
     */
    handleResize() {
      this.hrvChart?.resize();
      this.rhrChart?.resize();
      this.sleepChart?.resize();
    },

    /**
     * 关闭弹窗
     */
    handleClose() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
.health-view-container {
  width: 100%;
  padding: 20px;
  background: #fff;

  .health-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e5e5e5;

    .health-title {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin-right: 20px;
    }
    .date-info {
      margin-right: 20px;
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }

    .device-select {
      width: 150px;
    }
  }

  .health-content {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .charts-section {
      flex: 1;
      display: flex;
      gap: 15px;

      .chart-wrapper {
        flex: 1;

        .chart-item {
          width: 100%;
          height: 250px;
          border: 1px solid #e5e5e5;
          border-radius: 4px;
        }
      }
    }

    .info-section {
      width: 280px;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .date-info {
        padding: 15px;
        background: #f5f7fa;
        border-radius: 4px;
        border: 1px solid #e5e5e5;

        .date-value {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
        }

        .range-info {
          .range-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 13px;

            .label {
              color: #666;
            }

            .value {
              font-weight: bold;
              color: #333;
            }
          }
        }
      }
    }
  }

  .health-metrics {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 20px;

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 15px;

      &:last-child {
        margin-bottom: 0;
      }

      .metric-item {
        padding: 15px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #e5e5e5;
        text-align: center;

        .metric-label {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }

  .health-footer {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid #e5e5e5;
  }
}
</style>
