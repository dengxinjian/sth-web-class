<template>
  <div class="time-input-wrapper" :class="{ 'has-error': errorMessage }">
    <el-input
      v-model="inputValue"
      :placeholder="placeholderText"
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
    timerType: {
      type: String,
      default: "hh:mm:ss",
    },
  },
  data() {
    return {
      inputValue: "",
      errorMessage: "",
      isInteger: false,
    };
  },
  computed: {
    // 根据 timerType 生成动态 placeholder
    placeholderText() {
      if (this.timerType === "mm:ss") {
        return "请输入时间 (mm:ss) 或分钟数";
      }
      return "请输入时间 (hh:mm:ss) 或分钟数";
    },
    // 默认时间格式
    defaultTimeFormat() {
      return this.timerType === "mm:ss" ? "00:00" : "00:00:00";
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal !== this.inputValue) {
          this.inputValue = newVal || "";
          // this.validateAndConvert();
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

      if (!value) {
        this.errorMessage = "请输入时间";
        this.inputValue = this.defaultTimeFormat;
        this.$emit("input", this.defaultTimeFormat);
        this.$emit("change", this.defaultTimeFormat);
        return;
      }

      // 情况1: 纯数字（分钟数）
      if (/^\d+$/.test(value)) {
        this.isInteger = true;
        const minutes = parseInt(value, 10);
        const timeFormat = this.minutesToTimeFormat(minutes);
        this.inputValue = timeFormat;
        this.$emit("input", timeFormat);
        this.$emit("change", timeFormat);
        this.errorMessage = "";
        return;
      }

      // 情况2: mm:ss 格式
      if (/^\d+:\d+$/.test(value)) {
        this.isInteger = false;
        const formattedTime = this.normalizeTimeFormat(value, 2);
        this.inputValue = formattedTime;
        this.$emit("input", formattedTime);
        this.$emit("change", formattedTime);
        this.errorMessage = "";
        return;
      }

      // 情况3: hh:mm:ss 格式
      if (/^\d+:\d+:\d+$/.test(value)) {
        this.isInteger = false;
        const formattedTime = this.normalizeTimeFormat(value, 3);
        this.inputValue = formattedTime;
        this.$emit("input", formattedTime);
        this.$emit("change", formattedTime);
        this.errorMessage = "";
        return;
      }

      // 格式不正确
      this.errorMessage = `请输入正确的时间格式 (${this.timerType} 或分钟数)`;
      this.inputValue = this.defaultTimeFormat;
      this.$emit("input", this.defaultTimeFormat);
      this.$emit("change", this.defaultTimeFormat);
    },

    // 将分钟数转换为时间格式，根据 timerType 返回对应格式
    minutesToTimeFormat(minutes) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const secs = 0; // 秒数固定为0

      if (this.timerType === "mm:ss") {
        // 返回 mm:ss 格式，将小时也转换为分钟
        const totalMinutes = hours * 60 + mins;
        return `${totalMinutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }

      // 返回 hh:mm:ss 格式
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    },

    // 标准化时间格式，处理分钟和秒超过59的情况
    // partsCount: 2 表示 mm:ss 格式，3 表示 hh:mm:ss 格式
    normalizeTimeFormat(timeStr, partsCount) {
      const parts = timeStr.split(":");

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (partsCount === 2) {
        // mm:ss 格式
        minutes = parseInt(parts[0], 10) || 0;
        seconds = parseInt(parts[1], 10) || 0;
      } else if (partsCount === 3) {
        // hh:mm:ss 格式
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
        seconds = parseInt(parts[2], 10) || 0;
      }

      // 处理秒数超过59的情况
      if (seconds >= 60) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
      }

      // 处理分钟数超过59的情况
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }

      // 根据 timerType 返回对应格式
      if (this.timerType === "mm:ss") {
        // 返回 mm:ss 格式，将小时转换为分钟
        const totalMinutes = hours * 60 + minutes;
        return `${totalMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      // 返回 hh:mm:ss 格式
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },

    // 获取当前值的总分钟数
    getMinutes() {
      if (!this.inputValue) return 0;

      // 如果是整数输入，直接返回分钟数
      if (this.isInteger) {
        return parseInt(this.inputValue, 10);
      }

      // 解析时间格式
      const parts = this.inputValue.split(":");

      // mm:ss 格式
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        // 将时间转换为总分钟数（秒数向上取整）
        return minutes + Math.ceil(seconds / 60);
      }

      // hh:mm:ss 格式
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        const seconds = parseInt(parts[2], 10) || 0;
        // 将时间转换为总分钟数（秒数向上取整）
        return hours * 60 + minutes + Math.ceil(seconds / 60);
      }

      return 0;
    },

    // 获取当前值的总秒数
    getTotalSeconds() {
      if (!this.inputValue) return 0;

      const parts = this.inputValue.split(":");

      // mm:ss 格式
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        return minutes * 60 + seconds;
      }

      // hh:mm:ss 格式
      if (parts.length === 3) {
        const hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        const seconds = parseInt(parts[2], 10) || 0;
        return hours * 3600 + minutes * 60 + seconds;
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
