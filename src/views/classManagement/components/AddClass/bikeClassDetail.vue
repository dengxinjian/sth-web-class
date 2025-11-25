<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="90%"
    :before-close="handleClose"
    append-to-body
    class="add-swim-class-dialog"
    :close-on-click-modal="false"
    custom-class="class-dialog"
  >
    <span slot="title">{{
      type === "add" ? "新建骑行课程" : "编辑骑行课程"
    }}</span>
    <div class="basic-info">
      <div class="basic-info-item">
        <div class="basic-info-title">
          <span>标题：</span>
          <el-input
            type="text"
            v-model="classInfo.title"
            :disabled="originalType === 'official'"
            :maxlength="50"
          />
        </div>
        <div class="basic-info-total">
          <span>
            <img src="~@/assets/addClass/icon-bike.png" width="30" alt="" />
          </span>
          <span>{{
            classInfo.duration == "00:00:00" || !classInfo.duration
              ? "--:--:--"
              : classInfo.duration
          }}</span>
          <span>{{
            !classInfo.distance || classInfo.distance == "0"
              ? "--km"
              : classInfo.distance
          }}</span>
          <span>
            {{ classInfo.sth || "--" }}
            <img src="~@/assets/addClass/sth.png" width="28" alt="" />
          </span>
        </div>
      </div>
      <div class="basic-info-item">
        <div class="basic-info-modal">
          <div class="modal-container" @click="handleAddStage('warmup')">
            <div class="modal-block">
              <div class="modal-block-warmup"></div>
            </div>
            <span>热身</span>
          </div>
          <div class="modal-container" @click="handleAddStage('recover')">
            <div class="modal-block">
              <div class="modal-block-recover"></div>
            </div>
            <span>恢复</span>
          </div>
          <div class="modal-container" @click="handleAddStage('cooling')">
            <div class="modal-block">
              <div class="modal-block-cooling"></div>
            </div>
            <span>冷身</span>
          </div>
          <div class="modal-container" @click="handleAddStage('stage1')">
            <div class="modal-block">
              <div class="modal-block-warmup"></div>
            </div>
            <span>1个段落</span>
          </div>
          <div class="modal-container" @click="handleAddStage('stage2')">
            <div class="modal-block">
              <div class="modal-block-recover"></div>
              <div class="modal-block-warmup"></div>
            </div>
            <span>2个段落</span>
          </div>
          <div class="modal-container" @click="handleAddStage('stage3')">
            <div class="modal-block">
              <div class="modal-block-cooling"></div>
              <div class="modal-block-recover"></div>
              <div class="modal-block-warmup"></div>
            </div>
            <span>3个段落</span>
          </div>
        </div>
      </div>
      <div class="basic-info-item">
        <div>
          <span>模式选择：</span>
          <el-select
            v-model="classInfo.mode"
            :disabled="originalType === 'official'"
            class="pill-select short"
            @change="getSth"
          >
            <el-option label="跟随阈值功率" :value="1" />
            <el-option label="跟随阈值心率" :value="2" />
            <el-option label="固定功率" :value="3" />
            <el-option label="固定心率" :value="4" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="time-line" id="timeLineDrag">
      <div
        v-for="(item, index) in timeline"
        :key="`timeline-${index}-${item.duration}-${item.times}`"
        class="time-stage"
        :style="{ flex: item.duration, minWidth: 0 }"
      >
        <span
          v-if="originalType !== 'official'"
          class="time-stage-close"
          @click="handleDeleteStage(index)"
          ><i class="el-icon-close"></i
        ></span>
        <div class="time-stage-title">
          {{
            item.stageTimeline.length > 1 ? "骑行" : item.stageTimeline[0].title
          }}
        </div>
        <div class="time-stage-for">
          <div
            v-for="n in +item.times"
            :key="`stage-${index}-${n}-${item.duration}`"
            class="time-stage-item"
          >
            <ExerciseProcessChart
              :exerciseList="item.stageTimeline"
              :maxIntensity="maxIntensity"
              :height="30"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="class-edit">
      <div class="class-edit-left">
        <!-- 概要部分 -->
        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">概要</span>
          </div>
          <div class="summary-input-container">
            <el-input
              v-model="classInfo.summary"
              type="textarea"
              :rows="6"
              placeholder="请输入课程概要"
              maxlength="500"
              show-word-limit
              class="summary-textarea"
              :disabled="originalType === 'official'"
            />
          </div>
        </div>

        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">训练建议</span>
          </div>
          <div class="summary-input-container">
            <el-input
              v-model="classInfo.trainingAdvice"
              type="textarea"
              :rows="4"
              placeholder="请输入训练建议"
              maxlength="500"
              show-word-limit
              class="summary-textarea"
              :disabled="originalType === 'official'"
            />
          </div>
        </div>

        <!-- 阶段明细部分 -->
        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">阶段明细</span>
          </div>
          <div class="phase-details">
            <div class="phase-item">
              <div
                v-for="(item, index) in classInfo.stages"
                :key="index"
                class="phase-item-content"
              >
                <div v-if="item.times > 1">重复{{ item.times }}次</div>
                <div v-for="(part, idx) in item.sections" :key="idx">
                  <div>{{ part.title }}</div>
                  <div v-if="classInfo.mode === 1 && part.range === 'range'">
                    {{ part.target }} @ {{ part.thresholdFtpRange[0] }}~
                    {{ part.thresholdFtpRange[1] }}% 阈值功率
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 2 && part.range === 'range'">
                    {{ part.target }} @ {{ part.thresholdHeartRateRange[0] }}~
                    {{ part.thresholdHeartRateRange[1] }}% 阈值心率
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 1 && part.range === 'target'">
                    {{ part.target }} @ {{ part.thresholdFtp }}% 阈值功率
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 2 && part.range === 'target'">
                    {{ part.target }} @ {{ part.thresholdHeartRate }}% 阈值心率
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 3 && part.range === 'range'">
                    {{ part.target }} @ {{ part.targetFtpRange[0] }}~
                    {{ part.targetFtpRange[1] }}w
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 4 && part.range === 'range'">
                    {{ part.target }} @ {{ part.targetHeartRateRange[0] }}~
                    {{ part.targetHeartRateRange[1] }}bpm
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 3 && part.range === 'target'">
                    {{ part.target }} @ {{ part.targetFtp }}w
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 4 && part.range === 'target'">
                    {{ part.target }} @ {{ part.targetHeartRate }}bpm
                    <span v-if="part.hasCadence"
                      >踏频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="part.lap">按LAP进入下一段落</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 标签部分 -->
        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">标签</span>
          </div>
          <div class="tags-container">
            <div class="add-tag-input">
              <el-select
                v-model="classInfo.tags"
                placeholder="选择或输入标签内容"
                class="tag-input"
                multiple
                allow-create
                filterable
                style="width: 100%"
                :disabled="originalType === 'official'"
              >
                <el-option
                  v-for="tag in existingTags"
                  :key="tag.label"
                  :label="tag.label"
                  :value="tag.label"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <div class="class-edit-right">
        <div class="stages-container">
          <div class="section-header">
            <span class="section-title">阶段编辑</span>
          </div>
          <!-- 阶段1 -->
          <div
            v-for="(item, index) in classInfo.stages"
            :key="index"
            class="stage-section"
          >
            <div v-if="item.sections.length > 1" class="stage-header">
              <span class="stage-title">重复次数</span>
              <el-input
                v-model="item.times"
                class="times-input"
                size="small"
                @input="handleTimesChange(index)"
                @change="calculateTimeline(item.times)"
                :disabled="originalType === 'official'"
              />
            </div>
            <div
              v-for="(part, idx) in item.sections"
              :key="idx + '' + index"
              class="stage-config"
            >
              <div class="config-row">
                <div class="config-item">
                  <span class="label required">阶段名</span>
                  <el-input
                    v-model="part.title"
                    placeholder="请输入阶段名称"
                    size="small"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                </div>
                <div class="config-item">
                  <span class="label required">段落模式选择</span>
                  <el-select
                    v-model="part.stageMode"
                    placeholder="请选择"
                    size="small"
                    :disabled="originalType === 'official'"
                  >
                    <el-option label="热身" value="warmup" />
                    <el-option label="骑行" value="bike" />
                    <el-option label="恢复" value="recover" />
                    <el-option label="冷身" value="cooling" />
                  </el-select>
                </div>
                <div class="config-item">
                  <span class="label required">容量选择</span>
                  <el-select
                    v-model="part.capacity"
                    placeholder="请选择"
                    size="small"
                    :disabled="originalType === 'official'"
                  >
                    <el-option label="运动时间" value="time" />
                  </el-select>
                </div>
                <div class="config-item">
                  <span class="label required">范围选择</span>
                  <el-select
                    v-model="part.range"
                    placeholder="请选择"
                    size="small"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  >
                    <el-option label="目标值" value="target" />
                    <el-option label="范围" value="range" />
                  </el-select>
                </div>
              </div>

              <div class="config-row">
                <div class="config-item">
                  <span class="label">目标</span>
                  <!-- <el-input v-model="stages[0].duration" placeholder="00:01:00" size="small" /> -->
                  <!-- <el-time-picker v-model="part.target" value-format="HH:mm:ss" placeholder="请选择" size="small" @change="handleTargetChange(index, idx)" style="max-width: 140px;">
                                </el-time-picker> -->
                  <TimeInput
                    v-model="part.target"
                    size="small"
                    @change="handleTargetChange(index, idx)"
                    :disabled="originalType === 'official'"
                  />
                </div>
                <div
                  v-if="classInfo.mode === 1 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdFtpRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdFtpRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">%阈值功率</span>
                </div>
                <div
                  v-else-if="classInfo.mode === 1 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdFtp"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">%阈值功率</span>
                </div>
                <div
                  v-if="classInfo.mode === 2 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdHeartRateRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">%阈值心率</span>
                </div>
                <div
                  v-else-if="classInfo.mode === 2 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.thresholdHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">%阈值心率</span>
                </div>
                <div
                  v-if="classInfo.mode === 3 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetFtpRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetFtpRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">w</span>
                </div>
                <div
                  v-else-if="classInfo.mode === 3 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetFtp"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">w</span>
                </div>
                <div
                  v-if="classInfo.mode === 4 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetHeartRateRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">bpm</span>
                </div>
                <div
                  v-else-if="classInfo.mode === 4 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.targetHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">bpm</span>
                </div>
                <div v-if="part.hasCadence" class="config-item">
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.cadence[0]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    v-model="part.cadence[1]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                    :disabled="originalType === 'official'"
                  />
                  <span class="unit">踏频</span>
                  <i
                    v-if="originalType !== 'official'"
                    class="el-icon-close"
                    @click="handleRemoveCadence(index, idx)"
                    style="cursor: pointer"
                  ></i>
                </div>
              </div>

              <div class="btn-row">
                <div class="stage-actions">
                  <el-button
                    class="action-btn-add action-btn"
                    type="text"
                    size="mini"
                    circle
                    @click="handleAddSection(index)"
                    :disabled="originalType === 'official'"
                  >
                    <i class="el-icon-plus"></i>增加段落
                  </el-button>
                  <el-button
                    class="action-btn-remove action-btn"
                    type="text"
                    size="mini"
                    circle
                    @click="handleRemoveSection(index, idx)"
                    :disabled="originalType === 'official'"
                  >
                    <i class="el-icon-close"></i>移除段落
                  </el-button>
                  <el-button
                    v-if="!part.hasCadence"
                    type="text"
                    size="mini"
                    class="add-cadence-btn"
                    @click="handleAddCadence(index, idx)"
                    :disabled="originalType === 'official'"
                  >
                    <i class="el-icon-plus"></i>添加踏频范围
                  </el-button>
                </div>
                <div class="lap-toggle">
                  <el-switch
                    v-model="part.lap"
                    :disabled="originalType === 'official'"
                  />
                  <span class="toggle-label">按LAP进入下一段落</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button
        v-if="originalType !== 'official'"
        @click="onDelete"
        :disabled="originalType === 'my'"
        >删除</el-button
      >
      <el-button @click="onCancel">取消</el-button>
      <el-button
        v-if="originalType !== 'official'"
        type="warning"
        @click="onSave(false)"
        >保存</el-button
      >
      <el-button
        v-if="originalType !== 'official'"
        type="danger"
        @click="onSave(true)"
        >保存并关闭</el-button
      >
    </span>
  </el-dialog>
