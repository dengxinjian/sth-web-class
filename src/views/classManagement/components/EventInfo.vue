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
          <span class="event-date">
            {{
              eventData.competitionDistance === "自定义"
                ? eventData.competitionDistanceValue +
                  " " +
                  eventData.competitionDistanceUnit
                : eventData?.competitionDistance
            }}</span
          >
          <span class="event-location">{{
            eventData?.competitionLocation
          }}</span>
        </div>
        <div class="header-actions">
          <i class="el-icon-delete delete-icon" @click="handleDelete"></i>
          <i class="el-icon-close close-icon" @click="handleClose"></i>
        </div>
      </div>

      <!-- 内容区域 -->
      <!-- 查看模式：显示比赛结果和运动记录 -->
      <div v-if="!isEditing" class="event-content">
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
                <tr v-if="eventData.competitionType === 2">
                  <td class="label-cell">游泳成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.swimmingResult
                        ? formatTimeDisplay(
                            competitionResult.swimmingResult,
                            false
                          )
                        : "-"
                    }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType === 2">
                  <td class="label-cell">T1成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.t1Result
                        ? formatTimeDisplay(competitionResult.t1Result, false)
                        : "-"
                    }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType === 2">
                  <td class="label-cell">骑行成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.cyclingResult
                        ? formatTimeDisplay(
                            competitionResult.cyclingResult,
                            false
                          )
                        : "-"
                    }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType === 2">
                  <td class="label-cell">T2成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.t2Result
                        ? formatTimeDisplay(competitionResult.t2Result, false)
                        : "-"
                    }}
                  </td>
                </tr>
                <tr v-if="eventData.competitionType === 2">
                  <td class="label-cell">跑步成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.runningResult
                        ? formatTimeDisplay(
                            competitionResult.runningResult,
                            false
                          )
                        : "-"
                    }}
                  </td>
                </tr>
                <tr class="highlight-row">
                  <td class="label-cell">总成绩</td>
                  <td class="value-cell">
                    {{
                      competitionResult.totalResult
                        ? formatTimeDisplay(
                            competitionResult.totalResult,
                            false
                          )
                        : "-"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
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
                :disabled="true"
              />
            </div>
          </div>
        </div>

        <!-- 右侧：运动记录 -->
        <div class="content-right">
          <div class="section-title" style="margin-bottom: 5px">运动记录</div>
          <div class="activity-list">
            <div
              v-if="activityList.swim.length > 0"
              style="margin-bottom: 10px"
            >
              游泳运动记录
            </div>
            <ActivityItem
              v-for="(activity, index) in activityList.swim"
              :key="`swim-${index}`"
              :activity="activity"
              @remove="handleRemoveActivity"
            />
            <div
              style="margin-bottom: 10px"
              v-if="
                activityList.otherT1.length > 0 ||
                activityList.otherT2.length > 0
              "
            >
              T1运动记录
            </div>
            <draggable
              :key="`draggable-otherT1-${eventData.id}`"
              :list="activityList.otherT1"
              :group="{
                name: 'other',
              }"
              :animation="150"
              :force-fallback="true"
              :fallback-on-body="true"
              :fallback-tolerance="10"
              :scroll="true"
              :scroll-sensitivity="80"
              :scroll-speed="20"
              :empty-insert-threshold="50"
              :swap-threshold="0.65"
              :invert-swap="false"
              :easing="'cubic-bezier(0.175, 0.885, 0.32, 1.275)'"
              :ghost-class="'is-activity-drag-ghost'"
              :chosen-class="'is-activity-drag-chosen'"
              :drag-class="'is-activity-drag-drag'"
              tag="div"
              :emptyInsertThreshold="10"
              @add="handleDragAdd"
              class="draggable-activities-container"
            >
              <ActivityItem
                v-for="(activity, index) in activityList.otherT1"
                :key="`otherT1-${index}`"
                :activity="activity"
                @remove="handleRemoveActivity"
              />
            </draggable>
            <div
              style="margin-bottom: 10px"
              v-if="activityList.cycle.length > 0"
            >
              骑行运动记录
            </div>
            <ActivityItem
              v-for="(activity, index) in activityList.cycle"
              :key="`cycle-${index}`"
              :activity="activity"
              @remove="handleRemoveActivity"
            />
            <div
              style="margin-bottom: 10px"
              v-if="
                activityList.otherT1.length > 0 ||
                activityList.otherT2.length > 0
              "
            >
              T2运动记录
            </div>
            <draggable
              :key="`draggable-otherT2-${eventData.id}`"
              :list="activityList.otherT2"
              :group="{
                name: 'other',
              }"
              :animation="150"
              :force-fallback="true"
              :fallback-on-body="true"
              :fallback-tolerance="10"
              :scroll="true"
              :scroll-sensitivity="80"
              :scroll-speed="20"
              :empty-insert-threshold="50"
              :swap-threshold="0.65"
              :invert-swap="false"
              :easing="'cubic-bezier(0.175, 0.885, 0.32, 1.275)'"
              :ghost-class="'is-activity-drag-ghost'"
              :chosen-class="'is-activity-drag-chosen'"
              :drag-class="'is-activity-drag-drag'"
              tag="div"
              :emptyInsertThreshold="10"
              @add="handleDragAdd"
              class="draggable-activities-container"
            >
              <ActivityItem
                v-for="(activity, index) in activityList.otherT2"
                :key="`otherT2-${index}`"
                :activity="activity"
                @remove="handleRemoveActivity"
              />
            </draggable>
            <div style="margin-bottom: 10px" v-if="activityList.run.length > 0">
              跑步运动记录
            </div>
            <ActivityItem
              v-for="(activity, index) in activityList.run"
              :key="`run-${index}`"
              :activity="activity"
              @remove="handleRemoveActivity"
            />
            <div
              style="margin-bottom: 10px"
              v-if="activityList.strength.length > 0"
            >
              力量运动记录
            </div>
            <ActivityItem
              v-for="(activity, index) in activityList.strength"
              :key="`strength-${index}`"
              :activity="activity"
              @remove="handleRemoveActivity"
            />
          </div>
        </div>
      </div>

      <!-- 编辑模式：显示编辑表单 -->
      <div v-else class="event-content-edit">
        <div class="edit-form-container">
          <div class="section-title">
            {{ checkIsEdit() ? "录入比赛成绩" : "编辑比赛成绩" }}
          </div>
          <el-form
            ref="editForm"
            :model="editForm"
            label-width="120px"
            class="edit-form"
          >
            <el-form-item label="全场排名">
              <el-input
                v-model="editForm.overallRank"
                placeholder="请输入全场排名"
                @input="handleRankInput('overallRank', $event)"
              />
            </el-form-item>
            <el-form-item label="分组排名">
              <el-input
                v-model="editForm.groupRank"
                placeholder="请输入分组排名"
                @input="handleRankInput('groupRank', $event)"
              />
            </el-form-item>
            <el-form-item label="性别排名">
              <el-input
                v-model="editForm.genderRank"
                placeholder="请输入性别排名"
                @input="handleRankInput('genderRank', $event)"
              />
            </el-form-item>
            <el-form-item
              v-if="eventData.competitionType === 2"
              label="游泳成绩"
            >
              <TimeInput
                ref="swimmingResultInput"
                v-model="editForm.swimmingResult"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item v-if="eventData.competitionType === 2" label="T1成绩">
              <TimeInput
                ref="t1ResultInput"
                v-model="editForm.t1Result"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item
              v-if="eventData.competitionType === 2"
              label="骑行成绩"
            >
              <TimeInput
                ref="cyclingResultInput"
                v-model="editForm.cyclingResult"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item v-if="eventData.competitionType === 2" label="T2成绩">
              <TimeInput
                ref="t2ResultInput"
                v-model="editForm.t2Result"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item
              v-if="eventData.competitionType === 2"
              label="跑步成绩"
            >
              <TimeInput
                ref="runningResultInput"
                v-model="editForm.runningResult"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item label="总成绩">
              <TimeInput
                :disabled="eventData.competitionType === 2"
                ref="totalResultInput"
                v-model="editForm.totalResult"
                timer-type="hh:mm:ss"
              />
            </el-form-item>
            <el-form-item label="总结/反馈">
              <el-input
                v-model="editForm.feedback"
                type="textarea"
                :rows="5"
                placeholder="请输入总结反馈"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div v-if="!isEditing" class="edit-button-container">
        <el-button type="primary" class="edit-button" @click="handleEditResult">
          {{ checkIsEdit() ? "录入成绩" : "编辑成绩" }}
        </el-button>
      </div>
      <div v-else class="edit-button-container">
        <el-button @click="handleCancelEdit">取消</el-button>
        <el-button type="primary" @click="handleSaveResult">保存</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { competitionApi } from "../services/classManagement.js";
