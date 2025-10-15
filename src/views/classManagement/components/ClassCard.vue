<template>
  <div
    class="schedule-class"
    :data-id="classData.id"
    data-type="classTemplate"
    @click="$emit('click', classData.id, classData.sportType)"
  >
    <div class="schedule-class-info">
      <!-- 标题和操作按钮 -->
      <div class="schedule-class-info-item-title">
        <div>{{ classData.classesJson.title }}</div>
        <el-popover
          popper-class="athletic-btn-popover"
          placement="right"
          width="80"
          trigger="hover"
        >
          <div class="btn-list-hover">
            <span v-if="showMoveBtn">
              <el-button type="text" @click.stop="$emit('move', classData.id)">
                移动分组
              </el-button>
            </span>
            <span v-if="showDeleteBtn">
              <el-button
                type="text"
                @click.stop="$emit('delete', classData.id)"
              >
                删除课程
              </el-button>
            </span>
            <span v-if="showCopyBtn">
              <el-button type="text" @click.stop="$emit('copy', classData)">
                {{ copyBtnText }}
              </el-button>
            </span>
          </div>
          <i class="el-icon-more" slot="reference" @click.stop></i>
        </el-popover>
      </div>

      <!-- 课程信息 -->
      <div class="schedule-class-info-item-content">
        <!-- 运动类型图标 -->
        <span>
          <img :src="getSportTypeIcon(classData.sportType)" alt="" />
        </span>

        <!-- 时长 -->
        <span>
          {{
            classData.classesJson.duration == "00:00:00" || !classData.classesJson.duration
              ? "--:--:--"
              : classData.classesJson.duration
          }}
        </span>

        <!-- 距离 -->
        <span>
          {{
            !classData.classesJson.distance
              ? "--"
              : classData.classesJson.distance
          }}
          <span v-if="classData.sportType === 'SWIM'">
            {{ classData.classesJson.distanceUnit }}
          </span>
          <span v-else>km</span>
        </span>

        <!-- STH值 -->
        <span>
          <img class="sth" src="~@/assets/addClass/sth.png" alt="" />
          {{
            !classData.classesJson.sth ? "--" : classData.classesJson.sth
          }}
        </span>
      </div>
    </div>

    <!-- 训练强度可视化 -->
    <div
      v-if="classData.classesJson.timeline"
      style="height: 16px; display: flex; gap: 1px"
    >
      <div
        v-for="(stage, index) in classData.classesJson.timeline"
        :key="index"
        class="time-stage"
        :style="{ flex: stage.duration }"
      >
        <div style="display: flex; gap: 1px; height: 16px">
          <div v-for="n in +stage.times" :key="n" :style="{ flex: 1 }">
            <ExerciseProcessChart
              :exerciseList="stage.stageTimeline"
              :maxIntensity="classData.classesJson.maxIntensity"
              :height="16"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import { SPORT_TYPE_ICONS } from "../constants";

export default {
  name: "ClassCard",
  components: {
    ExerciseProcessChart,
  },
  props: {
    classData: {
      type: Object,
      required: true,
    },
    activeClassType: {
      type: String,
      default: "my", // 'my' | 'official'
    },
    groupId: {
      type: [String, Number],
      default: null,
    },
  },
  computed: {
    showMoveBtn() {
      return this.activeClassType === "my";
    },
    showDeleteBtn() {
      return this.activeClassType === "my";
    },
    showCopyBtn() {
      return true;
    },
    copyBtnText() {
      return this.activeClassType === "official" ? "添加课程" : "复制课程";
    },
  },
  methods: {
    getSportTypeIcon(sportType) {
      return SPORT_TYPE_ICONS[sportType] || SPORT_TYPE_ICONS.OTHER;
    },
  },
};
</script>

<style lang="scss" scoped>
.schedule-class {
  background-color: #f8f8f8;
  margin-bottom: 10px;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;

  .schedule-class-info-item-title {
    display: flex;
    gap: 6px;
    justify-content: space-between;

    > div {
      flex: 1;
    }
  }

  .schedule-class-info-item-content {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
    align-items: center;

    img {
      width: 20px;
      vertical-align: middle;
      margin-top: -3px;
    }

    .sth {
      width: 24px;
      vertical-align: middle;
    }

    >span:nth-child(1) {
      flex: 0 0 20px;
    }
    >span:nth-child(2) {
      flex: 1;
    }
    >span:nth-child(3) {
      flex: 1.2;
      text-align: right;
    }
    >span:nth-child(4) {
      flex: 1.5;
    }
  }
}

.btn-list-hover {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-stage {
  height: 16px;
}
</style>
