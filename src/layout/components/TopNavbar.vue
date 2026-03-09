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
        <el-dropdown-menu slot="dropdown">
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
      <vip1 :visible.sync="vipDialogVisible" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from "vuex"
import Breadcrumb from "@/components/Breadcrumb"
import { getData, submitData } from "@/api/common"
import vip1 from "@/components/Vip1";

export default {
  name: "TopNavbar",
  inject: ["reload"],
  components: {
    Breadcrumb,
    vip1
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
      vipDialogVisible: false,
      activeTab: "1",
      vipInfoList: [
        {
          title: "会员标识",
          subTitle: "会员专属图标",
          img: require("@/assets/vip/vip_1.png"),
          children: [{ idx: 1, label: "专业版专属头像框" }],
        },
        {
          title: "运动员高阶数据",
          subTitle: "数据分析/运动峰值表现可见",
          img: require("@/assets/vip/vip_2.png"),
          children: [
            { idx: 1, label: "从数据出发，深入了解你的运动员" },
          ],
        },
        {
          title: "一站式团队管理",
          subTitle: "科学管理",
          img: require("@/assets/vip/vip_3.png"),
          children: [
            { idx: 1, label: "身份切换可用(可切换至教练身份)" },
            { idx: 2, label: "运动员管理" },
            { idx: 3, label: "执教管理" },
            { idx: 4, label: "团队课程管理" },
            { idx: 5, label: "团队计划管理" },
          ],
        },
        {
          title: "数据总览",
          subTitle: "可视化分析",
          img: require("@/assets/vip/vip_4.png"),
          children: [
            { idx: 1, label: "成员日程/数据可视化，掌握团队全局训练情况。" },
          ],
        },
        {
          title: "训练计划",
          subTitle: "示例计划可用",
          img: require("@/assets/vip/vip_5.png"),
          children: [
            { idx: 1, label: "定期更新高效示例计划库可用" },
          ],
        },
      ],
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
        url: "/consumer/api/vipSubscribe/subscribe",
        requestData: {
          identityType: "C",
          subscribeType: 1,
        },
      }).then((res) => {
        if (res.success) {
          _this.vipDialogVisible = false
          _this.$message.success("订阅成功")
          _this.resetPageData()
        } else {
          _this.$message.error(res.message)
        }
      })
    },
    async handleCancelSubscribeVip() {
      submitData({
        url: "/consumer/api/vipSubscribe/cancelSubscribe",
        requestData: {
          identityType: "C",
          subscribeType: 1,
        },
      }).then((res) => { })
    },
    async getSubscribeInfo() {
      const _this = this
      try {
        const res = await getData({
          url: "consumer/api/vipSubscribe/getUserSubscribeInfo",
          identityType: "C",
        })
        if (!res || !res.success) {
          _this.vipDialogVisible = true
          return
        }
        const result = res.result
        let proInfo = null
        if (Array.isArray(result)) {
          proInfo = result.find((it) => it?.identityType === "C") || null
        } else if (result && (result.identityType === "R" || result.identityType === "C")) {
          proInfo = result.identityType === "C" ? result : null
        }
        const subscribeType = proInfo?.subscribeType
        const expireTime = proInfo?.expireTime
        const hasSubscribe = subscribeType != null && !!expireTime
        const isExpired = (exp) => {
          if (!exp) return false
          const d = typeof exp === "number"
            ? new Date(exp < 1e12 ? exp * 1000 : exp)
            : new Date(String(exp).replace(/-/g, "/"))
          return !Number.isNaN(d.getTime()) && d.getTime() < Date.now()
        }
        const expired = hasSubscribe ? isExpired(expireTime) : false
        if (!hasSubscribe || expired) {
          _this.vipDialogVisible = true
        } else {
          _this.resetPageData()
        }
      } catch (e) {
        _this.vipDialogVisible = true
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

.vip-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;

  .mask-container {
    width: 880px;
    min-height: 500px;
    background: #fff;
    border-radius: 10px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    // 背景图 从顶部，不变形，高度不变，宽度自适应
    background-image: url("~@/assets/professional_vip.png");
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 100% auto;

    .container-top-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;

      .container-top-box-title {
        font-size: 16px;
        font-weight: bold;
        color: #101010;
      }

      .close-icon {
        width: 24px;
        height: 24px;
        cursor: pointer;
      }
    }

    .container-content {
      width: 100%;
      height: 520px;
      background: #fff;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
      padding: 16px;
      box-sizing: border-box;
      position: relative;

      .container-content-title-box {
        width: 750px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        left: 50px;
        top: -38px;

        .container-content-title {
          width: 120px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #fff;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          position: relative;

          .container-content-title-img {
            width: 57px;
            height: 16px;
          }

          .container-content-title-bg {
            width: 144px;
            height: 12px;
            position: absolute;
            left: -12px;
            bottom: 0;
          }
        }
      }

      .content-box {
        width: 100%;
        height: 100%;
        border: 1px solid #f8e7e5;
        background: linear-gradient(180deg, #f8e7e5 0%, #ffffff 30%);
        border-radius: 8px;
        padding: 20px 40px 40px 16px;
        box-sizing: border-box;
        position: relative;

        .content-box-title {
          text-align: center;
          color: #101010;
          font-size: 14px;
          font-weight: 600;
        }

        .content-box-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          margin-top: 26px;
          // 每行3等分，可以换行，行距为10px
          column-gap: 16px;
          row-gap: 10px;
          margin-top: 16px;

          .list-item {
            // width: 33.33%;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            // gap: 10px;
            // 每行3个，减去2个gap（16px * 2 = 32px）
            width: calc((100% - 32px) / 3);
            box-sizing: border-box;
            margin-bottom: 16px;

            img {
              width: 30px;
              height: 30px;
              margin-right: 13px;
              flex-shrink: 0;
            }

            .list-item-title {
              font-size: 13px;
              color: #101010;
            }

            .list-item-content {
              .list-item-sub-title {
                height: 30px;
                line-height: 30px;
                font-size: 15px;
                font-weight: 600;
              }

              .list-item-content-item {
                display: flex;
                align-items: flex-start;
                margin-top: 8px;

                .list-item-content-icon-box {
                  height: 16px;
                  width: 6px !important;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 6px;
                }

                .list-item-content-icon {
                  width: 4px;
                  height: 4px;
                  border-radius: 4px;
                  background: #999;
                }

                .list-item-content-text {
                  flex: 1;
                  font-size: 12px;
                  line-height: 16px;
                  font-weight: 400;
                  color: #999;
                }
              }
            }
          }
        }

        .content-box-btn {
          width: 352px;
          height: 32px;
          border-radius: 6px;
          background: linear-gradient(90.94deg,
              #2a2a2a 10%,
              #b81300 50%,
              #2a2a2a 90%);
          text-align: center;
          line-height: 32px;
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          position: fixed;
          left: 264px;
          bottom: 32px;
        }
      }
    }
  }
}
</style>
