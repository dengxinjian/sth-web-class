<!-- eslint-disable vue/html-self-closing -->
<template>
  <div>
    <el-card>
      <el-form v-if="'search' in $slots" :inline="true">
        <slot name="search"></slot>
        <el-form-item>
          <el-button round type="primary" @click="search(1)">查询</el-button>
          <el-button round @click="search(0)">重置</el-button>
        </el-form-item>
      </el-form>

      <slot name="operation"></slot>

      <el-table default-expand-all v-loading="loading" :data="tableList" style="width: 100%; margin-top: 10px">
        <slot name="table"></slot>
      </el-table>
      <div v-if="showPage && 'table' in $slots" class="page">
        <el-pagination background :current-page="pageObj.pageNum" :page-sizes="[10, 30, 50, 100]"
          :page-size="pageObj.limit" layout="total, sizes, prev, pager, next, jumper" :total="pageObj.total"
          @size-change="handleSizeChange" @current-change="handleCurrentChange">
        </el-pagination>
      </div>
      <slot name="dialog"></slot>
    </el-card>
  </div>
</template>
<script>
export default {
  name: "ProContent",
  props: {
    // 搜索数据
    searchData: {
      type: Object,
      default: () => { },
    },
    getList: {
      type: Function,
      default: () => { },
    },
    dataChange: {
      type: Function,
      default: (data) => data,
    },
    ifMounted: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      loading: false,
      pageObj: {
        pageNum: 1,
        limit: 10,
        total: 0,
      },
      tableList: [],
      showPage: true,
    };
  },
  mounted() {
    this.preSearch = Object.freeze({ ...this.searchData });
    if (!this.ifMounted) return;
    this.getTableList();
  },
  methods: {
    async getTableList(values = {}) {
      if (this.loading) return;
      this.loading = true;
      const params = {
        ...this.searchData,
        ...this.pageObj,
        ...values,
      };
      const { success, message, result } = await this.getList(params).catch(
        () => {
          this.loading = false;
        }
      );
      this.loading = false;
      if (!success) {
        return this.$message({
          message,
          type: "warning",
        });
      }
      const { current, size, total } = result?.pageInfo ?? {};
      let data;
      if (Array.isArray(result)) {
        data = [...result];
      } else {
        data = (result?.records ?? []).map((item, index) => ({
          ...item,
          index: (current - 1) * size + index + 1,
        }));
        // current
        // debugger
        // console.log(current * size)
      }
      this.pageObj.total = total;
      if (total === undefined) this.showPage = false;
      this.tableList = [...data];
      const resultData = this?.dataChange?.([...data]);
      if (Array.isArray(resultData)) this.tableList = [...resultData];
    },
    handleSizeChange(limit) {
      this.pageObj.limit = limit;
      this.getTableList();
    },
    handleCurrentChange(pageNum) {
      this.pageObj.pageNum = pageNum;
      this.getTableList();
    },
    search(type) {
      if (type === 1) {
        this.pageObj.pageNum = 1
        this.$emit("search");
        this.getTableList({ pageNum: 1 });
      } else {
        this.pageObj = {
          pageNum: 1,
          limit: 10,
          total: 0,
        }
        this.$emit("reset", this.preSearch);
        this.getTableList(this.preSearch);
      }
    },
    refresh() {
      this.getTableList();
    },
  },
};
</script>
<style scoped lang="scss">
.page {
  margin-top: 10px;
  text-align: right;
}
</style>
