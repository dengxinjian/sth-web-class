<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    :before-close="onCancel"
    class="add-group-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">移动</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
    >
      <el-form-item label="分组" prop="targetGroupId">
        <el-select
          v-model="form.targetGroupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.groupName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";

export default {
  name: "AddGroupDialog",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    // data: { id, classesGroupName }
    data: { type: Object, default: () => ({}) },
    planInfo: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        id: this.data?.id || "",
        targetGroupId: null,
      },
      rules: {
        targetGroupId: [
          { required: true, message: "请选择目标分组", trigger: "blur" },
        ],
      },
      groupList: [],
      shareRecordList: [],
    };
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
        this.resetForm();
        this.getGroupList(this.data?.teamId);
        this.getCurrentShareRecord()
      } else {
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
    data: {
      deep: true,
      handler() {
        // 当传入数据变化时，同步更新表单
        this.form = {
          id: this.data?.id || "",
          groupName: this.data?.groupName || "",
          teamId: this.data?.teamId || "",
          requestUserId: localStorage.getItem("triUserId") || "",
          shareDataType: 2,
          targetGroupId: null,
        };
      },
    },
  },
  methods: {
    getGroupList(teamId) {
      if (!teamId) return;
      getData({
        url: `/training/api/shareTeamGroup/list?teamId=${teamId}&shareDataType=2`,
      }).then((res) => {
        if (res.success && res.result) {
          console.log('====计划分组下的数据====',res.result)
          this.groupList = res.result;
        }
      });
    },
    getCurrentShareRecord() {
      console.log(this.planInfo, "this.planInfo====当前计划信息")
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        // 由父组件决定具体新增/编辑接口，此处只派发规范化数据
        submitData({
          url: "/training/api/teamShare/move",
          requestData: {
            id: this.planInfo?.id,
            targetGroupId: this.form.targetGroupId,
            requestUserId: localStorage.getItem("triUserId") || "",
          },
        }).then((res) => {
          if (res.success) {
            this.$message.success("移动成功");
            this.$emit("save", { ...this.form });
          }
        });
      });
    },
    resetForm() {
      this.form = {
        id: this.data?.id || "",
        groupName: this.data?.groupName || "",
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
.add-group-modal ::v-deep(.el-dialog__header) {
  padding: 16px 35px;
}
.add-group-modal ::v-deep(.el-dialog__body) {
  padding: 16px 24px 24px 24px;
}
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
