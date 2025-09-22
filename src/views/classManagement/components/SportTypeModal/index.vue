<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="800px"
    append-to-body
    :before-close="onCancel"
    class="sport-type-modal"
  >
    <span slot="title">类型选择</span>

    <div class="type-grid">
      <div
        v-for="item in types"
        :key="item.key"
        class="type-card"
        @click="onSelect(item)"
      >
        <img v-if="item.key === 'rest'" src="~@/assets/addClass/type-rest.png" alt="">
        <img v-else-if="item.key === 'note'" src="~@/assets/addClass/type-remark.png" alt="">
        <img v-else-if="item.key === 'other'" src="~@/assets/addClass/type-others.png" alt="">
        <img v-else-if="item.key === 'strength'" src="~@/assets/addClass/type-power.png" alt="">
        <img v-else-if="item.key === 'run'" src="~@/assets/addClass/type-run.png" alt="">
        <img v-else-if="item.key === 'ride'" src="~@/assets/addClass/type-bike.png" alt="">
        <img v-else-if="item.key === 'swim'" src="~@/assets/addClass/type-swim.png" alt="">
      </div>
    </div>

    <!-- <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
    </span> -->
  </el-dialog>
</template>

<script>
export default {
  name: 'SportTypeModal',
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined }
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      types: [
        { key: 'strength', name: '力量' },
        { key: 'other', name: '其他' },
        { key: 'note', name: '备忘录' },
        { key: 'rest', name: '休息' },
        { key: 'swim', name: '游泳' },
        { key: 'ride', name: '骑行' },
        { key: 'run', name: '跑步' },
      ]
    }
  },
  watch: {
    visible(val) { this.innerVisible = val },
    value(val) { if (typeof val !== 'undefined') this.innerVisible = val },
    innerVisible(val) {
      this.$emit('update:visible', val)
      this.$emit('input', val)
    }
  },
  methods: {
    onCancel() {
      this.innerVisible = false
      this.$emit('cancel')
    },
    onSelect(item) {
      this.$emit('select', { key: item.key, name: item.name })
      this.innerVisible = false
    }
  }
}
</script>

<style scoped>
.sport-type-modal ::v-deep(.el-dialog__header){
  padding: 16px 24px;
}
.sport-type-modal ::v-deep(.el-dialog__body){
  padding: 10px 24px 30px 24px;
}
.type-grid{
  display: flex;
  gap: 20px;
  padding: 10px 6px 0 6px;
  flex-wrap: wrap-reverse;
  justify-content: center;
}
.type-card{
  flex: 0 0 calc(25% - 15px);
  height: 120px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s ease;
  background: #fafafa;
}
.type-card:hover{ transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.type-card>img{ width: 100%; height: 100%; object-fit: cover; }
.icon-wrap{ width: 56px; height: 56px; border-radius: 50%; overflow: hidden; display:flex; align-items:center; justify-content:center; margin-bottom: 6px; background: #fff; }
.icon-wrap img{ width: 100%; height: 100%; object-fit: cover; }
.type-name{ font-weight: 600; color: #333; }

/* 渐变背景（接近示意图） */
.bg-swim{ background: linear-gradient(180deg, #e6f5ff 0%, #d8ecff 100%); }
.bg-ride{ background: linear-gradient(180deg, #f5e8ff 0%, #efe2ff 100%); }
.bg-run{ background: linear-gradient(180deg, #ffe8ef 0%, #ffe2ea 100%); }
.bg-strength{ background: linear-gradient(180deg, #f7f7f7 0%, #f2f2f2 100%); }
.bg-other{ background: linear-gradient(180deg, #fff6df 0%, #fff1c9 100%); }
.bg-note{ background: linear-gradient(180deg, #fff0ea 0%, #ffe8e0 100%); }
.bg-rest{ background: linear-gradient(180deg, #e9fff6 0%, #e2fff2 100%); }

.dialog-footer{ display:flex; justify-content:center; }
</style>