import { getSportTypeName, parseClassesJson } from "../utils/helpers";
import draggable from "vuedraggable";
import ActivityItem from "./ActivityItem.vue";
import TimeInput from "@/views/classManagement/components/timeInpt";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils/index";
export default {
  name: "EventInfo",
  components: {
    draggable,
    ActivityItem,
    TimeInput,
  },
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
        strength: [],
      },
      isEditing: false, // 是否正在编辑
      editForm: {
        overallRank: "",
        groupRank: "",
        genderRank: "",
        swimmingResult: "",
        t1Result: "",
        cyclingResult: "",
        t2Result: "",
        runningResult: "",
        totalResult: "",
        feedback: "",
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
    // 监听成绩字段变化，自动计算总成绩（当 competitionType !== 3 时）
    "editForm.swimmingResult"() {
      if (this.eventData.competitionType !== 3) {
        this.calculateTotalResult();
      }
    },
    "editForm.t1Result"() {
      if (this.eventData.competitionType === 2) {
        this.calculateTotalResult();
      }
    },
    "editForm.cyclingResult"() {
      if (this.eventData.competitionType !== 3) {
        this.calculateTotalResult();
      }
    },
    "editForm.t2Result"() {
      if (this.eventData.competitionType === 2) {
        this.calculateTotalResult();
      }
    },
    "editForm.runningResult"() {
      if (this.eventData.competitionType !== 3) {
        this.calculateTotalResult();
      }
    },
  },
  methods: {
    /**
     * 处理排名输入，限制为正整数，最多7位
     */
    handleRankInput(field, value) {
      // 移除所有非数字字符
      let numericValue = value.replace(/\D/g, "");

      // 限制最大长度为7位
      if (numericValue.length > 7) {
        numericValue = numericValue.slice(0, 7);
      }

      // 移除前导零
      if (numericValue.length > 1 && numericValue[0] === "0") {
        numericValue = numericValue.replace(/^0+/, "");
      }

      // 如果输入为空或只有0，则清空
      if (numericValue === "" || numericValue === "0") {
        this.editForm[field] = "";
      } else {
        // 转换为正整数
        const intValue = parseInt(numericValue, 10);
        if (intValue > 0) {
          this.editForm[field] = String(intValue);
        } else {
          this.editForm[field] = "";
        }
      }
    },
    /**
     * 根据录入的成绩自动计算总成绩
     */
    calculateTotalResult() {
      if (this.eventData.competitionType === 3) {
        // 其他类型：不自动计算，保持手动输入
        return;
      }

      let totalSeconds = 0;

      if (this.eventData.competitionType === 1) {
        // 路跑：总成绩 = 跑步成绩
        totalSeconds = this.timeToSeconds(this.editForm.runningResult) || 0;
      } else if (this.eventData.competitionType === 4) {
        // 骑行：总成绩 = 骑行成绩
        totalSeconds = this.timeToSeconds(this.editForm.cyclingResult) || 0;
      } else if (this.eventData.competitionType === 5) {
        // 游泳：总成绩 = 游泳成绩
        totalSeconds = this.timeToSeconds(this.editForm.swimmingResult) || 0;
      } else if (this.eventData.competitionType === 2) {
        // 铁三：总成绩 = 游泳成绩 + T1成绩 + 骑行成绩 + T2成绩 + 跑步成绩
        const swimming = this.timeToSeconds(this.editForm.swimmingResult) || 0;
        const t1 = this.timeToSeconds(this.editForm.t1Result) || 0;
        const cycling = this.timeToSeconds(this.editForm.cyclingResult) || 0;
        const t2 = this.timeToSeconds(this.editForm.t2Result) || 0;
        const running = this.timeToSeconds(this.editForm.runningResult) || 0;
        totalSeconds = swimming + t1 + cycling + t2 + running;
      }

      // 将总秒数转换为时间格式并更新到表单
      if (totalSeconds > 0) {
        this.editForm.totalResult = this.secondsToTime(totalSeconds);
      } else {
        this.editForm.totalResult = "";
      }
    },
    /**
     * 将秒数转换为时间格式 (HH:MM:SS)
     */
    secondsToTime(seconds) {
      if (!seconds || seconds <= 0) return "";
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    },
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
      // 如果总成绩为空，说明是录入模式
      if (
        this.eventData.hasBind === true ||
        this.eventData.totalResult ||
        this.eventData.overallRank ||
        this.eventData.groupRank ||
        this.eventData.genderRank ||
        this.eventData.feedback
      ) {
        return false;
      } else {
        return true;
      }
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
        res.result.deviceActivityBindView.cycle.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        res.result.deviceActivityBindView.run.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        res.result.deviceActivityBindView.swim.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        res.result.deviceActivityBindView.otherT1.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        res.result.deviceActivityBindView.otherT2.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        res.result.deviceActivityBindView.strength.forEach((item) => {
          item.classesJson = parseClassesJson(item.classesJson);
        });
        this.competitionResult = res.result || {};
        console.log(this.competitionResult, "this.competitionResult");
        this.activityList = res.result.deviceActivityBindView || [];
        console.log(this.activityList, "this.activityList");
        this.summaryText = this.competitionResult.feedback || "";
      }
    },
    handleClose() {
      this.innerVisible = false;
      this.isEditing = false;
      // 重置编辑表单
      this.editForm = {
        overallRank: "",
        groupRank: "",
        genderRank: "",
        swimmingResult: "",
        t1Result: "",
        cyclingResult: "",
        t2Result: "",
        runningResult: "",
        totalResult: "",
        feedback: "",
      };
      this.$emit("close");
    },
    handleDelete() {
      // TODO: 实现删除功能
      this.$emit("delete", this.eventData);
      // this.handleClose();
      // this.$message.info("删除功能待实现");
    },
    handleEdit() {
      // TODO: 实现编辑功能
      this.$message.info("编辑功能待实现");
    },
    handleEditResult() {
      // 初始化编辑表单数据，将秒数转换为时间格式
      this.editForm = {
        overallRank: this.competitionResult?.overallRank || "",
        groupRank: this.competitionResult?.groupRank || "",
        genderRank: this.competitionResult?.genderRank || "",
        swimmingResult: this.competitionResult?.swimmingResult
          ? this.secondsToTimeFormat(
            this.competitionResult.swimmingResult,
            false
          )
          : "",
        t1Result: this.competitionResult?.t1Result
          ? this.secondsToTimeFormat(this.competitionResult.t1Result, false)
          : "",
        cyclingResult: this.competitionResult?.cyclingResult
          ? this.secondsToTimeFormat(
            this.competitionResult.cyclingResult,
            false
          )
          : "",
        t2Result: this.competitionResult?.t2Result
          ? this.secondsToTimeFormat(this.competitionResult.t2Result, false)
          : "",
        runningResult: this.competitionResult?.runningResult
          ? this.secondsToTimeFormat(
            this.competitionResult.runningResult,
            false
          )
          : "",
        totalResult: this.competitionResult?.totalResult
          ? this.secondsToTimeFormat(this.competitionResult.totalResult, false)
          : "",
        feedback: this.summaryText || "",
      };
      this.isEditing = true;
    },
    handleCancelEdit() {
      this.isEditing = false;
      // 重置表单
      this.editForm = {
        overallRank: "",
        groupRank: "",
        genderRank: "",
        swimmingResult: "",
        t1Result: "",
        cyclingResult: "",
        t2Result: "",
        runningResult: "",
        totalResult: "",
        feedback: "",
      };
    },
    // 将时间字符串转换为秒数（支持 mm:ss 和 hh:mm:ss 格式）
    timeToSeconds(timeString) {
      if (!timeString || typeof timeString !== "string") {
        return null;
      }
      const parts = timeString.split(":");
      if (parts.length === 2) {
        // mm:ss 格式
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      } else if (parts.length === 3) {
        // hh:mm:ss 格式
        return hhmmssToSeconds(timeString);
      }
      return null;
    },
    // 将秒数转换为 mm:ss 格式
    secondsToMMSS(seconds) {
      if (typeof seconds !== "number" || seconds < 0 || !isFinite(seconds)) {
        return "00:00";
      }
      const totalSeconds = Math.floor(seconds);
      const minutes = Math.floor(totalSeconds / 60);
      const remainingSeconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    },
    // 将秒数转换为时间格式（根据字段类型）
    secondsToTimeFormat(seconds, isMMSS = false) {
      if (typeof seconds !== "number" || seconds < 0 || !isFinite(seconds)) {
        return isMMSS ? "00:00" : "00:00:00";
      }
      if (isMMSS) {
        return this.secondsToMMSS(seconds);
      }
      return secondsToHHMMSS(seconds);
    },
    // 格式化时间显示（用于模板）
    formatTimeDisplay(seconds, isMMSS = false) {
      if (typeof seconds === "number") {
        return this.secondsToTimeFormat(seconds, isMMSS);
      }
      // 如果已经是字符串格式，直接返回
      if (typeof seconds === "string") {
        return seconds;
      }
      return "-";
    },
    async handleSaveResult() {
      try {
        // 准备保存数据，将时间字段转换为秒数
        const saveData = {
          id: this.eventData.id,
          overallRank: this.editForm.overallRank,
          groupRank: this.editForm.groupRank,
          genderRank: this.editForm.genderRank,
          feedback: this.editForm.feedback || "",
          totalResult: this.timeToSeconds(this.editForm.totalResult),
        };
        if (this.eventData.competitionType === 2) {
          saveData.swimmingResult = this.timeToSeconds(
            this.editForm.swimmingResult
          );
          saveData.t1Result = this.timeToSeconds(this.editForm.t1Result);
          saveData.cyclingResult = this.timeToSeconds(
            this.editForm.cyclingResult
          );
          saveData.t2Result = this.timeToSeconds(this.editForm.t2Result);
          saveData.runningResult = this.timeToSeconds(
            this.editForm.runningResult
          );
          saveData.totalResult = 0;
        }

        // 调用 API 保存成绩
        const res = await competitionApi.saveCompetitionResult(saveData);

        if (res.success) {
          this.$message.success("保存成功");
          this.isEditing = false;
          // 重新加载数据
          await this.loadEventDetail();
        } else {
          this.$message.error(res.message || "保存失败");
        }
      } catch (error) {
        console.error("保存失败:", error);
        this.$message.error("保存失败，请稍后重试");
      }
    },
    handleRemoveActivity(activity) {
      this.$confirm("确认移除该运动记录？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        console.log(activity, "activity");
        // this.activityList.splice(index, 1);
        // TODO: 调用 API 移除关联
        competitionApi
          .unbindActivity({
            activityId: activity.activityId,
            manualActivityId: activity.manualActivityId,
            competitionId: this.eventData.id,
          })
          .then((res) => {
            if (res.success) {
              this.$message.success("移除成功");
              this.loadEventDetail();
            }
          });
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
    handleDragAdd(e) {
      competitionApi
        .moveActivityPosition({
          competitionId: this.eventData.id,
          t1: this.activityList.otherT1,
          t2: this.activityList.otherT2,
        })
        .then((res) => {
          if (res.success) {
            this.$message.success("移动成功");
            this.loadEventDetail();
          } else {
            this.$message.error(res.message || "移动失败");
            this.loadEventDetail();
          }
        });
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
    height: 500px;
    // overflow-y: auto;
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
    // border: 1px solid #e8e8e8;
    border-radius: 4px;
    overflow: hidden;
    max-height: 480px;
    overflow-y: auto;

    .result-table {
      width: 100%;
      border-collapse: collapse;
      background: #fff;
      border: 1px solid #e8e8e8;

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
    // 总结反馈
    .summary-section {
      // margin-bottom: 20px;
      margin-top: 20px;

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
  }
}

// 右侧运动记录
.content-right {
  .activity-list {
    max-height: 480px;
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

::v-deep .is-activity-drag-ghost {
  opacity: 0.5;
  transform: scale(0.98);
}

::v-deep .is-activity-drag-chosen {
  opacity: 0.8;
}

::v-deep .is-activity-drag-drag {
  opacity: 0.8;
  transform: rotate(2deg);
}

::v-deep .is-activity-dragging {
  opacity: 0.6;
  cursor: grabbing !important;
}

::v-deep .draggable-activities-container {
  min-height: 10px;
  width: 100%;
  min-width: 0; // 防止 flex 子元素溢出
  position: relative;
  margin-bottom: 5px;
}

// 编辑模式样式
.event-content-edit {
  padding-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;

  .edit-form-container {
    max-height: 500px;
    overflow-y: auto;
  }

  .edit-form {
    padding: 20px 0;

    ::v-deep .el-form-item {
      margin-bottom: 20px;

      .el-form-item__label {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      .el-input__inner {
        border-color: #e8e8e8;
        border-radius: 4px;

        &:focus {
          border-color: #e42827;
        }
      }

      .el-textarea__inner {
        border-color: #e8e8e8;
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.6;

        &:focus {
          border-color: #e42827;
        }
      }
    }
  }
}

// 编辑按钮容器样式调整
.edit-button-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  width: 100%;

  .el-button {
    min-width: 100px;
  }
}
</style>
