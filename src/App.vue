<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
    <GlobalVipHost />

    <el-dialog
      :visible="maintenance.visible"
      width="420px"
      top="20vh"
      :append-to-body="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :lock-scroll="true"
      custom-class="system-maintenance-dialog"
      @close="noop"
    >
      <div class="system-maintenance-body">
        <i class="el-icon-loading system-maintenance-icon" />
        <div class="system-maintenance-title">系统升级中</div>
        <div class="system-maintenance-desc">
          {{ maintenance.message || "系统升级中，请稍后再试" }}
        </div>
      </div>
    </el-dialog>
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
  computed: {
    maintenance() {
      return this.$store.getters.maintenance || { visible: false, message: "" };
    },
  },
  created() {
  },
  methods: {
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function () {
        this.isRouterAlive = true;
      });
    },
    noop() {},
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
.maintenance-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  background: rgba(255, 255, 255, 0.95);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10000;
}

.system-maintenance-dialog {
  .el-dialog__header {
    padding-bottom: 0;
  }
  .el-dialog__body {
    padding: 18px 25px 22px;
  }
}

.system-maintenance-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.system-maintenance-icon {
  font-size: 28px;
  color: #f92b30;
  margin-bottom: 10px;
}
.system-maintenance-title {
  font-family: PingFang SC;
  font-weight: 600;
  font-size: 16px;
  color: #111;
  margin-bottom: 6px;
}
.system-maintenance-desc {
  font-family: PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #666;
  line-height: 20px;
}
</style>
