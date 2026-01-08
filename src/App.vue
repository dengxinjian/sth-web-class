<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
export default {
  name: "App",
  provide() {
    return {
      reload: this.reload,
    };
  },
  data() {
    return {
      isRouterAlive: true,
    };
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function () {
        this.isRouterAlive = true;
      });
    },
  },
};
</script>

<style lang="scss">
.el-dialog {
  border-radius: 12px;
}
.el-dialog__body {
  padding-top: 0px;
}
.el-dialog__header {
  // padding-top: 25px;
  padding: 25px;
  padding-bottom: 10px;
}
.el-button--primary {
  background: #f92b30;
  border: none;
  border-radius: 6px;
  font-family: PingFang SC;
  font-weight: 500;
  font-style: Medium;
  font-size: 13px;
  color: #fff;
}
.el-dialog__header {
  span {
    font-family: PingFang SC;
    font-weight: 600;
    font-style: Semibold;
    font-size: 16px;
  }
}
.el-dialog__footer {
  border-top: 1px solid #e5e5e5;
  padding-bottom: 10px;
  .el-button {
    min-width: 102px;
    border-radius: 5px;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    font-size: 12px;
    padding: 0px;
    height: 32px;
  }
}
</style>
