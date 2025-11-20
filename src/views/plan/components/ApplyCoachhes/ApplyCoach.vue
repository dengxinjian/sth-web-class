<template>
  <el-dialog
    :visible.sync="innerVisible"
    :width="loginType === '2' ? '680px' : '420px'"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">应用</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <template v-if="loginType === '2'">
        <el-form-item label="团队选择" prop="teamId">
          <el-select
            v-model="form.teamId"
            placeholder="请选择团队"
            filterable
            clearable
            style="width: 100%"
            @change="getMembersList(form.teamId)"
          >
            <el-option
              v-for="g in teamOptions"
              :key="g.id"
              :label="g.teamName"
              :value="g.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="人员选择" prop="athleteIds">
          <el-select
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
          </el-select>
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
          prop="applyMode"
        >
          <el-select
            v-model="form.applyMode"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="以开始日期" :value="1"></el-option>
            <el-option label="以结束日期" :value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.athleteType === 1"
          label="时间"
          prop="applyDate"
        >
          <el-date-picker
            v-model="form.applyDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item v-if="form.athleteType === 2" label="成员">
          <el-row :gutter="8">
            <el-col :span="6">方式</el-col>
            <el-col :span="8">时间</el-col>
          </el-row>
        </el-form-item> -->
        <!-- <el-form-item
        :label="item.userNickname"
        v-for="(item, index) in members"
        :key="index"
        :rules="[
          { required: true, message: '请选择方式', trigger: 'change' },
          { required: true, message: '请选择时间', trigger: 'change' },
        ]"
      > -->
        <el-row :gutter="24" class="member-row" v-if="form.athleteType === 2">
          <el-col :span="4" align="right"
            ><span class="member-name">成员</span></el-col
          >
          <el-col :span="8" align="left"
            ><span class="member-name">方式</span></el-col
          >
          <el-col :span="11" align="left"
            ><span class="member-name">时间</span></el-col
          >
          <el-col :span="1" align="left"
            ><span class="member-name"></span
          ></el-col>
        </el-row>
        <template v-if="form.athleteType === 2 && members.length > 0">
          <el-row
            :gutter="24"
            class="member-row"
            v-for="(item, index) in members"
            :key="index"
          >
            <el-col :span="4" align="right">
              <span class="member-name">{{ item.userNickname }}</span>
            </el-col>
            <el-col :span="8" align="left">
              <el-select v-model="item.applyMode" placeholder="请选择">
                <el-option label="以开始日期" :value="1"></el-option>
                <el-option label="以结束日期" :value="2"></el-option>
              </el-select>
            </el-col>
            <el-col :span="11" align="left">
              <el-date-picker
                v-model="item.applyDate"
                value-format="yyyy-MM-dd"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                :picker-options="pickerOptions"
              >
              </el-date-picker>
            </el-col>
            <el-col :span="1" align="left">
              <i
                class="el-icon-circle-close delete-icon"
                @click="removeMember(item, index)"
              ></i>
            </el-col>
          </el-row>
        </template>
      </template>
      <!-- </el-form-item> -->
      <template v-else>
        <el-form-item label="方式" prop="applyMode">
          <el-select
            v-model="form.applyMode"
            placeholder="请选择"
            style="width: 100%"
          >
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
            style="width: 100%"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
      </template>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="loading"
        >应用</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import moment from "moment";
