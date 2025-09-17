<!-- eslint-disable vue/html-self-closing -->
<template>
  <div>
    <el-form :inline="true" :model="form" ref="searchForm">
      <el-row :gutter="12">
        <el-col :xl="5" :md="8">
          <el-form-item label="品类" prop="lobList">
            <el-select v-model="form.lobList" @change="lobChange" multiple>
              <!-- <el-option key="empty" label="全部" value=""></el-option> -->
              <el-option
                v-for="item in lobOptions"
                :key="item.value"
                :label="item.code"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="运输方式" prop="typeOfShipping">
            <el-select v-model="form.typeOfShipping">
              <el-option key="empty2" label="全部" value=""></el-option>
              <el-option
                v-for="item in shippingList"
                :key="item.value"
                :label="item.code"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="干线是否准时" prop="groundLineOnTime">
            <el-select v-model="form.groundLineOnTime">
              <el-option label="全部" value=""></el-option>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="入仓是否准时" prop="warehousingOnTime">
            <el-select v-model="form.warehousingOnTime">
              <el-option label="全部" value=""></el-option>
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="途径" prop="pathWayList">
            <el-select v-model="form.pathWayList" multiple>
              <el-option label="全部" key="empty3" value=""></el-option>
              <el-option
                v-for="item in pathWayList"
                :label="item.code"
                :key="item.value"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="交货单号" prop="deliveryOrderNumber">
            <el-input v-model="form.deliveryOrderNumber"> </el-input>
          </el-form-item>
        </el-col>

        <el-col :xl="5" :md="8">
          <el-form-item label="物料编码" prop="productCode">
            <el-input v-model="form.productCode"> </el-input>
          </el-form-item>
        </el-col>

        <el-col :xl="7" :md="12">
          <el-form-item label="交货单创建时间" prop="deliveryTime">
            <el-date-picker
              type="daterange"
              v-model="form.deliveryTime"
              :clearable="true"
              :editable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :xl="7" :md="12">
          <el-form-item label="发货时间" prop="sendTime">
            <el-date-picker
              type="daterange"
              v-model="form.sendTime"
              :clearable="true"
              :editable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :xl="7" :md="12">
          <el-form-item label="预约时间" prop="dateTime">
            <el-date-picker
              type="daterange"
              v-model="form.dateTime"
              :editable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :xl="7" :md="12">
          <el-form-item label="VC签收时间" prop="vcSignTime">
            <el-date-picker
              type="daterange"
              v-model="form.vcSignTime"
              :editable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :xl="7" :md="12">
          <el-form-item label="中转签收时间" prop="transferSignTime">
            <el-date-picker
              type="daterange"
              v-model="form.transferSignTime"
              :editable="false"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :md="4">
          <el-form-item>
            <div class="search-btn">
              <Button label="查询" @click="onSubmit" className="btn1"></Button>
              <Button
                label="重置"
                @click="reset"
                :isSearch="false"
                className="btn"
              ></Button>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="top-btn">
      <el-button
        type="primary"
        round
        :loading="loading"
        v-permission="['logistics-aging-search-download']"
        @click="downTemplate"
      >
        数据下载
      </el-button>
      <!-- <el-button
        type="primary"
        round
        :loading="totalLoading"
        @click="downTotal"
      >
        汇总导出
      </el-button> -->
    </div>
    <!-- 列表 -->
    <el-table :data="tableData">
      <el-table-column
        prop="purchaseOrderLineItem"
        width="120"
        label="行项目号"
      />
      <el-table-column
        prop="deliveryOrderNumber"
        width="120"
        label="交货单号"
      />
      <el-table-column
        prop="deliveryCreateTime"
        width="160"
        label="交货单创建时间"
      />
      <el-table-column
        prop="displayEighteenClockPoint"
        width="100"
        label="18点前/后"
      />
      <el-table-column
        prop="jdPoNumber"
        width="150"
        label="PO号/移动来源单号"
      />
      <el-table-column prop="shippingDate" width="160" label="发货时间" />
      <el-table-column prop="addressee" label="签收人" />
      <el-table-column prop="lob" label="品类" />
      <el-table-column prop="productCode" width="120" label="物料编码" />
      <el-table-column prop="productName" width="180" label="物料名称" />
      <el-table-column prop="productCodeCount" label="物料数量" />
      <el-table-column prop="appointmentTime" width="160" label="预约时间" />
      <el-table-column prop="storageTime" width="160" label="VC签收时间" />
      <el-table-column prop="originCity" label="始发城市" />
      <el-table-column prop="destinationCity" label="目的城市" />
      <el-table-column
        prop="insideOrOutsidePort"
        width="120"
        label="市内外埠"
      />
      <el-table-column prop="shipToParty" width="120" label="送达方" />
      <el-table-column prop="pathway" width="100" label="途径" />
      <el-table-column prop="transferDate" width="160" label="中转签收日期" />
      <el-table-column prop="typeOfShipping" label="运输方式" />
      <el-table-column
        prop="firstSignTime"
        width="160"
        label="第一段签收时间"
      />
      <el-table-column
        prop="secondSignTime"
        width="160"
        label="第二段签收时间"
      />
      <el-table-column
        prop="thirdSignTime"
        width="160"
        label="第三段签收时间"
      />
      <el-table-column
        prop="fourthSignTime"
        width="160"
        label="第四段签收时间"
      />
      <el-table-column prop="groundLineTime" label="干线用时" />
      <el-table-column
        prop="groundLineStandardTime"
        width="120"
        label="干线标准时效"
      />
      <el-table-column
        prop="displayGroundLineOnTime"
        width="120"
        label="干线是否准时"
      />
      <el-table-column prop="warehousingTime" label="入仓用时" />
      <el-table-column
        prop="warehousingStandardTime"
        width="120"
        label="入仓标准时效"
      />
      <el-table-column
        prop="displayWarehousingOnTime"
        width="120"
        label="入仓是否准时"
      />
      <el-table-column prop="displayExceptionReason" label="异常原因" />
      <el-table-column prop="overdueDuration" label="超期时长" />
      <el-table-column
        prop="displayKeyNoteRoute"
        width="140"
        label="重点路线（是/否）"
      />
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />
  </div>
