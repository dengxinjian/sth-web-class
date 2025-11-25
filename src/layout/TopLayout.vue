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
      <!-- 左侧菜单（el-menu导航菜单） -->
      <!-- <div v-if="showLeftMenu" class="left-menu-container">
        <left-menu v-model="activeMenuType" @change="handleMenuChange" />
      </div> -->

      <!-- 主内容区 -->
      <div class="content-wrapper">
        <app-main />
          <right-panel v-if="showSettings">
          <settings />
        </right-panel>
      </div>
    </div>
  </div>
</template>

<script>
import RightPanel from "@/components/RightPanel";
import { AppMain, Settings } from "./components";
import TopNavbar from "./components/TopNavbar.vue";
import TopMenu from "./components/TopMenu.vue";
import LeftMenu from "@/views/classManagement/components/LeftMenu.vue";
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
    LeftMenu,
  },
  mixins: [ResizeMixin],
  data() {
    return {
      activeMenuType: "class", // 默认选中课程
    };
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
    // 根据路由判断是否显示左侧菜单
    showLeftMenu() {
      // 可以在需要显示菜单的路由中添加 meta.showLeftMenu 标识
      // 或者根据路由路径判断
      const routesWithMenu = ["/timeTable", "/classManagement", "/athletic"];
      return routesWithMenu.some((route) => this.$route.path.startsWith(route));
    },
  },
  watch: {
    // 监听路由变化，同步菜单状态
    $route: {
      handler(to) {
        // this.syncMenuFromRoute(to);
      },
      immediate: true,
    },
  },
  created() {},
  methods: {
    handleClickOutside() {
      this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    },
    /**
     * 根据路由同步菜单状态
     */
    syncMenuFromRoute(route) {
      const path = route.path;
      // 根据路由路径设置菜单项
      if (path.includes("/athletic") || path.endsWith("/athletic")) {
        this.activeMenuType = "athletic";
      } else if (path.includes("/class") || path.endsWith("/class")) {
        this.activeMenuType = "class";
      } else if (path.includes("/timeTable")) {
        // 如果是 /timeTable 但没有指定具体路径，默认根据路由重定向判断
        // 默认重定向到 /timeTable/athletic，所以默认选中运动员
        this.activeMenuType = "athletic";
      }
    },
    handleMenuChange(type) {
      // 先更新菜单状态
      this.activeMenuType = type;
      // 触发菜单切换事件
      this.$emit("menu-change", type);

      // 获取目标路由
      const targetPath = `/timeTable/${type}`;

      // 如果当前路由和目标路由相同，不进行跳转
      if (this.$route.path === targetPath) {
        return;
      }

      // 路由跳转，使用安全的错误处理
      if (this.$router) {
        const pushResult = this.$router.push(targetPath);
        if (pushResult && typeof pushResult.catch === "function") {
          pushResult.catch(() => {});
        }
      }
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
  margin-top: 50px; /* 顶部导航栏高度 */
  margin-left: 0 !important;
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

.left-menu-container {
  flex: 0 0 68px;
  width: 68px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.mobile {
  .top-navbar,
  .top-menu-container {
    position: relative;
  }

  .main-container {
    margin-top: 0;
  }

  .left-menu-container {
    position: fixed;
    left: 0;
    top: 50px;
    bottom: 0;
    z-index: 998;
    transform: translateX(-100%);
    transition: transform 0.3s;

    &.open {
      transform: translateX(0);
    }
  }
}
</style>
