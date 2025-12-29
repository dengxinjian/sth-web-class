<template>
  <div class="top-navbar">
    <!-- Logo区域 -->
    <div class="logo-container">
      <!-- <img :src="logoSth" alt="Logo" class="logoSth" /> -->
      <img :src="logoUrl" alt="Logo" class="logo" />
      <!-- <span class="title">{{ title }}</span> -->
    </div>

    <!-- 面包屑导航 -->
    <!-- <breadcrumb id="breadcrumb-container" class="breadcrumb-container" /> -->
    <div style="flex: 1; display: flex; align-items: center">
      <img
        src="../../assets//addClass/Frame.png"
        alt=""
        style="width: 20px; height: 20px; margin-right: 10px"
      />
      <div class="notice-text">
        2025.9.26前绑定‘佳明国际’及‘高驰’账号的用户需要在小程序左滑解绑设备后重新绑定，方能收到课表通知。
      </div>
    </div>

    <!-- 右侧菜单 -->
    <div class="right-menu">
      <!-- <div class="button-with-logo" style="margin-right: 10px">
        <el-button type="primary" size="small" @click="changeIdentify"
          >切换成{{ loginType == "1" ? "教练" : "运动员" }}</el-button
        >
        <img
          src="@/views/login-wx/imgs/PREMIUM.svg"
          alt="logo"
          class="button-logo"
          @click="changeIdentify"
        />
      </div> -->
      <!-- <span>{{ name }}</span> -->
      <!-- <el-divider direction="vertical"></el-divider> -->
      <!-- <span style="display: inline-block" @click="logout">{{
        $t("navbar.logOut")
      }}</span> -->
      <!-- <el-divider direction="vertical"></el-divider> -->
      <el-dropdown trigger="click">
        <div class="user-info">
          <img src="../../assets/logo-sth.png" alt="" />
          <span>{{ name }}</span>
          <i
            class="el-icon-caret-bottom"
            style="margin-left: 10px; font-size: 12px"
          ></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="logout">
            <el-button type="primary" size="small" style="width: 100%">{{
              $t("navbar.logOut")
            }}</el-button>
          </el-dropdown-item>
          <el-dropdown-item @click.native="changeIdentify">
            <el-button
              type="primary"
              size="small"
              style="width: 100%; margin-top: 10px; border: none"
              :style="{
                background:
                  loginType === '1'
                    ? 'linear-gradient(90.94deg, #2A2A2A 10%, #B81300 50%, #2A2A2A 90%)'
                    : 'linear-gradient(90.94deg, #2A2A2A 10%, #008867 50%, #2A2A2A 90%)',
              }"
              class="change-identify-button"
              >{{ `切换成${loginType == "1" ? "教练" : "运动员"}` }}</el-button
            >
          </el-dropdown-item>
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
      name: localStorage.getItem("name"),
      loginType: localStorage.getItem("loginType"),
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"]),
    ...mapState({
      // name: (state) => state.user.name,
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
    logoSth() {
      // 这里可以设置logo图片路径
      return require("@/assets/logo-sth.png");
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
      console.log(this.name);
      try {
        await this.$confirm("确定退出系统吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        // 用户点击了确定
        await this.$store.dispatch("user/logout");
        this.$router.push(`/login`);
      } catch (error) {
        // 用户点击了取消，或者发生了错误
        console.log("取消退出或发生错误:", error);
      }
    },
    changeIdentify() {
      this.$confirm(
        `确定切换成${this.loginType === "1" ? "教练" : "运动员"}身份吗?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          localStorage.setItem("loginType", this.loginType === "1" ? "2" : "1");
          localStorage.setItem(
            "activeName",
            this.loginType === "1" ? "class" : "athletic"
          );
          // 触发身份切换事件
          this.$root.$emit(
            "identity-changed",
            this.loginType === "1" ? "2" : "1"
          );
          if (this.loginType === "2") {
            // 路由跳转，使用安全的错误处理
            if (this.$router) {
              const pushResult = this.$router.push("/timeTable/class");
              if (pushResult && typeof pushResult.catch === "function") {
                pushResult.catch(() => {});
              }
            }
            this.reload();
          } else {
            this.reload();
          }
        })
        .catch(() => {});
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
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  padding: 0 20px;

  .logo-container {
    display: flex;
    align-items: center;
    width: 320px;

    .logo {
      width: 100px;
      height: 27px;
      margin: 0 12px;
    }

    .logoSth {
      width: 32px;
    }

    .title {
      font-size: 18px;
      font-weight: bold;
      color: #fff;
    }
  }
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-right: 10px;
    }
    span {
      font-family: PingFang SC;
      font-weight: 400;
      font-style: Regular;
      font-size: 15px;
      line-height: 16px;
      letter-spacing: 0%;
      vertical-align: middle;
    }
  }
  .notice-text {
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0%;
    vertical-align: middle;
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

    &:focus {
      outline: none;
    }

    .button-with-logo {
      position: relative;
      display: inline-block;

      .button-logo {
        position: absolute;
        top: -3px;
        right: -1px;
        width: 50px;
        height: 20px;
        padding: 2px;
        z-index: 10;
      }
      .elite-title {
        font-size: 12px;
        transform: scale(0.8);
        font-weight: bold;
        color: #0924f5;
        position: absolute;
        top: -1px;
        right: -1px;
      }
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
