<template>
  <div class="top">
    <div />
    <div>数据看板</div>
    <div>
      <span class="logout" @click="logout">{{ $t("navbar.logOut") }}</span>
      <el-divider direction="vertical"></el-divider>
      <span class="time">{{ time }}</span>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  data() {
    return {
      time: "",
    };
  },
  mounted() {
    this.initTime();
  },
  beforeDestroy() {
    this.timer = null;
  },
  methods: {
    initTime() {
      this.setTime();
      this.timer = setInterval(() => {
        this.setTime();
      }, 6000);
    },
    setTime() {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const week = date.getDay();
      const hour = date.getHours();
      const str = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      let text = "";
      if (hour >= 0 && hour <= 10) {
        text = "上午";
      } else if (hour > 10 && hour <= 14) {
        text = "中午";
      } else if (hour > 14 && hour <= 18) {
        text = "下午";
      } else {
        text = "晚上";
      }
      const time = `${month}月${day}日 ${str[week]} ${text} ${moment().format(
        "HH:mm"
      )}`;
      this.time = time;
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
  },
};
</script>
<style lang="scss" scoped>
.top {
  display: flex;
  flex: 1;
  justify-content: space-between;
  background: #1c1a1a;
  color: #fff;
  padding: 10px 20px;
  align-items: center;
  font-size: 18px;
  .time {
    font-size: 12px;
  }
  .logout {
    cursor: pointer;
    font-size: 12px;
  }
}
</style>
