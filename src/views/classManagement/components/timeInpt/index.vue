<template>
  <div class="time-input-wrapper">
    <el-input
      v-model="inputValue"
      placeholder="请输入时间 (hh:mm:ss) 或分钟数"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @clear="handleClear"
      v-bind="$attrs"
      class="time-input"
    >
      <template #suffix>
        <i class="el-icon-time" v-if="!inputValue"></i>
      </template>
    </el-input>
    <div class="error-message" v-if="errorMessage">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: "TimeInput",
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
  },
  data() {
    return {
      inputValue: "",
      errorMessage: "",
      isInteger: false,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal !== this.inputValue) {
          this.inputValue = newVal || "";
          this.validateAndConvert();
        }
      },
    },
  },
  methods: {
    // 处理输入事件
    handleInput(value) {
      this.errorMessage = "";
      this.inputValue = value;
      this.$emit("input", value);
    },

    // 处理失焦事件 - 进行格式转换和校验
    handleBlur() {
      this.validateAndConvert();
    },

    // 处理聚焦事件
    handleFocus() {
      this.errorMessage = "";
    },

    // 处理清空事件
    handleClear() {
      this.inputValue = "";
      this.errorMessage = "";
      this.$emit("input", "");
      this.$emit("change", "");
    },

    // 校验和转换输入值
    validateAndConvert() {
      const value = this.inputValue.trim();
      console.log(value, "value");
      if (!value) {
        this.errorMessage = "请输入正确的时间格式";
        console.log("errorMessage", "00:00:00");
        this.$emit("input", "00:00:00");
        this.$emit("change", "00:00:00");
        return;
      }

      // 检查是否为整数（分钟数）
      if (/^\d+$/.test(value)) {
        this.isInteger = true;
        const minutes = parseInt(value, 10);
        const timeFormat = this.secondsToTimeFormat(minutes);
        this.inputValue = timeFormat;
        this.$emit("input", timeFormat);
        this.$emit("change", timeFormat);
        this.errorMessage = "";
      } else if (/^\d+:\d+:\d+$/.test(value)) {
        // 检查是否为时间格式 hh:mm:ss，并处理超过59的情况
        this.isInteger = false;
        const formattedTime = this.normalizeTimeFormat(value);
        console.log("formattedTime", formattedTime);
        this.inputValue = formattedTime;
        this.$emit("input", formattedTime);
        this.$emit("change", formattedTime);
        this.errorMessage = "";
      } else {
        this.errorMessage = "请输入正确的时间格式";
        console.log("errorMessage", this.errorMessage);
        this.$emit("input", "00:00:00");
        this.$emit("change", "00:00:00");
      }
    },

    // 将分钟数转换为时间格式
    secondsToTimeFormat(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const secs = 0; // 秒数固定为0

      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },

    // 标准化时间格式，处理分钟和秒超过59的情况
    normalizeTimeFormat(timeStr) {
      console.log("normalizeTimeFormat input:", timeStr);
      const parts = timeStr.split(":");
      if (parts.length !== 3) return timeStr;

      let hours = parseInt(parts[0], 10) || 0;
      let minutes = parseInt(parts[1], 10) || 0;
      let seconds = parseInt(parts[2], 10) || 0;

      console.log("原始值:", { hours, minutes, seconds });

      // 处理秒数超过59的情况
      if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
        console.log("处理秒数后:", { hours, minutes, seconds });
      }

      // 处理分钟数超过59的情况
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
        console.log("处理分钟数后:", { hours, minutes, seconds });
      }

      // 确保小时数不超过23
      if (hours >= 24) {
        hours = hours % 24;
        console.log("处理小时数后:", { hours, minutes, seconds });
      }

      const result = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      console.log("最终结果:", result);
      return result;
    },

    // 格式化时间字符串，确保格式为 hh:mm:ss
    formatTimeString(timeStr) {
      const parts = timeStr.split(":");
      if (parts.length === 2) {
        // mm:ss 格式，补0
        return `00:${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      } else if (parts.length === 3) {
        // h:mm:ss 或 hh:mm:ss 格式
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(
          2,
          "0"
        )}:${parts[2].padStart(2, "0")}`;
      }
      return timeStr;
    },

    // 获取当前值的分钟数
    getMinutes() {
      if (!this.inputValue) return 0;

      if (this.isInteger) {
        return parseInt(this.inputValue, 10);
      }

      const parts = this.inputValue.split(":");
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        const seconds = parseInt(parts[2], 10) || 0;
        // 将秒数转换为分钟（向上取整）
        const totalMinutes = hours * 60 + minutes + Math.ceil(seconds / 60);
        return totalMinutes;
      }

      return 0;
    },
  },
};
</script>

<style scoped>
.time-input-wrapper {
  position: relative;
}

.time-input {
  width: 100%;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}

.el-icon-time {
  color: #c0c4cc;
  line-height: 32px;
}

/* 输入框聚焦时的样式 */
.time-input:focus-within .el-icon-time {
  color: #409eff;
}

/* 错误状态下的输入框样式 */
.time-input-wrapper.has-error .el-input__inner {
  border-color: #f56c6c;
}

.time-input-wrapper.has-error .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
