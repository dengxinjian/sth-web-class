<template>
  <div :class="classObj" class="app-wrapper">
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <sidebar class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <home-nar-bar-vue v-if="isHome" />
        <navbar v-else />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
    <!-- <el-dialog
      title="店铺选择"
      :visible.sync="shopVisible"
      width="400px"
      :before-close="handleClose"
    >
      <el-form
        :model="shopForm"
        ref="shopForm2"
        label-width="100px"
        :rules="shopRules"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item label="店铺名称" prop="name">
              <el-select
                v-model="shopForm.name"
                placeholder="请选择"
                class="shopSelect"
              >
                <el-option
                  v-for="item in shopOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="3" :offset="6">
            <el-form-item>
              <el-button @click="saveShop" type="primary" round class="saveBtn"
                >确定</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
    <el-dialog
      title="警告"
      :visible.sync="loginOutVisible"
      width="400px"
      :before-close="handleClose2"
    >
      <div class="tips-content">
        <div class="tips">您所关联的经销商下没有店铺</div>
        <el-button type="danger" class="loginOut" @click="loginOut"
          >推出登录</el-button
        >
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
import RightPanel from "@/components/RightPanel";
import { AppMain, Navbar, Settings, Sidebar } from "./components";
import ResizeMixin from "./mixin/ResizeHandler";
import { mapState } from "vuex";
import { mapMutations } from "vuex";
import { getData } from "@/api/common";
import { isEmpty } from "lodash";
import HomeNarBarVue from "./components/homeNarBar.vue";

export default {
  name: "Layout",
  inject: ["reload"],
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    HomeNarBarVue,
  },
  mixins: [ResizeMixin],
  data() {
    return {
      // shopVisible: false,
      // shopForm: {
      //   name: "",
      // },
      // shopOptions: [], // 店铺列表
      // shopRules: {
      //   name: [{ required: true, message: "请选择店铺", trigger: "blur" }],
      // },
      // loginOutVisible: false,
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
    isHome() {
      return this.$route.path === "/home";
    },
  },
  created() {
    // this.getShopList();
  },
  methods: {
    // ...mapMutations({
    //   SET_SHOP_NAME: "userInfo/SET_SHOP_NAME",
    //   SET_SHOP_OPTIONS: "userInfo/SET_SHOP_OPTIONS",
    //   SET_SHOP_ID: "userInfo/SET_SHOP_ID",
    // }),
    // handleClickOutside() {
    //   this.$store.dispatch("app/closeSideBar", { withoutAnimation: false });
    // },
    // async getShopList() {
    //   // if (this.shopName) return;
    //   const res = await getData({ url: "/apple-data-center/sys/shop/getShop" });
    //   if (isEmpty(res.result) && this.userType === 1) {
    //     this.loginOutVisible = true;
    //     return;
    //   }
    //   if (res.result.length === 1) {
    //     const { shopName, id } = res.result[0];
    //     this.SET_SHOP_NAME(shopName);
    //     this.SET_SHOP_ID(id);
    //     const obj = {
    //       url: `/apple-data-center/sys/shop/save/${id}`,
    //     };
    //     getData(obj);
    //   } else if (res.result.length > 1 && !this.shopName) {
    //     this.shopVisible = true;
    //   }
    //   this.shopOptions = res.result.map((item) => ({
    //     label: item.shopName,
    //     value: item.id,
    //   }));
    //   this.SET_SHOP_OPTIONS(this.shopOptions);
    // },
    // saveShop() {
    //   this.$refs.shopForm2.validate((valid) => {
    //     if (valid) {
    //       const obj = {
    //         url: `/apple-data-center/sys/shop/save/${this.shopForm.name}`,
    //       };
    //       const name = this.shopOptions.find(
    //         (item) => item.value === this.shopForm.name
    //       ).label;
    //       getData(obj).then((res) => {
    //         this.$message.success("保存成功");
    //         this.SET_SHOP_NAME(name);
    //         this.SET_SHOP_ID(this.shopForm.name);
    //         this.reload();
    //       });
    //       this.shopVisible = false;
    //     }
    //   });
    // },
    // handleClose(done) {
    //   if (this.shopName) done();
    //   else this.$message({ message: "请选择店铺", type: "warning" });
    // },
    // handleClose2(done) {
    //   // if (!this.loginOutVisible) done();
    // },
    // async loginOut() {
    //   this.loginOutVisible = false;
    //   await this.$store.dispatch("user/logout");
    //   this.$router.push(`/login`);
    // },
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

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
.shopbtn {
  color: #fff;
  cursor: pointer;
  text-align: center;
  width: 100px;
}
// .navbar {
//   // margin-left: 20px;
//   // font-size: 24px;
//   // padding: 20px 0;
//   // font-weight: bold;
// }
.tips-content {
  text-align: center;
  .tips {
    font-size: 16px;
    color: red;
    text-align: center;
  }
  .loginOut {
    margin: 10px 0;
  }
}
.saveBtn {
  position: relative;
  left: 40px;
}
</style>
