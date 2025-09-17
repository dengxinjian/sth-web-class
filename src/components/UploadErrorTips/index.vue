<template>
  <div>
    <el-dialog title="上传失败" :visible.sync="errVisible" width="800px">
      <div>
        <el-button round type="primary" @click="exportData" :loading="loading"
          >错误文件下载</el-button
        >
      </div>
      <el-table :data="errInfo" max-height="400">
        <el-table-column prop="row" label="问题行数"> </el-table-column>
        <el-table-column prop="field" label="问题字段"> </el-table-column>
        <el-table-column prop="cause" label="失败原因"> </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { exportExal } from "@/utils/request";

export default {
  props: {
    errInfo: {
      type: Array,
      default: () => [],
    },
    link: {
      type: String,
      default: () => "",
    },
  },
  data() {
    return {
      errVisible: false,
      loading: false,
    };
  },
  watch: {
    errInfo: {
      deep: true,
      handler(val) {
        this.errVisible = true;
      },
    },
  },
  methods: {
    async exportData() {
      if (this.loading) return;
      this.loading = true;
      await exportExal(this.link, {}, "数据错误源文件", (data) => {
        this.$message.error(data.message || "导出失败");
        this.loading = false;
      });
      this.loading = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
