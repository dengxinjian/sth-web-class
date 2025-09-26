export const statisticKeyToTitle = {
  totalTime: {
    title: "总时长",
    color: "rgba(217, 206, 185, 1)",
  },
  totalDistanceKm: {
    title: "总距离",
    unit: "KM",
    color: "rgba(217, 206, 185, 1)",
  },
  totalCalories: {
    title: "总消耗",
    unit: "kcal",
    color: "rgba(217, 206, 185, 1)",
  },
  totalSTH: {
    title: "总STH",
    unit: "",
    color: "rgba(204, 35, 35, 1)",
  },
  runTime: {
    title: "跑步时间",
    icon: require("@/assets/addClass/icon-run.png"),
    color: "rgba(255, 21, 82, 1)",
  },
  runDistanceKm: {
    title: "跑步距离",
    icon: require("@/assets/addClass/icon-run.png"),
    unit: "KM",
    color: "rgba(255, 21, 82, 1)",
  },
  cycleTime: {
    title: "骑行时间",
    icon: require("@/assets/addClass/icon-bike.png"),
    color: "rgba(134, 91, 214, 1)",
  },
  cycleDistanceKm: {
    title: "骑行距离",
    icon: require("@/assets/addClass/icon-bike.png"),
    unit: "KM",
    color: "rgba(134, 91, 214, 1)",
  },
  swimTime: {
    title: "游泳时间",
    icon: require("@/assets/addClass/icon-swim.png"),
    color: "rgba(46, 166, 223, 1)",
  },
  swimDistanceKm: {
    title: "游泳距离",
    icon: require("@/assets/addClass/icon-swim.png"),
    unit: "KM",
    color: "rgba(46, 166, 223, 1)",
  },
  strengthTime: {
    title: "力量",
    icon: require("@/assets/addClass/icon-power.png"),
    color: "rgba(163, 163, 163, 1)",
  },
  otherTime: {
    title: "其他",
    icon: require("@/assets/addClass/icon-other.png"),
    color: "rgba(163, 163, 163, 1)",
  },
};

// 单位转换
export const unitConversion = (value, unit) => {
  if (unit === "kcal") {
    return value;
  } else if (unit === "KM") {
    return (value / 1000).toFixed(2);
  } else {
    return value;
  }
};
