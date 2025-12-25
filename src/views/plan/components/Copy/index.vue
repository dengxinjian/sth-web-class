<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="540px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">复制</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="计划名称" prop="planTitle">
        <el-input
          v-model="form.planTitle"
          maxlength="20"
          show-word-limit
          placeholder="请输入计划名称"
          clearable
        />
      </el-form-item>

      <el-form-item label="分组名" prop="planGroupId">
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
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">保存</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";

export default {
  name: "SummaryPreview",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
    planInfo: { type: Object, default: () => ({}) },
    planClasses: { type: Array, default: () => [] },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        planTitle: this.defaultTitle,
        planGroupId: this.defaultGroupId,
      },
      rules: {
        planTitle: [
          { required: true, message: "请输入计划名称", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到20个字符", trigger: "blur" },
        ],
        planGroupId: [
          { required: true, message: "请选择分组", trigger: "change" },
        ],
      },
      groups: [],
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
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
        this.getGroupList();
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
    getGroupList() {
      getData({
        url: "/api/planClassesGroup/option",
      }).then((res) => {
        this.groups = res.result;
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        // this.$emit("save", { ...this.form });
        // this.innerVisible = false;
        console.log(this.planClasses, "this.planClasses");
        console.log(this.form, "this.form");
        console.log(this.planInfo, "this.planInfo");
        console.log("this.planClasses.flat()", this.planClasses.flat());
        const details = this.planClasses.flat().map((item) => {
          if (item.competitionDtoList.length > 0 || item.details.length > 0) {
            return {
              day: item.day,
              details: item.details.map(el => {
                return {
                  classesId: el.classesId,
                  classesJson: JSON.stringify(el.classesJson),
                  sportType: el.sportType,
                }
              }),
              competitionDtoList: item.competitionDtoList,
            };
          } else {
            return null;
          }
        }).filter(item => item !== null);
        console.log(details, "details");
        const params = {
          ...this.form,
          teamId: this.planInfo.teamId,
          email: this.planInfo.email,
          weChat: this.planInfo.weChat,
          description: this.planInfo.description,
          level: this.planInfo.level,
          dayDetails: details,
          sourcePlanId: this.planInfo.id,
          loginType: localStorage.getItem("loginType"),
        };
        console.log(params, "params");
        submitData({
          url: "/api/planClasses/copyPlanClasses",
          requestData: params,
        }).then((res) => {
          if (res.success) {
            this.$message.success("复制成功");
            this.innerVisible = false;
            this.$emit("save", res.result);
          }
        });
      });
    },
    resetForm() {
      this.form = {
        planTitle: this.defaultTitle,
        planGroupId: this.defaultGroupId,
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
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
</style>
