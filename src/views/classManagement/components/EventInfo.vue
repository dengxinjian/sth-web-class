<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="900px"
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
            :src="getClassImageIcon(eventData.priority)"
          />
          <span class="event-name">{{ eventData?.competitionName }}</span>
          <span class="event-date">{{ eventData?.competitionDate }}</span>
          <span class="event-location">{{
            eventData?.competitionLocation
          }}</span>
        </div>
        <div class="header-actions">
          <i class="el-icon-delete delete-icon" @click="handleDelete"></i>
          <i class="el-icon-edit-outline edit-icon" @click="handleEdit"></i>
          <i class="el-icon-close close-icon" @click="handleClose"></i>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="event-content">
        <!-- 左侧：比赛结果 -->
        <div class="content-left">
          <div class="section-title">比赛结果</div>

          <!-- 比赛结果表格 -->
          <div class="result-table-wrapper">
            <table class="result-table">
              <tbody>
                <tr>
                  <td class="label-cell">全场排名</td>
                  <td class="value-cell">
                    {{ competitionResult?.overallRank || "-" }}
                  </td>
                </tr>
                <tr>
                  <td class="label-cell">分组排名</td>
                  <td class="value-cell">
                    {{ competitionResult?.groupRank || "-" }}
                  </td>
                </tr>
                <tr>
                  <td class="label-cell">性别排名</td>
                  <td class="value-cell">
                    {{ competitionResult?.genderRank || "-" }}
                  </td>
                </tr>
                <tr
                  v-if="
                    eventData.competitionType == 2 ||
                    eventData.competitionType == 5
                  "
                >
                  <td class="label-cell">游泳成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.swimmingResult || "-" }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType == 2">
                  <td class="label-cell">T1成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.t1Result || "-" }}
                  </td>
                </tr>
                <tr
                  v-if="
                    eventData.competitionType == 2 ||
                    eventData.competitionType == 4
                  "
                >
                  <td class="label-cell">骑行成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.cyclingResult || "-" }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType == 2">
                  <td class="label-cell">T2成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.t2Result || "-" }}
                  </td>
                </tr>
                <tr
                  v-if="
                    eventData.competitionType == 2 ||
                    eventData.competitionType == 1
                  "
                >
                  <td class="label-cell">跑步成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.runningResult || "-" }}
                  </td>
                </tr>
                <tr class="highlight-row">
                  <td class="label-cell">总成绩</td>
                  <td class="value-cell">
                    {{ competitionResult.totalResult || "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 总结反馈 -->
          <div class="summary-section">
            <div class="summary-header">
              <span class="summary-label">总结/反馈</span>
            </div>
            <el-input
              v-model="summaryText"
              type="textarea"
              :rows="5"
              placeholder="请输入总结反馈"
              maxlength="500"
              show-word-limit
              class="summary-textarea"
            />
          </div>
        </div>

        <!-- 右侧：运动记录 -->
        <div class="content-right">
          <div class="section-title">运动记录</div>
          <div class="activity-list">
            <div
              v-for="(activity, index) in activityList.swim"
              :key="index"
              class="activity-item"
            >
              <div class="activity-left">
                <div class="activity-icon">
                  <img :src="getActivityIcon(activity.sportType)" />
                  <span
                    class="activity-name"
                    v-if="
                      (activity.classesJson && activity.classesJson.title) ||
                      activity.activityName
                    "
                  >
                    {{
                      activity.classesJson
                        ? activity.classesJson.title
                        : activity.activityName
                    }}
                  </span>
                  <span class="activity-name" v-else>
                    {{ getSportTypeName(activity.sportType) }}_手动录入
                  </span>
                </div>
                <i
                  class="el-icon-close activity-close"
                  @click="handleRemoveActivity(index)"
                ></i>
              </div>
              <div class="activity-details">
                <div class="activity-time">{{ activity.duration }}</div>
                <div class="activity-distance">
                  {{ formatDistance(activity.distance, activity.sportType) }}
                  <span v-if="activity.sportType === 3"> m </span>
                  <span v-else>km</span>
                </div>
                <div class="activity-tss">
                  {{ activity.sthValue ? activity.sthValue : "--" }}
                  <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
                </div>
              </div>
            </div>
            <div
              v-for="(activity, index) in activityList.otherT1"
              :key="index"
              class="activity-item"
            >
              <div class="activity-left">
                <div class="activity-icon">
                  <img :src="getActivityIcon(activity.sportType)" />
                  <span
                    class="activity-name"
                    v-if="
                      (activity.classesJson && activity.classesJson.title) ||
                      activity.activityName
                    "
                  >
                    {{
                      activity.classesJson
                        ? activity.classesJson.title
                        : activity.activityName
                    }}
                  </span>
                  <span class="activity-name" v-else>
                    {{ getSportTypeName(activity.sportType) }}_手动录入
                  </span>
                </div>
                <i
                  class="el-icon-close activity-close"
                  @click="handleRemoveActivity(index)"
                ></i>
              </div>
              <div class="activity-details">
                <div class="activity-time">{{ activity.duration }}</div>
                <div class="activity-distance">
                  {{ formatDistance(activity.distance, activity.sportType) }}
                  <span v-if="activity.sportType === 3"> m </span>
                  <span v-else>km</span>
                </div>
                <div class="activity-tss">
                  {{ activity.sthValue ? activity.sthValue : "--" }}
                  <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
                </div>
              </div>
            </div>

            <div
              v-for="(activity, index) in activityList.cycle"
              :key="index"
              class="activity-item"
            >
              <div class="activity-left">
                <div class="activity-icon">
                  <img :src="getActivityIcon(activity.sportType)" />
                  <span
                    class="activity-name"
                    v-if="
                      (activity.classesJson && activity.classesJson.title) ||
                      activity.activityName
                    "
                  >
                    {{
                      activity.classesJson
                        ? activity.classesJson.title
                        : activity.activityName
                    }}
                  </span>
                  <span class="activity-name" v-else>
                    {{ getSportTypeName(activity.sportType) }}_手动录入
                  </span>
                </div>
                <i
                  class="el-icon-close activity-close"
                  @click="handleRemoveActivity(index)"
                ></i>
              </div>
              <div class="activity-details">
                <div class="activity-time">{{ activity.duration }}</div>
                <div class="activity-distance">
                  {{ formatDistance(activity.distance, activity.sportType) }}
                  <span v-if="activity.sportType === 3"> m </span>
                  <span v-else>km</span>
                </div>
                <div class="activity-tss">
                  {{ activity.sthValue ? activity.sthValue : "--" }}
                  <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
                </div>
              </div>
            </div>

            <div
              v-for="(activity, index) in activityList.otherT2"
              :key="index"
              class="activity-item"
            >
              <div class="activity-left">
                <div class="activity-icon">
                  <img :src="getActivityIcon(activity.sportType)" />
                  <span
                    class="activity-name"
                    v-if="
                      (activity.classesJson && activity.classesJson.title) ||
                      activity.activityName
                    "
                  >
                    {{
                      activity.classesJson
                        ? activity.classesJson.title
                        : activity.activityName
                    }}
                  </span>
                  <span class="activity-name" v-else>
                    {{ getSportTypeName(activity.sportType) }}_手动录入
                  </span>
                </div>
                <i
                  class="el-icon-close activity-close"
                  @click="handleRemoveActivity(index)"
                ></i>
              </div>
              <div class="activity-details">
                <div class="activity-time">{{ activity.duration }}</div>
                <div class="activity-distance">
                  {{ formatDistance(activity.distance, activity.sportType) }}
                  <span v-if="activity.sportType === 3"> m </span>
                  <span v-else>km</span>
                </div>
                <div class="activity-tss">
                  {{ activity.sthValue ? activity.sthValue : "--" }}
                  <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
                </div>
              </div>
            </div>

            <div
              v-for="(activity, index) in activityList.run"
              :key="index"
              class="activity-item"
            >
              <div class="activity-left">
                <div class="activity-icon">
                  <img :src="getActivityIcon(activity.sportType)" />
                  <span
                    class="activity-name"
                    v-if="
                      (activity.classesJson && activity.classesJson.title) ||
                      activity.activityName
                    "
                  >
                    {{
                      activity.classesJson
                        ? activity.classesJson.title
                        : activity.activityName
                    }}
                  </span>
                  <span class="activity-name" v-else>
                    {{ getSportTypeName(activity.sportType) }}_手动录入
                  </span>
                </div>
                <i
                  class="el-icon-close activity-close"
                  @click="handleRemoveActivity(index)"
                ></i>
              </div>
              <div class="activity-details">
                <div class="activity-time">{{ activity.duration }}</div>
                <div class="activity-distance">
                  {{ formatDistance(activity.distance, activity.sportType) }}
                  <span v-if="activity.sportType === 3"> m </span>
                  <span v-else>km</span>
                </div>
                <div class="activity-tss">
                  {{ activity.sthValue ? activity.sthValue : "--" }}
                  <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="edit-button-container">
        <el-button type="primary" class="edit-button" @click="handleEditResult">
          {{ checkIsEdit() ? "录入成绩" : "编辑成绩" }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { competitionApi } from "../services/classManagement.js";
import { getSportTypeName } from "../utils/helpers";
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
      activityList: {
        cycle: [],
        run: [],
        swim: [],
        otherT1: [],
        otherT2: [],
      },
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
      if (val) {
        console.log(val, "val");
        this.initData();
      }
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
    },
  },
  methods: {
    formatDistance(distance, sportType) {
      let result = Math.round(distance / 10) / 100;
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      if (sportType === 3 && result > 0) {
        result = Math.round(distance);
      }
      return result;
    },
    getSportTypeName(sportType) {
      return getSportTypeName(sportType);
    },
    //  校验当前 是录入成绩 还是编辑成绩 校验成绩是否为空 为空则提示录入成绩
    checkIsEdit() {
      if (
        this.competitionResult.overallRank &&
        this.competitionResult.groupRank &&
        this.competitionResult.genderRank &&
        this.competitionResult.swimmingResult &&
        this.competitionResult.t1Result &&
        this.competitionResult.cyclingResult &&
        this.competitionResult.t2Result &&
        this.competitionResult.runningResult &&
        this.competitionResult.totalResult
      ) {
        return false;
      }
      return true;
    },
    getClassImageIcon(priority) {
      if (priority === "PRIMARY" || priority === 1) {
        return require("@/assets/addClass/eventOne.png");
      } else if (priority === "SECONDARY" || priority === 2) {
        return require("@/assets/addClass/eventTwo.png");
      } else {
        return require("@/assets/addClass/eventThree.png");
      }
    },
    initData() {
      console.log(this.eventData, "this.eventData");
      if (!this.eventData) return;

      // 如果有 ID，可以加载详细数据
      if (this.eventData.id) {
        console.log(this.eventData.id, "this.eventData.id");
        this.loadEventDetail();
      }
    },
    async loadEventDetail() {
      // TODO: 调用 API 加载赛事详情数据
      const res = await competitionApi.getCompetitionDetail(this.eventData.id);
      console.log(res, "res");
      if (res.success) {
        this.competitionResult = res.result || {};
        this.activityList = res.result.deviceActivityBindView || [];
        this.summaryText = this.competitionResult.feedback || "";
      }
    },
    handleClose() {
      this.innerVisible = false;
      this.$emit("close");
    },
    handleDelete() {
      // TODO: 实现删除功能
      this.$message.info("删除功能待实现");
    },
    handleEdit() {
      // TODO: 实现编辑功能
      this.$message.info("编辑功能待实现");
    },
    handleEditResult() {
      // TODO: 实现编辑成绩功能
      this.$message.info("编辑成绩功能待实现");
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
    getActivityIcon(sportType) {
      const iconMap = {
        SWIM: require("@/assets/addClass/icon-swim.png"),
        CYCLE: require("@/assets/addClass/icon-bike.png"),
        RUN: require("@/assets/addClass/icon-run.png"),
        1: require("@/assets/addClass/icon-bike.png"),
        2: require("@/assets/addClass/icon-run.png"),
        3: require("@/assets/addClass/icon-swim.png"),
      };
      return iconMap[sportType] || require("@/assets/addClass/icon-other.png");
    },
  },
};
</script>

<style scoped lang="scss">
::v-deep .el-dialog {
  margin-top: 5vh !important;
}
::v-deep .event-info-dialog {
  border-radius: 12px;

  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 24px !important;
  }
}

