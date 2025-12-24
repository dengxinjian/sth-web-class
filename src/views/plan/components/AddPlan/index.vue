<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="520px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
    @close="onCancel"
  >
    <span slot="title">{{ copyOfficialPlanInfo ? '添加计划' : '新增计划' }}</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="计划标题" prop="planTitle">
        <el-input
          v-model="form.planTitle"
          maxlength="20"
          show-word-limit
          placeholder="请输入计划标题"
          clearable
        />
      </el-form-item>

      <el-form-item label="分组" prop="planGroupId">
        <el-select
          v-model="form.planGroupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.planClassesGroup"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="团队" prop="teamId" v-if="loginType === '2'">
        <el-select
          v-model="form.teamId"
          placeholder="请选择团队"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in teamOptions"
            :key="g.id"
            :label="g.teamName"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="计划源" prop="planSource" v-if="!copyOfficialPlanInfo">
        <el-input
          :readonly="true"
          placeholder="请输入计划源"
          v-model="form.planSource"
          disabled
        />
      </el-form-item>

      <el-form-item label="拥有者" v-if="!copyOfficialPlanInfo">
        <el-input
          :readonly="true"
          placeholder="请输入拥有者"
          v-model="form.possessNickname"
          disabled
        />
      </el-form-item>

      <el-form-item label="创建者" v-if="copyOfficialPlanInfo">
        <el-input
          :readonly="true"
          placeholder="请输入计划源"
          v-model="form.planSource"
          disabled
        />
      </el-form-item>

      <el-form-item label="所有者" v-if="copyOfficialPlanInfo">
        <el-input
          :readonly="true"
          placeholder="请输入拥有者"
          v-model="form.ownerName"
          disabled
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          placeholder="请输入邮箱"
          v-model="form.email"
          @blur="validateEmail"
        />
      </el-form-item>

      <el-form-item label="微信号" prop="weChat" v-if="!copyOfficialPlanInfo">
        <el-input placeholder="请输入微信号" v-model="form.weChat" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          :rows="6"
          type="textarea"
          placeholder="请输入描述"
          v-model="form.description"
          :maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="计划难度" prop="level" class="rate-form-item">
        <el-rate
          v-model="form.level"
          :allow-half="true"
          :colors="['#F92B30', '#F92B30', '#F92B30']"
          text-color="#999999"
          disabled-void-color="#E1E4EC"
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm" v-if="!copyOfficialPlanInfo">下一步</el-button>
      <el-button type="primary" @click="addPlan" v-else>确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import { planApi } from "../../services/planManagement";
