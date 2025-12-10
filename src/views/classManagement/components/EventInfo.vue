<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="90%"
    :close-on-click-modal="false"
    :show-close="false"
    custom-class="event-info-dialog"
    @close="handleClose"
  >
    <div class="event-info-container">
      <!-- 头部 -->
      <div class="event-header">
        <div class="header-left">
          <img
            class="trophy-icon"
            src="@/assets/addClass/eventIcon.png"
            alt="赛事"
          />
          <div class="header-info">
            <div class="event-name">{{ eventData?.competitionName || "赛事名称" }}</div>
            <div class="event-meta">
              <span class="event-date">{{ eventData?.competitionDate || "日期" }}</span>
              <span class="event-location">{{ eventData?.competitionLocation || "地点" }}</span>
            </div>
          </div>
        </div>
        <i class="el-icon-close close-icon" @click="handleClose"></i>
      </div>

      <!-- 内容区域 -->
      <div class="event-content">
        <!-- 左侧：比赛结果 -->
        <div class="content-left">
          <div class="section-title">比赛结果</div>

          <!-- 排名信息 -->
          <div class="rankings">
            <div class="rank-item">
              <span class="rank-label">全场排名</span>
              <span class="rank-value">{{ competitionResult?.overallRank || "-" }}</span>
            </div>
            <div class="rank-item">
              <span class="rank-label">分组排名</span>
              <span class="rank-value">{{ competitionResult?.groupRank || "-" }}</span>
            </div>
            <div class="rank-item">
              <span class="rank-label">性别排名</span>
              <span class="rank-value">{{ competitionResult?.genderRank || "-" }}</span>
            </div>
          </div>

          <!-- 各段成绩 -->
          <div class="segment-results">
            <div class="segment-item" v-if="competitionResult?.swimTime">
              <span class="segment-label">游泳成绩</span>
              <span class="segment-value">{{ formatTime(competitionResult.swimTime) }}</span>
            </div>
            <div class="segment-item" v-if="competitionResult?.t1Time">
              <span class="segment-label">T1成绩</span>
              <span class="segment-value">{{ formatTime(competitionResult.t1Time) }}</span>
            </div>
            <div class="segment-item" v-if="competitionResult?.cycleTime">
              <span class="segment-label">骑行成绩</span>
              <span class="segment-value">{{ formatTime(competitionResult.cycleTime) }}</span>
            </div>
            <div class="segment-item" v-if="competitionResult?.t2Time">
              <span class="segment-label">T2成绩</span>
              <span class="segment-value">{{ formatTime(competitionResult.t2Time) }}</span>
            </div>
            <div class="segment-item" v-if="competitionResult?.runTime">
              <span class="segment-label">跑步成绩</span>
              <span class="segment-value">{{ formatTime(competitionResult.runTime) }}</span>
            </div>
          </div>

          <!-- 总成绩 -->
          <div class="total-result" v-if="competitionResult?.totalTime">
            <span class="total-label">总成绩</span>
            <span class="total-value">{{ formatTime(competitionResult.totalTime) }}</span>
          </div>

          <!-- 总结反馈 -->
          <div class="summary-section">
            <div class="summary-label">总结/反馈</div>
            <el-input
              v-model="summaryText"
              type="textarea"
              :rows="6"
              placeholder="请输入总结反馈"
              maxlength="500"
              show-word-limit
              class="summary-textarea"
            />
          </div>

          <!-- 编辑按钮 -->
          <el-button type="primary" class="edit-button" @click="handleEdit">
            编辑成绩
          </el-button>
        </div>

        <!-- 右侧：运动记录 -->
        <div class="content-right">
          <div class="section-title">运动记录</div>
          <div class="activity-list">
            <div
              v-for="(activity, index) in activityList"
              :key="index"
              class="activity-item"
            >
              <div class="activity-icon">
                <img
                  :src="getActivityIcon(activity.sportType)"
                  :alt="getActivityName(activity.sportType)"
                />
              </div>
              <div class="activity-info">
                <div class="activity-name">{{ getActivityName(activity.sportType) }}</div>
                <div class="activity-details">
                  <span class="activity-duration">{{ formatDuration(activity.duration) }}</span>
                  <span class="activity-distance">{{ formatDistance(activity.distance, activity.sportType) }}</span>
                  <span class="activity-tss">{{ formatTSS(activity.tss, activity.sportType) }}</span>
                </div>
              </div>
              <i
                class="el-icon-close activity-close"
                @click="handleRemoveActivity(index)"
                v-if="editable"
              ></i>
            </div>
            <div v-if="!activityList || activityList.length === 0" class="empty-activity">
              暂无运动记录
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "EventInfo",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    eventData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      innerVisible: this.visible,
      summaryText: "",
      competitionResult: {},
      activityList: [],
      editable: true,
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
      if (val) {
        this.initData();
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
    },
    eventData: {
      handler(val) {
        if (val && this.visible) {
          this.initData();
        }
      },
      deep: true,
    },
  },
  methods: {
    initData() {
      if (!this.eventData) return;

      // 初始化比赛结果数据
      this.competitionResult = this.eventData.competitionResult || {};
      this.summaryText = this.eventData.summary || this.competitionResult.summary || "";

      // 初始化运动记录列表
      this.activityList = this.eventData.activityList || [];

      // 如果有 ID，可以加载详细数据
      if (this.eventData.id) {
        this.loadEventDetail();
      }
    },
    async loadEventDetail() {
      // TODO: 调用 API 加载赛事详情数据
      // const res = await competitionApi.getCompetitionDetail(this.eventData.id);
      // if (res.success) {
      //   this.competitionResult = res.result.competitionResult || {};
      //   this.activityList = res.result.activityList || [];
      // }
    },
    handleClose() {
      this.innerVisible = false;
      this.$emit("close");
    },
    handleEdit() {
      // TODO: 实现编辑功能
      this.$message.info("编辑功能待实现");
    },
    handleRemoveActivity(index) {
      this.$confirm("确认移除该运动记录？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.activityList.splice(index, 1);
        // TODO: 调用 API 移除关联
      });
    },
    formatTime(seconds) {
      if (!seconds && seconds !== 0) return "-";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      }
      return `${minutes}:${String(secs).padStart(2, "0")}`;
    },
    formatDuration(seconds) {
      if (!seconds && seconds !== 0) return "-";
      return this.formatTime(seconds);
    },
    formatDistance(distance, sportType) {
      if (!distance && distance !== 0) return "-";
      // 游泳用米，其他用公里
      if (sportType === "SWIM" || sportType === 3) {
        return `${distance} m`;
      }
      return `${distance} km`;
    },
    formatTSS(tss, sportType) {
      if (!tss && tss !== 0) return "-";
      // 根据运动类型显示不同的 TSS 单位
      if (sportType === "SWIM" || sportType === 3) {
        return `${tss} sTSS`;
      } else if (sportType === "RUN" || sportType === 2) {
        return `${tss} rTSS`;
      } else if (sportType === "CYCLE" || sportType === 1) {
        return `${tss} TSS`;
      }
      return `${tss} hrTSS`;
    },
    getActivityIcon(sportType) {
      const iconMap = {
        SWIM: require("@/assets/addClass/icon-swim.png"),
        CYCLE: require("@/assets/addClass/icon-bike.png"),
        RUN: require("@/assets/addClass/icon-run.png"),
        1: require("@/assets/addClass/icon-bike.png"),
        2: require("@/assets/addClass/icon-run.png"),
        3: require("@/assets/addClass/icon-swim.png"),
      };
      return (
        iconMap[sportType] ||
        require("@/assets/addClass/icon-other.png")
      );
    },
    getActivityName(sportType) {
      const nameMap = {
        SWIM: "开放游",
        CYCLE: "骑行",
        RUN: "跑步",
        TRANSITION: "换项",
        1: "骑行",
        2: "跑步",
        3: "开放游",
      };
      return nameMap[sportType] || "其他";
    },
  },
};
</script>

