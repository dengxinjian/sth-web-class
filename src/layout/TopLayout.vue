<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />

    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <top-navbar />
    </div>

    <!-- 顶部菜单栏 -->
    <!-- <div class="top-menu-container">
      <top-menu />
    </div> -->

    <!-- 主内容区域 -->
    <div class="main-container">
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script>
import RightPanel from "@/components/RightPanel";
import { AppMain, Settings } from "./components";
import TopNavbar from "./components/TopNavbar.vue";
import TopMenu from "./components/TopMenu.vue";
import ResizeMixin from "./mixin/ResizeHandler";
import { mapState } from "vuex";

export default {
  name: "TopLayout",
  inject: ["reload"],
  components: {
    AppMain,
    RightPanel,
    Settings,
    TopNavbar,
    TopMenu,
  },
  mixins: [ResizeMixin],
  data() {
    return {};
  },
  computed: {
    ...mapState({
      sidebar: (state) => state.app.sidebar,
      device: (state) => state.app.device,
      showSettings: (state) => state.settings.showSettings,
      needTagsView: (state) => state.settings.tagsView,
      fixedHeader: (state) => state.settings.fixedHeader,
      userType: (state) => state.userInfo.userType,
      shopName: (state) => state.userInfo.shopName,
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === "mobile",
      };
    },
  },
  created() {},
  methods: {
    handleClickOutside() {
      this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 50px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.top-menu-container {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  z-index: 999;
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.main-container {
  margin-top: 50px; /* 50px navbar + 50px menu */
  margin-left: 0 !important;
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.mobile {
  .top-navbar,
  .top-menu-container {
    position: relative;
  }

  .main-container {
    margin-top: 0;
  }
}
</style>
