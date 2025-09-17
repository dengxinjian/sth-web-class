<template>
  <div class="date-picker">
    <div class="top">
      <div class="quarter">Q{{ dateInfo.quarter }}</div>
      <div class="time">{{ dateInfo.time }}</div>
    </div>
    <div class="week">
      <div v-for="item in week" :key="item" class="week-item">{{ item }}</div>
    </div>
    <div
      v-for="(val, index) in dateInfo.timeList"
      :key="index + 1"
      class="month"
    >
      <div
        v-for="(v, inde) in val"
        :key="inde + 1"
        class="day"
        :style="{ background: getColor(inde, v, val, index) }"
      >
        {{ v }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    dateInfo: {
      type: Object,
      default: () => {},
    },
    // col: {
    //   type: Number,
    //   default: 1,
    // },
  },
  data() {
    return {
      data: [],
      week: ["W", "日", "一", "二", "三", "四", "五", "六"],
    };
  },

  methods: {
    getColor(index, v = 0, val, index2) {
      if (index !== 0 && index !== 7) return;
      const n0 = this.dateInfo.timeList.findIndex((item) => item[0]);
      const n1 = this.dateInfo.timeList.findLastIndex((item) => item[0]);
      const v1 = this.dateInfo.timeList[n0][0];
      const v2 = this.dateInfo.timeList[n1][0];
      const color = this.dateInfo.color;
      const num = index2 === 0 && !val[0] ? v1 : val[0] || v2;
      const opacity = num / 10 + 0.2;
      return `rgba(${color},${opacity})`;
    },
  },
};
</script>
<style lang="scss" scoped>
.date-picker {
  margin: 20px;
}
.top {
  display: flex;
  border: 2px solid black;
  font-weight: bold;
  .time {
    padding: 5px 0;
    flex: 1;
    text-align: center;
    border-left: none;
    text-align: center;
  }
  .quarter {
    border: 2px solid black;
    padding: 5px 0;
    height: 100%;
    text-align: center;
    border-bottom: none;
    border-left: none;
    border-top: none;
    min-width: 35px;
  }
}
.week {
  display: flex;
  justify-content: space-between;
  .week-item {
    padding: 5px;
    flex: 1;
    min-width: 35px;
    border: 2px solid black;
    border-top: none;
    background-color: rgb(17, 15, 15);
    color: #fff;
    &:not(:first-child) {
      border-left: none;
    }
  }
}
.month {
  display: flex;
  justify-content: space-between;
  .day {
    flex: 1;
    padding: 5px;
    border: 2px solid black;
    text-align: center;
    border-top: none;
    font-weight: bold;
    min-width: 35px;
    background-color: #ddffbb;
    &:not(:first-child) {
      border-left: none;
    }
  }
}
.dis {
  display: none;
}
</style>
