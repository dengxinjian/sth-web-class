<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="960px"
    :before-close="handleClose"
    append-to-body
    class="add-swim-class-dialog"
    @open="handleOpen"
    :close-on-click-modal="false"
  >
    <span slot="title">游泳</span>

    <div class="form-section">
      <el-form :model="form" label-width="60px">
        <el-form-item label="标题：">
          <el-input
            v-model="form.title"
            placeholder="标题"
            disabled
            class="pill-input"
          />
        </el-form-item>

        <div class="row">
          <div class="row-item icon-box">
            <img src="~@/assets/addClass/icon-swim.png" width="30" alt="" />
          </div>
          <div class="row-item">
            <span class="label">距离</span>
            <el-input-number
              :step="0.1"
              :min="0"
              :step-strictly="true"
              :controls="false"
              disabled
              v-model="form.distance"
              placeholder=""
              class="pill-input short"
            />
          </div>
          <div class="row-item">
            <el-select
              v-model="form.distanceUnit"
              class="pill-select short"
              disabled
            >
              <el-option label="m" value="m" />
              <el-option label="km" value="km" />
            </el-select>
          </div>
          <div class="row-item">
            <span class="label">时长</span>
            <el-time-picker
              v-model="form.duration"
              value-format="HH:mm:ss"
              format="HH:mm:ss"
              placeholder="00:00:00"
              class="pill-time"
              disabled
            />
          </div>
          <div class="row-item">
            <span class="label">STH</span>
            <el-input-number
              :step="1"
              :min="0"
              :step-strictly="true"
              :controls="false"
              v-model="form.sth"
              placeholder=""
              class="pill-input short"
              disabled
            />
          </div>
        </div>

        <!-- 运动参数部分 -->
        <div class="edit-section">
          <div class="summary-title">同步参数</div>
          <div class="sync-params-container">
            <div class="sync-params-left">
              <div class="sync-params">
                <span>时间：{{ sportDetail.startTime }}</span>
                <span>距离：{{ sportDetail.distance }} m</span>
              </div>
              <div class="sync-params">
                <span
                  >平均配速：{{
                    convertSpeedToPace(sportDetail.avgSpeed)
                  }}/100m</span
                >
                <span>运动消耗：{{ sportDetail.calories }} kcal</span>
              </div>
              <div class="sync-params">
                <span>STH：{{ sportDetail.sthValue }}</span>
                <span></span>
              </div>
            </div>
            <table class="sync-params-table">
              <tr>
                <td></td>
                <td>最小</td>
                <td>平均</td>
                <td>最大</td>
                <td>单位</td>
              </tr>
              <tr>
                <td>配速</td>
                <td>{{ convertSpeedToPace(sportDetail.minSpeed) }}</td>
                <td>{{ convertSpeedToPace(sportDetail.avgSpeed) }}</td>
                <td>{{ convertSpeedToPace(sportDetail.maxSpeed) }}</td>
                <td>min/100m</td>
              </tr>
              <tr>
                <td>心率</td>
                <td>{{ sportDetail.minHeartRate }}</td>
                <td>{{ sportDetail.avgHeartRate }}</td>
                <td>{{ sportDetail.maxHeartRate }}</td>
                <td>bpm</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="summary">
          <div class="summary-title">概要</div>
          <div class="editor-wrapper">
            <el-input
              type="textarea"
              v-model="form.summary"
              :rows="12"
              maxlength="2000"
              show-word-limit
              placeholder="请输入概要"
              class="summary-textarea"
              disabled
            />
          </div>
        </div>
        <el-form-item label="标签：">
          <el-select
            v-model="form.tags"
            placeholder="选择或输入标签内容"
            class="tag-input"
            disabled
            multiple
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="tag in existingTags"
              :key="tag.label"
              :label="tag.label"
              :value="tag.label"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";

