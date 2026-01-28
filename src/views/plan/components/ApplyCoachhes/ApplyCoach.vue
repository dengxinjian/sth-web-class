<template>
  <el-dialog
    :visible.sync="innerVisible"
    :width="loginType === '2' ? '880px' : '420px'"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false">
    <span slot="title">应用</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-width="loginType === '2' ? '145px' : '90px'"
      size="small">
      <template v-if="loginType === '2'">
        <el-form-item label="应用维度" prop="applyDimension">
          <el-radio-group v-model="form.applyDimension"
            @change="handleApplyDimensionChange">
            <el-radio label="1">团队</el-radio>
            <el-radio label="2">俱乐部</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="form.applyDimension === '2' ? '俱乐部选择' : '团队选择'"
          prop="teamId">
          <el-select
            v-model="form.teamId"
            :placeholder="form.applyDimension === '2' ? '请选择俱乐部' : '请选择团队'"
            filterable
            clearable
            style="width: 100%"
            @change="handleOrgChange">
            <el-option
              v-for="g in teamOptions"
              :key="g.id"
              :label="g.teamName || g.clubName || g.name"
              :value="g.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="人员选择" prop="athleteIds">
          <!-- <el-select
            v-model="form.athleteIds"
            placeholder="请选择人员"
            filterable
            clearable
            multiple
            style="width: 100%"
            @change="handleAthleteChange"
          >
            <el-option
              v-for="g in athletesOptions"
              :key="g.triUserId"
              :label="g.userNickname"
              :value="g.triUserId"
            />
          </el-select> -->
          <el-cascader
            :key="cascaderKey"
            v-model="form.athleteIds"
            :options="teamGroupList"
            :props="memberProps"
            clearable
            style="width: 100%"
            collapse-tags
            @change="handleCascaderChange"></el-cascader>
        </el-form-item>

        <el-form-item label="类型" prop="athleteType">
          <el-radio-group v-model="form.athleteType">
            <el-radio :label="1">批量设置</el-radio>
            <el-radio :label="2">单独设置</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.athleteType === 1"
          label="方式"
          prop="applyMode">
          <el-select
            v-model="form.applyMode"
            placeholder="请选择"
            style="width: 90%">
            <el-option label="以开始日期" :value="1"></el-option>
            <el-option label="以结束日期" :value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.athleteType === 1"
          label="时间"
          prop="applyDate">
          <el-date-picker
            v-model="form.applyDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            style="width: 90%"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划应用范围" v-if="form.athleteType === 1">
          <div class="apply-range-cell">
            <el-select
              v-model="form.applyRange"
              placeholder="请选择"
              size="small"
              style="width: 120px; flex-shrink: 0"
              @change="onFormApplyRangeChange">
              <el-option label="全部应用" :value="0"></el-option>
              <el-option label="部分应用" :value="1"></el-option>
            </el-select>
            <el-popover
              v-model="form.dayPickerVisibleForm"
              placement="bottom-start"
              trigger="click"
              popper-class="day-range-popper"
              :disabled="form.applyRange !== 1">
              <div class="day-range-popover">
                <div class="day-range-title">选择天数</div>
                <div class="day-range-row">
                  <span class="day-range-label">开始天数</span>
                  <el-select
                    v-model="form.applyStartDay"
                    placeholder="开始"
                    size="small"
                    style="width: 140px"
                    @change="onFormStartDayChange">
                    <el-option
                      v-for="d in planDayOptions"
                      :key="`form-start-${d}`"
                      :label="`第${d}天`"
                      :value="d" />
                  </el-select>
                </div>
                <div class="day-range-row">
                  <span class="day-range-label">结束天数</span>
                  <el-select
                    v-model="form.applyEndDay"
                    placeholder="结束"
                    size="small"
                    style="width: 140px">
                    <el-option
                      v-for="d in planDayOptions"
                      :key="`form-end-${d}`"
                      :label="`第${d}天`"
                      :value="d"
                      :disabled="form.applyStartDay && d <= form.applyStartDay" />
                  </el-select>
                </div>
              </div>
              <div
                slot="reference"
                class="day-range-input"
                :class="{ disabled: form.applyRange !== 1 }">
                <span class="day-range-input-text">
                  {{
                    form.applyRange === 1 &&
                    form.applyStartDay &&
                    form.applyEndDay
                      ? `第${form.applyStartDay}天~第${form.applyEndDay}天`
                      : "选择天数"
                  }}
                </span>
                <i class="el-icon-date"></i>
              </div>
            </el-popover>
          </div>
        </el-form-item>

        <el-form-item label="是否同步设备" v-if="form.athleteType === 1">
          <el-select
            v-model="form.syncFlag"
            placeholder="请选择"
            size="small"
            style="width: 120px">
            <el-option label="不同步" :value="0"></el-option>
            <el-option label="同步" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <div style="padding: 0 0 0 14px; box-sizing: border-box;"
          v-if="form.athleteType === 2">
          <el-row
            :gutter="8"
            class="member-row member-row-header">
            <el-col :span="3">
              <span class="member-name">成员</span>
            </el-col>
            <el-col :span="5">
              <span class="member-name">方式</span>
            </el-col>
            <el-col :span="4">
              <span class="member-name">时间</span>
            </el-col>
            <el-col :span="8">
              <span class="member-name">计划应用范围</span>
            </el-col>
            <el-col :span="3">
              <span class="member-name">是否同步设备</span>
            </el-col>
            <el-col :span="1">
              <span class="member-name"></span>
            </el-col>
          </el-row>
        </div>
        <div style="padding: 0 0 0 14px; box-sizing: border-box;"
          v-if="form.athleteType === 2 && members.length > 0">
          <el-row
            :gutter="8"
            class="member-row"
            v-for="(item, index) in members"
            :key="index">
            <el-col :span="3">
              <span class="member-name"><span
                  style="color: #F92B30;font-weight: bold;font-size: 14px;margin-right: 2px;">*</span>{{ item.userNickname }}</span>
            </el-col>
            <el-col :span="5" align="left">
              <el-select
                v-model="item.applyMode"
                placeholder="请选择"
                size="small"
                style="width: 100%">
                <el-option label="以开始日期" :value="1"></el-option>
                <el-option label="以结束日期" :value="2"></el-option>
              </el-select>
            </el-col>
            <el-col :span="4" align="left">
              <el-date-picker
                v-model="item.applyDate"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                :picker-options="pickerOptions"
                size="small">
              </el-date-picker>
            </el-col>
            <el-col :span="8" align="left">
              <div class="apply-range-cell">
                <el-select
                  v-model="item.applyRange"
                  placeholder="请选择"
                  size="small"
                  style="width: 100px; flex-shrink: 0"
                  @change="onMemberApplyRangeChange(item)">
                  <el-option label="全部应用" :value="0"></el-option>
                  <el-option label="部分应用" :value="1"></el-option>
                </el-select>
                <el-popover
                  v-model="item.dayPickerVisible"
                  placement="bottom-start"
                  trigger="click"
                  popper-class="day-range-popper"
                  :disabled="item.applyRange !== 1">
                  <div class="day-range-popover">
                    <div class="day-range-title">选择天数</div>
                    <div class="day-range-row">
                      <span class="day-range-label">开始天数</span>
                      <el-select
                        v-model="item.applyStartDay"
                        placeholder="开始"
                        size="small"
                        style="width: 140px"
                        @change="onMemberStartDayChange(item)">
                        <el-option
                          v-for="d in planDayOptions"
                          :key="`start-${d}`"
                          :label="`第${d}天`"
                          :value="d" />
                      </el-select>
                    </div>
                    <div class="day-range-row">
                      <span class="day-range-label">结束天数</span>
                      <el-select
                        v-model="item.applyEndDay"
                        placeholder="结束"
                        size="small"
                        style="width: 140px">
                        <el-option
                          v-for="d in planDayOptions"
                          :key="`end-${d}`"
                          :label="`第${d}天`"
                          :value="d"
                          :disabled="item.applyStartDay && d <= item.applyStartDay" />
                      </el-select>
                    </div>
                  </div>
                  <div
                    slot="reference"
                    class="day-range-input"
                    :class="{ disabled: item.applyRange !== 1 }">
                    <span class="day-range-input-text">
                      {{
                        item.applyRange === 1
                          ? `第${item.applyStartDay}天~第${item.applyEndDay}天`
                          : "选择天数"
                      }}
                    </span>
                    <i class="el-icon-date"></i>
                  </div>
                </el-popover>
              </div>
            </el-col>
            <el-col :span="3" align="left">
              <el-select
                v-model="item.syncFlag"
                placeholder="请选择"
                size="small"
                style="width: 100%">
                <el-option label="不同步" :value="0"></el-option>
                <el-option label="同步" :value="1"></el-option>
              </el-select>
            </el-col>
            <el-col :span="1" align="left">
              <img
                src="@/assets/plan/close.png"
                alt="删除"
                class="delete-icon-img"
                @click="removeMember(item, index)" />
              <!-- <i
                  class="el-icon-circle-close delete-icon"
                  @click="removeMember(item, index)"
                ></i> -->
            </el-col>
          </el-row>
        </div>
      </template>
      <template v-else>
        <el-form-item label="方式" prop="applyMode">
          <el-select
            v-model="form.applyMode"
            placeholder="请选择"
            style="width: 90%">
            <el-option label="以开始日期" :value="1"></el-option>
            <el-option label="以结束日期" :value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="时间" prop="applyDate">
          <el-date-picker
            v-model="form.applyDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            style="width: 90%"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="计划应用范围">
          <div class="apply-range-cell">
            <el-select
              v-model="form.applyRange"
              placeholder="请选择"
              size="small"
              style="width: 120px; flex-shrink: 0"
              @change="onFormApplyRangeChange">
              <el-option label="全部应用" :value="0"></el-option>
              <el-option label="部分应用" :value="1"></el-option>
            </el-select>
            <el-popover
              v-model="form.dayPickerVisibleForm"
              placement="bottom-start"
              trigger="click"
              popper-class="day-range-popper"
              :disabled="form.applyRange !== 1">
              <div class="day-range-popover">
                <div class="day-range-title">选择天数</div>
                <div class="day-range-row">
                  <span class="day-range-label">开始天数</span>
                  <el-select
                    v-model="form.applyStartDay"
                    placeholder="开始"
                    size="small"
                    style="width: 140px"
                    @change="onFormStartDayChange">
                    <el-option
                      v-for="d in planDayOptions"
                      :key="`form-start-${d}`"
                      :label="`第${d}天`"
                      :value="d" />
                  </el-select>
                </div>
                <div class="day-range-row">
                  <span class="day-range-label">结束天数</span>
                  <el-select
                    v-model="form.applyEndDay"
                    placeholder="结束"
                    size="small"
                    style="width: 140px">
                    <el-option
                      v-for="d in planDayOptions"
                      :key="`form-end-${d}`"
                      :label="`第${d}天`"
                      :value="d"
                      :disabled="form.applyStartDay && d <= form.applyStartDay" />
                  </el-select>
                </div>
              </div>
              <div
                slot="reference"
                class="day-range-input"
                :class="{ disabled: form.applyRange !== 1 }">
                <span class="day-range-input-text">
                  {{
                    form.applyRange === 1 &&
                    form.applyStartDay &&
                    form.applyEndDay
                      ? `第${form.applyStartDay}天~第${form.applyEndDay}天`
                      : "选择天数"
                  }}
                </span>
                <i class="el-icon-date"></i>
              </div>
            </el-popover>
          </div>
        </el-form-item>

        <el-form-item label="是否同步设备">
          <el-select
            v-model="form.syncFlag"
            placeholder="请选择"
            size="small"
            style="width: 120px">
            <el-option label="不同步" :value="0"></el-option>
            <el-option label="同步" :value="1"></el-option>
          </el-select>
        </el-form-item>
      </template>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm"
        :loading="loading">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js"