</template>
<script>
import Sortable from "sortablejs";
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import { getData, submitData } from "@/api/common.js";
import TimeInput from "@/views/classManagement/components/timeInpt";
import { debounce, checkFormBike } from "@/views/classManagement/uilt";

export default {
  name: "AddBikeClassDialog",
  components: {
    ExerciseProcessChart,
    TimeInput,
  },
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
    type: {
      type: String,
      default: "add",
    },
    originalType: {
      type: String,
      default: "my",
    },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      timeline: [],
      maxIntensity: 1,
      existingTags: [], // 现有的标签
      newTag: "", // 新标签输入
      classInfo: {
        id: "",
        sportType: "CYCLE",
        title: this.data.title || "", // 标题
        groupId: this.data.groupId || 0, // 分组
        duration: "", // 时长
        distance: "", // 距离
        sth: "",
        mode: 1, // 模式
        summary: "", // 概要
        tags: [],
        stages: [],

        durationSeconds: "",
        distanceMeters: "",
      },
      sectionTemplate: {
        title: "", // 标题
        stageMode: "warmup", // 段落模式
        summary: "", // 概要
        tags: [], // 标签
        capacity: "time", // 容量
        range: "range", // 范围
        target: "00:20:00", // 目标
        hasCadence: false,
        thresholdFtp: 80,
        thresholdFtpRange: [80, 85],
        thresholdHeartRate: 80,
        thresholdHeartRateRange: [80, 85],
        targetFtp: 230,
        targetFtpRange: [140, 160],
        targetHeartRate: 150,
        targetHeartRateRange: [110, 150],
        cadence: [80, 90],
        lap: false,
        targetSeconds: 20 * 60, // 计算出来的秒数
      },
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
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val;
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
      this.$emit("input", val);
      // 当弹框打开时清空表单
      if (val) {
        this.getTagList();
        if (this.data.id && this.originalType === "my") {
          // 如果数据已经包含完整的 classesJson，直接使用，不需要调用 API
          if (this.data.classesJson) {
            const classesJson = typeof this.data.classesJson === 'string'
              ? JSON.parse(this.data.classesJson)
              : this.data.classesJson;
            this.classInfo = classesJson;
            this.timeline = classesJson.timeline;
            this.maxIntensity = classesJson.maxIntensity;
            this.classInfo.id = this.data.id;
            this.classInfo.groupId = this.data.classesGroupId || this.data.groupId;
            this.handleClassDrag();
          } else {
            // 只有 id 没有 classesJson 时，才调用 API 获取完整数据
            this.getClassInfo(this.data.id);
          }
        } else if (this.originalType === "my") {
          this.resetForm();
        } else {
          this.classInfo = this.data.classesJson;
          this.timeline = this.data.classesJson.timeline;
          this.maxIntensity = this.data.classesJson.maxIntensity;
          this.classInfo.groupId = this.data.groupId;
          this.handleClassDrag();
        }
      }
    },
    data(val) {
      this.getTagList();
      if (this.data.id && this.originalType === "my") {
        // 如果数据已经包含完整的 classesJson，直接使用，不需要调用 API
        if (this.data.classesJson) {
          const classesJson = typeof this.data.classesJson === 'string'
            ? JSON.parse(this.data.classesJson)
            : this.data.classesJson;
          this.classInfo = classesJson;
          this.timeline = classesJson.timeline;
          this.maxIntensity = classesJson.maxIntensity;
          this.classInfo.id = this.data.id;
          this.classInfo.groupId = this.data.classesGroupId || this.data.groupId;
          this.handleClassDrag();
        } else {
          // 只有 id 没有 classesJson 时，才调用 API 获取完整数据
          this.getClassInfo(this.data.id);
        }
      } else if (this.originalType === "my") {
        this.resetForm();
      } else {
        this.classInfo = this.data.classesJson;
        this.timeline = this.data.classesJson.timeline;
        this.maxIntensity = this.data.classesJson.maxIntensity;
        this.classInfo.groupId = this.data.groupId;
        this.handleClassDrag();
      }
    },
  },
  created() {
    this.handleTimesChange = debounce(this.handleTimesChange, 500);
  },
  methods: {
    handleTimesChange(stageIndex) {
      const stage = this.classInfo.stages[stageIndex];
      console.log(stage, "stage", stageIndex);
      const times = Number(stage.times);
      if (isNaN(times) || times < 1) {
        this.$set(this.classInfo.stages[stageIndex], "times", 1);
      } else if (!Number.isInteger(times)) {
        this.$set(
          this.classInfo.stages[stageIndex],
          "times",
          Math.max(1, Math.round(times))
        );
      }
    },
    // 获取标签列表
    getTagList() {
      getData({
        url: "/api/classesLabel/user/getLabelsByUserId",
      }).then((res) => {
        if (res.success) {
          this.existingTags = res.result || [];
        } else {
          this.existingTags = [];
        }
      });
    },
    // 编辑进入弹框时，查询课程数据
    getClassInfo(id) {
      getData({
        url: "/api/classes/getClassesById",
        id,
      }).then((res) => {
        if (res.success) {
          this.classInfo = JSON.parse(res.result.classesJson);
          this.timeline = JSON.parse(res.result.classesJson).timeline;
          this.classInfo.id = res.result.id;
          this.maxIntensity = JSON.parse(res.result.classesJson).maxIntensity;
          this.classInfo.groupId = res.result.classesGroupId;
          this.handleClassDrag();
        }
      });
    },
    // 新增课程
    submitNewClass(flag) {
      const saveData = {
        classesTitle: this.classInfo.title,
        classesGroupId: this.classInfo.groupId,
        labels: this.classInfo.tags,
        sportType: "CYCLE",
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
      };

      this.$emit("save", saveData, flag);
    },
    // 更新课程
    submitUpdateClass(flag) {
      const saveData = {
        id: this.classInfo.id,
        classesTitle: this.classInfo.title,
        classesGroupId: this.classInfo.groupId,
        labels: this.classInfo.tags,
        sportType: "CYCLE",
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
      };

      this.$emit("save", saveData, flag);
    },
    // 删除课程
    submitDeleteClass() {
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          submitData({
            url: "/api/classes/deleteClasses?id=" + this.classInfo.id,
          }).then((res) => {
            if (res.success) {
              this.resetForm();
              this.$emit("save", { ...this.classInfo });
              this.$message.success("课程删除成功");
              this.onCancel();
            }
          });
        })
        .catch(() => {});
    },
    // 获取sth值
    getSth() {
      const validation = checkFormBike(this.classInfo);
      if (!validation.isValid) {
        this.$message.error(validation.message);
        return;
      }
      submitData({
        url: "/api/classes/calculateTimeDistanceSth",
        classesTitle: this.classInfo.title,
        labels: this.classInfo.tags,
        sportType: "CYCLE",
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
      }).then((res) => {
        if (res.success) {
          this.classInfo.sth = res.result?.sth || "";
        }
      });
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.$emit("cancel");
    },
    onSave(closeAfter) {
      const validation = checkFormBike(this.classInfo);
      if (!validation.isValid) {
        this.$message.error(validation.message);
        return;
      }
      if (this.classInfo.id) {
        this.submitUpdateClass(closeAfter);
      } else {
        this.submitNewClass(closeAfter);
      }
    },
    onDelete() {
      this.$emit("delete");
    },
    resetForm() {
      // 清空表单数据，但保留传入的title
      this.classInfo = {
        id: "",
        sportType: "CYCLE",
        title: this.data.title || "", // 标题
        groupId: this.data.groupId || 0, // 分组
        duration: "", // 时长
        distance: "", // 距离
        sth: "",
        mode: 1, // 模式
        summary: "", // 概要
        tags: [],
        stages: [],

        durationSeconds: "",
        distanceMeters: "",
      };
    },
    // 删除阶段
    handleDeleteStage(index) {
      this.classInfo.stages.splice(index, 1);
      if (this.classInfo.stages.length <= 1) {
        this.classInfo.times = 1;
      }
      this.calculateTimeline();
    },
    // 创建深拷贝的section模板
    createSectionTemplate(title, stageMode) {
      return {
        ...this.sectionTemplate,
        title,
        stageMode,
        tags: [...this.sectionTemplate.tags], // 深拷贝数组
        thresholdFtpRange: [...this.sectionTemplate.thresholdFtpRange], // 深拷贝数组
        thresholdHeartRateRange: [
          ...this.sectionTemplate.thresholdHeartRateRange,
        ], // 深拷贝数组
        targetFtpRange: [...this.sectionTemplate.targetFtpRange], // 深拷贝数组
        targetHeartRateRange: [...this.sectionTemplate.targetHeartRateRange], // 深拷贝数组
        cadence: [...this.sectionTemplate.cadence], // 深拷贝数组
      };
    },
    // 添加段落
    handleAddStage(type) {
      if (this.originalType === "official") {
        return;
      }
      switch (type) {
        case "warmup":
          this.classInfo.stages.push({
            times: 1,
            sections: [this.createSectionTemplate("热身", "warmup")],
          });
          break;
        case "recover":
          this.classInfo.stages.push({
            times: 1,
            sections: [this.createSectionTemplate("恢复", "recover")],
          });
          break;
        case "cooling":
          this.classInfo.stages.push({
            times: 1,
            sections: [this.createSectionTemplate("冷身", "cooling")],
          });
          break;
        case "stage1":
          this.classInfo.stages.push({
            times: 1,
            sections: [this.createSectionTemplate("骑行", "bike")],
          });
          break;
        case "stage2":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              this.createSectionTemplate("骑行", "bike"),
              this.createSectionTemplate("骑行", "bike"),
            ],
          });
          break;
        case "stage3":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              this.createSectionTemplate("骑行", "bike"),
              this.createSectionTemplate("骑行", "bike"),
              this.createSectionTemplate("骑行", "bike"),
            ],
          });
          break;
      }
      this.calculateTimeline();
    },
    handleAddSection(index) {
      this.classInfo.stages[index].sections.push(
        this.createSectionTemplate("骑行", "bike")
      );
      this.calculateTimeline();
    },
    handleRemoveSection(index, sectionIndex) {
      if (this.classInfo.stages[index].sections.length > 1) {
        this.classInfo.stages[index].sections.splice(sectionIndex, 1);
        if (this.classInfo.stages[index].sections.length === 1) {
          this.classInfo.stages[index].times = 1;
        }
      } else {
        this.classInfo.stages.splice(index, 1);
      }
      this.calculateTimeline();
    },
    handleAddCadence(index, sectionIndex) {
      this.classInfo.stages[index].sections[sectionIndex].hasCadence = true;
    },
    handleRemoveCadence(index, sectionIndex) {
      this.classInfo.stages[index].sections[sectionIndex].hasCadence = false;
    },
    translateTarget(target) {
      return target
        .split(":")
        .map((item) => parseInt(item))
        .reduce((prev, curr) => prev * 60 + curr);
    },
    handleTargetChange(index, sectionIndex) {
      this.classInfo.stages[index].sections[sectionIndex].targetSeconds =
        this.translateTarget(
          this.classInfo.stages[index].sections[sectionIndex].target
        );
      this.calculateTimeline();
    },
    calculateIndent(section, mode) {
      switch (mode) {
        case 1:
          if (section.range === "range") {
            return (
              (section.thresholdFtpRange[0] + section.thresholdFtpRange[1]) / 2
            );
          } else {
            return section.thresholdFtp;
          }
        case 2:
          if (section.range === "range") {
            return (
              (section.thresholdHeartRateRange[0] +
                section.thresholdHeartRateRange[1]) /
              2
            );
          } else {
            return section.thresholdHeartRate;
          }
        case 3:
          if (section.range === "range") {
            return (section.targetFtpRange[0] + section.targetFtpRange[1]) / 2;
          } else {
            return section.targetFtp;
          }
        case 4:
          if (section.range === "range") {
            return (
              (section.targetHeartRateRange[0] +
                section.targetHeartRateRange[1]) /
              2
            );
          } else {
            return section.targetHeartRate;
          }
      }
    },
    // 秒转换成HH:mm:ss
    translateTime(seconds) {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    },
    // 计算时间线
    calculateTimeline(times = 1) {
      const timesNum = Number(times);
      if (isNaN(timesNum) || timesNum < 1) {
        return;
      } else if (!Number.isInteger(timesNum)) {
        return;
      }
      this.getSth();
      let duration = 0;
      this.maxIntensity = 0;
      this.timeline = this.classInfo.stages.map((stage) => {
        let totalTime = 0;
        stage.sections.forEach((section) => {
          totalTime += section.targetSeconds;
        });
        const stageTimeline = stage.sections.map((section) => {
          const intensity = this.calculateIndent(section, this.classInfo.mode);
          if (this.maxIntensity < intensity) {
            this.maxIntensity = intensity;
          }
          return {
            duration: section.targetSeconds,
            intensity,
            title: section.title,
          };
        });
        duration += totalTime * stage.times;
        return {
          duration: totalTime * stage.times,
          stageTimeline,
          times: stage.times,
        };
      });
      this.classInfo.duration = this.translateTime(duration);
      this.handleClassDrag();
    },
    // 段落图形拖拽
    handleClassDrag(e) {
      document.querySelectorAll("#timeLineDrag").forEach((el) => {
        new Sortable(el, {
          group: { name: "classLineDrag" },
          animation: 150,
          onEnd: (evt) => {
            this.handleClassSort(evt.oldIndex, evt.newIndex);
          },
        });
      });
    },
    // 拖拽后重新排序
    handleClassSort(oldIndex, newIndex) {
      if (oldIndex === newIndex) return;
      const stages = { ...this.classInfo.stages };
      const dragStage = stages[oldIndex];
      if (oldIndex < newIndex) {
        this.classInfo.stages.splice(oldIndex, 1);
        this.classInfo.stages.splice(newIndex, 0, dragStage);
      } else {
        this.classInfo.stages.splice(newIndex, 0, dragStage);
        this.classInfo.stages.splice(oldIndex + 1, 1);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
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

.basic-info {
  display: flex;
  gap: 20px;
  .basic-info-item {
    flex: 1;
    background-color: rgba(0, 0, 0, 0.04);
    padding: 10px 20px;
    align-content: space-around;

    .basic-info-title {
      display: flex;
      align-items: center;
      > span {
        flex: 1;
        white-space: nowrap;
      }
    }
    .basic-info-total {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-top: 20px;
      font-weight: 600;
    }
    .basic-info-modal {
      display: flex;
      flex-wrap: wrap;
      gap: 5%;
      row-gap: 10px;
      .modal-container {
        flex: 1 1 30%;
        text-align: center;
        font-size: 12px;
        line-height: 18px;
        cursor: pointer;
      }
      .modal-block {
        height: 42px;
        display: flex;
        align-items: end;
        border-radius: 6px;
        overflow: hidden;
        background-color: #fff;
        .modal-block-warmup {
          flex: 1;
          height: 21px;
          background-color: #bbc2d1;
        }
        .modal-block-recover {
          flex: 1;
          height: 30px;
          background-color: #bbc2d1;
        }
        .modal-block-cooling {
          flex: 1;
          height: 10px;
          background-color: #bbc2d1;
        }
      }
    }
  }
}

.time-line {
  margin: 10px 0;
  display: flex;
  gap: 2px;

  .time-stage {
    flex: 1;
    position: relative;
    height: auto;
    &:hover {
      background-color: #e8e8e8;
      .time-stage-close {
        display: block;
      }
    }

    .time-stage-close {
      position: absolute;
      right: 0;
      top: 0;
      padding: 3px;
      display: none;
      cursor: pointer;
    }
    .time-stage-title {
      font-size: 12px;
      line-height: 18px;
      text-align: center;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .time-stage-for {
      display: flex;
      gap: 2px;

      .time-stage-item {
        flex: 1;
        height: 30px;
        overflow: hidden;
      }
    }
  }
}

.class-edit {
  display: flex;
  gap: 20px;
  margin-top: 20px;

  .class-edit-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: scroll;
    overflow-x: hidden;
    max-height: 480px;
    padding-right: 8px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #c1c1c1 0%, #a8a8a8 100%);
      border-radius: 10px;
      border: 2px solid #f5f7fa;
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(180deg, #a8a8a8 0%, #909090 100%);
      }

      &:active {
        background: linear-gradient(180deg, #909090 0%, #787878 100%);
      }
    }

    /* Firefox 滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f5f7fa;

    .edit-section {
      .summary-input-container {
        .summary-textarea {
          .el-textarea__inner {
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;

            &:focus {
              border-color: #b8b8b8;
              box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.2);
            }
          }
        }
      }

      .phase-details {
        .phase-item {
          font-size: 12px;
          padding: 12px 8px;
          margin-bottom: 8px;
          background-color: #f8f9fa;
          border-radius: 6px;
          color: #333;
          transition: all 0.3s ease;

          &:hover {
            background-color: #e9ecef;
            transform: translateX(4px);
          }
          > div {
            margin-bottom: 8px;
          }

          > div:last-child {
            margin-bottom: 0;
          }
        }
      }

      .tags-container {
        .existing-tags {
          margin-bottom: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tag-item {
            background: #b8b8b8;
            border: none;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            line-height: 28px;
            transition: all 0.3s ease;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
            }
          }
        }

        .add-tag-input {
          .tag-input {
            .el-input__inner {
              border-radius: 20px;
              border: 1px solid #e4e7ed;
              transition: all 0.3s ease;

              &:focus {
                border-color: #ff6b9d;
                box-shadow: 0 0 0 2px rgba(255, 107, 157, 0.2);
              }
            }

            .el-input-group__append {
              background: linear-gradient(135deg, #ff6b9d, #c44569);
              border: none;
              color: white;
              border-radius: 0 20px 20px 0;
              padding: 0 16px;
              transition: all 0.3s ease;

              &:hover {
                background: linear-gradient(135deg, #e55a8a, #b03a5a);
              }
            }
          }
        }
      }
    }
  }

  .section-header {
    margin-bottom: 15px;

    .section-title {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 16px;
      color: #000000;
      line-height: 20px;

      &.required::after {
        content: "*";
        color: #f56c6c;
        margin-left: 4px;
      }
    }
  }

  .class-edit-right {
    flex: 3;
    border-radius: 8px;
    overflow-y: auto;
    max-height: 480px;
    padding-right: 8px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #c1c1c1 0%, #a8a8a8 100%);
      border-radius: 10px;
      border: 2px solid #f5f7fa;
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(180deg, #a8a8a8 0%, #909090 100%);
      }

      &:active {
        background: linear-gradient(180deg, #909090 0%, #787878 100%);
      }
    }

    /* Firefox 滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f5f7fa;

    .stage-form-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        flex: 1;
        white-space: nowrap;
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #333;

        &.required::after {
          content: "*";
          color: #f56c6c;
          margin-left: 4px;
        }
      }
    }

    .stages-container {
      display: flex;
      flex-direction: column;

      .stage-section {
        background-color: #fff;
        border: 2px solid #e4e7ed;
        padding: 5px;
        margin-bottom: 10px;
        box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.1);
        .times-input {
          width: 130px;
        }

        &.template {
          border-style: dashed;
          border-color: #c0c4cc;
          background-color: #fafafa;
        }

        .stage-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stage-config {
          border-bottom: 1px solid #e4e7ed;
          margin-bottom: 10px;
          &:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .config-row {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;

            .config-item {
              flex: 1;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: flex-start;
              text-align: center;

              .label {
                white-space: nowrap;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 500;
                color: #333;
                margin-bottom: 0;
                margin-right: 8px;

                &.required::after {
                  content: "*";
                  color: #f56c6c;
                  margin-left: 4px;
                }
              }

              .el-select,
              .el-input {
                width: 100%;
              }

              .unit {
                white-space: nowrap;
                margin: 0 8px;
                font-size: 12px;
                color: #909399;
                line-height: 32px;
              }

              &.repeat-count {
                .repeat-input {
                  .el-input__inner {
                    border-color: #f56c6c;
                    color: #f56c6c;
                  }
                }
              }

              .add-cadence-btn {
                background-color: #e6a23c;
                border-color: #e6a23c;
                color: white;

                &:hover {
                  background-color: #ebb563;
                  border-color: #ebb563;
                }

                i {
                  margin-right: 4px;
                }
              }
            }
          }

          .btn-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
          }
          .lap-toggle {
            display: flex;
            align-items: center;
            gap: 12px;

            .el-switch {
              .el-switch__core {
                border-color: #dcdfe6;
                background-color: #dcdfe6;

                &.is-checked {
                  border-color: #409eff;
                  background-color: #409eff;
                }
              }
            }

            .toggle-label {
              font-size: 14px;
              color: #606266;
            }
          }
        }
      }
    }
  }
}

.phase-item-content {
  background-color: #efefef;
  padding: 5px 10px;
}
</style>
