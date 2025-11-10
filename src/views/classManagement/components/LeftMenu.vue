<template>
  <div class="left-menu">
    <el-menu
      ref="menu"
      :default-active="activeName"
      :active-text-color="menuActiveText"
      :background-color="menuBg"
      :text-color="menuText"
      mode="vertical"
      class="type-change-menu"
      @select="handleMenuSelect"
    >
      <el-menu-item
        v-if="loginType === '2'"
        index="athletic"
        class="menu-item-custom"
        data-menu-index="athletic"
      >
        <img :src="athleticIconSrc" alt="" class="menu-icon" />
        <span slot="title">运动员</span>
      </el-menu-item>
      <el-menu-item
        index="class"
        class="menu-item-custom"
        data-menu-index="class"
      >
        <img :src="classIconSrc" alt="" class="menu-icon" />
        <span slot="title">课程</span>
      </el-menu-item>
      <el-menu-item
        index="plan"
        class="menu-item-custom"
        data-menu-index="plan"
      >
        <img :src="planIconSrc" alt="" class="menu-icon" />
        <span slot="title">计划</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import variables from "@/styles/variables.scss";

export default {
  name: "LeftMenu",
  props: {
    value: {
      type: String,
      default: "class",
    },
  },
  data() {
    return {
      loginType: localStorage.getItem("loginType") || "2",
      menuBg: "#fff",
      menuText: "#333",
      menuActiveText: "#fff",
      activeName: localStorage.getItem("activeName") || "class",
    };
  },
  computed: {
    athleticIconSrc() {
      return this.activeName === "athletic"
        ? require("@/assets/addClass/menu-player-active.png")
        : require("@/assets/addClass/menu-player.png");
    },
    classIconSrc() {
      return this.activeName === "class"
        ? require("@/assets/addClass/menu-class-active.png")
        : require("@/assets/addClass/menu-class.png");
    },
    planIconSrc() {
      return this.activeName === "plan"
        ? require("@/assets/addClass/menu-plan-active.png")
        : require("@/assets/addClass/menu-plan.png");
    },
  },
  watch: {
    activeName: {
      handler(newVal) {
        // 当 value prop 变化时，更新 el-menu 的激活项
        this.$nextTick(() => {
          if (this.$refs.menu && this.$refs.menu.$el) {
            // 通过 DOM 操作确保菜单项正确高亮
            const menuItems =
              this.$refs.menu.$el.querySelectorAll(".el-menu-item");
            menuItems.forEach((item) => {
              const index =
                item.getAttribute("data-menu-index") ||
                item.getAttribute("index");
              if (index === newVal) {
                item.classList.add("is-active");
              } else {
                item.classList.remove("is-active");
              }
            });
          }
        });
      },
      immediate: true,
    },
  },
  methods: {
    handleMenuSelect(index) {
      this.handleTypeChange(index);
    },
    handleTypeChange(type) {
      this.activeName = type;
      localStorage.setItem("activeName", type);
      this.$emit("change", type);
    },
  },
};
</script>

<style lang="scss" scoped>
.left-menu {
  width: 100%;
  height: 100%;
  background-color: #fff;
}

// el-menu 样式定制
:deep(.type-change-menu) {
  border-right: none;
  width: 100%;
  min-height: 100%;

  .el-menu-item {
    height: 74px;
    line-height: 1;
    padding: 0 !important;
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 0;
    position: relative;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &.is-active {
      background-color: #000 !important;
      color: #fff !important;
      border-color: transparent !important;

      .menu-icon {
        filter: brightness(0) invert(1);
      }

      span {
        color: #fff !important;
      }

      &:hover {
        background-color: #000 !important;
      }
    }

    &:not(.is-active):hover {
      background-color: #f5f5f5;
    }

    .menu-icon {
      width: 28px;
      height: 28px;
      margin-bottom: 4px;
      display: block;
      flex-shrink: 0;
    }

    span {
      font-size: 12px;
      font-weight: 500;
      line-height: 1.2;
      margin-top: 0;
      transition: color 0.2s ease;
    }
  }
}

.type-change-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0;

  > li {
    font-size: 14px;
    cursor: pointer;
    height: 74px;
    width: 100%;
    background-color: #fff;
    font-size: 12px;
    text-align: center;
    color: #333;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    justify-content: center;

    &.active {
      background-color: #000;
      color: #fff;
    }

    img {
      width: 28px;
    }
  }
}
</style>
