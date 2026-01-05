export const statisticKeyToTitle = {
  totalTime: {
    title: "总时长",
    color: "#F92B30",
  },
  totalDistanceKm: {
    title: "总距离",
    unit: "km",
    color: "#F92B30",
  },
  totalCalories: {
    title: "总消耗",
    unit: "kcal",
    color: "#F92B30",
  },
  totalSTH: {
    title: "总STH",
    unit: "",
    color: "#F92B30",
  },
  runTime: {
    title: "跑步时间",
    icon: require("@/assets/addClass/icon-run.png"),
    color: "#00A781",
  },
  runDistanceKm: {
    title: "跑步距离",
    icon: require("@/assets/addClass/icon-run.png"),
    unit: "km",
    color: "#00A781",
  },
  cycleTime: {
    title: "骑行时间",
    icon: require("@/assets/addClass/icon-bike.png"),
    color: "#8B3DFF",
  },
  cycleDistanceKm: {
    title: "骑行距离",
    icon: require("@/assets/addClass/icon-bike.png"),
    unit: "km",
    color: "#8B3DFF",
  },
  swimTime: {
    title: "游泳时间",
    icon: require("@/assets/addClass/icon-swim.png"),
    color: "#385DFF",
  },
  swimDistanceKm: {
    title: "游泳距离",
    icon: require("@/assets/addClass/icon-swim.png"),
    unit: "km",
    color: "#385DFF",
  },
  strengthTime: {
    title: "力量",
    icon: require("@/assets/addClass/icon-power.png"),
    color: "#404040",
  },
  otherTime: {
    title: "其他",
    icon: require("@/assets/addClass/icon-other.png"),
    color: "#8994AC",
  },
};

// 单位转换
export const unitConversion = (value, unit) => {
  if (unit === "kcal") {
    return value;
  } else if (unit === "km") {
    return (value / 1000).toFixed(2);
  } else {
    return value;
  }
};
