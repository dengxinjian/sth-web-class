<!-- eslint-disable vue/html-self-closing -->
<template>
  <div>
    <el-card>
      <el-form
        :model="form"
        label-width="150px"
        :inline="true"
        ref="form"
        :rule="rules"
      >
        <div class="form-title">
          品线标准周转值配置
          <span class="openBtn" @click="handleOpenClick(1)"
            ><i v-if="openIds.includes(1)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <el-row :gutter="20" :class="openIds.includes(1) ? 'closeContain' : ''">
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="CPU" prop="mac">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.mac"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="Watch" prop="watch">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.watch"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="iPad" prop="ipad">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.ipad"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="iPhone" prop="iphone">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.iphone"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="Airpods" prop="airPods">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.airPods"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="配件" prop="fitting">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.fitting"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
          <el-col :md="10" :span="9" style="display: flex">
            <el-form-item label="其他" prop="others">
              <el-input-number
                :controls="false"
                :step="0.01"
                :max="100000"
                :min="0"
                :step-strictly="true"
                v-model="form.others"
              ></el-input-number>
            </el-form-item>
            <span style="line-height: 36px">（天）</span>
          </el-col>
        </el-row>

        <div class="form-title">
          京东前一周库存、销售数据上传提醒<span
            class="openBtn"
            @click="handleOpenClick(2)"
            ><i v-if="openIds.includes(2)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(2) ? 'closeContain' : ''">
          <div>
            <el-form-item
              label="上传截至时间"
              prop="jdUploadDeadlineWeek"
              :required="true"
            >
              <el-select v-model="form.jdUploadDeadlineWeek">
                <el-option :value="1" label="周一"></el-option>
                <el-option :value="2" label="周二"></el-option>
                <el-option :value="3" label="周三"></el-option>
                <el-option :value="4" label="周四"></el-option>
                <el-option :value="5" label="周五"></el-option>
                <el-option :value="6" label="周六"></el-option>
                <el-option :value="7" label="周日"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="jdUploadDeadlineTime">
              <el-time-picker
                v-model="form.jdUploadDeadlineTime"
                value-format="HH:mm:ss"
                :clearable="false"
                :editable="false"
              ></el-time-picker>
            </el-form-item>
          </div>
          <el-form-item label="提醒人员">
            <div
              v-for="(item, index) in jdEmails"
              :key="item"
              style="margin-bottom: 10px; display: flex"
            >
              <el-input
                :value="item.value"
                style="width: 280px"
                @input="(val) => handleJdEmailChange(val, index)"
              ></el-input>
              <i
                class="el-icon-plus"
                v-if="index === 0"
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleJdEmailAdd"
              ></i>
              <i
                class="el-icon-minus"
                v-else
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleJdEmailDecr(index)"
              ></i>
            </div>
          </el-form-item>
        </div>
        <div class="form-title">
          ShipmentPlan数据上传提醒
          <span class="openBtn" @click="handleOpenClick(3)"
            ><i v-if="openIds.includes(3)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(3) ? 'closeContain' : ''">
          <div>
            <el-form-item
              label="上传截至时间"
              prop="shipmentUploadDeadlineWeek"
              :required="true"
            >
              <el-select v-model="form.shipmentUploadDeadlineWeek">
                <el-option :value="1" label="周一"></el-option>
                <el-option :value="2" label="周二"></el-option>
                <el-option :value="3" label="周三"></el-option>
                <el-option :value="4" label="周四"></el-option>
                <el-option :value="5" label="周五"></el-option>
                <el-option :value="6" label="周六"></el-option>
                <el-option :value="7" label="周日"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="shipmentUploadDeadlineTime">
              <el-time-picker
                v-model="form.shipmentUploadDeadlineTime"
                value-format="HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
          </div>
          <el-form-item label="提醒人员">
            <div
              v-for="(item, index) in shipmentEmails"
              :key="item"
              style="margin-bottom: 10px; display: flex"
            >
              <el-input
                :value="item.value"
                style="width: 280px"
                @input="(val) => handleShipmentEmailChange(val, index)"
              ></el-input>
              <i
                class="el-icon-plus"
                v-if="index === 0"
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleShipmentEmailAdd"
              ></i>
              <i
                class="el-icon-minus"
                v-else
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleShipmentEmailDecr(index)"
              ></i>
            </div>
          </el-form-item>
        </div>

        <div class="form-title">
          分货满足定时保存
          <span class="openBtn" @click="handleOpenClick(4)"
            ><i v-if="openIds.includes(4)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(4) ? 'closeContain' : ''">
          <el-form-item label="定时保存时间" prop="timer">
            <el-time-picker
              v-model="form.timer"
              value-format="HH:mm:ss"
            ></el-time-picker>
          </el-form-item>
        </div>

        <!-- <div class="form-title">邮件轮询时间设置</div>
        <div style="display: flex">
          <el-form-item label="轮询时间" prop="uploadDeadline">
            <el-input></el-input>
          </el-form-item>
          <span style="line-height: 36px">（分钟）</span>
        </div> -->

        <div class="form-title">
          DN上传时间设置
          <span class="openBtn" @click="handleOpenClick(5)"
            ><i v-if="openIds.includes(5)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(5) ? 'closeContain' : ''">
          <el-form-item
            label="第二天上传截至时间"
            prop="dnUploadTimeLimit"
            :required="true"
          >
            <el-time-picker
              v-model="form.dnUploadTimeLimit"
              :clearable="false"
              value-format="HH:mm"
              format="HH:mm"
            ></el-time-picker>
          </el-form-item>
          <el-form-item prop="productStockScheduledLast" :required="true">
            <el-input-number
              v-model="form.productStockScheduledLast"
              :min="10"
              step-strictly="true"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </div>

        <div class="form-title">
          货况查询定时发送
          <span class="openBtn" @click="handleOpenClick(6)"
            ><i v-if="openIds.includes(6)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(6) ? 'closeContain' : ''">
          <div>
            <el-form-item label="邮件发送时间" :required="true">
              <el-time-picker
                v-model="form.cargoQueryTimedSendConfVo.uploadDeadLineTime"
                :clearable="false"
                :editable="false"
                value-format="HH:mm:ss"
                format="HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
          </div>
          <div
            v-for="(item, index) in form.cargoQueryTimedSendConfVo
              .lobConfVoList"
            :key="index"
            style="margin-top: 10px"
          >
            <div>
              <el-form-item label="品类">
                <el-select v-model="item.lob">
                  <el-option
                    v-for="part in lobOptions"
                    :key="part.comBox.value"
                    :value="part.comBox.value"
                    :label="part.comBox.code"
                  ></el-option>
                </el-select>
              </el-form-item>
              <i
                class="el-icon-plus"
                v-if="index === 0"
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleCargoLobAdd"
              ></i>
              <i
                class="el-icon-minus"
                v-else
                style="
                  font-size: 20px;
                  line-height: 36px;
                  padding: 0 10px;
                  cursor: pointer;
                "
                @click="handleCargoLobDecr(index)"
              ></i>
            </div>
            <div v-for="(part, idx) in item.emailBoxList" :key="idx">
              <el-form-item :label="idx === 0 ? '邮箱' : ' '">
                <el-input
                  placeholder="请输入邮箱"
                  v-model="part.email"
                  style="width: 280px"
                ></el-input>
                <i
                  class="el-icon-plus"
                  v-if="idx === 0"
                  style="
                    font-size: 20px;
                    line-height: 36px;
                    padding: 0 10px;
                    cursor: pointer;
                  "
                  @click="handleCargoEmailAdd(index)"
                ></i>
                <i
                  class="el-icon-minus"
                  v-else
                  style="
                    font-size: 20px;
                    line-height: 36px;
                    padding: 0 10px;
                    cursor: pointer;
                  "
                  @click="handleCargoEmailDecr(index, idx)"
                ></i>
              </el-form-item>
            </div>
          </div>
        </div>

        <div class="form-title">
          VC上传截止时间设置
          <span class="openBtn" @click="handleOpenClick(7)"
            ><i v-if="openIds.includes(7)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(7) ? 'closeContain' : ''">
          <div>
            <el-form-item label="预警时间">
              <el-time-picker
                v-model="form.vcNotifyConfigVo.vcNotifyTime"
                :clearable="false"
                :editable="false"
                value-format="HH:mm:ss"
                format="HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
            <el-form-item label="上传截止时间">
              <el-time-picker
                v-model="form.vcNotifyConfigVo.vcLasUploadTime"
                :clearable="false"
                :editable="false"
                value-format="HH:mm:ss"
                format="HH:mm:ss"
              ></el-time-picker>
            </el-form-item>
          </div>
          <div>
            <el-form-item label="提醒人员">
              <div
                v-for="(item, index) in form.vcNotifyConfigVo.vcNotifyEmailList"
                :key="item"
                style="margin-bottom: 10px; display: flex"
              >
                <el-input v-model="item.email" style="width: 280px"></el-input>
                <i
                  class="el-icon-plus"
                  v-if="index === 0"
                  style="
                    font-size: 20px;
                    line-height: 36px;
                    padding: 0 10px;
                    cursor: pointer;
                  "
                  @click="handleVcEmailAdd"
                ></i>
                <i
                  class="el-icon-minus"
                  v-else
                  style="
                    font-size: 20px;
                    line-height: 36px;
                    padding: 0 10px;
                    cursor: pointer;
                  "
                  @click="handleVcEmailDecr(index)"
                ></i>
              </div>
            </el-form-item>
          </div>
        </div>

        <!-- <div class="form-title">
          自动分仓取EB库存
          <span class="openBtn" @click="handleOpenClick(8)"
            ><i v-if="openIds.includes(8)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(8) ? 'closeContain' : ''">
          <div
            v-for="item in autoWarehouseList"
            :key="item.id"
            style="
              background-color: #fafafa;
              margin-bottom: 10px;
              border-radius: 8px;
            "
          >
            <div>
              <span
                style="
                  display: inline-block;
                  padding-left: 110px;
                  line-height: 36px;
                  margin-bottom: 10px;
                "
                >品类：{{ item.sub }}</span
              >
              <span class="openBtn" @click="handleAutoOpenClick(item.sub)">
                <i
                  v-if="!autoOpenIds.includes(item.sub)"
                  class="el-icon-arrow-down"
                ></i
                ><i v-else class="el-icon-arrow-up"></i>
              </span>
            </div>
            <div :class="autoOpenIds.includes(item.sub) ? '' : 'closeContain'">
              <el-form-item label="工厂">
                <el-input v-model="item.factory" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="批次">
                <el-input v-model="item.batch" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="仓库编号">
                <el-input
                  v-model="item.warehouseNumber"
                  :maxlength="50"
                ></el-input>
              </el-form-item>
            </div>
          </div>
        </div>

        <div class="form-title">
          自动分仓-仓库分表
          <span class="openBtn" @click="handleOpenClick(9)"
            ><i v-if="openIds.includes(9)" class="el-icon-arrow-down"></i
            ><i v-else class="el-icon-arrow-up"></i
          ></span>
        </div>
        <div :class="openIds.includes(9) ? 'closeContain' : ''">
          <div>
            <el-form-item
              label="台数"
              prop="automaticWarehousingCount"
              :rules="{
                message: '请输入正整数',
                trigger: 'change',
                pattern: /^([1-9][0-9]*)$/,
              }"
            >
              <div style="display: flex">
                <el-input
                  :controls="false"
                  v-model="form.automaticWarehousingCount"
                >
                </el-input
                ><span style="margin-left: 10px">台</span>
              </div>
            </el-form-item>
          </div>
          <div>
            <el-form-item
              label="总价"
              prop="automaticWarehousingPrice"
              :rules="{
                message: '请输入正数，最多包含两位小数',
                trigger: 'change',
                pattern:
                  /^(?!0\.0{1,2}$)(0(?:\.\d[1-9]|\.?[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/,
              }"
            >
              <div style="display: flex">
                <el-input
                  :controls="false"
                  v-model="form.automaticWarehousingPrice"
                >
                </el-input
                ><span style="margin-left: 10px">万</span>
              </div>
            </el-form-item>
          </div>

          <div>
            <el-form-item
              label="批次号"
              prop="automaticWarehousingBatchNumber"
              :rules="{
                required: true,
                message: '请输入批次号',
                trigger: 'blur',
              }"
            >
              <div style="display: flex">
                <el-input
                  :controls="false"
                  v-model="form.automaticWarehousingBatchNumber"
                >
                </el-input>
              </div>
            </el-form-item>
          </div>
        </div> -->

        <div>
          <el-form-item label=" ">
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import moment from "moment";
import Pagination from "@/components/Pagination";
import Button from "@/components/customBtn";
import { submitData, getData } from "@/api/common";

export default {
  name: "BasicData",
  components: { Button, Pagination },
  data() {
    return {
      form: {
        mac: "",
        watch: "",
        iphone: "",
        ipad: "",
        airPods: "",
        fitting: "",
        others: "",
        jdUploadDeadlineWeek: "",
        jdUploadDeadlineTime: "",
        shipmentUploadDeadlineWeek: "",
        shipmentUploadDeadlineTime: "",
        timer: "",
        dnUploadTimeLimit: "",
        productStockScheduledLast: "",
        cargoQueryTimedSendConfVo: {
          lobConfVoList: [],
          uploadDeadLineTime: "",
        },
        vcNotifyConfigVo: {
          vcLasUploadTime: "",
          vcNotifyTime: "",
          vcNotifyEmailList: [],
        },
        // automaticWarehousingCount: "",
        // automaticWarehousingPrice: "",
        // automaticWarehousingBatchNumber: "",
      },
      jdEmails: [{ value: "" }],
      shipmentEmails: [{ value: "" }],
      lobOptions: [],
      openIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      // autoWarehouseList: [],
      autoOpenIds: [],
    };
  },
  mounted() {
    this.getLobList();
    this.getConfig();
  },
  methods: {
    getConfig() {
      getData({ url: "/sysConf/getSysConf" }).then((res) => {
        const {
          pinXianPeiZhiVo,
          jdEmailRemindConfVo,
          shipmentEmailRemindConfVo,
          saveShipmentPlanDataPageConf,
          dnUploadTimeLimit,
          productStockScheduledLast,
          cargoQueryTimedSendConfVo,
          vcNotifyConfigVo,
          // automaticWarehousingConfigVoList,
          // automaticWarehousingCount,
          // automaticWarehousingPrice,
          // automaticWarehousingBatchNumber,
        } = res.result;
        // this.autoWarehouseList = automaticWarehousingConfigVoList;
        this.form = {
          ...pinXianPeiZhiVo,
          jdUploadDeadlineWeek: jdEmailRemindConfVo.uploadDeadLineWeek,
          jdUploadDeadlineTime: jdEmailRemindConfVo.uploadDeadLineTime,
          shipmentUploadDeadlineWeek:
            shipmentEmailRemindConfVo.uploadDeadLineWeek,
          shipmentUploadDeadlineTime:
            shipmentEmailRemindConfVo.uploadDeadLineTime,
          timer: saveShipmentPlanDataPageConf.uploadDeadLineTime,
          dnUploadTimeLimit,
          productStockScheduledLast,
          cargoQueryTimedSendConfVo: {
            ...cargoQueryTimedSendConfVo,
            lobConfVoList: cargoQueryTimedSendConfVo.lobConfVoList.map(
              (item) => {
                return {
                  ...item,
                  emailBoxList: item.emailBoxList.length
                    ? item.emailBoxList
                    : [{ email: "" }],
                };
              }
            ),
          },
          vcNotifyConfigVo: {
            ...vcNotifyConfigVo,
            vcNotifyEmailList: vcNotifyConfigVo.vcNotifyEmailList.length
              ? vcNotifyConfigVo.vcNotifyEmailList
              : [{ email: "" }],
          },
          // automaticWarehousingCount,
          // automaticWarehousingPrice,
          // automaticWarehousingBatchNumber,
        };
        // this.form = { ...pinXianPeiZhiVo };
        // this.form.jdUploadDeadlineWeek = jdEmailRemindConfVo.uploadDeadLineWeek;
        // this.form.jdUploadDeadlineTime = jdEmailRemindConfVo.uploadDeadLineTime;
        this.jdEmails = jdEmailRemindConfVo.emailBoxList.map((item) => {
          return { value: item };
        });
        // this.form.shipmentUploadDeadlineWeek =
        //   shipmentEmailRemindConfVo.uploadDeadLineWeek;
        // this.form.shipmentUploadDeadlineTime =
        //   shipmentEmailRemindConfVo.uploadDeadLineTime;
        this.shipmentEmails = shipmentEmailRemindConfVo.emailBoxList.map(
          (item) => {
            return { value: item };
          }
        );
        if (this.jdEmails.length === 0) {
          this.jdEmails.push({ value: "" });
        }
        if (this.shipmentEmails.length === 0) {
          this.shipmentEmails.push({ value: "" });
        }
      });
    },
    getLobList() {
      getData({ url: "/inventorySaleRecord/getComboBoxContent" }).then(
        (res) => {
          this.lobOptions = res.result;
        }
      );
    },
    handleJdEmailAdd() {
      this.jdEmails.push({ value: "" });
    },
    handleJdEmailDecr(index) {
      this.jdEmails.splice(index, 1);
    },
    handleJdEmailChange(val, index) {
      this.jdEmails[index].value = val;
    },
    handleShipmentEmailAdd() {
      this.shipmentEmails.push({ value: "" });
    },
    handleShipmentEmailDecr(index) {
      this.shipmentEmails.splice(index, 1);
    },
    handleShipmentEmailChange(val, index) {
      this.shipmentEmails[index].value = val;
    },
    handleSubmit() {
      const jdEmpty = this.jdEmails.filter((item) => item.value);
      const shipmentEmpty = this.shipmentEmails.filter((item) => item.value);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const countRegex = /^([1-9][0-9]*)$/;
      const priceRegex =
        /^(?!0\.0{1,2}$)(0(?:\.\d[1-9]|\.?[1-9]\d?)|[1-9]\d*(?:\.\d{1,2})?)$/;
      let flag = false;
      jdEmpty.forEach((item) => {
        const result = emailRegex.test(item.value);
        if (!result) {
          flag = true;
        }
      });
      if (flag) {
        return this.$message.error(
          "京东前一周库存、销售数据上传提醒邮箱格式有误，请输入正确格式的邮箱地址，然后重新提交"
        );
      }
      shipmentEmpty.forEach((item) => {
        const result = emailRegex.test(item.value);
        if (!result) {
          flag = true;
        }
      });
      if (flag) {
        return this.$message.error(
          "ShipmentPlan数据上传提醒邮箱格式有误，请输入正确格式的邮箱地址，然后重新提交"
        );
      }
      this.form.cargoQueryTimedSendConfVo.lobConfVoList.forEach((item) => {
        item.emailBoxList.forEach((part) => {
          const result = emailRegex.test(part.email);
          if (!result) {
            flag = true;
          }
        });
      });
      if (flag) {
        return this.$message.error(
          "货况查询定时发送邮箱格式有误，请输入正确格式的邮箱地址，然后重新提交"
        );
      }
      this.form.vcNotifyConfigVo.vcNotifyEmailList.forEach((item) => {
        const result = emailRegex.test(item.email);
        if (!result) {
          flag = true;
        }
      });
      if (flag) {
        return this.$message.error(
          "VC上传截止时间设置邮箱格式有误，请输入正确格式的邮箱地址，然后重新提交"
        );
      }

      // if (
      //   this.form.automaticWarehousingCount &&
      //   !countRegex.test(this.form.automaticWarehousingCount)
      // ) {
      //   return this.$message.error(
      //     "自动分仓-仓库分表台数格式有误，请输入正整数，然后重新提交"
      //   );
      // }
      // if (
      //   this.form.automaticWarehousingPrice &&
      //   !priceRegex.test(this.form.automaticWarehousingPrice)
      // ) {
      //   return this.$message.error(
      //     "自动分仓-仓库分表总价格式有误，请输入正数且最多包含两位小数，然后重新提交"
      //   );
      // }
      // if (!this.form.automaticWarehousingBatchNumber) {
      //   return this.$message.error("自动分仓-仓库分表批次号不能为空");
      // }
      const {
        mac,
        iphone,
        ipad,
        airPods,
        fitting,
        watch,
        others,
        jdUploadDeadlineTime,
        jdUploadDeadlineWeek,
        shipmentUploadDeadlineTime,
        shipmentUploadDeadlineWeek,
        timer,
        dnUploadTimeLimit,
        productStockScheduledLast,
        cargoQueryTimedSendConfVo,
        vcNotifyConfigVo,
        // automaticWarehousingCount,
        // automaticWarehousingPrice,
        // automaticWarehousingBatchNumber,
      } = this.form;
      const obj = {
        url: "/sysConf/updateSysConf",
        // automaticWarehousingConfigVoList: this.autoWarehouseList,
        cargoQueryTimedSendConf: {
          uploadDeadLineTime: cargoQueryTimedSendConfVo.uploadDeadLineTime,
          lobConfReqDtoList: cargoQueryTimedSendConfVo.lobConfVoList,
        },
        pinXianPeiZhi: {
          mac,
          iphone,
          ipad,
          airPods,
          fitting,
          watch,
          others,
        },
        jdEmailRemindConf: {
          remindEmailBoxList: jdEmpty.map((item) => item.value),
          uploadDeadLineTime: jdUploadDeadlineTime,
          uploadDeadLineWeek: jdUploadDeadlineWeek,
        },
        shipmentEmailRemindConf: {
          remindEmailBoxList: shipmentEmpty.map((item) => item.value),
          uploadDeadLineTime: shipmentUploadDeadlineTime,
          uploadDeadLineWeek: shipmentUploadDeadlineWeek,
        },
        saveShipmentPlanDataPageConf: {
          uploadDeadLineTime: timer,
        },
        dnUploadTimeLimit,
        productStockScheduledLast,
        vcNotifyConfigVo,
        // automaticWarehousingCount,
        // automaticWarehousingPrice,
        // automaticWarehousingBatchNumber,
      };
      submitData(obj).then((res) => {
        this.$message.success("提交成功");
      });
    },
    handleCargoLobAdd() {
      this.form.cargoQueryTimedSendConfVo.lobConfVoList.push({
        lob: "",
        emailBoxList: [{ email: "" }],
      });
    },
    handleCargoLobDecr(index) {
      this.form.cargoQueryTimedSendConfVo.lobConfVoList.splice(index, 1);
    },
    handleCargoEmailAdd(index) {
      this.form.cargoQueryTimedSendConfVo.lobConfVoList[
        index
      ].emailBoxList.push({ email: "" });
    },
    handleCargoEmailDecr(index, idx) {
      this.form.cargoQueryTimedSendConfVo.lobConfVoList[
        index
      ].emailBoxList.splice(idx, 1);
    },
    handleVcEmailAdd() {
      this.form.vcNotifyConfigVo.vcNotifyEmailList.push({ email: "" });
    },
    handleVcEmailDecr(index) {
      this.form.vcNotifyConfigVo.vcNotifyEmailList.splice(index, 1);
    },
    handleOpenClick(id) {
      if (this.openIds.includes(id)) {
        this.openIds = this.openIds.filter((item) => item !== id);
      } else {
        this.openIds.push(id);
      }
    },
    handleAutoOpenClick(id) {
      if (this.autoOpenIds.includes(id)) {
        this.autoOpenIds = this.autoOpenIds.filter((item) => item !== id);
      } else {
        this.autoOpenIds.push(id);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.form-title {
  font-size: 16px;
  font-weight: bold;
  margin: 30px 0 20px;
}
.openBtn {
  font-weight: bold;
  padding: 5px;
  margin-left: 10px;
  cursor: pointer;
}
.closeContain {
  height: 0;
  overflow: hidden;
}
</style>
