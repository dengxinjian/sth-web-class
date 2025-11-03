<template>
  <div class="health-data-card" @click="handleClick">
    <div class="health-data-header">
      <div>
        <img
          src="@/assets/addClass/health.png"
          alt=""
          class="health-data-icon"
        />
        <span class="health-data-title">指标</span>
      </div>
      <div>更多</div>
    </div>
    <div class="health-data-content">
      <div class="health-data-item">
        <span class="item-label">睡眠时间:</span>
        <span class="item-value">{{ healthData.sleepTime }}</span>
      </div>
      <div class="health-data-item">
        <span class="item-label">静息心率:</span>
        <span class="item-value">{{ healthData.rhr }}</span>
      </div>
      <div class="health-data-item">
        <span class="item-label">HRV:</span>
        <span class="item-value">{{ healthData.hrv }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HealthDataCard",
  props: {
    healthData: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    date: {
      type: String,
      required: true,
    },
  },
  computed: {},
  methods: {
    handleClick() {
      // 点击卡片查看详情
      this.$emit("click", this.healthData);
    },
  },
};
</script>

<style lang="scss" scoped>
.health-data-card {
  margin-left: 2px;
  margin-right: 2px;
  margin-bottom: 5px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background-color: #f8f9fa;
  padding: 8px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
    background-color: #e9ecef;
  }

  .health-data-header {
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .health-data-title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
    .health-data-icon {
      width: 20px;
      height: 15px;
      margin-right: 5px;
    }
  }

  .health-data-content {
    .health-data-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      line-height: 20px;
      color: #666;

      .item-label {
        color: #666;
      }

      .item-value {
        font-weight: 600;
        color: #333;
      }
    }
  }
}
</style>
