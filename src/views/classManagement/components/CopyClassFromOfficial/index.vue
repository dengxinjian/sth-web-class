<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    :before-close="onCancel"
    class="move-group-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">添加课程</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      size="small"
    >
      <el-form-item
        label="课程标题"
        prop="title"
        v-if="activeClassType === 'my'"
      >
        <el-input
          v-model="form.title"
          maxlength="50"
          show-word-limit
          placeholder="请输入课程标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="分组" prop="destinationId">
        <el-select
          v-model="form.destinationId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groups"
            :key="g.value"
            :label="g.label"
            :value="g.value"
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
  name: "MoveGroupDialog",
  props: {
    // v-model 控制弹框显示
    value: { type: Boolean, default: undefined },
    visible: { type: Boolean, default: false },
    // 当前官方课程ID
    classId: { type: [String, Number], default: "" },
    activeClassType: { type: String, default: "my" },
    groupId: { type: [String, Number], default: "" },
    data: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: { destinationId: "", title: "" },
      rules: {
        destinationId: [
          { required: true, message: "请选择目标分组", trigger: "change" },
        ],
        title: [{ required: true, message: "请输入课程标题", trigger: "blur" }],
      },
      groups: [],
    };
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val;
    },
    groupId(val) {
      this.form.destinationId = val;
    },
    innerVisible(val) {
      if (!val) {
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      } else {
        this.getGroupList();
      }
    },
  },
  methods: {
    getGroupList() {
      getData({
        url: "/api/classesGroup/user/getClassesGroupsByUserId",
      }).then((res) => {
        const groups = [];
        res.result.forEach((item) => {
          groups.push({
            label: item.classesGroupName,
            value: item.id,
          });
        });
        this.groups = groups;
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("save");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        this.submitClassAdd();
      });
    },
    submitClassAdd() {
      if (!this.classId) return;
      if (this.activeClassType !== "my") {
        submitData({
          url: `/api/classes/createOfficial`,
          classesGroupId: this.form.destinationId,
          id: this.classId,
        }).then((res) => {
          if (res.success) {
            this.$message.success("课程添加成功");
            this.innerVisible = false;
            this.$emit("save", { ...this.form });
          }
        });
      } else {
        const classesJson = JSON.parse(
          JSON.stringify(this.data.classesJson)
        );
        classesJson.title = this.form.title + " 复制课程";
        submitData({
          url: "/api/classes/create",
          classesGroupId: this.form.destinationId,
          labels: this.data.tags,
          sportType: this.data.sportType,
          classesJson: JSON.stringify(classesJson),
          classesTitle: this.form.title + " 复制课程",
        }).then((res) => {
          if (res.success) {
            this.$message.success("课程添加成功");
            this.innerVisible = false;
            this.$emit("save", { ...this.form });
          }
        });
      }
    },
  },
};
</script>

<style scoped>
.move-group-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.move-group-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
</style>
