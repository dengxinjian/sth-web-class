<template>
  <div class="left-menu">
    <ul class="type-change-list">
      <li
        :class="{ active: activeName === 'athletic' }"
        @click="handleTypeChange('athletic')"
        v-if="loginType === '2'"
      >
        <img
          v-if="activeName === 'athletic'"
          src="~@/assets/addClass/menu-player-active.png"
          alt=""
        />
        <img v-else src="~@/assets/addClass/menu-player.png" alt="" />
        <span>运动员</span>
      </li>
      <li
        :class="{ active: activeName === 'class' }"
        @click="handleTypeChange('class')"
      >
        <img
          v-if="activeName === 'class'"
          src="~@/assets/addClass/menu-class-active.png"
          alt=""
        />
        <img v-else src="~@/assets/addClass/menu-class.png" alt="" />
        <span>课程</span>
      </li>
    </ul>
  </div>
</template>

<script>
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
    };
  },
  computed: {
    activeName: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    handleTypeChange(type) {
      this.activeName = type;
      this.$emit("change", type);
    },
  },
};
</script>

<style lang="scss" scoped>
.left-menu {
  flex: 0 0 68px;
  background-color: #fff;
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