export default {
  name: "AddPlan",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    currentGroupId: { type: [String, Number], default: undefined },
    activeClassType: { type: String, default: "my" },
    copyOfficialPlanInfo: { type: Object, default: null },
    planList: { type: Array, default: () => [] },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        planTitle: undefined,
        planGroupId: this.currentGroupId,
        teamId: undefined,
        planSource: localStorage.getItem("name")?.split("#")[0] || undefined,
        possessNickname:
          localStorage.getItem("name")?.split("#")[0] || undefined,
        ownerName: localStorage.getItem("name")?.split("#")[0] || undefined,
        email: undefined,
        weChat: undefined,
        description: undefined,
        level: undefined,
      },
      rules: {
        planTitle: [
          { required: true, message: "请输入计划标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到20个字符", trigger: "blur" },
        ],
        planGroupId: [
          { required: true, message: "请选择分组", trigger: "change" },
        ],
        teamId: [{ required: true, message: "请选择团队", trigger: "change" }],
        email: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                // 邮箱为可选，如果为空则不校验
                callback();
                return;
              }
              const emailRegex =
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              if (!emailRegex.test(value)) {
                callback(new Error("请输入正确的邮箱地址"));
              } else {
                callback();
              }
            },
            trigger: ["blur", "change"],
          },
        ],
      },
      groups: [],
      teams: [],
      emptyPlanClasses: [[], [], [], []],
      teamInfo: {},
      loginType: localStorage.getItem("loginType") || "",
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
    },
    teamOptions() {
      return Array.isArray(this.teams) ? this.teams : [];
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
        // 如果存在 currentGroupId，设置到表单中
        if (this.currentGroupId) {
          this.$nextTick(() => {
            this.form.planGroupId = this.currentGroupId;
          });
        }
        this.getGroupList();
        this.getTeamList();
        // this.getTeamDetail();
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
    currentGroupId(val) {
      // 如果对话框已打开且有值，则更新表单
      if (this.innerVisible && val) {
        this.form.planGroupId = val;
      }
    },
    copyOfficialPlanInfo(val) {
      if (val) {
        this.$nextTick(() => {
          this.form = {
            ...this.form,
            ...val,
            planTitle: val.planTitle,
            // planGroupId: this.currentGroupId,
            teamId: val.teamId,
            planSource: val.teamName ? `${val.teamName} - ${val.possessNickname}` : val.possessNickname,
            ownerName: val.ownerName,
            email: val.email,
            weChat: val.weChat,
            description: val.description,
            level: val.level,
          };
        });
        // 清除表单验证状态
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      }
    },
  },
  beforeDestroy() {
    this.resetForm();
  },
  methods: {
    onCopyPlan() {
      this.$emit("copyPlan", this.form);
    },
    getTeamDetail() {
      getData({
        url: "/api/team/my-team",
      }).then((res) => {
        this.teamInfo = res.result;
        if (this.teamInfo.teamName && this.teamInfo.teamOwnerNickname) {
          // 重置表单数据显示
          this.$nextTick(() => {
            this.form = {
              ...this.form,
              planSource: `${this.teamInfo.teamName} - ${this.teamInfo.teamOwnerNickname}`,
              planSourceId: this.teamInfo.teamOwnerId,
              possessNickname: this.teamInfo.teamOwnerNickname,
              // teamId: this.teamInfo.id,
            };
          });
          // 清除表单验证状态
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
          }
        }
      });
    },
    validateEmail() {
      // 手动触发表单校验
      this.$refs.formRef && this.$refs.formRef.validateField("email");
    },
    handleTeamChange(val) {
      if (this.copyOfficialPlanInfo) return;
      const findTeam = this.teams.find((item) => item.id === val);
      if (findTeam) {
        if (findTeam.teamName && findTeam.teamOwnerNickname) {
          this.$nextTick(() => {
            this.form = {
              ...this.form,
              planSource: `${findTeam.teamName} - ${findTeam.teamOwnerNickname}`,
              planSourceId: findTeam.teamOwnerId,
              possessNickname: findTeam.teamOwnerNickname,
            };
          });
        }
      }
    },
    getGroupList() {
      getData({
        url: "/api/planClassesGroup/option",
      }).then((res) => {
        this.groups = res.result;
        if (!this.currentGroupId) {
          this.$nextTick(() => {
            this.form = {
              ...this.form,
              planGroupId: this.groups[0].id,
            };
          });
          // 清除表单验证状态
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
          }
        }
      });
    },
    getTeamList() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = res.result;
        if (this.teams.length === 0) {
          this.getDefaultTeam();
        }
      });
    },
    getDefaultTeam() {
      const _this = this;
      getData({
        url: "/api/team/my-team",
      }).then((res) => {
        _this.teams = [
          {
            id: res.result.id,
            teamName: res.result.teamName
          }
        ];
      });
    },
    onCancel() {
      // 重置表单数据
      this.resetForm();
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        const params = {
          ...this.form,
          dayDetails: this.emptyPlanClasses,
        };
        // 将 params 保存到 planStore 中的 planData
        this.$store.dispatch("plan/savePlanData", params);
        // 跳转到 planEdit 页面
        this.$router.push({
          path: "/plan/add",
          query: {
            type: "add",
          },
        });
      });
    },
    resetForm() {
      const nameValue =
        localStorage.getItem("name")?.split("#")[0] || undefined;
      this.form = {
        planTitle: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.planTitle : undefined,
        planGroupId: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.planGroupId : undefined,
        teamId: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.teamId : undefined,
        planSource: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.teamName ? `${this.copyOfficialPlanInfo.teamName} - ${this.copyOfficialPlanInfo.possessNickname}` : this.copyOfficialPlanInfo.possessNickname : nameValue,
        possessNickname: nameValue,
        email: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.email : undefined,
        weChat: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.weChat : undefined,
        description: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.description : undefined,
        ownerName: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.ownerName : undefined,
        level: this.copyOfficialPlanInfo ? this.copyOfficialPlanInfo.level : undefined,
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    // 添加计划
    async addPlan() {
      const planData = this.planList.flat().map(item => {
        return {
          ...item,
          details: item.details.map(el => {
            return {
              ...el,
              classesJson: JSON.stringify(el.classesJson),
            }
          }),
        };
      }).filter(el => el.details.length > 0 || el.competitionDtoList.length > 0);
      const params = {
        planTitle: this.form.planTitle,
        planGroupId: this.form.planGroupId,
        teamId: this.form.teamId,
        email: this.form.email,
        weChat: this.form.weChat,
        description: this.form.description,
        officialPlanId: this.copyOfficialPlanInfo.id,
        level: this.form.level,
        dayDetails: planData,
      }
      const res = await planApi.createSelfPlanByOffice(params);
      if (res.success) {
        this.$message.success("添加成功");
        this.onCancel();
        this.$emit("addPlanSuccess", res.result);
      }
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
.rate-form-item ::v-deep(.el-rate__icon) {
  font-size: 20px;
  margin-top: 6px;
}
</style>
