<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="600px"
    :before-close="handleClose"
    append-to-body
    class="athletic-info-dialog"
  >
    <span slot="title">运动员信息</span>
    <el-tabs v-model="activeMainTab">
      <el-tab-pane label="基本信息" name="base">
        <el-form :model="baseForm" label-width="80px" class="base-form">
          <el-form-item label="昵称">
            <el-input v-model="baseForm.nickname" placeholder="请输入昵称" disabled />
          </el-form-item>
          <el-form-item label="头像">
            <div class="avatar-uploader">
              <el-upload
                class="avatar-upload"
                action=""
                :http-request="noopRequest"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="onAvatarChange"
                accept="image/*"
                disabled
              >
                <img v-if="baseForm.avatarUrl" :src="baseForm.avatarUrl" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="baseForm.gender" disabled>
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="身高">
            <div class="inline-field">
              <el-input v-model.number="baseForm.height" placeholder="cm" disabled />
              <span class="unit">CM</span>
            </div>
          </el-form-item>
          <el-form-item label="体重">
            <div class="inline-field">
              <el-input v-model.number="baseForm.weight" placeholder="kg" disabled />
              <span class="unit">KG</span>
            </div>
          </el-form-item>
          <el-form-item label="BMI">
            <span>{{ bmiDisplay }}</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="阈值" name="threshold">
        <el-tabs v-model="activeSport" class="sport-tabs">
          <el-tab-pane label="心率" :name="1" />
          <el-tab-pane label="游泳" :name="4" />
          <el-tab-pane label="骑车" :name="2" />
          <el-tab-pane label="跑步" :name="3" />
        </el-tabs>
        <div class="threshold-form">
          <div v-if="activeSport === 1" class="row">
            <span class="label"><span class="required">*</span>阈值心率</span>
            <el-input v-model.number="thresholdData.param2" step="1" class="pill-input" />
            <span class="suffix unit-red">bpm</span>
            <span class="label right-gap"><span class="required">*</span>最大心率</span>
            <el-input v-model.number="thresholdData.param1" step="1" class="pill-input" />
            <span class="suffix unit-red">bpm</span>
          </div>
          <div v-else-if="activeSport === 4" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <el-time-picker v-model="thresholdData.threshold" value-format="mm:ss" format="mm:ss" popper-class="hide-hour" class="pill-input" />
            <span class="suffix unit-red">min/100m</span>
          </div>
          <div v-else-if="activeSport === 2" class="row">
            <span class="label"><span class="required">*</span>阈值功率</span>
            <el-input v-model.number="thresholdData.threshold" step="1" class="pill-input" />
            <span class="suffix unit-red">w</span>
          </div>
          <div v-else-if="activeSport === 3" class="row">
            <span class="label"><span class="required">*</span>阈值配速</span>
            <el-time-picker v-model="thresholdData.threshold" value-format="mm:ss" format="mm:ss" popper-class="hide-hour" class="pill-input" />
            <span class="suffix unit-red">min/km</span>
          </div>
          <div class="zoneContainer">
            <div class="zoneTr">
              <div class="zoneTd">z1:恢复</div>
              <div class="zoneTd">{{ thresholdData.zone1[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone1[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z2:有氧</div>
              <div class="zoneTd">{{ thresholdData.zone2[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone2[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z3:节奏</div>
              <div class="zoneTd">{{ thresholdData.zone3[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone3[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z4:阈值门槛</div>
              <div class="zoneTd">{{ thresholdData.zone4[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone4[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5A:阈值上限</div>
              <div class="zoneTd">{{ thresholdData.zone5A[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone5A[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5B:最大摄氧量</div>
              <div class="zoneTd">{{ thresholdData.zone5B[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone5B[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
            <div class="zoneTr">
              <div class="zoneTd">z5C:无氧能力</div>
              <div class="zoneTd">{{ thresholdData.zone5C[0] }}</div>
              <div class="zoneTd">~</div>
              <div class="zoneTd">{{ thresholdData.zone5C[0] }}</div>
              <div class="zoneTd">{{ thresholdData.unit }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSave">保存</el-button>
    </span>
  </el-dialog>
  </template>

<script>
import {getData, submitData} from '@/api/common.js'
import { secondsToMMSS, mmssToSeconds } from '@/utils/index'

export default {
  name: 'AthleticInfoDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      // 兼容 v-model 用法
      type: Boolean,
      default: undefined
    },
    // 初始数据（可选）
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      activeMainTab: 'base',
      activeSport: 1,
      baseForm: {
        nickname: this.data.nickname || '',
        avatar: this.data.avatar || '',
        gender: 1,
        heightCm: this.data.heightCm || null,
        weightKg: this.data.weightKg || null
      },
      thresholds: [],
      thresholdData: {
        zone1: [],
        zone2: [],
        zone3: [],
        zone4: [],
        zone5A: [],
        zone5B: [],
        zone5C: [],
        unit: ''
      }
    };
  },
  computed: {
    bmiDisplay() {
      const h = Number(this.baseForm.height);
      const w = Number(this.baseForm.weight);
      if (!h || !w) return '';
      const bmi = w / Math.pow(h / 100, 2);
      return bmi ? bmi.toFixed(1) : '';
    },
    // currentThreshold() {
    //   const find = this.thresholds.find(item => item.thresholdType === this.activeSport)
    //   return find;
    // },
    // zoneRows() {
    //   const t = Number(this.currentThreshold.threshold) || 0;
    //   const m = Number(this.currentThreshold.max) || 0;
    //   const clamp = (v) => (m ? Math.min(v, m) : v);
    //   const rows = [
    //     { key: 'z1', label: 'z1:恢复', from: 0, to: Math.max(0, t - 40), unit: 'bpm' },
    //     { key: 'z2', label: 'z2:有氧', from: Math.max(0, t - 39), to: t - 30 },
    //     { key: 'z3', label: 'z3:节奏', from: t - 29, to: t - 20},
    //     { key: 'z4', label: 'z4:阈值门槛', from: t - 19, to: t - 10},
    //     { key: 'z5a', label: 'z5A:阈值上限', from: t - 9, to: t },
    //     { key: 'z5b', label: 'z5B:最大摄氧量', from: t + 1, to: t + 10 },
    //     { key: 'z5c', label: 'z5C:无氧能力', from: t + 11, to: t + 20 }
    //   ];
    //   return rows.map((r) => ({
    //     label: r.label,
    //     from: clamp(r.from),
    //     to: clamp(r.to),
    //     unit: 'bpm'
    //   }));
    // }
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== 'undefined') this.innerVisible = val;
    },
    innerVisible(val) {
      this.$emit('update:visible', val);
      this.$emit('input', val);
      if (val && this.data.triUserId) {
        this.getAthleticInfo()
        this.getThresholdData()
      }
    },
    activeSport(val) {
      this.getThresholdData()
    }
  },
  methods: {
    getAthleticInfo() {
      getData({
        url: '/api/classSchedule/getUserProfile',
        triUserId: this.data.triUserId
      }).then(res => {
        if (res.success) {
          this.baseForm = res.result
          // this.thresholds = res.result.thresholdRecordList
          // this.currentThreshold = this.thresholds.find(item => item.thresholdType === this.activeSport)
        }
      })
    },
    getThresholdData() {
      getData({
        url: '/api/classSchedule/getThresholdDetail',
        type: this.activeSport
      }).then(res => {
        this.thresholdData = res.result[0]
        if (this.activeSport === 4 || this.activeSport === 3) {
          this.thresholdData.threshold = secondsToMMSS(+this.thresholdData.threshold)
        }
      })
    },
    handleClose() {
      this.onCancel();
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit('cancel');
    },
    onSave() {
      const params = {thresholdType: this.activeSport, param1: '', param2: '', threshold: '', triUserId: this.data.triUserId}
      if (this.activeSport === 4 || this.activeSport === 3) {
        params.threshold = mmssToSeconds(this.thresholdData.threshold)
      } else if (this.activeSport === 2) {
        params.threshold = this.thresholdData.threshold
      } else if (this.activeSport === 1) {
        params.param1 = this.thresholdData.param1
        params.param2 = this.thresholdData.param2
      }
      submitData({
        url: '/api/classSchedule/updateThreshold',
        requestData: params
      }).then(res => {
        if (res.success) {
          this.$message.success('阈值保存成功')
          // this.$emit('save', res.result);
          // this.innerVisible = false;
        }
      })
    },
    noopRequest() {},
    onAvatarChange(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.baseForm.avatar = e.target.result;
      };
      reader.readAsDataURL(file.raw);
    },
    handleSportChange(val) {
      console.log(val)
      this.activeSport = val
    }
  }
};
</script>

<style scoped>
.athletic-info-dialog ::v-deep(.el-dialog__header){
  padding: 16px 24px;
}
.athletic-info-dialog ::v-deep(.el-dialog__body){
  padding: 10px 36px 0 36px;
}
.athletic-info-dialog ::v-deep(.el-tabs__header){
  margin-bottom: 16px;
}
.base-form .el-input.is-disabled .el-input__inner{
  background: #f5f5f7;
  color: #333;
  border-radius: 24px;
  border: none;
  height: 40px;
}
.base-form .el-form-item{
  margin-bottom: 18px;
}
.base-form ::v-deep(.el-radio.is-disabled){
  opacity: 1;
}
.base-form ::v-deep(.el-radio__input.is-disabled .el-radio__inner){
  border-color: #d9d9d9;
}
.base-form ::v-deep(.el-radio__input.is-disabled.is-checked .el-radio__inner){
  border-color: #e74c3c;
}
.base-form ::v-deep(.el-radio__input.is-disabled.is-checked .el-radio__inner::after){
  background: #e74c3c;
}
.athletic-info-dialog .avatar-uploader {
  display: inline-block;
}
.avatar-upload {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
.avatar-uploader-icon {
  font-size: 24px;
  color: #8c939d;
}
.inline-field {
  display: inline-flex;
  align-items: center;
}
.inline-field .unit {
  flex: 1 1 80px;
  margin-left: 8px;
  color: #666;
}
.threshold-form .row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.threshold-form .label {
  flex: 1 0 70px;
  margin-right: 6px;
  color: #333;
  font-weight: 500;
  max-width: 140px;
}
.threshold-form .suffix {
  flex: 1 0 40px;
  margin: 0 12px 0 6px;
  color: #666;
}
.right-gap { margin-left: 24px; }
.required{ color: #e65b55; margin-right: 4px; }
.unit-red{ color: #e65b55; }
.sport-tabs ::v-deep(.el-tabs__nav-wrap::after){ height: 0; }
.sport-tabs ::v-deep(.el-tabs__item){
  height: 36px;
  line-height: 36px;
  border-radius: 18px;
  background: #f2f2f4;
  margin-right: 16px;
  color: #333;
  text-align: center;
  font-weight: 500;
  padding: 0 24px;
}
.sport-tabs ::v-deep(.el-tabs__item:nth-child(2)) {
  padding-left: 24px;
}
.sport-tabs ::v-deep(.el-tabs__item:last-child) {
  padding-right: 24px;
}
.sport-tabs ::v-deep(.el-tabs__item.is-active){
  background: #e65b55;
  color: #fff;
}
.pill-input .el-input__inner{
  border-radius: 22px;
  height: 40px;
  border: 1px solid #e5e6eb;
  background: #fff;
  padding: 0 16px;
}
.pill-input{ width: 220px; }
.zone-table ::v-deep(.el-table__row){
  height: 44px;
}
.zone-table ::v-deep(.el-table){
  background: transparent;
}
.zone-table ::v-deep(.el-table__body tr:hover>td){
  background: transparent;
}
.zone-table ::v-deep(.el-table__cell){
  border-bottom: none;
  font-size: 14px;
  color: #333;
}
.zone-table ::v-deep(.el-table__body){ font-weight: 500; }
.zone-table ::v-deep(.cell){
  padding-left: 0;
  padding-right: 0;
}
.dialog-footer{
  display: flex;
  justify-content: center;
}
.dialog-footer .el-button{
  min-width: 120px;
  border-radius: 22px;
}
.dialog-footer .el-button--primary{
  background: #d83b36;
  border-color: #d83b36;
}

.zoneTr {
  display: flex;
  flex-direction: row;
  line-height: 34px;
}
.zoneTd {
  flex: 0 0 80px;
}
.zoneTd:nth-child(1) {
  flex: 0 0 140px;
}

</style>

