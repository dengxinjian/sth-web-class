<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="1200px"
    :before-close="handleClose"
    append-to-body
    class="add-swim-class-dialog"
    @open="handleOpen"
     :close-on-click-modal="false"
  >
    <span slot="title">跑步</span>
    <div class="basic-info">
      <div class="basic-info-item">
        <div class="basic-info-title">
          <span>标题：</span>
          <el-input type="text" v-model="classInfo.title" disabled />
        </div>
        <div class="basic-info-total">
          <span>
            <img src="~@/assets/addClass/icon-run.png" width="30" alt="" />
          </span>
          <span>{{ classInfo.duration }}</span>
          <span>{{ classInfo.distance }}</span>
          <span v-if="classInfo.sth">
            {{ classInfo.sth }}
            <img src="~@/assets/addClass/sth.png" width="28" alt="" />
          </span>
        </div>
      </div>
      <div class="basic-info-item">
        <div class="basic-info-modal">
          <div class="modal-container">
            <div class="modal-block">
              <div class="modal-block-warmup"></div>
            </div>
            <span>热身</span>
          </div>
          <div class="modal-container">
            <div class="modal-block">
              <div class="modal-block-recover"></div>
            </div>
            <span>恢复</span>
          </div>
          <div class="modal-container">
            <div class="modal-block">
              <div class="modal-block-cooling"></div>
            </div>
            <span>冷身</span>
          </div>
          <div class="modal-container">
            <div class="modal-block">
              <div class="modal-block-warmup"></div>
            </div>
            <span>1个段落</span>
          </div>
          <div class="modal-container">
            <div class="modal-block">
              <div class="modal-block-recover"></div>
              <div class="modal-block-warmup"></div>
            </div>
            <span>2个段落</span>
          </div>
          <div class="modal-container">
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
            class="pill-select short"
            disabled
          >
            <el-option label="跟随阈值配速" :value="1" />
            <el-option label="跟随阈值心率" :value="2" />
            <el-option label="固定配速" :value="3" />
            <el-option label="固定心率" :value="4" />
          </el-select>
        </div>
      </div>
    </div>

    <div class="time-line">
      <div
        v-for="(item, index) in timeline"
        :key="index"
        class="time-stage"
        :style="{ flex: item.duration, minWidth: 0 }"
      >
        <div class="time-stage-title">
          {{
            item.stageTimeline.length > 1 ? "跑步" : item.stageTimeline[0].title
          }}
        </div>
        <div class="time-stage-for">
          <div v-for="n in item.times" :key="n" class="time-stage-item">
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
              disabled
              class="summary-textarea"
            />
          </div>
        </div>

        <!-- 运动参数部分 -->
        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">同步参数</span>
          </div>
          <div class="sync-params">
            <span>时间：{{ sportDetail.startTime }}</span>
            <span>距离：{{ (sportDetail.distance/1000).toFixed(2) }} km</span>
          </div>
          <div class="sync-params">
            <span
              >平均配速：{{ convertSpeedToPace(sportDetail.avgSpeed) }}/km</span
            >
            <span>卡路里：{{ sportDetail.calories }} kcal</span>
          </div>
          <div class="sync-params">
            <span>爬升：{{ sportDetail.totalAscent }} m</span>
            <span>STH：{{ sportDetail.sthValue }}</span>
          </div>
          <div class="sync-params">
            <span>下降：{{ sportDetail.totalDescent }} m</span>
            <span></span>
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
              <td>min/km</td>
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

        <!-- 阶段明细部分 -->
        <div class="edit-section">
          <div class="section-header">
            <span class="section-title">阶段明细</span>
          </div>
          <div class="phase-details">
            <div class="phase-item">
              <div v-for="(item, index) in classInfo.stages" :key="index">
                <div v-for="(part, idx) in item.sections" :key="idx">
                  <div>{{ part.title }}</div>
                  <div v-if="classInfo.mode === 1 && part.range === 'range'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ secondsToMMSS(part.thresholdSpeedRangeNum[0]) }}~
                    {{ secondsToMMSS(part.thresholdSpeedRangeNum[1]) }}/km {{ part.thresholdSpeedRangeNumZone[0] }}~{{ part.thresholdSpeedRangeNumZone[1] }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 2 && part.range === 'range'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.thresholdHeartRateRangeNum[0] }}~
                    {{ part.thresholdHeartRateRangeNum[1] }}bpm {{ part.thresholdHeartRateRangeNumZone[0] }}~{{ part.thresholdHeartRateRangeNumZone[1] }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 1 && part.range === 'target'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ secondsToMMSS(part.thresholdSpeedNum) }}/km {{ part.thresholdSpeedNumZone }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 2 && part.range === 'target'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.thresholdHeartRateNum }}bpm {{ part.thresholdHeartRateNumZone }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 3 && part.range === 'range'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.targetSpeedRange[0] }}~
                    {{ part.targetSpeedRange[1] }}/km {{ part.targetSpeedRangeNumZone[0] }}~{{ part.targetSpeedRangeNumZone[1] }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 4 && part.range === 'range'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.targetHeartRateRange[0] }}~
                    {{ part.targetHeartRateRange[1] }}bpm {{ part.targetHeartRateRangeNumZone[0] }}~{{ part.targetHeartRateRangeNumZone[1] }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 3 && part.range === 'target'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.targetSpeed }}/km {{ part.targetSpeedNumZone }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 4 && part.range === 'target'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance + part.targetUnit
                    }}
                    @ {{ part.targetHeartRate }}bpm {{ part.targetHeartRateNumZone }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                </div>
                <div v-if="item.times > 1">重复{{ item.times }}次</div>
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
                disabled
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
              <el-input-number
                :controls="false"
                :step="1"
                :step-strictly="true"
                disabled
                v-model="item.times"
                size="small"
                @change="calculateTimeline"
              />
            </div>
            <div
              v-for="(part, idx) in item.sections"
              :key="idx + '' + index"
              class="stage-config"
            >
              <div class="config-row">
                <div class="config-item">
                  <span class="label">阶段名</span>
                  <el-input
                    v-model="part.title"
                    placeholder="请输入阶段名称"
                    size="small"
                    disabled
                    @change="calculateTimeline"
                  />
                </div>
                <div class="config-item">
                  <span class="label">段落模式选择</span>
                  <el-select
                    v-model="part.stageMode"
                    placeholder="请选择"
                    size="small"
                    disabled
                  >
                    <el-option label="热身" value="warmup" />
                    <el-option label="跑步" value="bike" />
                    <el-option label="恢复" value="recover" />
                    <el-option label="冷身" value="cooling" />
                  </el-select>
                </div>
                <div class="config-item">
                  <span class="label">容量选择</span>
                  <el-select
                    v-model="part.capacity"
                    placeholder="请选择"
                    size="small"
                    disabled
                    @change="handleTargetChange(index, idx)"
                  >
                    <el-option label="运动时间" value="time" />
                    <el-option label="距离" value="distance" />
                  </el-select>
                </div>
                <div class="config-item">
                  <span class="label">范围选择</span>
                  <el-select
                    v-model="part.range"
                    placeholder="请选择"
                    size="small"
                    disabled
                    @change="calculateTimeline"
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
                  <el-time-picker
                    v-if="part.capacity === 'time'"
                    disabled
                    v-model="part.target"
                    value-format="HH:mm:ss"
                    placeholder="请选择"
                    size="small"
                    @change="handleTargetChange(index, idx)"
                    style="max-width: 140px"
                  >
                  </el-time-picker>
                  <el-input-number
                    v-if="part.capacity === 'distance'"
                    disabled
                    :controls="false"
                    :step="part.unit === 'km' ? 1 : 0.1"
                    :step-strictly="true"
                    v-model="part.targetDistance"
                    size="small"
                    @change="handleTargetChange(index, idx)"
                  />
                  <el-select
                    v-if="part.capacity === 'distance'"
                    disabled
                    v-model="part.targetUnit"
                    placeholder="请选择"
                    size="small"
                    :style="{ width: '80px', marginLeft: '8px' }"
                    @change="handleTargetChange(index, idx)"
                  >
                    <el-option label="km" value="km" />
                    <el-option label="m" value="m" />
                  </el-select>
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
                    disabled
                    v-model="part.thresholdSpeedRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    disabled
                    v-model="part.thresholdSpeedRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">%阈值配速</span>
                  <span class="label"
                    >{{ secondsToMMSS(part.thresholdSpeedRangeNum[0]) }}~{{
                      secondsToMMSS(part.thresholdSpeedRangeNum[1])
                    }}/km</span
                  >
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
                    disabled
                    v-model="part.thresholdSpeed"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">%阈值配速</span>
                  <span class="label"
                    >{{ secondsToMMSS(part.thresholdSpeedNum) }}/km</span
                  >
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
                    disabled
                    v-model="part.thresholdHeartRateRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="0.1"
                    :step-strictly="true"
                    disabled
                    v-model="part.thresholdHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">%阈值心率</span>
                  <span class="label"
                    >{{ part.thresholdHeartRateRangeNum[0] }}~{{
                      part.thresholdHeartRateRangeNum[1]
                    }}bpm</span
                  >
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
                    disabled
                    v-model="part.thresholdHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">%阈值心率</span>
                  <span class="label"
                    >{{ part.thresholdHeartRateNum }}bpm</span
                  >
                </div>
                <div
                  v-if="classInfo.mode === 3 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-time-picker
                    value-format="mm:ss"
                    v-model="part.targetSpeedRange[0]"
                    disabled
                    format="mm:ss"
                    size="small"
                    popper-class="hide-hour"
                    :style="{ width: '100px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">~</span>
                  <el-time-picker
                    v-model="part.targetSpeedRange[1]"
                    value-format="mm:ss"
                    disabled
                    format="mm:ss"
                    size="small"
                    popper-class="hide-hour"
                    :style="{ width: '100px' }"
                    @change="handleTargetChange(index, idx)"
                  ></el-time-picker>
                  <span class="unit">min/km</span>
                </div>
                <div
                  v-else-if="classInfo.mode === 3 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-time-picker
                    v-model="part.targetSpeed"
                    value-format="mm:ss"
                    disabled
                    format="mm:ss"
                    size="small"
                    popper-class="hide-hour"
                    :style="{ width: '100px' }"
                    @change="handleTargetChange(index, idx)"
                  ></el-time-picker>
                  <span class="unit">min/km</span>
                </div>
                <div
                  v-if="classInfo.mode === 4 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    disabled
                    v-model="part.targetHeartRateRange[0]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    disabled
                    v-model="part.targetHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
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
                    :step="1"
                    :step-strictly="true"
                    disabled
                    v-model="part.targetHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">bpm</span>
                </div>
                <div v-if="part.hasCadence" class="config-item">
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    disabled
                    v-model="part.cadence[0]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    disabled
                    v-model="part.cadence[1]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline"
                  />
                  <span class="unit">spm</span>
                  <i
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
                    disabled
                    size="mini"
                    circle
                    @click="handleAddSection(index)"
                  >
                    <i class="el-icon-plus"></i>增加段落
                  </el-button>
                  <el-button
                    class="action-btn-remove action-btn"
                    type="text"
                    disabled
                    size="mini"
                    circle
                    @click="handleRemoveSection(index, idx)"
                  >
                    <i class="el-icon-close"></i>移除段落
                  </el-button>
                  <el-button
                    v-if="!part.hasCadence"
                    type="text"
                    size="mini"
                    disabled
                    class="add-cadence-btn"
                    @click="handleAddCadence(index, idx)"
                  >
                    <i class="el-icon-plus"></i>添加步频范围
                  </el-button>
                </div>
                <div class="lap-toggle">
                  <el-switch v-model="part.lap" disabled />
                  <span class="toggle-label">按LAP进入下一段落</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import Sortable from "sortablejs";
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import { getData, submitData } from "@/api/common.js";
import { secondsToMMSS } from "@/utils/index";

export default {
  name: "RunDetailDialog",
  components: {
    ExerciseProcessChart,
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
        sportType: "RUN",
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
        range: "target", // 范围
        target: "00:20:00", // 目标时间
        targetDistance: 10,
        targetUnit: "km",
        hasCadence: false,
        thresholdSpeed: 80,
        thresholdSpeedRange: [80, 85],
        thresholdHeartRate: 80,
        thresholdHeartRateRange: [80, 85],
        targetSpeed: "05:00",
        targetSpeedRange: ["03:30", "05:00"],
        targetHeartRate: 150,
        targetHeartRateRange: [110, 150],
        cadence: [160, 200],
        lap: false,
        targetSeconds: 20 * 60, // 计算出来的秒数
      },
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
    secondsToMMSS,
    handleOpen() {
      this.resetForm();
      if (this.data.id) {
        this.getClassInfo(this.data.id);
      }
      if (this.data.activityId) {
        this.getSportDetail(this.data.activityId);
      }
    },
    // 查询课表数据
    getClassInfo(id) {
      getData({
        url: "/api/classSchedule/getClassScheduleById",
        id,
      }).then((res) => {
        if (res.success) {
          this.classInfo = JSON.parse(res.result.classesJson);
          this.timeline = JSON.parse(res.result.classesJson).timeline;
          this.classInfo.id = res.result.id;
          JSON.parse(res.result.classesJson).maxIntensity;
        }
      });
    },
    // 查询运动详情
    getSportDetail(id) {
      getData({
        url: "/api/classSchedule/getActivityDetail",
        activityId: id,
      }).then((res) => {
        if (res.success) {
          this.sportDetail = res.result;
        }
      });
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onSave(closeAfter) {
      console.log(JSON.stringify(this.classInfo));
      if (this.classInfo.id) {
        this.submitUpdateClass(closeAfter);
      } else {
        this.submitNewClass(closeAfter);
      }
    },
    onDelete() {
      if (this.classInfo.id) {
        this.submitDeleteClass();
      } else {
        this.resetForm();
      }
      this.$emit("delete", this.form);
    },
    resetForm() {
      // 清空表单数据，但保留传入的title
      this.classInfo = {
        id: "",
        sportType: "RUN",
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
      this.timeline = [];
    },
    // 删除阶段
    handleDeleteStage(index) {
      this.classInfo.stages.splice(index, 1);
      this.calculateTimeline();
    },
    // 创建深拷贝的section模板
    createSectionTemplate(title, stageMode) {
      return {
        ...this.sectionTemplate,
        title,
        stageMode,
        tags: [...this.sectionTemplate.tags], // 深拷贝数组
        thresholdSpeedRange: [...this.sectionTemplate.thresholdSpeedRange], // 深拷贝数组
        thresholdHeartRateRange: [
          ...this.sectionTemplate.thresholdHeartRateRange,
        ], // 深拷贝数组
        targetSpeedRange: [...this.sectionTemplate.targetSpeedRange], // 深拷贝数组
        targetHeartRateRange: [...this.sectionTemplate.targetHeartRateRange], // 深拷贝数组
        cadence: [...this.sectionTemplate.cadence], // 深拷贝数组
      };
    },
    // 添加段落
    handleAddStage(type) {
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
            sections: [this.createSectionTemplate("跑步", "bike")],
          });
          break;
        case "stage2":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              this.createSectionTemplate("跑步", "bike"),
              this.createSectionTemplate("跑步", "bike"),
            ],
          });
          break;
        case "stage3":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              this.createSectionTemplate("跑步", "bike"),
              this.createSectionTemplate("跑步", "bike"),
              this.createSectionTemplate("跑步", "bike"),
            ],
          });
          break;
      }
      this.calculateTimeline();
    },
    handleAddSection(index) {
      this.classInfo.stages[index].sections.push(
        this.createSectionTemplate("跑步", "bike")
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
    translateTarget(target, targetDistance, capacity, mode, speed = 3000) {
      if (capacity === "time") {
        return target
          .split(":")
          .map((item) => parseInt(item))
          .reduce((prev, curr) => prev * 60 + curr);
      } else if (capacity === "distance" && mode === 3) {
        return targetDistance * speed;
      } else {
        return 600;
      }
    },
    // s转换成hh:mm:ss
    translateSecondsToFormat(seconds) {
      // 计算小时、分钟和剩余秒数
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      // 格式化各部分为两位数
      const pad = (num) => num.toString().padStart(2, "0");

      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    },
    // 速度转换成s
    translateSpeedToSeconds(speed) {
      return parseInt(speed.split(":")[0]) * 60 + parseInt(speed.split(":")[1]);
    },
    // 根据速度和距离换算成时间
    translateSpeedToTime(speed, distance, unit) {
      const seconds =
        parseInt(speed.split(":")[0]) * 60 + parseInt(speed.split(":")[1]);
      let time = 0;
      if (unit === "m") {
        time = Math.round((distance * seconds) / 1000);
      } else if (unit === "km") {
        time = Math.round(distance * seconds);
      }
      return {
        seconds: time,
        format: this.translateSecondsToFormat(time),
      };
    },
    // 根据时间和速度换算成距离
    translateSpeedToDistance(speed, time) {
      const seconds =
        parseInt(time.split(":")[0]) * 3600 +
        parseInt(time.split(":")[1]) * 60 +
        parseInt(time.split(":")[2]);
      return Math.round((seconds / speed) * 1000);
    },
    handleTargetChange(index, sectionIndex) {
      const {
        target,
        targetDistance,
        targetUnit,
        capacity,
        range,
        targetSpeedRange,
        targetSpeed,
      } = this.classInfo.stages[index].sections[sectionIndex];
      const kmDistance =
        targetUnit === "m"
          ? Math.round(targetDistance / 1000) || 1
          : targetDistance;
      let speed = 3000;
      if (range === "range") {
        speed =
          (this.translateSpeedToSeconds(targetSpeedRange[0]) +
            this.translateSpeedToSeconds(targetSpeedRange[0])) /
          2;
      } else {
        speed = this.translateSpeedToSeconds(targetSpeed);
      }
      this.classInfo.stages[index].sections[sectionIndex].targetSeconds =
        this.translateTarget(
          target,
          kmDistance,
          capacity,
          this.classInfo.mode,
          speed
        );
      this.calculateTimeline();
    },
    calculateIndent(section, mode) {
      switch (mode) {
        case 1:
          if (section.range === "range") {
            return (
              (section.thresholdSpeedRange[0] +
                section.thresholdSpeedRange[1]) /
              2
            );
          } else {
            return section.thresholdSpeed;
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
            return Math.round(
              100000 /
                ((this.translateSpeedToSeconds(section.targetSpeedRange[0]) +
                  this.translateSpeedToSeconds(section.targetSpeedRange[1])) /
                  2 -
                  120)
            );
          } else {
            return Math.round(
              100000 / (this.translateSpeedToSeconds(section.targetSpeed) - 120)
            );
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
    // 将速度（m/s）转换为配速（min/km）并格式化为mm:ss格式
    convertSpeedToPace(speedInMs) {
      if (!speedInMs || speedInMs <= 0) {
        return "--:--";
      }

      // 速度 m/s 转换为配速 min/km
      // 配速 = 1000 / (速度 * 60) 分钟
      const paceInMinutes = 1000 / (speedInMs * 60);

      // 分离分钟和秒数
      const minutes = Math.floor(paceInMinutes);
      const seconds = Math.round((paceInMinutes - minutes) * 60);

      // 格式化输出为 mm:ss
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");

      return `${formattedMinutes}:${formattedSeconds}`;
    },
    // 计算时间线
    calculateTimeline() {
      this.getSth();
      let duration = 0;
      let distance = 0;
      let timeFlag = false; // 判断是否可以显示时间，当存在阶段 模式≠3 且 容量=距离 时，不显示时间
      let distanceFlag = false; // 判断是否可以显示距离，当存在阶段 模式≠3 且 容量=时间 时，不显示距离
      this.maxIntensity = 0;
      this.timeline = this.classInfo.stages.map((stage) => {
        let totalTime = 0;
        let totalDistance = 0;
        stage.sections.forEach((section) => {
          totalTime += section.targetSeconds;
          // 下面的逻辑用来计算总距离，mode=3 capacity=time的情况下需要把距离计算出来，其他情况直接相加，用其他逻辑判断距离是否显示
          if (
            this.classInfo.mode === 3 &&
            section.capacity === "time" &&
            section.range === "target"
          ) {
            totalDistance += this.translateSpeedToDistance(
              this.translateSpeedToSeconds(section.targetSpeed),
              section.target
            );
          } else if (
            this.classInfo.mode === 3 &&
            section.capacity === "time" &&
            section.range === "range"
          ) {
            const speed =
              (this.translateSpeedToSeconds(section.targetSpeedRange[0]) +
                this.translateSpeedToSeconds(section.targetSpeedRange[1])) /
              2;
            totalDistance += this.translateSpeedToDistance(
              speed,
              section.target
            );
          } else {
            if (section.targetUnit === "km") {
              totalDistance += section.targetDistance * 1000;
            } else {
              totalDistance += section.targetDistance;
            }
          }
        });

        const stageTimeline = stage.sections.map((section) => {
          const intensity = this.calculateIndent(section, this.classInfo.mode);
          if (this.maxIntensity < intensity) {
            this.maxIntensity = intensity;
          }
          if (section.capacity === "distance" && this.classInfo.mode !== 3) {
            timeFlag = true;
          }
          if (section.capacity === "time" && this.classInfo.mode !== 3) {
            distanceFlag = true;
          }
          return {
            duration: section.targetSeconds,
            intensity,
            title: section.title,
          };
        });

        duration += totalTime * stage.times;
        distance += totalDistance * stage.times;
        return {
          duration: totalTime * stage.times,
          stageTimeline,
          times: stage.times,
        };
      });
      this.classInfo.duration = timeFlag
        ? "--:--:--"
        : this.translateTime(duration);
      this.classInfo.distance = distanceFlag
        ? "-"
        : Math.round(distance / 100) / 10;
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
        background-color: rgba(255, 251, 240, 1);
        .modal-block-warmup {
          flex: 1;
          height: 21px;
          background-color: rgba(222, 187, 146, 1);
        }
        .modal-block-recover {
          flex: 1;
          height: 30px;
          background-color: rgba(222, 187, 146, 1);
        }
        .modal-block-cooling {
          flex: 1;
          height: 10px;
          background-color: rgba(222, 187, 146, 1);
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
    max-height: 600px;

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
        border: 1px solid #e4e7ed;
        padding: 5px;
        margin-bottom: 10px;

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

.sync-params {
  font-size: 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  margin-bottom: 5px;
  > span {
    flex: 2;
  }
  span:last-child {
    flex: 1.2;
  }
}
.sync-params-table {
  font-size: 12px;
  line-height: 20px;
  width: 100%;
  border-collapse: collapse;
  td {
    flex: 1;
    text-align: center;
  }
  td:last-child {
    flex: 1;
  }
  td:first-child {
    flex: 1;
  }
  tr:first-child {
    background-color: #f5f5f5;
  }
}
</style>
