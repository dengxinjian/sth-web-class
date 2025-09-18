<template>
  <div class="top-menu">
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="horizontal"
        class="horizontal-menu"
      >
        <top-menu-item
          v-for="route in permission_routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import TopMenuItem from "./TopMenuItem.vue";
import variables from "@/styles/variables.scss";

export default {
  name: "TopMenu",
  components: { TopMenuItem },
  computed: {
    ...mapGetters(["permission_routes", "sidebar"]),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    variables() {
      return variables;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.top-menu {
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;

  .horizontal-menu {
    border: none;
    height: 50px;
    line-height: 50px;

    .el-menu-item {
      height: 50px;
      line-height: 50px;
      padding: 0 20px;
      border-bottom: 2px solid transparent;

      &:hover {
        background-color: #f5f7fa;
        border-bottom-color: #409eff;
      }

      &.is-active {
        background-color: #ecf5ff;
        border-bottom-color: #409eff;
        color: #409eff;
      }
    }

    .el-submenu {
      height: 50px;
      line-height: 50px;

      .el-submenu__title {
        height: 50px;
        line-height: 50px;
        padding: 0 20px;
        border-bottom: 2px solid transparent;

        &:hover {
          background-color: #f5f7fa;
          border-bottom-color: #409eff;
        }
      }

      &.is-active .el-submenu__title {
        background-color: #ecf5ff;
        border-bottom-color: #409eff;
        color: #409eff;
      }
    }
  }

  .scrollbar-wrapper {
    overflow-x: auto;
    overflow-y: hidden;
  }
}

// 下拉菜单样式调整
:deep(.el-menu--horizontal .el-menu--popup) {
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    padding: 0 20px;
    border-bottom: none;

    &:hover {
      background-color: #f5f7fa;
      border-bottom: none;
    }

    &.is-active {
      background-color: #ecf5ff;
      border-bottom: none;
      color: #409eff;
    }
  }
}
</style>
