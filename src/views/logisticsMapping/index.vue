<template>
  <div class="container">
    <el-card>
      <el-form :inline="true" :model="searchForm" ref="searchForm2">
        <el-row :gutter="12">
          <el-col :xl="5" :md="8">
            <el-form-item label="运输方式" prop="typeOfShipping">
              <el-select v-model="searchForm.typeOfShipping">
                <el-option key="empty" value="" label="全部"></el-option>
                <el-option
                  v-for="item in shippingList"
                  :value="item.value"
                  :key="item.value"
                  :label="item.code"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xl="5" :md="8">
            <el-form-item label="途径" prop="pathWay" label-width="auto">
              <el-input
                v-model="searchForm.pathWay"
                :maxlength="50"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :md="4">
            <el-form-item>
              <el-button type="primary" @click="onSubmit" round>查询</el-button>
              <el-button type="default" @click="reset" round>重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="top-btn">
        <el-button
          type="primary"
          v-permission="['logistics-mapping-insert']"
          @click="addUser"
          round
        >
          新增</el-button
        >

        <el-button
          type="primary"
          round
          :loading="loading"
          v-permission="['logistics-mapping-tempalte']"
          @click="downTemplate"
        >
          模板下载
        </el-button>

        <el-upload
          action
          accept=".xls, .xlsx"
          :show-file-list="false"
          :http-request="importFile"
          v-permission="['logistics-mapping-upload']"
        >
          <el-button round type="primary">数据导入</el-button>
        </el-upload>
        <el-button
          type="primary"
          round
          :loading="loadingData"
          v-permission="['logistics-mapping-download']"
          @click="downData"
        >
          数据下载
        </el-button>
      </div>
      <Table
        :data="tableData"
        :columns="columns"
        :getList="getList"
        :total="total"
        :pagination="pagination"
      >
        <template v-slot:action="{ row }">
          <el-button
            type="text"
            v-permission="['logistics-mapping-update']"
            @click="clickAcion('edit', row)"
            >编辑</el-button
          >
          <el-button
            type="text"
            v-permission="['logistics-mapping-remove']"
            @click="clickAcion('delete', row)"
            >删除</el-button
          >
        </template>
      </Table>
    </el-card>
    <el-dialog
      :title="isEditUser ? '编辑' : '新增'"
      :visible.sync="orderFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="orderForm"
        ref="orderForm2"
        label-width="140px"
        :rules="rules"
        :key="nowTime"
      >
        <el-form-item label="途径" prop="pathwayBeginLocation">
          <el-input
            v-model="orderForm.pathwayBeginLocation"
            :maxLength="50"
            placeholder="请输入"
            style="width: 40%"
          ></el-input>
          <span style="padding: 0 15px">-</span>
          <el-input
            v-model="orderForm.pathwayEndLocation"
            :maxLength="50"
            placeholder="请输入"
            style="width: 40%"
          ></el-input>
        </el-form-item>
        <el-form-item label="运输方式" prop="typeOfShipping">
          <el-select v-model="orderForm.typeOfShipping">
            <el-option
              v-for="item in shippingList"
              :value="item.value"
              :key="item.value"
              :label="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="入仓时效标准" prop="warehousingStandardTime">
          <el-input
            v-model="orderForm.warehousingStandardTime"
            :maxlength="20"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="干线时效标准" prop="groundLineStandardTime">
          <el-input
            v-model="orderForm.groundLineStandardTime"
            :maxlength="20"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="京东公路" prop="jdHighwayTime">
          <el-input
            v-model="orderForm.jdHighwayTime"
            :maxlength="20"
            placeholder="请输入"
          ></el-input>
        </el-form-item>
        <el-form-item label="iPhone重点路线" prop="iphoneKeyNoteRoute">
          <el-radio-group v-model="orderForm.iphoneKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="iPad重点路线" prop="ipadKeyNoteRoute">
          <el-radio-group v-model="orderForm.ipadKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="CPU重点路线" prop="cpuKeyNoteRoute">
          <el-radio-group v-model="orderForm.cpuKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Watch重点路线" prop="watchKeyNoteRoute">
          <el-radio-group v-model="orderForm.watchKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="AirPods重点路线" prop="airPodsKeyNoteRoute">
          <el-radio-group v-model="orderForm.airPodsKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="配件重点路线" prop="fittingKeyNoteRoute">
          <el-radio-group v-model="orderForm.fittingKeyNoteRoute">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <div class="user-btn">
          <el-button
            @click="coloseorderForm"
            class="user-btn-cancel"
            type="default"
            round
            >取消</el-button
          >
          <el-button
            @click="saveUser"
            type="primary"
            :loading="saveLoading"
            class="user-btn-save"
            round
            >保存</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Table from "@/components/customTable/index.vue";
