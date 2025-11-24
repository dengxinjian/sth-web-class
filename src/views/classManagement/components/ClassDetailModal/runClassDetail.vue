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
    <span slot="title">编辑跑步课表</span>
    <div class="basic-info">
      <div class="basic-info-item">
        <div class="basic-info-title">
          <span>标题：</span>
          <el-input type="text" v-model="classInfo.title" />
        </div>
        <div class="basic-info-total">
          <span>
            <img src="~@/assets/addClass/icon-run.png" width="30" alt="" />
          </span>
          <span>{{
            classInfo.duration == "00:00:00" || !classInfo.duration
              ? "--:--:--"
              : classInfo.duration
          }}</span>
          <span
            >{{
              formatDistance(classInfo.distance, classInfo.sportType)
            }}km</span
          >
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
            class="pill-select short"
            @change="handleModeChange"
          >
            <el-option label="跟随阈值配速" :value="1" />
            <el-option label="跟随阈值心率" :value="2" />
            <el-option label="固定配速" :value="3" />
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
        <span class="time-stage-close" @click="handleDeleteStage(index)"
          ><i class="el-icon-close"></i
        ></span>
        <div class="time-stage-title">
          {{
            item.stageTimeline.length > 1 ? "跑步" : item.stageTimeline[0].title
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
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance
                        ? part.targetDistance + part.targetUnit
                        : 0 + part.targetUnit
                    }}
                    @ {{ secondsToMMSS(part.thresholdSpeedRangeNum[0]) }}~
                    {{ secondsToMMSS(part.thresholdSpeedRangeNum[1]) }}/km
                    {{ part.thresholdSpeedRangeNumZone[0] }}~{{
                      part.thresholdSpeedRangeNumZone[1]
                    }}
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
                    {{ part.thresholdHeartRateRangeNum[1] }}bpm
                    {{ part.thresholdHeartRateRangeNumZone[0] }}~{{
                      part.thresholdHeartRateRangeNumZone[1]
                    }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
                    >
                  </div>
                  <div v-if="classInfo.mode === 1 && part.range === 'target'">
                    {{
                      part.capacity === "time"
                        ? part.target
                        : part.targetDistance
                        ? part.targetDistance + part.targetUnit
                        : 0 + part.targetUnit
                    }}
                    @ {{ secondsToMMSS(part.thresholdSpeedNum) }}/km
                    {{ part.thresholdSpeedNumZone }}
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
                    @ {{ part.thresholdHeartRateNum }}bpm
                    {{ part.thresholdHeartRateNumZone }}
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
                    {{ part.targetSpeedRange[1] }}/km
                    {{ part.targetSpeedRangeNumZone[0] }}~{{
                      part.targetSpeedRangeNumZone[1]
                    }}
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
                    {{ part.targetHeartRateRange[1] }}bpm
                    {{ part.targetHeartRateRangeNumZone[0] }}~{{
                      part.targetHeartRateRangeNumZone[1]
                    }}
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
                    @ {{ part.targetSpeed }}/km
                    {{ part.targetSpeedNumZone }}
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
                    @ {{ part.targetHeartRate }}bpm
                    {{ part.targetHeartRateNumZone }}
                    <span v-if="part.hasCadence"
                      >步频{{ part.cadence[0] }}~{{ part.cadence[1] }}</span
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
                  />
                </div>
                <div class="config-item">
                  <span class="label required">段落模式选择</span>
                  <el-select
                    v-model="part.stageMode"
                    placeholder="请选择"
                    size="small"
                  >
                    <el-option label="热身" value="warmup" />
                    <el-option label="跑步" value="bike" />
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
                    @change="handleTargetChange(index, idx)"
                  >
                    <el-option label="运动时间" value="time" />
                    <el-option label="距离" value="distance" />
                  </el-select>
                </div>
                <div class="config-item">
                  <span class="label required">范围选择</span>
                  <el-select
                    v-model="part.range"
                    placeholder="请选择"
                    size="small"
                    @change="calculateTimeline()"
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
                  <!-- <el-time-picker v-if="part.capacity === 'time'" v-model="part.target" value-format="HH:mm:ss" placeholder="请选择" size="small" @change="handleTargetChange(index, idx)" style="max-width: 140px;">
                                </el-time-picker> -->
                  <TimeInput
                    v-if="part.capacity === 'time'"
                    v-model="part.target"
                    size="small"
                    @change="handleTargetChange(index, idx)"
                  />
                  <el-input-number
                    v-if="part.capacity === 'distance'"
                    :controls="false"
                    :step="part.targetUnit === 'km' ? 0.01 : 1"
                    :precision="part.targetUnit === 'km' ? 2 : 0"
                    :step-strictly="true"
                    v-model="part.targetDistance"
                    size="small"
                    @change="handleTargetChange(index, idx)"
                  />
                  <el-select
                    v-if="part.capacity === 'distance'"
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
                    v-model="part.thresholdSpeedRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >%阈值配速 &nbsp; &nbsp;
                    {{
                      calculateThresholdSpeedRangeNumZone(
                        part.thresholdSpeedRange
                      )[0]
                    }}~{{
                      calculateThresholdSpeedRangeNumZone(
                        part.thresholdSpeedRange
                      )[1]
                    }}</span
                  >
                  <!-- <span class="label"
                    >{{
                      secondsToMMSS(
                        calculateThresholdSpeedRangeNum(
                          part.thresholdSpeedRange
                        )[0]
                      )
                    }}~{{
                      secondsToMMSS(
                        calculateThresholdSpeedRangeNum(
                          part.thresholdSpeedRange
                        )[1]
                      )
                    }}/km</span> -->
                  <span class="label"
                    >{{
                      secondsToMMSS(
                        calculateThresholdSpeedRangeNum(
                          part.thresholdSpeedRange
                        )[0]
                      )
                    }}~{{
                      secondsToMMSS(
                        calculateThresholdSpeedRangeNum(
                          part.thresholdSpeedRange
                        )[1]
                      )
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
                    v-model="part.thresholdSpeed"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >%阈值配速 &nbsp; &nbsp;
                    {{
                      calculateThresholdSpeedNumZone(part.thresholdSpeed)
                    }}</span
                  >
                  <span class="label"
                    >{{
                      secondsToMMSS(
                        calculateThresholdSpeedNum(part.thresholdSpeed)
                      )
                    }}/km</span
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
                    v-model="part.thresholdHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >%阈值心率 &nbsp; &nbsp;
                    {{
                      calculateThresholdHeartRateRangeNumZone(
                        part.thresholdHeartRateRange
                      ).join(" ~ ")
                    }}</span
                  >
                  <span class="label"
                    >{{
                      calculateThresholdHeartRateRangeNum(
                        part.thresholdHeartRateRange
                      ).join(" ~ ")
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
                    v-model="part.thresholdHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >%阈值心率 &nbsp; &nbsp;
                    {{
                      calculateThresholdHeartRateNumZone(
                        part.thresholdHeartRate
                      )
                    }}</span
                  >
                  <span class="label"
                    >{{
                      calculateThresholdHeartRateNum(part.thresholdHeartRate)
                    }}bpm</span
                  >
                </div>
                <div
                  v-if="classInfo.mode === 3 && part.range === 'range'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <TimeInput
                    v-model="part.targetSpeedRange[0]"
                    timerType="mm:ss"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit">~</span>
                  <TimeInput
                    v-model="part.targetSpeedRange[1]"
                    timerType="mm:ss"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >min/km &nbsp; &nbsp;
                    {{
                      calculateTargetSpeedRangeNumZone(
                        part.targetSpeedRange
                      ).join(" ~ ")
                    }}</span
                  >
                </div>
                <div
                  v-else-if="classInfo.mode === 3 && part.range === 'target'"
                  class="config-item"
                >
                  <span class="label">运动值</span>
                  <TimeInput
                    v-model="part.targetSpeed"
                    timerType="mm:ss"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >min/km &nbsp; &nbsp;
                    {{ calculateTargetSpeedNumZone(part.targetSpeed) }}</span
                  >
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
                    v-model="part.targetHeartRateRange[1]"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >bpm &nbsp; &nbsp;
                    {{
                      calculateTargetHeartRateRangeNumZone(
                        part.targetHeartRateRange
                      ).join(" ~ ")
                    }}</span
                  >
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
                    v-model="part.targetHeartRate"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="handleTargetChange(index, idx)"
                  />
                  <span class="unit"
                    >bpm &nbsp; &nbsp;
                    {{
                      calculateTargetHeartRateNumZone(part.targetHeartRate)
                    }}</span
                  >
                </div>
                <div v-if="part.hasCadence" class="config-item">
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    v-model="part.cadence[0]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
                  />
                  <span class="unit">~</span>
                  <el-input-number
                    :controls="false"
                    :step="1"
                    :step-strictly="true"
                    v-model="part.cadence[1]"
                    placeholder="80"
                    size="small"
                    :style="{ width: '80px' }"
                    @change="calculateTimeline()"
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
                    size="mini"
                    circle
                    @click="handleAddSection(index)"
                  >
                    <i class="el-icon-plus"></i>增加段落
                  </el-button>
                  <el-button
                    class="action-btn-remove action-btn"
                    type="text"
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
                    class="add-cadence-btn"
                    @click="handleAddCadence(index, idx)"
                  >
                    <i class="el-icon-plus"></i>添加步频范围
                  </el-button>
                </div>
                <div class="lap-toggle">
                  <el-switch v-model="part.lap" />
                  <span class="toggle-label">按LAP进入下一段落</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <span slot="footer" class="dialog-footer">
      <!-- <el-button @click="onDelete" :disabled="!classInfo.id">删除</el-button> -->
      <el-button @click="onCancel">取消</el-button>
      <el-button type="warning" @click="onSave(false)">保存</el-button>
      <el-button type="danger" @click="onSave(true)">保存并关闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import Sortable from "sortablejs";
import ExerciseProcessChart from "@/components/ExerciseProcessChart";
import { getData, submitData } from "@/api/common.js";
import TimeInput from "@/views/classManagement/components/timeInpt";
import {
  getLunarDate,
  secondsToHHMMSS,
  secondsToMMSS,
  mmssToSeconds,
} from "@/utils/index";
import {
  debounce,
  CalculateRun,
  checkForm,
} from "@/views/classManagement/uilt";
import { athleteApi } from "../../services/classManagement";
export default {
  name: "AddRunClassDialog",
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
    triUserId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      timeline: [],
      maxIntensity: 1,
      existingTags: ["标签1", "标签2", "标签3"], // 现有的标签
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
      athleticThreshold: {},
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
      // 当弹框打开时
      if (val) {
        this.getTagList();
        if (this.data.id) {
          // 如果有ID，先获取数据，获取完成后再重置表单（保留获取到的数据）
          this.getClassInfo(this.data.id);
        } else {
          // 如果没有ID，说明是新增，重置表单
          this.resetForm();
        }
      }
    },
  },
  created() {
    this.handleTimesChange = debounce(this.handleTimesChange, 500);
  },
  methods: {
    formatDistance(distance, sportType) {
      let result = "";
      if (distance && typeof distance === "string" && distance.includes("km")) {
        result = distance.replace("km", "");
      }
      if (distance && Number(distance) > 0) {
        result = distance;
      }
      if (!result || result === "0") {
        result = "--";
      }
      return result;
    },
    async getAthleticThreshold() {
      if (!this.triUserId) {
        console.warn("triUserId is empty, skip getAthleticThreshold");
        return;
      }
      console.log(this.data, "this.data.classesDate");
      const res = await athleteApi.getUserProfile(
        this.triUserId,
        this.data.classesDate
      );
      if (res.result && res.result.thresholdRecordList) {
        res.result.thresholdRecordList.forEach((item) => {
          switch (item.thresholdType) {
            case 1:
              this.athleticThreshold.heartRate = item.threshold;
              break;
            case 2:
              this.athleticThreshold.cycle = item.threshold;
              break;
            case 3:
              this.athleticThreshold.run = item.threshold;
              break;
            case 4:
              this.athleticThreshold.swim = item.threshold;
              break;
          }
        });
        console.log(this.athleticThreshold, "this.athleticThreshold");
      }
    },
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
    secondsToMMSS,
    calculateThresholdSpeedRangeNum(thresholdSpeedRange, run) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdSpeedRangeNum(thresholdSpeedRange);
    },
    calculateThresholdSpeedRangeNumZone(thresholdSpeedRange) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdSpeedRangeNumZone(thresholdSpeedRange);
    },
    calculateThresholdSpeedNum(thresholdSpeed) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdSpeedNum(thresholdSpeed);
    },
    calculateThresholdSpeedNumZone(thresholdSpeed) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdSpeedNumZone(thresholdSpeed);
    },
    // 计算跟随阀值心率目标值的分组
    calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange);
    },
    calculateThresholdHeartRateRangeNum(thresholdHeartRateRange) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdHeartRateRangeNum(thresholdHeartRateRange);
    },
    calculateThresholdHeartRateNum(thresholdHeartRate) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdHeartRateNum(thresholdHeartRate);
    },
    calculateThresholdHeartRateNumZone(thresholdHeartRate) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateThresholdHeartRateNumZone(thresholdHeartRate);
    },
    // 计算固定配速运动值的分组
    calculateTargetSpeedRangeNumZone(targetSpeedRange) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateTargetSpeedRangeNumZone(targetSpeedRange);
    },
    calculateTargetSpeedNumZone(targetSpeed) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateTargetSpeedNumZone(targetSpeed);
    },
    // 计算固定心率分组
    calculateTargetHeartRateRangeNumZone(targetHeartRateRange) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateTargetHeartRateRangeNumZone(targetHeartRateRange);
    },
    calculateTargetHeartRateNumZone(targetHeartRate) {
      return new CalculateRun(
        this.athleticThreshold
      ).calculateTargetHeartRateNumZone(targetHeartRate);
    },
    updateClassInfoCalculatedValues() {
      // 更新所有阶段的阈值功率计算值
      console.log(this.classInfo, "this.classInfo");

      this.classInfo = new CalculateRun(
        this.athleticThreshold,
        this.classInfo
      ).updateClassInfoCalculatedValues();
    },
    // 获取标签列表
    getTagList() {
      getData({
        url: "/api/classesLabel/user/getLabelsByUserId",
      }).then((res) => {
        if (res.success) {
          this.existingTags = res.result;
        } else {
          this.existingTags = [];
        }
      });
    },
    // 编辑进入弹框时，查询课程数据
    getClassInfo(id) {
      getData({
        url: "/api/classSchedule/getClassScheduleById",
        id,
      }).then((res) => {
        if (res.success) {
          this.$nextTick(async () => {
            await this.getAthleticThreshold();
            this.classInfo = JSON.parse(res.result.classesJson);
            this.timeline = JSON.parse(res.result.classesJson).timeline;
            this.classInfo.id = res.result.id;
            this.maxIntensity = JSON.parse(res.result.classesJson).maxIntensity;
            console.log(this.classInfo, "this.classInfo");
            this.updateClassInfoCalculatedValues(); // 更新计算值
            this.handleClassDrag();
          });
        }
      });
    },
    // 新增课程
    submitNewClass(flag) {
      submitData({
        url: "/api/classes/create",
        classesTitle: this.classInfo.title,
        classesGroupId: this.classInfo.groupId,
        labels: this.classInfo.tags,
        sportType: "RUN",
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
      }).then((res) => {
        if (res.success) {
          this.classInfo.id = res.result;
          this.$emit("save", flag);
          this.$message.success("课程保存成功");
        }
        if (flag) this.onCancel();
      });
    },
    // 更新课表
    submitUpdateClass(flag) {
      submitData({
        url: "/api/classSchedule/updateClassSchedule",
        id: this.classInfo.id,
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
      }).then((res) => {
        if (res.success) {
          this.$emit("save", flag);
          this.$message.success("课表保存成功");
        }
        if (flag) this.onCancel();
      });
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
              this.$emit("save", true);
              this.$message.success("课程删除成功");
              this.onCancel();
            }
          });
        })
        .catch(() => {});
    },
    // 获取sth值
    getSth() {
      const validation = checkForm(this.classInfo);
      if (!validation.isValid) {
        this.$message.error(validation.message);
        return;
      }
      submitData({
        url: "/api/classSchedule/calculateTimeDistanceSth",
        classesTitle: this.classInfo.title,
        classesGroupId: this.classInfo.groupId,
        labels: this.classInfo.tags,
        sportType: "RUN",
        classesJson: JSON.stringify({
          ...this.classInfo,
          timeline: this.timeline,
          maxIntensity: this.maxIntensity,
        }),
        triUserId: this.triUserId,
      }).then((res) => {
        if (res.success) {
          this.classInfo.sth = res.result?.sth || "";
          this.classInfo.distance = res.result?.distance
            ? res.result.distance
            : "";
          this.classInfo.duration = this.translateTime(res.result?.time || "");
          console.log(this.classInfo.distance, "this.classInfo.distance");
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
      const validation = checkForm(this.classInfo);
      if (!validation.isValid) {
        this.$message.error(validation.message);
        return;
      }
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
    // 添加段落
    handleAddStage(type) {
      switch (type) {
        case "warmup":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "热身", stageMode: "warmup" },
            ],
          });
          break;
        case "recover":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "恢复", stageMode: "recover" },
            ],
          });
          break;
        case "cooling":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "冷身", stageMode: "cooling" },
            ],
          });
          break;
        case "stage1":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
            ],
          });
          break;
        case "stage2":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
            ],
          });
          break;
        case "stage3":
          this.classInfo.stages.push({
            times: 1,
            sections: [
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
              { ...this.sectionTemplate, title: "跑步", stageMode: "bike" },
            ],
          });
          break;
      }
      this.calculateTimeline();
    },
    handleAddSection(index) {
      this.classInfo.stages[index].sections.push({
        ...this.sectionTemplate,
        title: "跑步",
        stageMode: "bike",
      });
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
            this.translateSpeedToSeconds(targetSpeedRange[1])) /
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
    // 模式变更时重新计算时间
    handleModeChange() {
      if (this.classInfo.mode === 3) {
        this.classInfo.stages.forEach((stage, index) => {
          stage.sections.forEach((section, idx) => {
            this.handleTargetChange(index, idx);
          });
        });
      }
      this.calculateTimeline();
    },
    // 计算时间线
    calculateTimeline(times = 1) {
      const timesNum = Number(times);
      if (isNaN(timesNum) || timesNum < 1) {
        return;
      } else if (!Number.isInteger(timesNum)) {
        return;
      }
      this.updateClassInfoCalculatedValues(); // 更新计算值
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
        duration = 0;
        const stageTimeline = stage.sections.map((section) => {
          duration += section.targetSeconds;
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
          distance: stage.distance,
        };
      });
      this.handleClassDrag();
      console.log(this.timeline, "this.timeline");
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
            flex-wrap: wrap;
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
