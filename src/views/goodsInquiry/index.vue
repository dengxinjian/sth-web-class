<!-- eslint-disable vue/html-self-closing -->
<template>
  <div>
    <el-form :inline="true" :model="form" ref="searchForm">
      <el-row :gutter="12">
        <el-col :md="5">
          <el-form-item label="Lob" prop="lob">
            <el-select v-model="form.lob" @change="lobChange">
              <el-option key="empty" label="全部" value=""></el-option>
              <el-option
                v-for="item in lobOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :md="5">
          <el-form-item label="Sub-Lob" prop="subLob">
            <el-select v-model="form.subLob" filterable>
              <el-option key="empty" label="全部" value=""></el-option>
              <el-option
                v-for="item in subLobOptions"
                :key="item.code"
                :label="item.code"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :md="5">
          <el-form-item label="MPN" prop="mpn">
            <el-input v-model="form.mpn"> </el-input>
          </el-form-item>
        </el-col>

        <el-col :md="5">
          <el-form-item label="数据日期" prop="date">
            <el-datePicker
              v-model="form.date"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
            >
            </el-datePicker>
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
        v-permission="['cargo-state-data-search-download']"
        @click="downTemplate"
      >
        数据下载
      </el-button>

      <el-upload
        action
        accept=".xls, .xlsx"
        :show-file-list="false"
        :http-request="importFile"
        v-permission="['cargo-state-data-search-init-data-upload']"
      >
        <el-button round type="primary">初始值上传</el-button>
      </el-upload>
    </div>
    <!-- 列表 -->
    <el-table :data="tableData">
      <el-table-column prop="lob" label="lob" />
      <el-table-column prop="subLob" label="Sob-Lob" />
      <el-table-column prop="mpn" label="MPN" />
      <el-table-column prop="productName" width="300" label="DC描述" />
      <el-table-column prop="totalOrderQuantity" width="80" label="订单合计" />
      <el-table-column prop="smStorageIn" width="100" label="神码已到仓" />
      <el-table-column prop="jdOrdered" label="JD已下单" />
      <el-table-column prop="jdNotOrdered" label="JD未下单" />
      <el-table-column prop="quantityExpectedDn" label="DN预计到货" />
      <el-table-column prop="quantityExpectedDn1" label="DN+1预计到货" />
      <el-table-column prop="quantityExpectedDn2" label="DN+2预计到货" />
      <el-table-column prop="quantityExpectedDn3" label="DN+3预计到货" />
      <el-table-column prop="alreadyDnNotShipped" label="已DN未发货" />
      <el-table-column prop="notDnNotShipped" label="未DN未发货" />
      <el-table-column prop="quantityOnTheWay" label="纯在途" />
      <el-table-column prop="quantityBeiJing" label="北京" />
      <el-table-column prop="quantityJiNan" label="德州" />
      <!-- <el-table-column prop="quantityZhengZhou" label="郑州" /> -->
      <el-table-column prop="quantityShengYang" label="沈阳" />
      <el-table-column prop="quantityWuHan" label="武汉" />
      <el-table-column prop="quantityXiAn" label="西安" />
      <el-table-column prop="quantityChengDu" label="成都" />
      <el-table-column prop="quantityShangHai" label="上海" />
      <!-- <el-table-column prop="quantityHeFei" label="合肥" /> -->
      <el-table-column prop="quantityGuangZhou" label="广州" />
      <!-- <el-table-column prop="quantityShenZhen" label="深圳" />
      <el-table-column prop="quantityFuZhou" label="福州" /> -->
      <el-table-column prop="quantityTotal" label="总计" />
      <el-table-column prop="quantityDifference" label="差值">
        <template slot-scope="scope">
          <span v-if="scope.row.quantityDifference >= 0">{{
            scope.row.quantityDifference
          }}</span>
          <span v-else style="color: red">{{
            scope.row.quantityDifference
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in columnList"
        :key="item.key"
        :prop="item.value"
        :label="item.key"
        width="140"
      ></el-table-column>
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
        lob: "",
        subLob: "",
        mpn: "",
        date: "",
      },
      downloadForm: {
        lob: "",
        subLob: "",
        mpn: "",
        date: "",
      },
      tableData: [],
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
      },
      delloading: false,
      lobOptions: [],
      subLobOptions: [],
      columnList: [],
    };
  },
  mounted() {
    this.getList();
    this.getLobList();
  },
  methods: {
    getList() {
      const obj = {
        url: "/productStockRecord/getPage",
        ...this.listQuery,
        ...this.form,
      };
      this.downloadForm = { ...this.form };
      getData(obj).then((res) => {
        const { dataList, current, size, total, columnName } = res.result;
        this.tableData = dataList.map((item) => {
          const o = { ...item };
          item.batchScheduleData.forEach((part) => {
            o[part.key] = part.value;
          });
          return o;
        });
        this.columnList = columnName;
        this.listQuery = { current, size };
        this.total = total;
      });
    },
    getLobList() {
      getData({ url: "/productStockRecord/getComBox" }).then((res) => {
        this.lobOptions = res.result.map((item) => {
          return {
            label: item.comBox.code,
            value: item.comBox.value,
            subLob: item.subComBoxList,
          };
        });
      });
    },
    lobChange(param) {
      let flag = true;
      this.lobOptions.forEach((item) => {
        if (item.value === param) {
          flag = false;
          this.form.subLob = "";
          this.subLobOptions = item.subLob;
        }
      });
      if (flag) {
        this.form.subLob = "";
        this.subLobOptions = [];
      }
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
      this.subLobOptions = [];
      this.getList();
    },
    async downTemplate() {
      const res = await getData({
        url: "/productStockRecord/getListToExport",
        responseType: "blob",
        ...this.downloadForm,
      });
      downloadFile(res);
    },
    importFile(file) {
      const formData = new FormData();
      formData.append("multipartFile", file.file);
      submitData({
        url: "/productStockRecord/jdNotOrderedDataImport",
        requestData: formData,
      }).then((res) => {
        this.$message.success("数据上传成功");
        this.form.lob = "";
        this.form.subLob = "";
        this.getList();
        this.getLobList();
      });
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