import moment from "moment"
export default {
  name: "ApplyCoach",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
    planInfo: { type: Object, default: () => { } },
    planClasses: { type: Array, default: () => [] },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        teamId: undefined,
        athleteIds: [],
        athleteType: 1,
        applyMode: 1,
        applyDate: moment().format("YYYY-MM-DD"),
        applyDimension: "1",
        // 批量设置时的计划应用范围 & 同步设备
        applyRange: 0,
        applyStartDay: 1,
        applyEndDay: null,
        syncFlag: 0,
        dayPickerVisibleForm: false,
      },
      rules: {
        title: [
          { required: true, message: "请输入课程标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到50个字符", trigger: "blur" },
        ],
        teamId: [{ required: true, message: "请选择团队", trigger: "change" }],
        athleteIds: [
          { required: true, message: "请选择人员", trigger: "change" },
        ],
        athleteType: [
          { required: true, message: "请选择类型", trigger: "change" },
        ],
        members: [
          { required: true, message: "请选择方式", trigger: "change" },
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        applyMode: [
          { required: true, message: "请选择方式", trigger: "change" },
        ],
        applyDate: [
          { required: true, message: "请选择时间", trigger: "change" },
        ],
        applyDimension: [
          { required: true, message: "请选择应用维度", trigger: "change" },
        ],
      },
      teams: [],
      teamGroupList: [],
      athletesList: [],
      members: [],
      loading: false,
      cascaderKey: 0, // 用于强制级联选择器重新渲染
      memberProps: {
        multiple: true,
        emitPath: true,
        checkStrictly: false,
      },
      // 俱乐部列表
      clubList: [],
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天以前的日期（不包括今天）
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return time.getTime() < today.getTime()
        },
      },
      originAthletesAll: [], // 所有运动员列表，用于提交时筛选
    }
  },
  computed: {
    teamOptions() {
      // 维度为“俱乐部”时，使用俱乐部列表作为选择项；否则使用团队列表
      if (this.form.applyDimension === "2") {
        return Array.isArray(this.clubList) ? this.clubList : []
      }
      return Array.isArray(this.teams) ? this.teams : []
    },
    athletesOptions() {
      return Array.isArray(this.athletesList) ? this.athletesList : []
    },
    loginType() {
      return localStorage.getItem("loginType")
    },
    triUserId() {
      return localStorage.getItem("triUserId")
    },
    planDayOptions() {
      // 取「最后一个有内容的 day」作为结束天：
      // competitionDtoList 非空 或 details 非空；取不到则默认 28
      const classes = Array.isArray(this.planClasses) ? this.planClasses : []
      const flat = classes.flat ? classes.flat() : [].concat(...classes)
      const valid = flat.filter((i) => i && typeof i.day === "number")
      const lastDay = valid.reduce((max, i) => {
        const hasCompetition =
          Array.isArray(i.competitionDtoList) && i.competitionDtoList.length > 0
        const hasDetails = Array.isArray(i.details) && i.details.length > 0
        return hasCompetition || hasDetails ? Math.max(max, i.day) : max
      }, 0)
      const finalMax = lastDay > 0 ? lastDay : 28
      return Array.from({ length: finalMax }, (_, idx) => idx + 1)
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val
    },
    innerVisible(val) {
      this.$emit("update:visible", val)
      this.$emit("input", val)
      if (val) {
        // reset form when opening
        this.resetForm()
        this.getDefaultTeam()
        this.getTeamList()
        this.getClubList()
        console.log("planClasses", this.planClasses)
      } else {
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        )
      }
    },
    // teamGroupList(newList) {
    //   // 当 teamGroupList 更新时，验证 form.athleteIds 的值是否有效
    //   if (
    //     newList &&
    //     Array.isArray(newList) &&
    //     this.form.athleteIds &&
    //     this.form.athleteIds.length > 0
    //   ) {
    //     // 检查所有选中的值是否仍然存在于新的列表中
    //     const isValid = this.form.athleteIds.every((path) => {
    //       if (!Array.isArray(path) || path.length === 0) return false;
    //       const [groupId, userId] = path;
    //       const group = newList.find((item) => item && item.value === groupId);
    //       if (!group || !group.children) return false;
    //       return group.children.some(
    //         (child) => child && child.value === userId
    //       );
    //     });
    //     if (!isValid) {
    //       // 如果值无效，清空选择
    //       this.$nextTick(() => {
    //         this.form.athleteIds = [];
    //         this.members = [];
    //       });
    //     }
    //   }
    // },
  },
  methods: {
    handleApplyDimensionChange(value) {
      // 清空所有相关数据
      this.form.teamId = undefined
      this.form.athleteIds = []
      this.members = []
      this.teamGroupList = []
      this.originAthletesAll = []
      // 强制级联选择器重新渲染，清空显示
      this.cascaderKey = Date.now()
    },
    handleOrgChange(id) {
      // 团队/俱乐部切换时，刷新人员列表
      if (!id) return
      if (this.form.applyDimension === "2") {
        this.getClubMemberList(id)
        return
      }
      this.getTeamGroupList(id)
    },
    viewApplyHistory() {
      this.$emit("viewApplyHistory", this.planInfo.id)
    },
    handleCascaderChange(value) {
      if (!value || !Array.isArray(value)) {
        this.members = []
        return
      }
      const choosedAthletes = value
        .map((path) => (Array.isArray(path) ? path[path.length - 1] : path))
        .filter((val) => val !== undefined && val !== null)
      const memberList = choosedAthletes
        .map((item) => {
          const findItem = this.originAthletesAll.find(
            (el) => el && el.triUserId === item
          )
          if (!findItem) return null
          return {
            ...findItem,
            applyMode: 1,
            // 今天的年月日
            applyDate: moment().format("YYYY-MM-DD"),
            // 计划应用范围：0=全部，1=部分
            applyRange: 0,
            // 部分应用：起始/结束天数
            applyStartDay: 1,
            applyEndDay: this.planDayOptions[this.planDayOptions.length - 1] || 28,
            // 天数选择弹出框
            dayPickerVisible: false,
            // 同步设备：0=不同步，1=同步
            syncFlag: 0,
          }
        })
        .filter((item) => item != null) // 过滤掉 null
      const newMembers =
        this.members.length > 0
          ? memberList.map((item) => {
            const findItem = this.members.find(
              (el) => el.triUserId === item.triUserId
            )
            return {
              ...item,
              ...findItem,
            }
          })
          : memberList
      this.members = newMembers
    },
    handleAthleteChange(value) {
      const memberList = value.map((item) => {
        const findItem = this.athletesList.find((el) => el.triUserId === item)
        return {
          ...findItem,
          applyMode: undefined,
          applyDate: undefined,
          applyRange: 0,
          applyStartDay: 1,
          applyEndDay: this.planDayOptions[this.planDayOptions.length - 1] || 28,
          dayPickerVisible: false,
          syncFlag: 0,
        }
      })
      const newMembers =
        this.members.length > 0
          ? memberList.map((item) => {
            const findItem = this.members.find(
              (el) => el.triUserId === item.triUserId
            )
            return {
              ...item,
              ...findItem,
            }
          })
          : memberList
      this.members = newMembers
    },
    onMemberApplyRangeChange(item) {
      if (!item) return
      if (item.applyRange !== 1) {
        item.applyStartDay = 1
        item.applyEndDay = this.planDayOptions[this.planDayOptions.length - 1] || 28
        item.dayPickerVisible = false
      }
    },
    onMemberStartDayChange(item) {
      if (!item) return
      // 保证开始天数 < 结束天数
      if (item.applyEndDay && item.applyStartDay && item.applyEndDay <= item.applyStartDay) {
        const maxDay = this.planDayOptions[this.planDayOptions.length - 1] || 28
        const nextDay = Math.min(item.applyStartDay + 1, maxDay)
        item.applyEndDay = nextDay
      }
    },
    onFormApplyRangeChange() {
      if (this.form.applyRange !== 1) {
        this.form.applyStartDay = 1
        this.form.applyEndDay =
          this.planDayOptions[this.planDayOptions.length - 1] || 28
        this.form.dayPickerVisibleForm = false
      }
    },
    onFormStartDayChange() {
      if (!this.form.applyStartDay) return
      const maxDay = this.planDayOptions[this.planDayOptions.length - 1] || 28
      if (
        this.form.applyEndDay &&
        this.form.applyEndDay <= this.form.applyStartDay
      ) {
        const nextDay = Math.min(this.form.applyStartDay + 1, maxDay)
        this.form.applyEndDay = nextDay
      }
    },
    getClubList() {
      getData({
        url: "/consumer/api/club/coach/getAllTeamsAndClubs",
      }).then((res) => {
        this.clubList = res.result.allCoachClubList || []
      })
    },
    getTeamList() {
      getData({
        url: "/consumer/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = [...this.teams, ...res.result].reduce((acc, team) => {
          if (team && team.id && !acc.find((t) => t.id === team.id)) {
            acc.push(team)
          }
          return acc
        }, [])
      })
    },
    getDefaultTeam() {
      const _this = this
      getData({
        url: "/gateway/team/my-team",
      }).then((res) => {
        _this.teams = [..._this.teams, res.result].reduce((acc, team) => {
          if (team && team.id && !acc.find((t) => t.id === team.id)) {
            acc.push(team)
          }
          return acc
        }, [])
      })
    },
    getTeamGroupList(teamId) {
      this.form.athleteIds = []
      this.members = []
      this.teamGroupList = []
      if (!teamId) return
      this.teamGroupList = []
      if (!teamId) return
      getData({
        url: `/consumer/api/team/group/list/${teamId}`,
        teamId: teamId,
      }).then((res) => {
        const treeData = (res.result || [])
          // .filter((item) => item != null) // 过滤掉 null 或 undefined
          .map((item) => {
            const members = item.members
              ? item.members
                .filter((el) => el != null && el.userType === 3)
                .filter((member) => member.userNickname && member.triUserId) // 确保必要字段存在
              : []
            return {
              id: item.id,
              value: item.id,
              label: item.groupName || "",
              children: members.map((member) => ({
                ...member,
                label: member.userNickname || "",
                value: member.triUserId,
              })),
            }
          })
        // .filter((item) => item != null && item.value != null); // 确保节点有效
        this.teamGroupList = treeData
        // 所有运动员列表，用于提交时筛选
        this.originAthletesAll = treeData
          .map((item) => item.children || [])
          .flat()
      })
    },

    // 俱乐部成员列表（按 groupName 分组，结构与 teamGroupList 一致）
    getClubMemberList(clubId) {
      this.form.athleteIds = []
      this.members = []
      this.teamGroupList = []
      this.originAthletesAll = []
      if (!clubId) return

      getData({
        // swagger 里一般是 /api/club/member/list/{clubId}，这里按你提供的 consumer 前缀走
        url: `/consumer/api/club/member/list/${clubId}`,
        clubId,
      }).then((res) => {
        const list = (res && res.success && Array.isArray(res.result))
          ? res.result
          : []

        // 只保留已通过成员（如果后端有其它状态，可在这里调整）
        const approvedMembers = list.filter((m) => m && m.userId && m.userNickname)

        // 按 groupId/groupName 分组（无分组归入“未分类”）
        const groupMap = new Map()
        approvedMembers.forEach((m) => {
          const groupId = m.groupId || "unGrouped"
          const groupName = m.groupName || "未分类"
          if (!groupMap.has(groupId)) {
            groupMap.set(groupId, { groupId, groupName, members: [] })
          }
          groupMap.get(groupId).members.push(m)
        })

        const treeData = Array.from(groupMap.values()).map((g) => ({
          id: g.groupId,
          value: g.groupId,
          label: g.groupName,
          children: g.members.map((member) => ({
            ...member,
            // 兼容现有逻辑：把 userId 当作 triUserId 使用
            triUserId: member.userId,
            label: member.userNickname || "",
            value: member.userId,
          })),
        }))

        this.teamGroupList = treeData
        this.originAthletesAll = treeData.map((item) => item.children || []).flat()
      })
    },
    getMembersList(teamId) {
      getData({
        url: `/consumer/api/team/info/${teamId}`,
        teamId: teamId,
      }).then((res) => {
        this.athletesList = res.result.athletes || []
      })
    },
    onCancel() {
      this.innerVisible = false
      this.form = {
        teamId: undefined,
        athleteIds: [],
        athleteType: 1,
        applyMode: 1,
        applyDate: moment().format("YYYY-MM-DD"),
        applyDimension: "1",
        applyRange: 0,
        applyStartDay: 1,
        applyEndDay: null,
        syncFlag: 0,
        dayPickerVisibleForm: false,
      }
      this.members = []
      this.resetForm()
      this.$emit("cancel")
    },
    // 判断是否在结束日期之后
    diffAffterDate(dates, classes) {
      // 边界检查
      if (!dates || dates.length === 0 || !classes || classes.length === 0) {
        return false
      }

      // 找出最大day值
      const maxDay = classes.reduce(
        (max, item) => Math.max(max, item.day || 0),
        classes[0]?.day || 0
      )

      // 计算结束日期：今天 + maxDay 天
      const endDate = moment().add(maxDay, "days")

      // 遍历dates中的每一项，判断是否在结束日期之后
      const dateResults = dates.map((date) => {
        const isAfter = moment(date.applyDate).isAfter(endDate)
        return {
          date: date,
          isAfter: isAfter,
        }
      })

      // 判断是否所有日期都在结束日期之后
      const isAfter = dateResults.every((item) => item.isAfter === false)

      // 获取所有在结束日期之后的日期
      const isAfterArr = dateResults
        .filter((item) => item.isAfter === false)
        .map((item) => item.date)
      // 返回结果
      return {
        isAfter: isAfter, // true: 存在应用日期超出计划日期，false: 所有应用日期都在计划日期之内
        isAfterArr: isAfterArr,
        endDate: endDate,
        maxDay: maxDay,
      }
    },
    // 告警提示
    alarmConfirm(message, targets) {
      const _this = this
      this.$confirm(message, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          _this.applyPlanClasses(targets)
        })
        .catch(() => {
          _this.loading = false
        })
    },
    onConfirm() {
      const _this = this
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        _this.loading = true
        const choosedAthletes = _this.form.athleteIds
          .map((path) => (Array.isArray(path) ? path[path.length - 1] : path))
          .filter((val) => val !== undefined && val !== null)

        // 根据登录类型构建 targets 数组
        let targets = []
        if (_this.loginType === "2") {
          if (_this.form.athleteType === 1) {
            targets = choosedAthletes.map((item) => ({
              triUserId: item,
              applyDate: _this.form.applyDate,
              applyMode: _this.form.applyMode,
              applyRange: _this.form.applyRange,
              applyDays:
                _this.form.applyRange === 1 &&
                _this.form.applyStartDay &&
                _this.form.applyEndDay
                  ? [_this.form.applyStartDay, _this.form.applyEndDay]
                  : [],
              syncFlag: _this.form.syncFlag,
            }))
          } else {
            targets = _this.members.map((item) => ({
              triUserId: item.triUserId,
              applyDate: item.applyDate,
              applyMode: item.applyMode,
              applyRange: item.applyRange,
              applyDays:
                item.applyRange === 1
                  ? [item.applyStartDay, item.applyEndDay]
                  : [],
              syncFlag: item.syncFlag,
            }))
          }
          const findEmptyDateOrApplyMode = targets.filter(
            (item) => !item.applyDate || !item.applyMode
          )
          if (findEmptyDateOrApplyMode.length > 0) {
            _this.$message.error("日期和方式不能为空，请选择日期和方式")
            _this.loading = false
            return
          }
          // 单独设置：部分应用必须选择天数
          const invalidApplyDays = targets.filter(
            (t) =>
              t.applyRange === 1 &&
              (!t.applyDays ||
                t.applyDays.length !== 2 ||
                !t.applyDays[0] ||
                !t.applyDays[1] ||
                t.applyDays[0] >= t.applyDays[1])
          )
          if (invalidApplyDays.length > 0) {
            _this.$message.error("部分应用时，开始天数必须小于结束天数")
            _this.loading = false
            return
          }
        } else {
          targets = [
            {
              triUserId: _this.triUserId,
              applyDate: _this.form.applyDate,
              applyMode: _this.form.applyMode,
            },
          ]
        }
        const findEndDate = targets.filter((item) => item.applyMode === 2)

        const planList = _this.planClasses
          .flat()
          .filter((item) => item.details.length > 0)
        const diffAffterDate = _this.diffAffterDate(findEndDate, planList)
        if (!diffAffterDate.isAfter) {
          _this.applyPlanClasses(targets)
          return
        } else {
          if (_this.loginType === "1") {
            const message =
              "当前应用周期小于计划周期，只会应用部分，确认是否应用？"
            _this.alarmConfirm(message, targets)
          } else {
            // 查找所有在结束日期之前的日期对应的人员信息
            const findPersons = diffAffterDate.isAfterArr
              .map((item) =>
                _this.originAthletesAll.find(
                  (el) => el.triUserId === item.triUserId
                )
              )
              .filter((person) => person !== undefined)

            // 生成提示信息
            let message = ""
            if (findPersons.length === 1) {
              message = `${findPersons[0].userNickname} 的应用周期小于计划周期，只会应用部分，确认是否应用？`
            } else if (findPersons.length > 1) {
              let names = ""
              if (findPersons.length > 10) {
                names =
                  findPersons
                    .slice(0, 10)
                    .map((person) => person.userNickname)
                    .join("、") + `...等${findPersons.length}位运动员`
              } else {
                names = findPersons
                  .map((person) => person.userNickname)
                  .join("、")
              }
              message = `${names} 的应用周期小于计划周期，只会应用部分，确认是否应用？`
            } else {
              message =
                "当前应用周期小于计划周期，只会应用部分，确认是否应用？"
            }

            _this.alarmConfirm(message, targets)
          }
        }
      })
    },
    applyPlanClasses(targets) {
      const _this = this
      const params = {
        planClassesId: _this.planInfo.id,
        teamId: _this.form.teamId,
        targets,
        applyDimension: _this.form.applyDimension,
      }
      submitData({
        url: "/gateway/training/planClasses/applyPlanClasses",
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            _this.$message.success(
              "事件创建成功，计划持续同步中，稍后请在应用历史查看"
            )
            this.form = {
              teamId: undefined,
              athleteIds: [],
              athleteType: 1,
            }
            this.members = []
            _this.resetForm()
            _this.innerVisible = false
            _this.$emit("cancel", true)
            _this.loading = false
          }
        })
        .catch(() => {
          _this.loading = false
        })
        .finally(() => {
          _this.loading = false
        })
    },
    resetForm() {
      this.form = {
        teamId: undefined,
        athleteIds: [],
        athleteType: 1,
        applyMode: 1,
        applyDate: moment().format("YYYY-MM-DD"),
        applyDimension: "1",
        applyRange: 0,
        applyStartDay: 1,
        applyEndDay: null,
        syncFlag: 0,
        dayPickerVisibleForm: false,
      }
      this.members = []
      this.teamGroupList = [] // 清空团队分组列表
      // 更新 key 强制级联选择器重新渲染
      this.cascaderKey += 1
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    removeMember(item, index) {
      this.form.athleteIds = this.form.athleteIds.filter(
        (el) => !el.includes(item.triUserId)
      )
      this.members.splice(index, 1)
    },
  },
}
</script>