.event-info-container {
  background: #fff;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .trophy-icon {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .event-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .event-date,
    .event-location {
      font-size: 13px;
      color: #999;
      position: relative;
      padding-left: 12px;

      &::before {
        content: "•";
        position: absolute;
        left: 0;
        color: #ddd;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;

    .delete-icon,
    .edit-icon,
    .close-icon {
      font-size: 18px;
      color: #999;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #333;
      }
    }

    .delete-icon:hover {
      color: #f56c6c;
    }
  }
}

.event-content {
  display: flex;
  gap: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;

  .content-left,
  .content-right {
    flex: 1;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
    padding-bottom: 8px;
  }
}

// 左侧比赛结果
.content-left {
  .result-table-wrapper {
    margin-bottom: 20px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    overflow: hidden;

    .result-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;

      tbody {
        tr {
          border-bottom: 1px solid #e8e8e8;

          &:last-child {
            border-bottom: none;
          }

          &.highlight-row {
            background: #f7f7f8;

            td {
              color: #333;
              background: #f7f7f8 !important;
            }

            .value-cell.highlight {
              color: #e42827;
              font-weight: 600;
              font-size: 15px;
            }
          }

          td {
            padding: 11px 16px;
            font-size: 14px;
            background: #fff;

            &.label-cell {
              color: #666;
              font-weight: normal;
              width: 40%;
              border-right: 1px solid #e8e8e8;
            }

            &.value-cell {
              color: #333;
              font-weight: 500;
              text-align: center;
            }
          }
        }
      }
    }
  }
}

