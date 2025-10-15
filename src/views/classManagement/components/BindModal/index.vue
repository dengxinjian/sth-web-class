<template>
  <el-dialog
    title="运动数据匹配"
    :visible.sync="visible"
    width="600px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    center
  >
    <div class="bind-modal-content">
      <!-- 问题文本 -->
      <div class="question-text">
        <p class="question">你确定将选择的课程和运动数据进行匹配吗？</p>
        <p class="explanation">
          匹配后会将完成的运动数据加到课程中。您的所有数据、描述和评论都将保持不变。
        </p>
      </div>

      <!-- 数据匹配可视化 -->
      <div class="binding-visualization">
        <!-- 左侧运动数据 -->
        <div class="exercise-data">
          <div class="exercise-card">
            <div class="card-icon">
              <img
                width="40"
                height="40"
                :src="getSportTypeIcon(exerciseData[0].sportType)"
                alt=""
              />
            </div>
            <div class="card-content">
              <div class="card-title">{{ exerciseData[0].name }}</div>
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
                  exerciseData[0].distance == 0
                    ? "--"
                    : exerciseData[0].distance
                }}km
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
            </div>
            <div class="card-content">
              <div class="card-title">{{ courseData.name }}</div>
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
                {{ courseData.distance == 0 ? "--" : courseData.distance }}
                <span v-if="courseData.distanceUnit">{{
                  courseData.distanceUnit
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 箭头 -->
        <div class="arrow-container">
          <div class="arrow"></div>
        </div>

        <!-- 右侧课程数据 -->
        <div class="course-data">
          <div class="course-card">
            <div class="card-icon">
              <img
                width="40"
                height="40"
                :src="getSportTypeIcon(courseData.sportType)"
                alt=""
              />
            </div>
            <div class="card-content">
              <div class="card-title">{{ courseData.name }}</div>
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

export default {
  name: "BindModal",
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    exerciseData: {
      type: Array,
      default: () => ({
        name: "Strength",
        duration: "0:55:58",
        sth: "28",
        id: "",
      }),
    },
    courseData: {
      type: Object,
      default: () => ({
        name: "肌肉耐力训练(e)",
        duration: "0:55:58",
        sth: "28",
        dataDate: "",
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
    getSportTypeIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
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
  padding: 20px 0;
}

.question-text {
  margin-bottom: 30px;

  .question {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 10px 0;
  }

  .explanation {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }
}

.binding-visualization {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
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
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 15px;
  width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: #8b5cf6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.card-content {
  flex: 1;

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .card-duration {
    font-size: 12px;
    color: #666;
    margin-bottom: 2px;
  }

  .card-sth {
    font-size: 12px;
    color: #666;
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
  border-left: 20px solid #8b5cf6;
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
    border-left: 20px solid #8b5cf6;
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
    border-left: 20px solid #8b5cf6;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
  }
}

.dialog-footer {
  text-align: center;

  .el-button {
    margin: 0 10px;
    padding: 10px 30px;
  }
}
</style>