<style scoped lang="scss">
.event-info-container {
  min-height: 600px;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 20px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;

    .trophy-icon {
      width: 32px;
      height: 32px;
    }

    .header-info {
      .event-name {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }

      .event-meta {
        display: flex;
        gap: 20px;
        font-size: 14px;
        color: #666;

        .event-date,
        .event-location {
          &::before {
            content: "";
            display: inline-block;
            width: 4px;
            height: 4px;
            background: #999;
            border-radius: 50%;
            margin-right: 8px;
            vertical-align: middle;
          }
        }
      }
    }
  }

  .close-icon {
    font-size: 20px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #333;
    }
  }
}

.event-content {
  display: flex;
  gap: 30px;
  min-height: 500px;

  .content-left,
  .content-right {
    flex: 1;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #cc2323;
  }
}

.content-left {
  .rankings {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

    .rank-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      background: #f8f8f8;
      border-radius: 8px;

      .rank-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }

      .rank-value {
        font-size: 24px;
        font-weight: 600;
        color: #cc2323;
      }
    }
  }

  .segment-results {
    margin-bottom: 20px;

    .segment-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      .segment-label {
        font-size: 14px;
        color: #666;
      }

      .segment-value {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
    }
  }

  .total-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #fff5f5;
    border-radius: 8px;
    margin-bottom: 30px;

    .total-label {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .total-value {
      font-size: 20px;
      font-weight: 600;
      color: #cc2323;
    }
  }

  .summary-section {
    margin-bottom: 20px;

    .summary-label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 10px;
      display: block;
    }

    .summary-textarea {
      ::v-deep .el-textarea__inner {
        font-size: 14px;
        line-height: 1.6;
      }
    }
  }

  .edit-button {
    width: 100%;
    background: #cc2323;
    border-color: #cc2323;

    &:hover {
      background: #a01d1d;
      border-color: #a01d1d;
    }
  }
}

.content-right {
  .activity-list {
    max-height: 600px;
    overflow-y: auto;

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: #f8f8f8;
      border-radius: 8px;
      margin-bottom: 15px;
      position: relative;

      .activity-icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .activity-info {
        flex: 1;
        min-width: 0;

        .activity-name {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .activity-details {
          display: flex;
          gap: 15px;
          font-size: 14px;
          color: #666;

          .activity-duration,
          .activity-distance,
          .activity-tss {
            white-space: nowrap;
          }
        }
      }

      .activity-close {
        font-size: 16px;
        color: #999;
        cursor: pointer;
        transition: color 0.3s;
        flex-shrink: 0;

        &:hover {
          color: #cc2323;
        }
      }
    }

    .empty-activity {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 14px;
    }
  }
}

::v-deep .event-info-dialog {
  .el-dialog__body {
    padding: 20px 30px;
  }
}
</style>