</template>
<script>
import Pagination from "@/components/Pagination";
import Button from "@/components/customBtn";
import { submitData, getData } from "@/api/common";
import { downloadFile } from "@/utils";

export default {
  name: "BasicData",
  components: { Button, Pagination },
  data() {
    return {
      loading: false,
      form: {
        lobList: [],
        pathWayList: [],
        typeOfShipping: "",
        groundLineOnTime: "",
        warehousingOnTime: "",
        deliveryOrderNumber: "",
        productCode: "",
        deliveryTime: "",
        sendTime: "",
        dateTime: "",
        vcSignTime: "",
        transferSignTime: "",
      },
      downloadForm: {
        lobList: [],
        pathWayList: [],
        typeOfShipping: "",
        groundLineOnTime: "",
        warehousingOnTime: "",
        deliveryOrderNumber: "",
        productCode: "",
        deliveryTime: "",
        sendTime: "",
        dateTime: "",
        vcSignTime: "",
        transferSignTime: "",
      },
      tableData: [],
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
      },
      delloading: false,
      lobOptions: [],
      onTimeList: [],
      pathWayList: [],
      shippingList: [],
      totalLoading: false,
    };
  },
  mounted() {
    this.getList();
    this.getLobList();
  },
  methods: {
    getList() {
      const {
        lobList,
        pathWayList,
        typeOfShipping,
        groundLineOnTime,
        warehousingOnTime,
        deliveryOrderNumber,
        productCode,
        deliveryTime,
        sendTime,
        dateTime,
        vcSignTime,
        transferSignTime,
      } = this.form;
      const obj = {
        url: "/logisticsAging/getPage",
        ...this.listQuery,
        lobList,
        pathWayList,
        typeOfShipping,
        groundLineOnTime,
        warehousingOnTime,
        deliveryOrderNumber,
        productCode,
        deliveryCreateTimeBegin: deliveryTime ? deliveryTime[0] : "",
        deliveryCreateTimeEnd: deliveryTime ? deliveryTime[1] : "",
        shippingDateBegin: sendTime ? sendTime[0] : "",
        shippingDateEnd: sendTime ? sendTime[1] : "",
        appointmentTimeBegin: dateTime ? dateTime[0] : "",
        appointmentTimeEnd: dateTime ? dateTime[1] : "",
        storageTimeBegin: vcSignTime ? vcSignTime[0] : "",
        storageTimeEnd: vcSignTime ? vcSignTime[1] : "",
        transferTimeBegin: transferSignTime ? transferSignTime[0] : "",
        transferTimeEnd: transferSignTime ? transferSignTime[1] : "",
      };
      this.downloadForm = { ...this.form };
      submitData(obj).then((res) => {
        const { records, current, size, total } = res.result;
        this.tableData = records;
        this.listQuery = { current, size };
        this.total = total;
      });
    },
    getLobList() {
      getData({ url: "/logisticsAging/getComboBoxContent" }).then((res) => {
        this.lobOptions = res.result.lob;
        this.onTimeList = res.result.onTime;
        this.pathWayList = res.result.pathWay;
        this.shippingList = res.result.typeOfShipping;
      });
    },

    delete(row) {
      console.log(row);
    },
    onSubmit() {
      this.listQuery.current = 1;
      this.getList();
    },

    reset() {
      this.$refs.searchForm.resetFields();
      this.getList();
    },
    async downTemplate() {
      this.loading = true;
      const {
        lobList,
        pathWayList,
        typeOfShipping,
        groundLineOnTime,
        warehousingOnTime,
        deliveryOrderNumber,
        productCode,
        deliveryTime,
        sendTime,
        dateTime,
        vcSignTime,
        transferSignTime,
      } = this.downloadForm;
      const res = await submitData({
        url: "/logisticsAging/download",
        responseType: "blob",
        lobList,
        pathWayList,
        typeOfShipping,
        groundLineOnTime,
        warehousingOnTime,
        deliveryOrderNumber,
        productCode,
        deliveryCreateTimeBegin: deliveryTime ? deliveryTime[0] : "",
        deliveryCreateTimeEnd: deliveryTime ? deliveryTime[1] : "",
        shippingDateBegin: sendTime ? sendTime[0] : "",
        shippingDateEnd: sendTime ? sendTime[1] : "",
        appointmentTimeBegin: dateTime ? dateTime[0] : "",
        appointmentTimeEnd: dateTime ? dateTime[1] : "",
        storageTimeBegin: vcSignTime ? vcSignTime[0] : "",
        storageTimeEnd: vcSignTime ? vcSignTime[1] : "",
        transferTimeBegin: transferSignTime ? transferSignTime[0] : "",
        transferTimeEnd: transferSignTime ? transferSignTime[1] : "",
      });
      this.loading = false;
      downloadFile(res);
    },
    async downTotal() {
      this.totalLoading = true;
      const { lobList, deliveryTime } = this.downloadForm;
      const res = await submitData({
        url: "/logisticsAging/logisticsAgingSummaryDownload",
        responseType: "blob",
        lobList,
        deliveryCreateTimeBegin: deliveryTime ? deliveryTime[0] : "",
        deliveryCreateTimeEnd: deliveryTime ? deliveryTime[1] : "",
      });
      this.totalLoading = false;
      downloadFile(res);
    },
  },
};
</script>
<style lang="scss" scoped>
.top-btn {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}
.search-btn {
  display: flex;
  .btn1 {
    margin-right: 8px;
  }
}
</style>
