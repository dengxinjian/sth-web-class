<template>
  <el-popover
    ref="popover"
    placement="bottom-start"
    width="300"
    trigger="click"
    popper-class="weekPicker"
    @show="handleShow"
    @hide="handleHide"
  >
    <div class="selectBox">
      <div class="leftMenu">
        <div
          v-if="hasWeek"
          :class="type === 'FW' ? 'active' : ''"
          @click="handleType('FW')"
        >
          FW
        </div>
        <div :class="type === 'FQ' ? 'active' : ''" @click="handleType('FQ')">
          FQ
        </div>
        <div :class="type === 'FY' ? 'active' : ''" @click="handleType('FY')">
          FY
        </div>
      </div>
      <div class="rightWeek">
        <div class="weekTop">
          <span v-if="type !== 'FY'" @click="handlePrevYear"
            ><i class="el-icon-d-arrow-left"></i
          ></span>
          <span v-if="type === 'FW'" @click="handlePrevSeason"
            ><i class="el-icon-arrow-left"></i
          ></span>
          <div v-if="type === 'FW'">FY{{ showDate.FY }}Q{{ showDate.FQ }}</div>
          <div v-if="type === 'FQ'">FY{{ showDate.FY }}</div>
          <div v-if="type === 'FY'">FY</div>
          <span
            v-if="type === 'FW'"
            @click="handleNextSeason"
            :class="
              showDate.FY >= currentDate.FY && showDate.FQ >= currentDate.FQ
                ? 'disable'
                : ''
            "
            ><i class="el-icon-arrow-right"></i
          ></span>
          <span
            v-if="type !== 'FY'"
            @click="handleNextYear"
            :class="
              showDate.FY >= currentDate.FY ||
              (showDate.FY + 1 == currentDate.FY &&
                showDate.FQ > currentDate.FQ)
                ? 'disable'
                : ''
            "
            ><i class="el-icon-d-arrow-right"></i
          ></span>
        </div>

        <div v-if="type === 'FW'" class="weekContain">
          <span
            v-for="item in weekList"
            :class="FW === item ? 'active' : ''"
            :key="item"
            @click="handleWeek(item)"
            >W{{ item }}</span
          >
        </div>
        <div v-if="type === 'FQ'" class="weekContain">
          <span
            v-for="item in seasonList"
            :class="FQ == item && FY == showDate.FY ? 'active' : ''"
            v-show="!(showDate.FY == currentDate.FY && item > currentDate.FQ)"
            :key="item"
            @click="handleSeason(item)"
            >Q{{ item }}</span
          >
        </div>
        <div v-if="type === 'FY'" class="weekContain">
          <span
            v-for="item in yearList"
            :class="FY === item ? 'active' : ''"
            :key="item"
            @click="handleYear(item)"
            >FY{{ item }}</span
          >
        </div>
      </div>
    </div>
    <div class="inputBlock" slot="reference">
      <span v-if="startDate">{{ startDate }}</span>
      <span v-else class="placeholder">开始日期</span>
      <span>至</span>
      <span v-if="endDate">{{ endDate }}</span>
      <span v-else class="placeholder">结束日期</span>
    </div>
  </el-popover>
</template>

<script>
import moment from "moment";