export default {
  name: "AddSwimClassDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      // 兼容 v-model
      type: Boolean,
      default: undefined,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      existingTags: [], // 现有的标签
      form: Object.assign(
        {
          id: this.data.id || "",
          title: this.data.title || "",
          groupId: this.data.groupId || "",
          sportType: "SWIM",
          distance: "",
          distanceUnit: "m",
          duration: "",
          sth: "",
          summary: "",
          tags: "",
        },
        this.data || {}
      ),
      sportDetail: {},
    };
  },
  computed: {
    canDelete() {
      return !!(this.data && this.data.id);
    },
    summaryLength() {
      return (this.form.summary || "").length;
    },
  },
  watch: {
    value(val) {
      this.innerVisible = val;
    },
    innerVisible: {
      handler(val) {
        // 当弹框打开时调用 handleOpen
        if (val) {
          this.handleOpen();
        }
      },
      immediate: true, // 确保在组件挂载时立即执行一次
    },
  },
  methods: {
    handleOpen() {
      this.resetForm();
      if (this.data.id) {
        this.getClassInfo(this.data.id);
      }
      if (this.data.activityId) {
        this.getSportDetail(this.data.activityId);
      }
    },
    // 编辑进入弹框时，查询课程数据
    getClassInfo(id) {
      getData({
        url: "/api/classSchedule/getClassScheduleById",
        id,
      }).then((res) => {
        if (res.success) {
          this.form = JSON.parse(res.result.classesJson);
          this.form.id = res.result.id;
        }
      });
    },
    // 查询运动详情
    getSportDetail(id) {
      getData({
        url: "/gateway/training/activity/getActivityDetail",
        activityId: id,
      }).then((res) => {
        if (res.success) {
          this.sportDetail = res.result;
        }
      });
    },
    // 秒转换成HH:mm:ss
    translateTime(seconds) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    },
    // 将速度（m/s）转换为配速（min/km）并格式化为mm:ss格式
    convertSpeedToPace(speedInMs) {
      if (!speedInMs || speedInMs <= 0) {
        return "--:--";
      }

      // 速度 m/s 转换为配速 min/km
      // 配速 = 1000 / (速度 * 60) 分钟
      const paceInMinutes = 100 / (speedInMs * 60);

      // 分离分钟和秒数
      const minutes = Math.floor(paceInMinutes);
      const seconds = Math.round((paceInMinutes - minutes) * 60);

      // 格式化输出为 mm:ss
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      return `${formattedMinutes}:${formattedSeconds}`;
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onSave(closeAfter) {
      const payload = { ...this.form };
      if (this.form.id) {
        this.submitUpdateClass(closeAfter);
      } else {
        this.submitNewClass(closeAfter);
      }
    },
    onDelete() {
      if (this.form.id) {
        this.submitDeleteClass();
      } else {
        this.resetForm();
      }
      this.$emit("delete", this.form);
    },
    resetForm() {
      // 清空表单数据，但保留传入的title
      this.form = {
        id: this.data?.id || "",
        title: this.data?.title || "",
        groupId: this.data?.groupId || "",
        sportType: "SWIM",
        distance: "",
        distanceUnit: "m",
        duration: "",
        sth: "",
        summary: "",
        tips: "",
      };
    },
  },
};
</script>

<style scoped>
.add-swim-class-dialog ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.add-swim-class-dialog ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.pill-input .el-input__inner {
  border-radius: 22px;
  height: 40px;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 0 16px;
}
.pill-input.short {
  width: 120px;
}
.pill-select ::v-deep(.el-input__inner) {
  height: 40px;
}
.pill-time ::v-deep(.el-input__inner) {
  height: 40px;
}
.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.row-item {
  margin-right: 16px;
  display: flex;
  align-items: center;
}
.row-item .label {
  margin-right: 8px;
  color: #666;
  width: 30px;
}
.icon-box {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f2f2f4;
  display: flex;
  align-items: center;
  justify-content: center;
}
.summary {
  margin-top: 10px;
  margin-bottom: 10px;
}
.summary-title {
  margin: 10px 0;
  font-weight: 600;
  color: rgb(96, 98, 102);
  text-indent: 6px;
}
.editor-wrapper {
  position: relative;
}
.word-limit {
  position: absolute;
  right: 8px;
  bottom: 6px;
  color: #999;
  font-size: 12px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
.dialog-footer .el-button {
  min-width: 120px;
  border-radius: 22px;
}
.dialog-footer .el-button--warning {
  background: #f5a623;
  border-color: #f5a623;
}
.dialog-footer .el-button--danger {
  background: #d83b36;
  border-color: #d83b36;
}

.sync-params-container {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.sync-params-left {
  flex: 1;
}

.sync-params {
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 10px;
}

.sync-params > span {
  flex: 2;
}

.sync-params span:last-child {
  flex: 1.2;
}

.sync-params-table {
  flex: 1;
  font-size: 12px;
  line-height: 20px;
  width: 100%;
  border-collapse: collapse;
}

.sync-params-table td {
  flex: 1;
  text-align: center;
}

.sync-params-table td:last-child {
  flex: 1;
}

.sync-params-table td:first-child {
  flex: 1;
}

.sync-params-table tr:first-child {
  background-color: #f5f5f5;
}
</style>
