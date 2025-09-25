export const debounce = (cb, wait) => {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => cb.apply(context, args), wait);
  };
};

// 跑步 骑行 计算跟随阀值心率目标值的分组
export const calculateThresholdHeartRateNumZoneFollow = (reciprocal) => {
  const one = 0.82;
  const two = 0.89;
  const three = 0.94;
  const four = 0.99;
  const five = 1.03;
  const six = 1.06;
  if (reciprocal < one) {
    return "Z1";
  } else if (reciprocal < two) {
    return "Z2";
  } else if (reciprocal < three) {
    return "Z3";
  } else if (reciprocal < four) {
    return "Z4";
  } else if (reciprocal < five) {
    return "Z5A";
  } else if (reciprocal < six) {
    return "Z5B";
  } else {
    return "Z5C";
  }
}