<style scoped>
.add-class-title-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}

.add-class-title-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.statistics-divider-wrapper {
  margin: 8px 0;
}

.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}

.delete-icon {
  cursor: pointer;
  /* color: #909399; */
  color: #f56c6c;
  font-size: 20px;
  line-height: 32px;
}

.delete-icon:hover {
  color: #f56c6c;
}

.member-name {
  display: inline-block;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  vertical-align: middle;
  /* text-align: right; */
}

.member-row-header {
  height: 42px;
  line-height: 42px;
  font-size: 12px;
  color: #666;
  border-bottom: 1px solid #00000026;
}

.apply-range-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow: hidden;
}

.apply-range-cell ::v-deep(.el-select) {
  min-width: 0;
}

.day-range-sep {
  color: #999;
  flex-shrink: 0;
}

.day-range-input {
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 140px;
  max-width: 180px;
  background: #fff;
  cursor: pointer;
}

.day-range-input.disabled {
  background: #f5f7fa;
  cursor: not-allowed;
  color: #c0c4cc;
}

.day-range-input-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-range-popper {
  padding: 12px;
}

.day-range-popover {
  width: 240px;
}

.day-range-title {
  font-weight: 600;
  margin-bottom: 10px;
  color: #101010;
}

.day-range-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.day-range-label {
  color: #666;
  font-size: 12px;
  flex-shrink: 0;
}

.member-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.member-row-wrapper {
  width: 100%;
  max-height: 360px;
  overflow-y: auto;
}

.member-list-wrapper {
  max-height: 400px;
  overflow-y: auto;
}

/* .member-list-wrapper::-webkit-scrollbar {
  width: 4px;
}
.member-list-wrapper::-webkit-scrollbar-button {
  display: block;
  height: 4px;
  width: 4px;
}
.member-list-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
.member-list-wrapper::-webkit-scrollbar-track {
  background-color: transparent;
} */
.member-row ::v-deep(.el-col) {
  display: flex;
  align-items: center;
}

.delete-icon-img {
  width: 24px;
  height: 24px;
  cursor: pointer;
}
</style>
