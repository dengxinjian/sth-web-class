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
      <img src="../../assets//addClass/Frame.png" alt=""
        style="width: 20px; height: 20px; margin-right: 10px" />
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
          <div class="avatar-with-frame avatar-with-frame--navbar"
            :class="{ 'has-frame': getVipFrameSrc(vipSubStatus) }">
            <img v-if="getVipFrameSrc(vipSubStatus)"
              :src="getVipFrameSrc(vipSubStatus)"
              class="avatar-frame"
              alt="" />
            <img :src="userAvatar" alt="" class="user-avatar-img" />
          </div>
          <span>{{ name }}</span>
          <i class="el-icon-caret-bottom"
            style="margin-left: 10px; font-size: 12px"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="navbar-user-dropdown">
          <el-dropdown-item @click.native="changeIdentify">
            <el-button type="primary" size="small"
              style="width: 100%; margin-bottom: 10px; border: none"
              :style="{
                background:
                  loginType === '1'
                    ? 'linear-gradient(90.94deg, #2A2A2A 10%, #B81300 50%, #2A2A2A 90%)'
                    : '',
              }"
              class="change-identify-button">{{ `切换成${loginType == "1" ? "教练" : "运动员"}` }}</el-button>
          </el-dropdown-item>
          <!-- linear-gradient(90.94deg, #2A2A2A 10%, #008867 50%, #2A2A2A 90%) -->
          <el-dropdown-item @click.native="goMemberCenter">
            <el-button type="primary" size="small"
              style="width: 100%; margin-bottom: 10px; border: none">
              会员中心
            </el-button>
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <el-button type="info" size="small" style="width: 100%">{{
              $t("navbar.logOut")
            }}</el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from "vuex"
import Breadcrumb from "@/components/Breadcrumb"
import { getData, submitData } from "@/api/common"

export default {
  name: "TopNavbar",
  inject: ["reload"],
  components: {
    Breadcrumb
  },
  data() {
    return {
      title: "强者之心",
      name: localStorage.getItem("name"),
      loginType: localStorage.getItem("loginType"),
      triUserId: localStorage.getItem("triUserId"),
      webIdentityType: localStorage.getItem("webIdentityType"),
      vipSubStatus: localStorage.getItem("vipSubStatus") || 0,
      userAvatar:
        localStorage.getItem("avatarUrl") || require("@/assets/logo-sth.png"),
      // 用于触发 watch 的响应式属性
      avatarUrlWatcher: localStorage.getItem("avatarUrl"),
      loginTypeWatcher: localStorage.getItem("loginType"),
      nameWatcher: localStorage.getItem("name"),
      vipSubStatusWatcher: localStorage.getItem("vipSubStatus"),
      userInfo: null,
    }
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device"]),
    ...mapState({
      // name: (state) => state.user.name,
      shopOptions: (state) => state.userInfo.shopOptions,
      shopName: (state) => state.userInfo.shopName,
      userType: (state) => state.userInfo.userType,
      // userInfo: (state) => state.user.userInfo,
    }),
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    logoUrl() {
      // 这里可以设置logo图片路径
      return require("@/assets/logo-text.svg")
    },
    logoSth() {
      // 这里可以设置logo图片路径
      return require("@/assets/logo-sth.png")
    },
    showShop() {
      return this.shopOptions.length > 0
    },
  },
  // 使用watch监听 localStorage 的变化
  watch: {
    avatarUrlWatcher: {
      handler(newVal) {
        this.getAthleticInfo()
      },
      immediate: true,
    },
    loginTypeWatcher: {
      handler(newVal) {
        this.getAthleticInfo()
      },
      immediate: true,
    },
    nameWatcher: {
      handler(newVal) {
        this.getAthleticInfo()
      },
      immediate: true,
    },
  },
  mounted() {
    this.triUserId = localStorage.getItem("triUserId")
    this.getAthleticInfo()
    // 监听 localStorage 的变化（跨标签页）
    window.addEventListener("storage", this.handleStorageChange)
    // 定期检查 localStorage 的变化（同标签页内）
    this.storageCheckInterval = setInterval(() => {
      this.checkLocalStorageChanges()
    }, 500)
  },
  beforeDestroy() {
    // 清理事件监听器和定时器
    window.removeEventListener("storage", this.handleStorageChange)
    if (this.storageCheckInterval) {
      clearInterval(this.storageCheckInterval)
    }
  },
  methods: {
    ...mapMutations({
      SET_SHOP_NAME: "userInfo/SET_SHOP_NAME",
      SET_SHOP_OPTIONS: "userInfo/SET_SHOP_OPTIONS",
      SET_SHOP_ID: "userInfo/SET_SHOP_ID",
    }),
    async logout() {
      console.log(this.name)
      try {
        await this.$confirm("确定退出系统吗?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        // 用户点击了确定
        await this.$store.dispatch("user/logout")
        this.$router.push(`/login`)
      } catch (error) {
        // 用户点击了取消，或者发生了错误
        console.log("取消退出或发生错误:", error)
      }
    },
    goMemberCenter() {
      if (!this.$router) return
      const pushResult = this.$router.push("/member/center")
      if (pushResult && typeof pushResult.catch === "function") {
        pushResult.catch(() => { })
      }
    },
    // vipSubStatus: 0 未订阅 1 精英 2 专业 4 精英&专业 → 头框图片
    getVipFrameSrc(vipSubStatus) {
      const v = Number(vipSubStatus)
      if (v === 1) return require("@/assets/addClass/vip1.png")
      if (v === 2) return require("@/assets/addClass/vip2.png")
      if (v === 4) return require("@/assets/addClass/vip4.png")
      return null
    },
    getAthleticInfo() {
      getData({
        url: "/consumer/wx/getUserProfile",
        triUserId: this.triUserId,
        clientType: 'web',
      }).then((res) => {
        if (res.success) {
          console.log("=====获取用户信息---切换=====", res)
          this.userInfo = res.result
          this.name = res.result.nicknameTag
          this.userAvatar = res.result.avatarUrl
          this.vipSubStatus = res.result.vipSubStatus
          localStorage.setItem("webIdentityType", res.result.webIdentityType)
          this.webIdentityType = res.result.webIdentityType
          // 更新 localStorage 和 watcher 属性
          if (res.result.nicknameTag) {
            localStorage.setItem("name", res.result.nicknameTag)
            this.nameWatcher = res.result.nicknameTag
          }
          if (res.result.avatarUrl) {
            localStorage.setItem("avatarUrl", res.result.avatarUrl)
            this.avatarUrlWatcher = res.result.avatarUrl
          }
          if (res.result.vipSubStatus) {
            localStorage.setItem("vipSubStatus", res.result.vipSubStatus)
            this.vipSubStatusWatcher = res.result.vipSubStatus
          }
        }
      })
    },
    getUserAvatar() {
      this.userAvatar =
        localStorage.getItem("avatarUrl") || require("@/assets/logo-sth.png")
    },
    openVip1Dialog(tradeType = "") {
      this.$vip1({
        tradeType,
        forceShow: false,
      })
    },
    async resetPageData() {
      await this.updateUserInfo()
      const newLoginType = this.loginType === "1" ? "2" : "1"
      localStorage.setItem("loginType", newLoginType)
      localStorage.setItem(
        "activeName",
        this.loginType === "1" ? "class" : "athletic"
      )
      // 更新响应式属性以触发 watch
      this.loginTypeWatcher = newLoginType
      this.loginType = newLoginType
      // 触发身份切换事件
      this.$root.$emit("identity-changed", newLoginType)
      if (this.loginType === "2") {
        // 路由跳转，使用安全的错误处理
        if (this.$router) {
          const pushResult = this.$router.push("/timeTable/class")
          if (pushResult && typeof pushResult.catch === "function") {
            pushResult.catch(() => { })
          }
        }
        this.reload()
      } else {
        this.reload()
      }
    },
    async updateUserInfo() {
      console.log('=====更新用户信息=====', this.userInfo)
      console.log('=====更新用户信息-webIdentityType=====', this.webIdentityType)
      // const clinetType = !this.webIdentityType || this.webIdentityType === 'null' || this.webIdentityType === "R" ? "C" : "R";
      submitData({
        url: "/consumer/wx/switchIdentity?clinetType=web",
        requestData: {
          clinetType: 'web'
        },
      })
        .then((res) => {
          if (res.success) {
            this.getAthleticInfo()
          }
        })
    },
    async handleSubscribeVip() {
      const _this = this
      submitData({
        url: "/operate/api/vipSubscribe/subscribe",
        requestData: {
          identityType: "C",
          subscribeType: 1,
        },
      }).then((res) => {
        if (res.success) {
          _this.$message.success("订阅成功")
          _this.resetPageData()
        } else {
          _this.$message.error(res.message)
        }
      })
    },
    async getSubscribeInfo() {
      const _this = this
      try {
        const res = await getData({
          url: "/operate/api/vipSubscribe/getUserSubscribeInfo",
          identityType: "C",
        })
        if (!res || !res.success) {
          _this.openVip1Dialog()
          return
        }
        const result = res.result
        let proInfo = null
        if (Array.isArray(result)) {
          proInfo = result.find((it) => it?.identityType === "C") || null
        } else if (result && (result.identityType === "R" || result.identityType === "C")) {
          proInfo = result.identityType === "C" ? result : null
        }
        console.log('=====proInfo=====', proInfo)
        const subStatus = proInfo?.subStatus
        if (subStatus !== 1) {
          _this.openVip1Dialog()
        } else {
          _this.resetPageData()
        }
      } catch (e) {
        _this.openVip1Dialog()
      }
    },
    async changeIdentify() {
      const _this = this
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
          // if (_this.loginType === "1") {
          _this.getSubscribeInfo()
          // _this.handleCancelSubscribeVip()
          // } else {
          // _this.resetPageData();
          // }
        })
        .catch(() => { })
    },
    // 处理 storage 事件（跨标签页）
    handleStorageChange(e) {
      if (e.key === "avatarUrl") {
        this.avatarUrlWatcher = e.newValue
        this.userAvatar = e.newValue || require("@/assets/logo-sth.png")
      } else if (e.key === "loginType") {
        this.loginTypeWatcher = e.newValue
        this.loginType = e.newValue
      } else if (e.key === "name") {
        this.nameWatcher = e.newValue
        this.name = e.newValue
      } else if (e.key === "vipSubStatus") {
        this.vipSubStatusWatcher = e.newValue
        this.vipSubStatus = e.newValue || 0
      }
    },
    // 检查 localStorage 的变化（同标签页内）
    checkLocalStorageChanges() {
      const currentAvatarUrl = localStorage.getItem("avatarUrl")
      const currentLoginType = localStorage.getItem("loginType")
      const currentName = localStorage.getItem("name")
      const currentVipSubStatus = localStorage.getItem("vipSubStatus")

      if (currentAvatarUrl !== this.avatarUrlWatcher) {
        this.avatarUrlWatcher = currentAvatarUrl
        this.userAvatar = currentAvatarUrl || require("@/assets/logo-sth.png")
      }
      if (currentLoginType !== this.loginTypeWatcher) {
        this.loginTypeWatcher = currentLoginType
        this.loginType = currentLoginType
      }
      if (currentVipSubStatus !== this.vipSubStatusWatcher) {
        this.vipSubStatusWatcher = currentVipSubStatus
        this.vipSubStatus = currentVipSubStatus || 0
      }
      if (currentName !== this.nameWatcher) {
        this.nameWatcher = currentName
        this.name = currentName
      }
    },
    chooseShop(e) {
      const name = this.shopOptions.find((item) => item.value === e).label
      getData({
        url: `/apple-data-center/sys/shop/save/${e}`,
      }).then((res) => {
        this.SET_SHOP_NAME(name)
        this.SET_SHOP_ID(e)
        this.reload()
      })
    },
  },
}
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
      width: 98px;
      height: 28px;
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

    .avatar-with-frame.avatar-with-frame--navbar {
      position: relative;
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      margin-right: 10px;

      .avatar-frame {
        position: absolute;
        top: 0;
        left: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: contain;
        pointer-events: none;
        z-index: 0;
      }

      .user-avatar-img {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        z-index: 1;
      }

      &.has-frame .user-avatar-img {
        width: 24px;
        height: 24px;
      }
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

<style lang="scss">
.navbar-user-dropdown .el-dropdown-menu__item,
.navbar-user-dropdown .el-dropdown-menu__item:not(.is-disabled):hover,
.navbar-user-dropdown .el-dropdown-menu__item:not(.is-disabled):focus,
.navbar-user-dropdown .el-dropdown-menu__item:hover,
.navbar-user-dropdown .el-dropdown-menu__item:focus {
  background-color: transparent !important;
}

.navbar-user-dropdown .member-center-button:hover,
.navbar-user-dropdown .member-center-button:focus {
  color: #fff !important;
  box-shadow: none !important;
}

.navbar-user-dropdown .logout-button:hover,
.navbar-user-dropdown .logout-button:focus {
  background: #909399 !important;
  border-color: #909399 !important;
}
</style>