// 总结反馈
.summary-section {
  margin-bottom: 20px;

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .summary-label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .summary-required {
      font-size: 12px;
      color: #e42827;
    }
  }

  .summary-textarea {
    ::v-deep .el-textarea__inner {
      font-size: 13px;
      line-height: 1.6;
      border-color: #e8e8e8;
      border-radius: 4px;

      &:focus {
        border-color: #e42827;
      }
    }

    ::v-deep .el-input__count {
      background: transparent;
      font-size: 12px;
      color: #999;
    }
  }
}

// 右侧运动记录
.content-right {
  .activity-list {
    max-height: 500px;
    overflow-y: auto;

    .activity-item {
      background: #fff;
      border-radius: 6px;
      margin-bottom: 10px;
      position: relative;
      border: 1px solid #e8e8e8;
      gap: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      .activity-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-height: 50px;
        flex-shrink: 0;
        min-width: 100px;
        border-bottom: 1px solid #e8e8e8;
        margin-left: 10px;

        .activity-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 30px;
            height: 30px;
            object-fit: contain;
            margin-right: 20px;
          }
        }

        .activity-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }
        i {
          margin-right: 10px;
        }
      }

      .activity-details {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 14px;
        color: #666;
        flex: 1;
        justify-content: space-around;
        min-height: 50px;

        .activity-time,
        .activity-distance,
        .activity-tss {
          white-space: nowrap;
          font-weight: 600;
          font-size: 14px;
        }
      }

      .activity-close {
        font-size: 16px;
        color: #d0d0d0;
        cursor: pointer;
        transition: color 0.3s;
        flex-shrink: 0;

        &:hover {
          color: #e42827;
        }
      }
    }

    .empty-activity {
      text-align: center;
      padding: 60px 20px;
      color: #d0d0d0;
      font-size: 13px;
    }
  }
}

// 编辑按钮
.edit-button {
  width: 100px;
  height: 35x;
  line-height: 35px;
  background: #e42827;
  border-color: #e42827;
  font-size: 14px;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 20px;
  padding: 0;

  &:hover,
  &:focus {
    background: #c31f1f;
    border-color: #c31f1f;
  }
}
.edit-button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  width: 100%;
}
</style>
