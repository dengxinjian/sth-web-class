/**
 * 课程管理模块常量定义
 */

// 运动类型枚举
export const SPORT_TYPES = {
  SWIM: "SWIM",
  CYCLE: "CYCLE",
  RUN: "RUN",
  STRENGTH: "STRENGTH",
  REMARK: "REMARK",
  REST: "REST",
  OTHER: "OTHER",
};

// 运动类型图标映射
export const SPORT_TYPE_ICONS = {
  SWIM: require("@/assets/addClass/icon-swim.png"),
  CYCLE: require("@/assets/addClass/icon-bike.png"),
  RUN: require("@/assets/addClass/icon-run.png"),
  STRENGTH: require("@/assets/addClass/icon-power.png"),
  REMARK: require("@/assets/addClass/icon-note.png"),
  REST: require("@/assets/addClass/icon-rest.png"),
  OTHER: require("@/assets/addClass/icon-other.png"),
};

// 运动类型中文名称
export const SPORT_TYPE_NAMES = {
  SWIM: "游泳",
  CYCLE: "骑行",
  RUN: "跑步",
  STRENGTH: "力量",
  REMARK: "备注",
  REST: "休息",
  OTHER: "其他",
};

// 设备类型字典
export const DEVICE_TYPE_DICT = {
  1: "高驰",
  2: "佳明国际",
  3: "佳明中国",
  4: "华米",
  5: "颂拓国际",
  6: "颂拓中国",
};

// 设备类型图标字典
export const DEVICE_TYPE_ICON_DICT = {
  1: "C", // COROS
  2: "G", // Garmin International
  3: "G", // Garmin China
  4: "Z", // Zepp (Amazfit)
  5: "S", // Suunto International
  6: "S", // Suunto China
};

// 设备品牌图标
export const DEVICE_BRAND_ICONS = {
  COROS: require("@/assets/addClass/device-coros.png"),
  GARMIN: require("@/assets/addClass/device-garmin.png"),
  ZEPP: require("@/assets/addClass/device-zepp.png"),
  SUUNTO: require("@/assets/addClass/device-suunto.png"),
};

// 活动类型映射（数字到字符串）
export const ACTIVITY_TYPE_DICT = {
  1: "CYCLE",
  2: "RUN",
  3: "SWIM",
  4: "STRENGTH",
  5: "OTHER",
};

// 星期列表
export const WEEK_LIST = [
  { id: 1, name: "周一" },
  { id: 2, name: "周二" },
  { id: 3, name: "周三" },
  { id: 4, name: "周四" },
  { id: 5, name: "周五" },
  { id: 6, name: "周六" },
  { id: 7, name: "周日" },
];

// 课程模式
export const CLASS_MODES = {
  THRESHOLD_FTP: 1, // 阈值功率
  THRESHOLD_HR: 2, // 阈值心率
  TARGET_FTP: 3, // 目标功率
  TARGET_HR: 4, // 目标心率
};

// 完成度颜色映射
export const COMPLETION_COLORS = {
  GREEN: "green", // 80-120%
  SHALLOW_ORANGE: "shallowOrange", // <60%
  DEEP_ORANGE: "deepOrange", // 60-80% 或 >120%
};

// 同步状态颜色
export const SYNC_STATUS_COLORS = {
  0: "#aaaaaa", // 未同步
  1: "#7fb135", // 同步成功
  2: "#c72a29", // 同步失败
};

// 训练模式标签
export const MODE_LABELS = {
  1: "阈值功率",
  2: "阈值心率",
  3: "目标功率",
  4: "目标心率",
};