import Button from "@/components/customBtn";
import { mapState } from "vuex";
import { getData, submitData } from "@/api/common";
import { downloadFile } from "@/utils";

const column = [
  {
    label: "途径",
    prop: "pathway",
  },
  {
    label: "运输方式",
    prop: "displayTypeOfShipping",
  },
  {
    label: "入仓时效标准（天）",
    prop: "warehousingStandardTime",
  },
  {
    label: "干线时效标准（天）",
    prop: "groundLineStandardTime",
  },
  {
    label: "京东公路（天）",
    prop: "jdHighwayTime",
  },
  {
    label: "iPhone重点路线",
    prop: "iphoneKeyNoteRoute",
  },
  {
    label: "iPad重点路线",
    prop: "ipadKeyNoteRoute",
  },
  {
    label: "CPU重点路线",
    prop: "cpuKeyNoteRoute",
  },
  {
    label: "Watch重点路线",
    prop: "watchKeyNoteRoute",
  },
  {
    label: "AirPods重点路线",
    prop: "airPodsKeyNoteRoute",
  },
  {
    label: "配件重点路线",
    prop: "fittingKeyNoteRoute",
  },
  {
    label: "操作",
    slot: "action",
    width: "140",
  },
];
export default {
  components: {
    Table,
    Button,
  },
  data() {
    return {
      loadingData: false,
      loading: false,
      searchForm: {
        typeOfShipping: "",
        pathWay: "",
      },
      orderForm: {
        pathwayBeginLocation: "",
        pathwayEndLocation: "",
        typeOfShipping: "",
        warehousingStandardTime: "",
        groundLineStandardTime: "",
        jdHighwayTime: "",
        iphoneKeyNoteRoute: "0",
        ipadKeyNoteRoute: "0",
        cpuKeyNoteRoute: "0",
        watchKeyNoteRoute: "0",
        airPodsKeyNoteRoute: "0",
        fittingKeyNoteRoute: "0",
      },
      tableData: [],
      total: 1,
      pagination: {
        page: 1,
        limit: 10,
      },
      columns: [...column],
      saveLoading: false,
      orderFormVisible: false, // 新增用户
      roleVisible: false, // 角色
      rules: {
        typeOfShipping: [
          {
            required: true,
            message: "请输入",
          },
        ],
        pathwayBeginLocation: [
          {
            required: true,
            message: "请输入",
          },
        ],
        pathwayEndLocation: [
          {
            required: true,
            message: "请输入",
          },
        ],
        warehousingStandardTime: [
          {
            required: true,
            message: "请输入大于或等于0且不超过5位的整数",
            pattern: /^(0|[1-9]\d{0,4})$/,
          },
        ],
        groundLineStandardTime: [
          {
            required: true,
            message: "请输入大于或等于0且不超过5位的整数",
            pattern: /^(0|[1-9]\d{0,4})$/,
          },
        ],
        jdHighwayTime: [
          {
            required: true,
            message: "请输入大于或等于0且不超过5位的整数",
            pattern: /^(0|[1-9]\d{0,4})$/,
          },
        ],
        iphoneKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
        ipadKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
        cpuKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
        watchKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
        airPodsKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
        fittingKeyNoteRoute: [
          {
            required: true,
            message: "请选择",
          },
        ],
      },
      currentItem: {},
      roleOptioins: [],
      isEditUser: false, // 是否编辑用户
      disOptions: [],
      disOptions2: [],
      nowTime: Date.now(),
      shippingList: [],
    };
  },

  mounted() {
    this.getTypeOfShipping();
    this.getList();
  },
  methods: {
    getList(payload) {
      const { page: current, limit: size } = this.pagination;
      // const { userId } = this.userInfo;
      let obj = {
        current,
        size,
        ...this.searchForm,
        url: "/logisticsAging/getMappingPage",
      };
      if (payload) obj = { ...obj, ...payload };
      getData(obj).then((res) => {
        const { records, total, current, size: limit } = res.result;
        this.tableData = records;
        this.total = total;
        this.pagination.page = current;
        this.pagination.limit = limit;
      });
    },
    getTypeOfShipping() {
      getData({ url: "/logisticsAging/getMappingComBox" }).then((res) => {
        this.shippingList = res.result;
      });
    },
    clickAcion(type, row) {
      switch (type) {
        case "edit":
          this.orderFormVisible = true;
          this.editUser(row);
          break;
        case "delete":
          this.delete(row);
          break;
        case "role":
          this.roleVisible = true;
          this.role(row);
          break;

        default:
      }
    },
    coloseorderForm() {
      this.orderForm = {
        pathwayBeginLocation: "",
        pathwayEndLocation: "",
        typeOfShipping: "",
        warehousingStandardTime: "",
        groundLineStandardTime: "",
        jdHighwayTime: "",
        iphoneKeyNoteRoute: "0",
        ipadKeyNoteRoute: "0",
        cpuKeyNoteRoute: "0",
        watchKeyNoteRoute: "0",
        airPodsKeyNoteRoute: "0",
        fittingKeyNoteRoute: "0",
      };
      this.nowTime = Date.now();
      this.orderFormVisible = false;
    },
    addUser() {
      this.orderFormVisible = true;
      this.$nextTick(() => {
        this.isEditUser = false;
        this.orderForm = {
          pathwayBeginLocation: "",
          pathwayEndLocation: "",
          typeOfShipping: "",
          warehousingStandardTime: "",
          groundLineStandardTime: "",
          jdHighwayTime: "",
          iphoneKeyNoteRoute: "0",
          ipadKeyNoteRoute: "0",
          cpuKeyNoteRoute: "0",
          watchKeyNoteRoute: "0",
          airPodsKeyNoteRoute: "0",
          fittingKeyNoteRoute: "0",
        };
        this.nowTime = Date.now();
      });
    },

    saveUser() {
      if (this.saveLoading) return;
      this.$refs.orderForm2.validate((valid) => {
        if (valid) {
          this.saveLoading = true;
          let obj = {
            url: "/logisticsAging/insertMapping",
            ...this.orderForm,
          };
          if (this.isEditUser) {
            obj = {
              url: "/logisticsAging/updateMapping",
              ...this.orderForm,
              id: this.currentItem.id,
            };
          }
          submitData(obj)
            .then(async (res) => {
              this.orderFormVisible = false;
              this.saveLoading = false;
              if (this.isEditUser) {
                this.$message.success("物流映射编辑成功");
              } else {
                this.$message.success("物流映射新建成功");
              }
              this.isEditUser = false;

              this.getList();
            })
            .catch(() => {
              this.saveLoading = false;
            });
        }
      });
    },
    editUser(row) {
      this.isEditUser = true;
      this.currentItem = row;
      const {
        pathwayBeginLocation,
        pathwayEndLocation,
        typeOfShipping,
        warehousingStandardTime,
        groundLineStandardTime,
        jdHighwayTime,
        iphoneKeyNoteRoute,
        ipadKeyNoteRoute,
        cpuKeyNoteRoute,
        watchKeyNoteRoute,
        airPodsKeyNoteRoute,
        fittingKeyNoteRoute,
      } = row;
      this.orderForm = {
        pathwayBeginLocation,
        pathwayEndLocation,
        typeOfShipping,
        warehousingStandardTime,
        groundLineStandardTime,
        jdHighwayTime,
        iphoneKeyNoteRoute: iphoneKeyNoteRoute === "是" ? "1" : "0",
        ipadKeyNoteRoute: ipadKeyNoteRoute === "是" ? "1" : "0",
        cpuKeyNoteRoute: cpuKeyNoteRoute === "是" ? "1" : "0",
        watchKeyNoteRoute: watchKeyNoteRoute === "是" ? "1" : "0",
        airPodsKeyNoteRoute: airPodsKeyNoteRoute === "是" ? "1" : "0",
        fittingKeyNoteRoute: fittingKeyNoteRoute === "是" ? "1" : "0",
      };
    },
    delete(row) {
      const self = this;
      this.$confirm("确定要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: (action) => {
          if (action !== "confirm") return;
          submitData({
            url: `/logisticsAging/deleteMapping?id=${row.id}`,
          }).then((res) => {
            self.$message.success("删除成功");
            self.getList();
          });
        },
      });
    },
    onSubmit() {
      this.pagination = {
        page: 1,
        limit: 10,
      };
      this.getList();
    },
    reset() {
      this.searchForm = {
        typeOfShipping: "",
        pathWay: "",
      };
      this.pagination = {
        page: 1,
        limit: 10,
      };
      this.getList();
    },
    async downTemplate() {
      const res = await getData({
        url: "/logisticsAging/downloadTemplate",
        responseType: "blob",
      });
      downloadFile(res);
    },
    importFile(file) {
      const formData = new FormData();
      formData.append("file", file.file);
      submitData({
        url: "/logisticsAging/importMappingExcel",
        requestData: formData,
      }).then((res) => {
        this.$message.success("数据导入成功");
        this.reset();
      });
    },
    async downData() {
      if (this.loadingData) return;
      this.loadingData = true;
      const res = await getData({
        url: "/logisticsAging/downloadMapping",
        responseType: "blob",
        ...this.listQuery,
        ...this.searchForm,
      }).finally(() => {
        this.loadingData = false;
      });
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
</style>
