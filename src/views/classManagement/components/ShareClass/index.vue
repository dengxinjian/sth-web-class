<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false">
    <span slot="title">分享团队</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="130px"
      size="small">
      <el-form-item label="团队选择" prop="teamId">
        <!-- <el-input
          v-model="form.planTitle"
          maxlength="20"
          show-word-limit
          placeholder="请输入计划名称"
          clearable
        /> -->
        <el-select
          v-model="form.teamId"
          placeholder="请选择团队"
          filterable
          clearable
          multiple
          style="width: 100%"
          @change="handleTeamChange">
          <el-option
            v-for="item in teams"
            :key="item.id"
            :label="item.name"
            :value="item.id"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        class="share-team-item"
        :label="`${item.teamName}`"
        v-for="item in selectedTeams"
        :key="item.shareToId">
        <el-radio-group v-model="item.shareToAuth">
          <el-radio
            :label="col.value"
            v-for="col in radioOptions"
            :key="col.id">{{ col.label }}</el-radio>
        </el-radio-group>
        <img
          src="~@/assets/plan/close.png"
          alt=""
          style="width: 24px; height: 24px; margin-left: 20px; cursor: pointer"
          @click="handleClose(item)" />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js"
import { teamApi } from "../../../plan/services/planManagement"

export default {
  name: "SummaryPreview",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
    planInfo: { type: Object, default: () => ({}) },
    planClasses: { type: Array, default: () => [] },
    classId: { type: [String, Number], default: undefined },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      triUserId: localStorage.getItem("triUserId"),
      form: {
        teamId: [],
      },
      rules: {
        teamId: [{ required: true, message: "请选择分组", trigger: "change" }],
      },
      groups: [],
      teams: [],
      selectedTeams: [],
      radioOptions: [
        { label: "查看", value: 1 },
        { label: "编辑", value: 2 },
      ],
    }
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : []
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
        this.getTeamList()
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
  },
  methods: {
    async getTeamList() {
      if (localStorage.getItem("loginType") === "2") {
        const res = await teamApi.getCoachTeams({
          triUserId: localStorage.getItem("triUserId"),
          filterType: 1,
          filterDataId: this.classId,
          filterDataType: 1,
        })
        this.teams = res.result
      } else {
        const res = await teamApi.getAthleteTeams({
          triUserId: localStorage.getItem("triUserId"),
          filterType: 1,
          filterDataId: this.classId,
          filterDataType: 1,
        })
        this.teams = res.result.length > 0 ? [res.result] : []
      }
      console.log(this.teams, "this.teams")
    },
    handleTeamChange(val) {
      // 與選中項聯動：下方列表 = 當前選中的團隊，取消勾選時同步移除
      const idList = Array.isArray(val) ? val : []
      const existingMap = new Map(
        this.selectedTeams.map((t) => [t.shareToId, t.shareToAuth])
      )
      this.selectedTeams = this.teams
        .filter((item) => idList.includes(item.id))
        .map((item) => ({
          shareToId: item.id,
          teamName: item.name,
          shareToAuth: existingMap.has(item.id) ? existingMap.get(item.id) : 1,
        }))
    },
    handleClose(val) {
      this.selectedTeams = this.selectedTeams.filter(
        (item) => item.shareToId !== val.shareToId
      )
      this.form.teamId = this.form.teamId.filter(
        (item) => item !== val.shareToId
      )
    },
    onCancel() {
      this.innerVisible = false
      this.$emit("cancel")
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        const triUserId = localStorage.getItem("triUserId")
        const shareTos = this.selectedTeams.map(item => ({
          shareToId: item.shareToId,
          shareToAuth: item.shareToAuth,
        }))
        const params = {
          requestUserId: triUserId,
          shareDataId: this.classId,
          shareDataType: 1, // 1 团队课程  2 分享计划
          shareTos: shareTos,
          shareToType: 2, //  1 个人  2 团队
        }
        submitData({
          url: "/training/api/share/create",
          requestData: params,
        }).then((res) => {
          if (res.success) {
            this.$message.success("分享成功")
            this.innerVisible = false
            this.$emit("shareSuccess", res.result)
          } else {
            this.$message.error(res.message)
          }
        })
      })
    },
    resetForm() {
      this.form = {
        teamId: [],
      }
      this.selectedTeams = []
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      })
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

/* 僅針對下方團隊列使用 flex，避免影響上方多選刪除時的排版 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__content) {
  margin-left: 0;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

/* 分享團隊名稱不換行，過長以省略號顯示 */
.add-class-title-modal .share-team-item ::v-deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 團隊選擇下拉框內標籤不換行 */
.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag) {
  max-width: 100%;
}

.add-class-title-modal .share-team-select ::v-deep(.el-select__tags .el-tag .el-select__tags-text) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 100%;
}

</style>
