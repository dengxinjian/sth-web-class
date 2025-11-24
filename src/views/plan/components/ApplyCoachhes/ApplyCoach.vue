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
      :label-width="loginType === '2' ? '145px' : '90px'"
      size="small"
    >
      <template v-if="loginType === '2'">
        <el-form-item label="团队选择" prop="teamId">
          <el-select
            v-model="form.teamId"
            placeholder="请选择团队"
            filterable
            clearable
            style="width: 90%"
            @change="getTeamGroupList(form.teamId)"
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
            v-model="form.athleteIds"
            :options="teamGroupList"
            :props="memberProps"
            clearable
            style="width: 90%"
            @change="handleCascaderChange"
          ></el-cascader>
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
            style="width: 90%"
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
            style="width: 90%"
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
          <el-col :span="6" align="right"
            ><span class="member-name">成员</span></el-col
          >
          <el-col :span="7" align="left"
            ><span class="member-name">方式</span></el-col
          >
          <el-col :span="9" align="left"
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
            <el-col :span="6" align="right">
              <span class="member-name">{{ item.userNickname }}</span>
            </el-col>
            <el-col :span="7" align="left">
              <el-select v-model="item.applyMode" placeholder="请选择">
                <el-option label="以开始日期" :value="1"></el-option>
                <el-option label="以结束日期" :value="2"></el-option>
              </el-select>
            </el-col>
            <el-col :span="9" align="left">
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
            style="width: 90%"
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
            style="width: 90%"
            :picker-options="pickerOptions"
          >
          </el-date-picker>
        </el-form-item>
      </template>
      <!-- <el-form-item label="">
        <a href="javascript:void(0)" @click="viewApplyHistory" style="color: #409EFF;">应用历史</a>
      </el-form-item> -->
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
      teamGroupList: [],
      athletesList: [],
      members: [],
      loading: false,
      memberProps: {
        multiple: true,
        emitPath: true,
        checkStrictly: false,
      },
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天以前的日期（包括今天）
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return time.getTime() <= today.getTime();
        },
      },
      originAthletesAll: [], // 所有运动员列表，用于提交时筛选
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
    teamGroupList(newList) {
      // 当 teamGroupList 更新时，验证 form.athleteIds 的值是否有效
      if (newList && Array.isArray(newList) && this.form.athleteIds && this.form.athleteIds.length > 0) {
        // 检查所有选中的值是否仍然存在于新的列表中
        const isValid = this.form.athleteIds.every((path) => {
          if (!Array.isArray(path) || path.length === 0) return false;
          const [groupId, userId] = path;
          const group = newList.find((item) => item && item.value === groupId);
          if (!group || !group.children) return false;
          return group.children.some((child) => child && child.value === userId);
        });
        if (!isValid) {
          // 如果值无效，清空选择
          this.$nextTick(() => {
            this.form.athleteIds = [];
            this.members = [];
          });
        }
      }
    },
  },
  methods: {
    viewApplyHistory() {
      this.$emit("viewApplyHistory", this.planInfo.id);
    },
    handleCascaderChange(value) {
      if (!value || !Array.isArray(value)) {
        this.members = [];
        return;
      }
      const choosedAthletes = value
        .map((path) => (Array.isArray(path) ? path[path.length - 1] : path))
        .filter((val) => val !== undefined && val !== null);
      const memberList = choosedAthletes
        .map((item) => {
          const findItem = this.originAthletesAll.find(
            (el) => el && el.triUserId === item
          );
          if (!findItem) return null;
          return {
            ...findItem,
            applyMode: undefined,
            applyDate: undefined,
          };
        })
        .filter((item) => item != null); // 过滤掉 null
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
    getTeamGroupList(teamId) {
      this.form.athleteIds = [];
      this.members = [];
      getData({
        url: `/api/team/group/list/${teamId}`,
        teamId: teamId,
      }).then((res) => {
        const treeData = (res.result || [])
          // .filter((item) => item != null) // 过滤掉 null 或 undefined
          .map((item) => {
            const members = item.members
              ? item.members
                  .filter((el) => el != null && el.userType === 3)
                  .filter((member) => member.userNickname && member.triUserId) // 确保必要字段存在
              : [];
            return {
              id: item.id,
              value: item.id,
              label: item.groupName || "",
              children: members.map((member) => ({
                ...member,
                label: member.userNickname || "",
                value: member.triUserId,
              })),
            };
          })
          // .filter((item) => item != null && item.value != null); // 确保节点有效
        this.teamGroupList = treeData;
        // 所有运动员列表，用于提交时筛选
        this.originAthletesAll = treeData.map((item) => item.children || []).flat();
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
    // 判断是否在结束日期之后
    diffAffterDate(dates, classes) {
      // 边界检查
      if (!dates || dates.length === 0 || !classes || classes.length === 0) {
        return false;
      }

      // 找出最大day值
      const maxDay = classes.reduce(
        (max, item) => Math.max(max, item.day || 0),
        classes[0]?.day || 0
      );

      // 计算结束日期：今天 + maxDay 天
      const endDate = moment().add(maxDay, "days");

      // 遍历dates中的每一项，判断是否在结束日期之后
      const dateResults = dates.map((date) => {
        const isAfter = moment(date.applyDate).isAfter(endDate);
        return {
          date: date,
          isAfter: isAfter,
        };
      });

      // 判断是否所有日期都在结束日期之后
      const isAfter = dateResults.every((item) => item.isAfter === false);

      // 获取所有在结束日期之后的日期
      const isAfterArr = dateResults
        .filter((item) => item.isAfter === false)
        .map((item) => item.date);
      // 返回结果
      return {
        isAfter: isAfter, // true: 存在应用日期超出计划日期，false: 所有应用日期都在计划日期之内
        isAfterArr: isAfterArr,
        endDate: endDate,
        maxDay: maxDay,
      };
    },
    // 告警提示
    alarmConfirm(message, targets) {
      const _this = this;
      this.$confirm(message, "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          _this.applyPlanClasses(targets);
        })
        .catch(() => {
          _this.loading = false;
        });
    },
    onConfirm() {
      const _this = this;
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        _this.loading = true;
        const choosedAthletes = _this.form.athleteIds
          .map((path) => (Array.isArray(path) ? path[path.length - 1] : path))
          .filter((val) => val !== undefined && val !== null);

        // 根据登录类型构建 targets 数组
        let targets = [];
        if (_this.loginType === "2") {
          targets =
            _this.form.athleteType === 1
              ? choosedAthletes.map((item) => ({
                  triUserId: item,
                  applyDate: _this.form.applyDate,
                  applyMode: _this.form.applyMode,
                }))
              : _this.members.map((item) => ({
                  triUserId: item.triUserId,
                  applyDate: item.applyDate,
                  applyMode: item.applyMode,
                }));
          const findEmptyDateOrApplyMode = targets.filter(
            (item) => !item.applyDate || !item.applyMode
          );
          if (findEmptyDateOrApplyMode.length > 0) {
            _this.$message.error("日期和方式不能为空，请选择日期和方式");
            _this.loading = false;
            return;
          }
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

        const planList = _this.planClasses
          .flat()
          .filter((item) => item.details.length > 0);
        const diffAffterDate = _this.diffAffterDate(findEndDate, planList);
        if (!diffAffterDate.isAfter) {
          _this.applyPlanClasses(targets);
          return;
        } else {
          if (_this.loginType === "1") {
            const message =
              "当前应用周期小于计划周期，只会应用部分，确认是否应用？";
            _this.alarmConfirm(message, targets);
          } else {
            // 查找所有在结束日期之前的日期对应的人员信息
            const findPersons = diffAffterDate.isAfterArr
              .map((item) =>
                _this.originAthletesAll.find(
                  (el) => el.triUserId === item.triUserId
                )
              )
              .filter((person) => person !== undefined);

            // 生成提示信息
            let message = "";
            if (findPersons.length === 1) {
              message = `${findPersons[0].userNickname} 的应用周期小于计划周期，只会应用部分，确认是否应用？`;
            } else if (findPersons.length > 1) {
              const names = findPersons
                .map((person) => person.userNickname)
                .join("、");
              message = `${names} 的应用周期小于计划周期，只会应用部分，确认是否应用？`;
            } else {
              message =
                "当前应用周期小于计划周期，只会应用部分，确认是否应用？";
            }

            _this.alarmConfirm(message, targets);
          }
        }
      });
    },
    applyPlanClasses(targets) {
      const _this = this;
      const params = {
        planClassesId: _this.planInfo.id,
        teamId: _this.form.teamId,
        targets,
      };
      submitData({
        url: "/api/planClasses/applyPlanClasses",
        requestData: params,
      })
        .then((res) => {
          if (res.success) {
            _this.$message.success("应用成功");
            this.form = {
              teamId: undefined,
              athleteIds: [],
              athleteType: 2,
            };
            this.members = [];
            _this.resetForm();
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
        (el) => !el.includes(item.triUserId)
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
