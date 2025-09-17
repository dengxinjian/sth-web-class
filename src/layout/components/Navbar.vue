<template>
  <div class="navbar">
    <hamburger
      id="hamburger-container"
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <!-- <span>{{ name }}</span> <el-divider direction="vertical"></el-divider>
      <span @click="changeIdentify"> 身份切换</span> -->
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
import Hamburger from "@/components/Hamburger";
import ErrorLog from "@/components/ErrorLog";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import LangSelect from "@/components/LangSelect";
import Search from "@/components/HeaderSearch";
import { getData } from "@/api/common";

export default {
  inject: ["reload"],

  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    Screenfull,
    SizeSelect,
    LangSelect,
    Search,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"]),
    ...mapState({
      name: (state) => state.user.name,
      shopOptions: (state) => state.userInfo.shopOptions,
      shopName: (state) => state.userInfo.shopName,
      userType: (state) => state.userInfo.userType,
    }),
    isHome() {
      return this.$route.path !== "/home";
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
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
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
    // updatePwd() {
    //   this.$router.push("/updatePassword/index");
    // },
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
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    position: absolute;
    right: 15px;
    height: 100%;
    line-height: 50px;
    font-size: 14px;
    cursor: pointer;
    &:focus {
      outline: none;
    }
    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
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
