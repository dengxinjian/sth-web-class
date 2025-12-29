<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="420px"
    append-to-body
    :before-close="onCancel"
    class="move-group-modal"
     :close-on-click-modal="false"
  >
    <span slot="title">移动分组</span>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="small">
      <el-form-item label="目标分组" prop="destinationId">
        <el-select v-model="form.destinationId" placeholder="请选择目标分组" filterable clearable style="width: 100%">
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
import {getData, submitData} from '@/api/common.js'

export default {
  name: 'MoveGroupDialog',
  props: {
    // v-model 控制弹框显示
    value: { type: Boolean, default: undefined },
    visible: { type: Boolean, default: false },
    // 当前分组ID，用于过滤掉自己
    id: { type: [String, Number], default: '' },
    classId: { type: [String, Number], default: '' },
    type: { type: String, default: '' }
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: { destinationId: '' },
      rules: {
        destinationId: [{ required: true, message: '请选择目标分组', trigger: 'change' }]
      },
      groups: []
    }
  },
  watch: {
    visible(val) { this.innerVisible = val },
    value(val) { if (typeof val !== 'undefined') this.innerVisible = val },
    innerVisible(val) {
      if (!val) {
        // 关闭时重置表单数据和验证状态
        this.resetForm()
      } else {
        // 打开时重置表单数据并获取分组列表
        this.resetForm()
        this.getGroupList()
      }
    }
  },
  methods: {
    // 重置表单数据
    resetForm() {
      this.form = { destinationId: '' }
      this.$nextTick(() => {
        if (this.$refs.formRef && this.$refs.formRef.clearValidate) {
          this.$refs.formRef.clearValidate()
        }
      })
    },
    getGroupList() {
      getData({
        url: '/training/api/classesGroup/user/getClassesGroupsByUserId'
      }).then(res => {
        const groups = []
        res.result.forEach(item => {
          if (item.id !== this.id) {
            groups.push({
              label: item.classesGroupName,
              value: item.id
            })
          }
        })
        this.groups = groups
        // 默认选择第一个分组
        if (groups.length > 0) {
          this.form.destinationId = groups[0].value
        }
      })
    },
    onCancel() {
      this.innerVisible = false
      this.$emit('save')
    },
    onConfirm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        if (this.type === 'group') {
          this.submitGroupMove()
        } else {
          this.submitClassMove()
        }
      })
    },
    submitGroupMove() {
      submitData({
        url: `/api/classesGroup/moveClassesGroupById?id=${this.id}&destinationId=${this.form.destinationId}`,
      }).then(res => {
        if (res.success) {
          this.$message.success('分组移动成功')
          this.innerVisible = false
          this.$emit('save', {...this.form})
        }
      })
    },
    submitClassMove() {
      submitData({
        url: `/api/classes/moveClasses?id=${this.classId}&destinationGroupId=${this.form.destinationId}`,
      }).then(res => {
        if (res.success) {
          this.$message.success('课程移动成功')
          this.innerVisible = false
          this.$emit('save', {...this.form})
        }
      })
    }
  }
}
</script>

<style scoped>
.move-group-modal ::v-deep(.el-dialog__header){
  padding: 16px 24px;
}
.move-group-modal ::v-deep(.el-dialog__body){
  padding: 10px 24px 0 24px;
}
.dialog-footer{
  display: flex;
  justify-content: center;
}
</style>

