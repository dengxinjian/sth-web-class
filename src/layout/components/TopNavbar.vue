<template>
  <div class="top-navbar">
    <!-- Logo区域 -->
    <div class="logo-container">
      <img :src="logoUrl" alt="Logo" class="logo" />
      <!-- <span class="title">{{ title }}</span> -->
    </div>

    <!-- 面包屑导航 -->
    <!-- <breadcrumb id="breadcrumb-container" class="breadcrumb-container" /> -->
     <div style="flex: 1;"></div>

    <!-- 右侧菜单 -->
    <div class="right-menu">
      <el-divider direction="vertical"></el-divider>
      <span style="display: inline-block" @click="logout">{{
        $t("navbar.logOut")
      }}</span>
      <el-divider direction="vertical"></el-divider>
      <el-dropdown trigger="click" @command="chooseShop" v-if="showShop">
        <div class="avatar-wrapper">
          <span>{{ shopName }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in shopOptions"
            :key="item.value"
            :command="item.value"
            >{{ item.label }}</el-dropdown-item
          >
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import { getData } from "@/api/common";

export default {
  name: "TopNavbar",
  inject: ["reload"],
  components: {
    Breadcrumb,
  },
  data() {
    return {
      title: "强者之心",
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"]),
    ...mapState({
      name: (state) => state.user.name,
      shopOptions: (state) => state.userInfo.shopOptions,
      shopName: (state) => state.userInfo.shopName,
      userType: (state) => state.userInfo.userType,
    }),
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    logoUrl() {
      // 这里可以设置logo图片路径
      return require("@/assets/logo-text.png");
    },
    showShop() {
      return this.shopOptions.length > 0;
    },
  },

  methods: {
    ...mapMutations({
      SET_SHOP_NAME: "userInfo/SET_SHOP_NAME",
      SET_SHOP_OPTIONS: "userInfo/SET_SHOP_OPTIONS",
      SET_SHOP_ID: "userInfo/SET_SHOP_ID",
    }),
    async logout() {
      this.$confirm("确定退出系统吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        callback: async (action, instance) => {
          if (action === "confirm") {
            await this.$store.dispatch("user/logout");
            this.$router.push(`/login`);
          }
        },
      });
    },
    changeIdentify() {
      this.$store.dispatch("user/changeIdentify");
      this.reload();
    },
    chooseShop(e) {
      const name = this.shopOptions.find((item) => item.value === e).label;
      getData({
        url: `/apple-data-center/sys/shop/save/${e}`,
      }).then((res) => {
        this.SET_SHOP_NAME(name);
        this.SET_SHOP_ID(e);
        this.reload();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.top-navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #333 !important;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;

  .logo-container {
    display: flex;
    align-items: center;
    min-width: 200px;

    .logo {
      height: 26px;
      margin-right: 12px;
    }

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }
  }

  .breadcrumb-container {
    flex: 1;
    margin-left: 20px;
  }

  .right-menu {
    display: flex;
    align-items: center;
    height: 100%;
    font-size: 14px;
    cursor: pointer;
    color: #fff;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #fff;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