export default {
  props: {
    hasWeek: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      type: this.hasWeek ? "FW" : "FQ",
      FY: moment().format("YY"),
      FQ: Math.ceil(moment().format("M") / 3),
      FW: moment().format("w") % 13,
      startDate: "",
      endDate: "",
      weekList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      seasonList: [1, 2, 3, 4],
      yearList: [],
      isNew: true,
      currentDate: {
        FY: moment().format("YY"),
        FQ: Math.ceil(moment().format("M") / 3),
        FW: moment().format("w") % 13,
      },
      showDate: {
        FY: moment().format("YY"),
        FQ: Math.ceil(moment().format("M") / 3),
        FW: moment().format("w") % 13,
      },
    };
  },
  mounted() {
    this.yearList = [];
    for (var i = 14; i <= moment().format("YY"); i++) {
      this.yearList.push(i);
    }
  },
  methods: {
    reset() {
      this.endDate = "";
      this.startDate = "";
    },
    handleSelect() {
      switch (this.type) {
        case "FY":
          if (!this.startDate || this.isNew) {
            this.startDate = "FY" + this.FY;
            this.endDate = "";
            this.isNew = false;
          } else {
            this.endDate = "FY" + this.FY;
            this.$refs.popover.doClose();
          }
          break;
        case "FQ":
          if (!this.startDate || this.isNew) {
            this.startDate = "FY" + this.showDate.FY + "Q" + this.FQ;
            this.endDate = "";
            this.isNew = false;
          } else {
            this.endDate = "FY" + this.showDate.FY + "Q" + this.FQ;
            this.$refs.popover.doClose();
          }
          break;
        case "FW":
          if (!this.startDate || this.isNew) {
            this.startDate =
              "FY" + this.showDate.FY + "Q" + this.showDate.FQ + "W" + this.FW;
            this.endDate = "";
            this.isNew = false;
          } else {
            this.endDate =
              "FY" + this.showDate.FY + "Q" + this.showDate.FQ + "W" + this.FW;
            this.$refs.popover.doClose();
          }
      }
      if (
        this.startDate &&
        this.endDate &&
        ((this.startDate > this.endDate &&
          this.startDate.length === this.endDate.length) ||
          (this.startDate.length !== this.endDate.length &&
            (this.startDate.split("W")[0] > this.endDate.split("W")[0] ||
              (this.startDate.split("W")[0] === this.endDate.split("W")[0] &&
                parseInt(this.startDate.split("W")[1]) >
                  parseInt(this.endDate.split("W")[1])))))
      ) {
        const a = this.startDate;
        this.startDate = this.endDate;
        this.endDate = a;
      }
    },
    handleType(val) {
      this.type = val;
      this.startDate = "";
      this.endDate = "";
      this.showDate = {
        FY: moment().format("YY"),
        FQ: Math.ceil(moment().format("M") / 3),
        FW: moment().format("w") % 13,
      };
    },
    handleWeek(val) {
      this.FW = val;
      this.FQ = this.showDate.FQ;
      this.FY = this.showDate.FY;
      this.handleSelect();
    },
    handleSeason(val) {
      this.FQ = val;
      this.FY = this.showDate.FY;
      this.handleSelect();
    },
    handleYear(val) {
      this.FY = val;
      this.handleSelect();
    },
    handleShow() {
      this.isNew = true;
    },
    handleHide() {
      if (!this.startDate || !this.endDate) {
        this.startDate = "";
        this.endDate = "";
      }
      const toType = {
        FW: 3,
        FQ: 2,
        FY: 1,
      };
      this.$emit("select", {
        start: this.startDate,
        end: this.endDate,
        type: toType[this.type],
      });
    },
    handlePrevYear() {
      this.showDate.FY = this.showDate.FY - 1;
    },
    handlePrevSeason() {
      if (this.showDate.FQ === 1) {
        this.showDate.FY = this.showDate.FY - 1;
        this.showDate.FQ = 4;
      } else {
        this.showDate.FQ = this.showDate.FQ - 1;
      }
    },
    handleNextYear() {
      if (
        this.showDate.FY >= this.currentDate.FY ||
        (this.showDate.FY + 1 == this.currentDate.FY &&
          this.showDate.FQ > this.currentDate.FQ)
      ) {
        return;
      }
      this.showDate.FY = this.showDate.FY + 1;
    },
    handleNextSeason() {
      if (
        this.showDate.FY >= this.currentDate.FY &&
        this.showDate.FQ >= this.currentDate.FQ
      ) {
        return;
      }
      if (this.showDate.FQ === 4) {
        this.showDate.FY = this.showDate.FY + 1;
        this.showDate.FQ = 1;
      } else {
        this.showDate.FQ = this.showDate.FQ + 1;
      }
    },
  },
};
</script>
<style scoped>
.inputBlock {
  width: 100%;
  min-width: 300px;
  height: 36px;
  line-height: 26px;
  padding: 5px 10px;
  border: 1px solid #e5e5e5;
  cursor: text;
  border-radius: 6px;
  display: flex;
}
.inputBlock span {
  flex: 1;
  text-align: center;
}
.inputBlock span:nth-child(2) {
  flex: 0 0 40px;
  text-align: center;
}
.inputBlock .placeholder {
  color: #ccc;
}
.selectBox {
  display: flex;
}
.leftMenu {
  width: 70px;
  flex: 0 0 1;
  padding: 10px;
  border-right: 1px solid #e5e5e5;
  text-align: center;
  line-height: 34px;
}
.leftMenu div {
  cursor: pointer;
}
.leftMenu .active {
  font-weight: bold;
  border-radius: 6px;
  background-color: #e5e5e5;
}
.rightWeek {
  flex: 1;
}
.weekTop {
  height: 34px;
  line-height: 34px;
  text-align: center;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
}
.weekTop span {
  flex: 0 0 30px;
  cursor: pointer;
}
.weekTop div {
  flex: 1;
}
.weekContain {
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
}
.weekContain span {
  flex: 0 0 25%;
  line-height: 34px;
  text-align: center;
  cursor: pointer;
}
.weekContain span.active {
  font-weight: bold;
  background-color: #e5e5e5;
  border-radius: 6px;
}
.disable {
  cursor: not-allowed !important;
}
</style>
