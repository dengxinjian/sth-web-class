<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="680px"
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
      <el-form-item label="团队选择" prop="teamId">
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

      <el-form-item label="人员选择" prop="personId">
        <el-select
          v-model="form.personId"
          placeholder="请选择人员"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.classesGroupName"
            :value="g.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type">
          <el-radio :label="1">批量设置</el-radio>
          <el-radio :label="2">单独设置</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="成员">
        <el-row :gutter="8">
          <el-col :span="5">方式</el-col>
          <el-col :span="8">时间</el-col>
        </el-row>
      </el-form-item>
      <el-form-item
        :label="item.name"
        v-for="(item, index) in members"
        :key="index"
        :rules="[
          { required: true, message: '请选择方式', trigger: 'change' },
          { required: true, message: '请选择时间', trigger: 'change' },
        ]"
      >
        <el-row :gutter="8" style="width: 100%;">
          <el-col :span="5">
            <el-select v-model="item.type" placeholder="请选择">
              <el-option label="以开始日期" :value="1"></el-option>
              <el-option label="以结束日期" :value="2"></el-option>
            </el-select>
          </el-col>
          <el-col :span="11">
            <el-date-picker v-model="item.time" type="date" placeholder="选择日期">
            </el-date-picker>
          </el-col>
          <el-col :span="4">
            <i class="el-icon-delete" @click="removeMember(index)"></i>
          </el-col>
        </el-row>
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
  name: "ApplyCoach",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        title: this.defaultTitle,
        teamId: undefined,
        personId: undefined,
        type: 1,
        members: [
          {
            name: "成员1",
            type: 1,
            time: "2025-01-01",
          },
        ],
      },
      rules: {
        title: [
          { required: true, message: "请输入课程标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到50个字符", trigger: "blur" },
        ],
        teamId: [
          { required: true, message: "请选择团队", trigger: "change" },
        ],
        personId: [
          { required: true, message: "请选择人员", trigger: "change" },
        ],
        type: [
          { required: true, message: "请选择类型", trigger: "change" },
        ],
        members: [
          { required: true, message: "请选择方式", trigger: "change" },
          { required: true, message: "请选择时间", trigger: "change" },
        ],
      },
      teams: [],
      members: [
        {
          name: "成员1",
          type: 1,
          time: "2025-01-01",
        },
        {
          name: "成员2",
          type: 2,
          time: "2025-01-01",
        },
        {
          name: "成员3",
          type: undefined,
          time: "",
        },
      ],
    };
  },
  computed: {
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
    getTeamList() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = res.result;
      });
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        this.$emit("save", { ...this.form });
        this.innerVisible = false;
      });
    },
    resetForm() {
      this.form = {
        title: this.defaultTitle,
        groupId: this.defaultGroupId,
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    removeMember(index) {
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
  color: #909399;
  font-size: 16px;
  line-height: 32px;
}
.delete-icon:hover {
  color: #f56c6c;
}
</style>
