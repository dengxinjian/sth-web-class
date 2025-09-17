<template>
  <div class="container">
    <div v-for="(item, index) in dateList" :key="index + 1" class="content">
      <div v-for="(val, ind) in item" :key="ind + 1">
        <Com1 :dateInfo="val" />
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
import Com1 from "./com-1.vue";
import { isEmpty } from "element-ui/lib/utils/util";
import { getData } from "@/api/common";
export default {
  components: {
    Com1,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      list: [],
      dateList: [],
    };
  },
  watch: {
    data: {
      deep: true,
      handler(val) {
        this.list = val;
        this.getDate();
      },
    },
  },
  methods: {
    async getDate() {
      const color = [
        "232, 160, 191",
        "199, 233, 176",
        "255, 217, 102",
        "180, 228, 255",
      ];
      const week = await this.getWeek();
      const arr = [];
      this.list.forEach((item, index) => {
        const { startTime, endTime } = item;
        const { year, month } = this.getYearMonth(startTime);
        const { year: year2, month: month2 } = this.getYearMonth(endTime);
        const n1 = year2 * 12 + month2;
        const n2 = year * 12 + month;
        const num = Math.abs(n1 - n2);
        let n = 0;
        const arr2 = [];
        while (n <= num) {
          const obj = {};
          const time = moment(startTime).add(n, "month").format("YYYY-MM");
          const [year, month] = time.split("-");
          const y = +time.split("-")[0];
          const m = +time.split("-")[1];
          const timeList = this.getTimeList(y, m, week[index], time);
          n++;
          arr2.push({
            time: `${year}年${month}月`,
            timeList,
            color: color[index],
            quarter: item.quarter,
          });
        }
        arr.push(arr2);
      });
      this.dateList = [...arr];
    },
    async getWeek() {
      const arr = [];
      const time = this.list.map((item) => ({
        startDate: item.startTime,
        endDate: item.endTime,
      }));
      let num = 0;
      while (num < time.length) {
        const obj = {
          url: "/apple-data-center/fiscal/week/list",
          startDate: time[num].startDate,
          endDate: time[num].endDate,
        };
        const res = await getData(obj);
        arr.push(res.result);

        num++;
      }
      return Promise.resolve(arr);
    },

    getTimeList(year, month, week, time) {
      const date = new Date(year, month - 1);
      const currentMonthDay = this.getMonthDay(year, month - 1); // 当前月天数
      date.setDate(1);
      const currentFirstDay = date.getDay(); // 当前月第一天是周几
      const nextMonth = 0;
      const list = [];
      let count = 0;
      for (let i = 0; i < 6; i++) {
        const weekList = new Array(7);
        if (i === 0) {
          for (let k = currentFirstDay; k < weekList.length; k++) {
            weekList[k] = ++count;
          }
        } else {
          for (let k = 0; k < weekList.length; k++) {
            count++;
            if (count <= currentMonthDay) {
              weekList[k] = count;
            } else {
              // weekList[k] = ++nextMonth;
            }
          }
        }

        list.push(weekList);
      }
      // let preDay = this.getMonthDay(year, date.getMonth() + 1);
      // for (let i = currentFirstDay - 1; i >= 0; i--) {
      //   list[0][i] = preDay--;
      // }
      const list2 = list.filter((item) => item.some((val) => !!val));
      list2.forEach((item) => {
        const arr = item.map((val) =>
          val ? `${time}-${val < 10 ? `0${val}` : val}` : ""
        );
        const ind = week.findIndex(
          (v) => arr.includes(v.startDate) || arr.includes(v.endDate)
        );
        item.unshift("");
        if (ind > -1) {
          item[0] = `${ind + 1}`;
        } else {
          item[0] = "";
        }
      });
      return list2;
    },
    getMonthDay(year, month) {
      const date = new Date(year, month);
      date.setMonth(month + 1, 0);
      const day = date.getDate();
      return day;
    },
    getYearMonth(time) {
      const ntime = time.replaceAll(/-/g, "/");
      const date = new Date(ntime);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      return { year, month };
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  clear: both;
}
.content {
  display: flex;
  // justify-content: space-between;
  flex-wrap: wrap;
  .con {
    display: flex;
    justify-content: space-between;
  }
}
</style>