export default {
  name: "ApplyCoach",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
    planInfo: { type: Object, default: () => {} },
    planClasses: { type: Array, default: () => [] },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        teamId: undefined,
        athleteIds: [],
        athleteType: 2,
        applyMode: undefined,
        applyDate: undefined,
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
      },
      teams: [],
      athletesList: [],
      members: [],
      loading: false,
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天以前的日期（不包括今天）
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        },
      },
    };
  },
  computed: {
    teamOptions() {
      return Array.isArray(this.teams) ? this.teams : [];
    },
    athletesOptions() {
      return Array.isArray(this.athletesList) ? this.athletesList : [];
    },
    loginType() {
      return localStorage.getItem("loginType");
    },
    triUserId() {
      return localStorage.getItem("triUserId");
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
      if (val) {
        // reset form when opening
        this.resetForm();
        this.getTeamList();
      } else {
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
  },
  methods: {
    handleAthleteChange(value) {
      const memberList = value.map((item) => {
        const findItem = this.athletesList.find((el) => el.triUserId === item);
        return {
          ...findItem,
          applyMode: undefined,
          applyDate: undefined,
        };
      });
      const newMembers =
        this.members.length > 0
          ? memberList.map((item) => {
              const findItem = this.members.find(
                (el) => el.triUserId === item.triUserId
              );
              return {
                ...item,
                ...findItem,
              };
            })
          : memberList;
      this.members = newMembers;
    },
    getTeamList() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = res.result;
      });
    },
    getMembersList(teamId) {
      getData({
        url: `/api/team/info/${teamId}`,
        teamId: teamId,
      }).then((res) => {
        this.athletesList = res.result.athletes || [];
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    diffEndDate(dates, classes) {
      // 边界检查
      if (!dates || dates.length === 0 || !classes || classes.length === 0) {
        return false;
      }

      // 找出最小日期
      const minDate = dates.reduce(
        (min, date) => (moment(date).isBefore(moment(min)) ? date : min),
        dates[0]
      );

      // 找出最大day值
      const maxDay = classes.reduce(
        (max, item) => Math.max(max, item.day || 0),
        classes[0]?.day || 0
      );

      // 计算结束日期：今天 + maxDay 天
      const endDate = moment().add(maxDay, "days");

      // 判断最小日期是否在结束日期之前
      return {
        isBefore: moment(minDate).isBefore(endDate),
        minDate: minDate,
        endDate: endDate,
      };
    },
    onConfirm() {
      const _this = this;
      this.loading = true;
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        // 根据登录类型构建 targets 数组
        let targets = [];
        if (_this.loginType === "2") {
          targets =
            _this.form.athleteType === 1
              ? _this.form.athleteIds.map((item) => ({
                  triUserId: item,
                  applyDate: _this.form.applyDate,
                  applyMode: _this.form.applyMode,
                }))
              : _this.members.map((item) => ({
                  triUserId: item.triUserId,
                  applyDate: item.applyDate,
                  applyMode: item.applyMode,
                }));
        } else {
          targets = [
            {
              triUserId: _this.triUserId,
              applyDate: _this.form.applyDate,
              applyMode: _this.form.applyMode,
            },
          ];
        }
        const findEndDate = targets.filter((item) => item.applyMode === 2);
        // console.log(findEndDate, "findEndDate");
        const planList = _this.planClasses
          .flat()
          .filter((item) => item.details.length > 0);
        // console.log(findEndDate, "findEndDate");
        // console.log("planList", planList);
        // console.log(targets, "targets");
        // console.log(_this.diffEndDate(findEndDate, planList), "diffEndDate");
        const diffEndDate = _this.diffEndDate(findEndDate, planList);
        // console.log(diffEndDate, "diffEndDate");
        if (!diffEndDate.isBefore) {
          _this.applyPlanClasses(targets);
          return;
        } else {
          if (_this.loginType === "1") {
            this.$confirm(
              "当前应用日期小于计划日期，只会部分应用，是否继续应用？",
              "提示",
              {
                confirmButtonText: "继续应用",
                cancelButtonText: "取消",
                type: "warning",
              }
            )
              .then(() => {
                _this.applyPlanClasses(targets);
              })
              .catch(() => {
                _this.loading = false;
              });
          } else {
            const findPerson = _this.athletesOptions.find(
              (item) => item.triUserId === diffEndDate.minDate.triUserId
            );
            console.log(findPerson, "findPerson");
            this.$confirm(
              `${findPerson.userNickname}的应用日期小于计划日期，只会部分应用，是否继续应用？`,
              "提示",
              {
                confirmButtonText: "继续应用",
                cancelButtonText: "取消",
                type: "warning",
              }
            )
              .then(() => {
                _this.applyPlanClasses(targets);
              })
              .catch(() => {
                _this.loading = false;
              });
          }
        }
      });
    },
    applyPlanClasses(targets) {
      const _this = this;
      const params = {
        planClassesId: _this.planInfo.id,
        teamId: _this.planInfo.teamId,
        targets,
      };
      submitData({
        url: "/api/planClasses/applyPlanClasses",
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            _this.$message.success("应用成功");
            _this.innerVisible = false;
            _this.$emit("cancel", true);
            _this.loading = false;
          }
        })
        .catch(() => {
          _this.loading = false;
        })
        .finally(() => {
          _this.loading = false;
        });
    },
    resetForm() {
      this.form = {
        teamId: undefined,
        athleteIds: [],
        athleteType: 2,
      };
      this.members = [];
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    removeMember(item, index) {
      this.form.athleteIds = this.form.athleteIds.filter(
        (el) => el !== item.triUserId
      );
      this.members.splice(index, 1);
    },
  },
};
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
  justify-content: center;
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
  font-size: 14px;
  font-weight: bold;
  vertical-align: middle;
  /* text-align: right; */
}
.member-row {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}
.member-row ::v-deep(.el-col) {
  display: flex;
  align-items: center;
}
</style>

<style>
/* 全局样式，用于 append-to-body 的 dialog */
.el-dialog__wrapper.add-class-title-modal .el-dialog,
.add-class-title-modal.el-dialog__wrapper .el-dialog {
  margin-top: 5vh !important;
}
</style>
