<template>
  <el-dialog
    :visible.sync="visible"
    width="640px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <span slot="title" class="dialog-title">运动匹配数据</span>
    <div class="bind-modal-content">
      <!-- 问题文本 -->
      <div class="question-text">
        <p class="question">你确定将选择的课程和运动数据进行匹配吗？</p>
        <p class="explanation">
          匹配后会将完成的运动数据加到课程中。您的所有数据、描述和评论都将保持不变。
        </p>
      </div>

      <!-- 数据匹配可视化 -->
      <div
        v-if="exerciseData && exerciseData.length > 0 && courseData"
        class="binding-visualization"
      >
        <!-- 左侧运动数据 -->
        <div class="exercise-data">
          <div class="exercise-card">
            <div class="card-icon">
              <img
                width="40"
                height="40"
                :src="getSportIcon(exerciseData[0].sportType)"
                alt=""
              />
              <div class="card-title" v-if="exerciseData[0].name">
                {{ exerciseData[0].name }}
              </div>
              <div class="card-title" v-else>
                {{ getSportTypeName(exerciseData[0].sportType) }}_手动录入
              </div>
            </div>
            <div class="card-content">
              <div class="card-duration">
                {{
                  exerciseData[0].duration == "00:00:00"
                    ? "--:--:--"
                    : exerciseData[0].duration
                }}
              </div>
              <div class="card-sth">
                {{ exerciseData[0].sth == 0 ? "--" : exerciseData[0].sth }} STH
              </div>
              <div class="card-distance">
                {{
                  formatDistance(
                    exerciseData[0].distance,
                    exerciseData[0].sportType
                  )
                }}
                <span v-if="exerciseData[0].sportType === 'SWIM'">{{
                  exerciseData[0].distanceUnit
                }}</span>
                <span v-else>km</span>
              </div>
            </div>
          </div>

          <div class="exercise-card">
            <div class="card-icon">
              <!-- <i class="el-icon-dumbbell"></i> -->
              <img
                width="40"
                height="40"
                :src="getSportTypeIcon(courseData.sportType)"
                alt=""
              />
              <div class="card-title">{{ courseData.name }}</div>
            </div>
            <div class="card-content">
              <div class="card-duration">
                {{
                  courseData.duration == "00:00:00"
                    ? "--:--:--"
                    : courseData.duration
                }}
              </div>
              <div class="card-sth">
                {{ courseData.sth == 0 ? "--" : courseData.sth }} STH
              </div>
              <div class="card-distance">
                {{ formatDistance(courseData.distance, courseData.sportType) }}
                <span v-if="courseData.sportType === 'SWIM'">{{
                  courseData.distanceUnit
                }}</span>
                <span v-else>km</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 箭头 -->
        <div class="arrow-container">
          <!-- <div
            class="arrow"
            :style="{
              '--arrow-color': getClassIconArrowColor(courseData.sportType),
            }"
          ></div> -->
          <img src="@/assets/addClass/Union.png" alt="" />
        </div>

        <!-- 右侧课程数据 -->
        <div class="course-data">
          <div
            class="course-card"
            style="
              border: 1px solid #f92b30;
              box-shadow: 0px 2px 4px 0px #f92b3026;
            "
          >
            <div class="card-icon">
              <img
                width="40"
                height="40"
                :src="getSportTypeIcon(courseData.sportType)"
                alt=""
              />
              <div class="card-title">
                {{ courseData.name }}
              </div>
            </div>
            <div class="card-content">
              <div class="card-duration">
                {{
                  exerciseData[0].duration == "00:00:00"
                    ? "--:--:--"
                    : exerciseData[0].duration
                }}
              </div>
              <div class="card-distance">
                {{
                  formatDistance(
                    exerciseData[0].distance,
                    exerciseData[0].sportType
                  )
                }}
                <span v-if="exerciseData[0].sportType === 'SWIM'">{{
                  exerciseData[0].distanceUnit
                }}</span>
                <span v-else>km</span>
              </div>
              <div class="card-sth">
                {{ exerciseData[0].sth == 0 ? "--" : exerciseData[0].sth }} STH
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleBind">匹配</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { SPORT_TYPE_ICONS } from "../../constants";
import {
  getClassImageIcon,
  getClassIconArrowColor,
  getSportTypeName,
} from "../../utils/helpers";

export default {
  name: "BindModal",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    exerciseData: {
      type: Array,
      default: () => [
        {
          name: "Strength",
          duration: "0:55:58",
          sth: "28",
          id: "",
          sportType: "",
        },
      ],
    },
    courseData: {
      type: Object,
      default: () => ({
        name: "肌肉耐力训练(e)",
        duration: "0:55:58",
        sth: "28",
        dataDate: "",
        sportType: "",
      }),
    },
    type: {
      type: String,
      default: "",
    },
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    getSportTypeName(sportType) {
      return getSportTypeName(sportType);
    },
    formatDistance(distance, sportType) {
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && typeof distance === "number" && distance > 0) {
        result = distance.toString();
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    getSportTypeIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
    },
    getSportIcon(sportType) {
      console.log(sportType, "sportType");
      return getClassImageIcon(sportType);
    },
    getClassIconArrowColor(sportType) {
      return getClassIconArrowColor(sportType);
    },
    handleClose() {
      this.visible = false;
      this.$emit("cancel");
    },
    handleCancel() {
      this.visible = false;
      this.$emit("cancel");
    },
    handleBind() {
      console.log("匹配数据：", this.exerciseData, this.courseData, this.type);
      this.$emit("bind", {
        exerciseData: this.exerciseData,
        courseData: this.courseData,
        type: this.type,
      });
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.bind-modal-content {
  padding: 0 20px;
}
.question-text {
  margin-bottom: 30px;

  .question {
    font-size: 16px;
    font-weight: 600;
    color: #101010;
    // margin: 0 0 10px 0;
    font-family: PingFang SC;
    font-weight: 600;
    font-style: Semibold;
    font-size: 16px;
  }

  .explanation {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.5;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
  }
}

.binding-visualization {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0;
}

.exercise-data {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-card,
.course-card {
  background: #fff;
  border: 1px solid #0000001f;
  border-radius: 8px;
  padding: 15px;
  width: 240px;
  box-shadow: 0px 2px 4px 0px #0000000d;
  // gap: 12px;
  display: flex;
  flex-direction: column;
}

.card-icon {
  display: flex;
  align-items: center;
  img {
    width: 24px;
    height: 24px;
  }
  .card-title {
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    margin-left: 10px;
    color: #101010;
  }
}

.card-content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  .card-duration {
    font-size: 12px;
    color: #666;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
  }

  .card-sth {
    font-size: 12px;
    color: #666;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
  }
}

.arrow-container {
  position: relative;
  height: 60px;
  display: flex;
  align-items: center;
}

.arrow {
  width: 0;
  height: 0;
  border-left: 20px solid var(--arrow-color, #8b5cf6);
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: -25px;
    top: -15px;
    width: 0;
    height: 0;
    border-left: 20px solid var(--arrow-color, #8b5cf6);
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
  }

  &::after {
    content: "";
    position: absolute;
    left: -30px;
    top: -15px;
    width: 0;
    height: 0;
    border-left: 20px solid var(--arrow-color, #8b5cf6);
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  .el-button {
    margin: 0 10px;
    padding: 10px 30px;
  }
}
</style>
