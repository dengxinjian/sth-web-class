import { mmssToSeconds } from "@/utils/index";
import { Message } from "element-ui";
export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
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
  const one1 = 0.65;
  if (reciprocal < one1) {
    return "热身/冷身";
  } else if (reciprocal < one) {
    return "z1";
  } else if (reciprocal < two) {
    return "z2";
  } else if (reciprocal < three) {
    return "z3";
  } else if (reciprocal < four) {
    return "z4";
  } else if (reciprocal < five) {
    return "z5A";
  } else if (reciprocal < six) {
    return "z5B";
  } else {
    return "z5C";
  }
};

// 跑步计算类
export class CalculateRun {
  constructor(athleticThreshold, classInfo) {
    this.classInfo = classInfo;
    this.athleticThreshold = athleticThreshold;
  }
  calculateThresholdSpeedRangeNum(thresholdSpeedRange) {
    if (!thresholdSpeedRange[0] || !thresholdSpeedRange[1]) {
      return [0, 0];
    }
    // 检查 run 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.run) {
      return [0, 0];
    }
    return [
      Math.round(
        this.athleticThreshold.run * (1 / (thresholdSpeedRange[0] / 100))
      ),
      Math.round(
        this.athleticThreshold.run * (1 / (thresholdSpeedRange[1] / 100))
      ),
    ];
  }
  calculateThresholdSpeedNum(thresholdSpeed) {
    if (!thresholdSpeed) {
      return 0;
    }
    // 检查 run 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.run) {
      return 0;
    }
    return Math.round(
      this.athleticThreshold.run * (1 / (thresholdSpeed / 100))
    );
  }
  calculateThresholdHeartRateRangeNum(thresholdHeartRateRange) {
    if (!thresholdHeartRateRange[0] || !thresholdHeartRateRange[1]) {
      return [0, 0];
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return [0, 0];
    }
    return [
      Math.round(
        this.athleticThreshold.heartRate * (thresholdHeartRateRange[0] / 100)
      ),
      Math.round(
        this.athleticThreshold.heartRate * (thresholdHeartRateRange[1] / 100)
      ),
    ];
  }
  calculateThresholdHeartRateNum(thresholdHeartRate) {
    if (!thresholdHeartRate) {
      return 0;
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return 0;
    }
    return Math.round(
      this.athleticThreshold.heartRate * (thresholdHeartRate / 100)
    );
  }
  calculateThresholdSpeedNumZoneFollow(reciprocal) {
    const one1 = 2;
    const one = 1.3;
    const two = 1.14;
    const three = 1.06;
    const four = 1.0;
    const five = 0.97;
    const six = 0.9;
    if (reciprocal > one1) {
      return "热身/冷身";
    } else if (reciprocal > one) {
      return "z1";
    } else if (reciprocal > two) {
      return "z2";
    } else if (reciprocal > three) {
      return "z3";
    } else if (reciprocal > four) {
      return "z4";
    } else if (reciprocal > five) {
      return "z5A";
    } else if (reciprocal > six) {
      return "z5B";
    } else {
      return "z5C";
    }
  }
  calculateThresholdSpeedNumZone(thresholdSpeed) {
    if (!thresholdSpeed) {
      return "";
    }
    const reciprocal = (1 / (thresholdSpeed / 100)).toFixed(4);
    return this.calculateThresholdSpeedNumZoneFollow(reciprocal);
  }
  calculateThresholdSpeedRangeNumZone(thresholdSpeedRange) {
    if (!thresholdSpeedRange[0] || !thresholdSpeedRange[1]) {
      return ["", ""];
    }
    return [
      this.calculateThresholdSpeedNumZoneFollow(
        (1 / (thresholdSpeedRange[0] / 100)).toFixed(4)
      ),
      this.calculateThresholdSpeedNumZoneFollow(
        (1 / (thresholdSpeedRange[1] / 100)).toFixed(4)
      ),
    ];
  }
  calculateThresholdHeartRateNumZone(thresholdHeartRate) {
    if (!thresholdHeartRate) {
      return "";
    }
    return calculateThresholdHeartRateNumZoneFollow(
      (thresholdHeartRate / 100).toFixed(4)
    );
  }
  calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange) {
    if (!thresholdHeartRateRange[0] || !thresholdHeartRateRange[1]) {
      return ["", ""];
    }
    return [
      calculateThresholdHeartRateNumZoneFollow(
        (thresholdHeartRateRange[0] / 100).toFixed(4)
      ),
      calculateThresholdHeartRateNumZoneFollow(
        (thresholdHeartRateRange[1] / 100).toFixed(4)
      ),
    ];
  }
  calculateTargetSpeedRangeNumZone(targetSpeedRange) {
    if (!targetSpeedRange[0] || !targetSpeedRange[1]) {
      return ["", ""];
    }
    // 检查 run 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.run) {
      return ["", ""];
    }
    const timer1 = mmssToSeconds(targetSpeedRange[0]);
    const timer2 = mmssToSeconds(targetSpeedRange[1]);
    return [
      this.calculateThresholdSpeedNumZoneFollow(
        (timer1 / this.athleticThreshold.run).toFixed(4)
      ),
      this.calculateThresholdSpeedNumZoneFollow(
        (timer2 / this.athleticThreshold.run).toFixed(4)
      ),
    ];
  }
  calculateTargetSpeedNumZone(targetSpeed) {
    if (!targetSpeed) {
      return "";
    }
    // 检查 run 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.run) {
      return "";
    }
    const timer1 = mmssToSeconds(targetSpeed);
    return this.calculateThresholdSpeedNumZoneFollow(
      (timer1 / this.athleticThreshold.run).toFixed(4)
    );
  }
  calculateTargetHeartRateRangeNumZone(targetHeartRateRange) {
    if (!targetHeartRateRange[0] || !targetHeartRateRange[1]) {
      return ["", ""];
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return ["", ""];
    }
    return [
      calculateThresholdHeartRateNumZoneFollow(
        (targetHeartRateRange[0] / this.athleticThreshold.heartRate).toFixed(4)
      ),
      calculateThresholdHeartRateNumZoneFollow(
        (targetHeartRateRange[1] / this.athleticThreshold.heartRate).toFixed(4)
      ),
    ];
  }
  calculateTargetHeartRateNumZone(targetHeartRate) {
    if (!targetHeartRate) {
      return "";
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return "";
    }
    return calculateThresholdHeartRateNumZoneFollow(
      (targetHeartRate / this.athleticThreshold.heartRate).toFixed(4)
    );
  }
  updateClassInfoCalculatedValues() {
    this.classInfo.stages.forEach((stage, stageIndex) => {
      stage.sections.forEach((section, sectionIndex) => {
        if (section.thresholdSpeed !== undefined) {
          section.thresholdSpeedNum = this.calculateThresholdSpeedNum(
            section.thresholdSpeed
          );
          section.thresholdSpeedNumZone = this.calculateThresholdSpeedNumZone(
            section.thresholdSpeed
          );
        }
        if (section.thresholdSpeedRange !== undefined) {
          section.thresholdSpeedRangeNum = this.calculateThresholdSpeedRangeNum(
            section.thresholdSpeedRange
          );
          section.thresholdSpeedRangeNumZone =
            this.calculateThresholdSpeedRangeNumZone(
              section.thresholdSpeedRange
            );
        }
        if (section.thresholdHeartRate !== undefined) {
          section.thresholdHeartRateNum = this.calculateThresholdHeartRateNum(
            section.thresholdHeartRate
          );
          section.thresholdHeartRateNumZone =
            this.calculateThresholdHeartRateNumZone(section.thresholdHeartRate);
        }
        if (section.thresholdHeartRateRange !== undefined) {
          section.thresholdHeartRateRangeNum =
            this.calculateThresholdHeartRateRangeNum(
              section.thresholdHeartRateRange
            );
          section.thresholdHeartRateRangeNumZone =
            this.calculateThresholdHeartRateRangeNumZone(
              section.thresholdHeartRateRange
            );
        }
        if (section.targetSpeed !== undefined) {
          section.targetSpeedNumZone = this.calculateTargetSpeedNumZone(
            section.targetSpeed
          );
        }
        if (section.targetSpeedRange !== undefined) {
          section.targetSpeedRangeNumZone =
            this.calculateTargetSpeedRangeNumZone(section.targetSpeedRange);
        }
        if (section.targetHeartRate !== undefined) {
          section.targetHeartRateNumZone = this.calculateTargetHeartRateNumZone(
            section.targetHeartRate
          );
        }
        if (section.targetHeartRateRange !== undefined) {
          section.targetHeartRateRangeNumZone =
            this.calculateTargetHeartRateRangeNumZone(
              section.targetHeartRateRange
            );
        }
      });
    });
    return this.classInfo;
  }
}

// 骑行 计算类
export class CalculateBike {
  constructor(athleticThreshold, classInfo) {
    this.classInfo = classInfo;
    this.athleticThreshold = athleticThreshold;
  }
  calculateThresholdFtpNum(thresholdFtp) {
    if (!thresholdFtp) {
      return 0;
    }
    // 检查 cycle 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.cycle) {
      return 0;
    }
    return Math.round(this.athleticThreshold.cycle * (thresholdFtp / 100));
  }
  calculateThresholdFtpRangeNum(thresholdFtpRange) {
    if (!thresholdFtpRange[0] || !thresholdFtpRange[1]) {
      return [0, 0];
    }
    // 检查 cycle 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.cycle) {
      return [0, 0];
    }
    return [
      Math.round(this.athleticThreshold.cycle * (thresholdFtpRange[0] / 100)),
      Math.round(this.athleticThreshold.cycle * (thresholdFtpRange[1] / 100)),
    ];
  }
  calculateThresholdHeartRateNum(thresholdHeartRate) {
    if (!thresholdHeartRate) {
      return 0;
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return 0;
    }
    return Math.round(
      this.athleticThreshold.heartRate * (thresholdHeartRate / 100)
    );
  }
  calculateThresholdHeartRateRangeNum(thresholdHeartRateRange) {
    if (!thresholdHeartRateRange[0] || !thresholdHeartRateRange[1]) {
      return [0, 0];
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return [0, 0];
    }
    return [
      Math.round(
        this.athleticThreshold.heartRate * (thresholdHeartRateRange[0] / 100)
      ),
      Math.round(
        this.athleticThreshold.heartRate * (thresholdHeartRateRange[1] / 100)
      ),
    ];
  }
  calculateThresholdFtpRangeNumZoneFollow(reciprocal) {
    const one1 = 0.4;
    const one = 0.71;
    const two = 0.83;
    const three = 0.91;
    const four = 0.99;
    const five = 1.02;
    const six = 1.1;
    if (reciprocal < one1) {
      return "热身/冷身";
    } else if (reciprocal < one) {
      return "z1";
    } else if (reciprocal < two) {
      return "z2";
    } else if (reciprocal < three) {
      return "z3";
    } else if (reciprocal < four) {
      return "z4";
    } else if (reciprocal < five) {
      return "z5A";
    } else if (reciprocal < six) {
      return "z5B";
    } else {
      return "z5C";
    }
  }
  calculateThresholdFtpNumZone(thresholdFtp) {
    if (!thresholdFtp) {
      return "";
    }
    return this.calculateThresholdFtpRangeNumZoneFollow(
      (thresholdFtp / 100).toFixed(4)
    );
  }
  calculateThresholdFtpRangeNumZone(thresholdFtpRange) {
    if (!thresholdFtpRange[0] || !thresholdFtpRange[1]) {
      return ["", ""];
    }
    return [
      this.calculateThresholdFtpRangeNumZoneFollow(
        (thresholdFtpRange[0] / 100).toFixed(4)
      ),
      this.calculateThresholdFtpRangeNumZoneFollow(
        (thresholdFtpRange[1] / 100).toFixed(4)
      ),
    ];
  }
  calculateThresholdHeartRateNumZone(thresholdHeartRate) {
    if (!thresholdHeartRate) {
      return "";
    }
    return calculateThresholdHeartRateNumZoneFollow(
      (thresholdHeartRate / 100).toFixed(4)
    );
  }
  calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange) {
    if (!thresholdHeartRateRange[0] || !thresholdHeartRateRange[1]) {
      return ["", ""];
    }
    return [
      calculateThresholdHeartRateNumZoneFollow(
        (thresholdHeartRateRange[0] / 100).toFixed(4)
      ),
      calculateThresholdHeartRateNumZoneFollow(
        (thresholdHeartRateRange[1] / 100).toFixed(4)
      ),
    ];
  }
  calculateTargetFtpRangeNumZone(targetFtpRange) {
    if (!targetFtpRange[0] || !targetFtpRange[1]) {
      return ["", ""];
    }
    // 检查 cycle 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.cycle) {
      return ["", ""];
    }
    return [
      this.calculateThresholdFtpRangeNumZoneFollow(
        (targetFtpRange[0] / this.athleticThreshold.cycle).toFixed(4)
      ),
      this.calculateThresholdFtpRangeNumZoneFollow(
        (targetFtpRange[1] / this.athleticThreshold.cycle).toFixed(4)
      ),
    ];
  }
  calculateTargetFtpNumZone(targetFtp) {
    if (!targetFtp) {
      return "";
    }
    // 检查 cycle 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.cycle) {
      return "";
    }
    return this.calculateThresholdFtpRangeNumZoneFollow(
      (targetFtp / this.athleticThreshold.cycle).toFixed(4)
    );
  }
  calculateTargetHeartRateRangeNumZone(targetHeartRateRange) {
    if (!targetHeartRateRange[0] || !targetHeartRateRange[1]) {
      return ["", ""];
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return ["", ""];
    }
    return [
      calculateThresholdHeartRateNumZoneFollow(
        (targetHeartRateRange[0] / this.athleticThreshold.heartRate).toFixed(4)
      ),
      calculateThresholdHeartRateNumZoneFollow(
        (targetHeartRateRange[1] / this.athleticThreshold.heartRate).toFixed(4)
      ),
    ];
  }
  calculateTargetHeartRateNumZone(targetHeartRate) {
    if (!targetHeartRate) {
      return "";
    }
    // 检查 heartRate 是否存在，避免 NaN
    if (!this.athleticThreshold || !this.athleticThreshold.heartRate) {
      return "";
    }
    return calculateThresholdHeartRateNumZoneFollow(
      (targetHeartRate / this.athleticThreshold.heartRate).toFixed(4)
    );
  }
  updateClassInfoCalculatedValues() {
    this.classInfo.stages.forEach((stage, stageIndex) => {
      stage.sections.forEach((section, sectionIndex) => {
        if (section.thresholdFtp !== undefined) {
          section.thresholdFtpNum = this.calculateThresholdFtpNum(
            section.thresholdFtp
          );
          section.thresholdFtpNumZone = this.calculateThresholdFtpNumZone(
            section.thresholdFtp
          );
        }
        if (section.thresholdFtpRange !== undefined) {
          section.thresholdFtpRangeNum = this.calculateThresholdFtpRangeNum(
            section.thresholdFtpRange
          );
          section.thresholdFtpRangeNumZone =
            this.calculateThresholdFtpRangeNumZone(section.thresholdFtpRange);
        }
        if (section.thresholdHeartRate !== undefined) {
          section.thresholdHeartRateNum = this.calculateThresholdHeartRateNum(
            section.thresholdHeartRate
          );
          section.thresholdHeartRateNumZone =
            this.calculateThresholdHeartRateNumZone(section.thresholdHeartRate);
        }
        if (section.thresholdHeartRateRange !== undefined) {
          section.thresholdHeartRateRangeNum =
            this.calculateThresholdHeartRateRangeNum(
              section.thresholdHeartRateRange
            );
          section.thresholdHeartRateRangeNumZone =
            this.calculateThresholdHeartRateRangeNumZone(
              section.thresholdHeartRateRange
            );
        }
        if (section.targetFtp !== undefined) {
          section.targetFtpNumZone = this.calculateTargetFtpNumZone(
            section.targetFtp
          );
        }
        if (section.targetFtpRange !== undefined) {
          section.targetFtpRangeNumZone = this.calculateTargetFtpRangeNumZone(
            section.targetFtpRange
          );
        }
        if (section.targetHeartRate !== undefined) {
          section.targetHeartRateNumZone = this.calculateTargetHeartRateNumZone(
            section.targetHeartRate
          );
        }
        if (section.targetHeartRateRange !== undefined) {
          section.targetHeartRateRangeNumZone =
            this.calculateTargetHeartRateRangeNumZone(
              section.targetHeartRateRange
            );
        }
      });
    });
    return this.classInfo;
  }
}
// 文本截取
export function truncateByLines(str, maxLines = 6) {
  const lines = str.split("\n");
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join("\n") + "...";
  }
  return str;
}
// 跑步数据校验
export const checkForm = (classInfo) => {
  for (let i = 0; i < classInfo.stages.length; i++) {
    for (let j = 0; j < classInfo.stages[i].sections.length; j++) {
      if (
        classInfo.stages[i].sections[j].capacity === "time" &&
        classInfo.stages[i].sections[j].target === "00:00:00"
      ) {
        return {
          isValid: false,
          message: `阶段${i + 1}的段落${j + 1}的目标时间不能为00:00:00`,
        };
      }
      if (
        classInfo.stages[i].sections[j].capacity === "distance" &&
        !classInfo.stages[i].sections[j].targetDistance
      ) {
        return {
          isValid: false,
          message: `阶段${i + 1}的段落${j + 1}的目标距离不能为0`,
        };
      }
      if (classInfo.mode === 1) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].thresholdSpeedRange[0] ||
            !classInfo.stages[i].sections[j].thresholdSpeedRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值配速范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].thresholdSpeed
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值配速不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 2) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].thresholdHeartRateRange[0] ||
            !classInfo.stages[i].sections[j].thresholdHeartRateRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值心率范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].thresholdHeartRate
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值心率不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 3) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].targetSpeedRange[0] ||
            !classInfo.stages[i].sections[j].targetSpeedRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的配速范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].targetSpeed
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的配速不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 4) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].targetHeartRateRange[0] ||
            !classInfo.stages[i].sections[j].targetHeartRateRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的心率范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].targetHeartRate
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的心率不能为空或者为0`,
          };
        }
      }
    }
  }
  return { isValid: true };
};
// 骑行数据校验

export const checkFormBike = (classInfo) => {
  for (let i = 0; i < classInfo.stages.length; i++) {
    for (let j = 0; j < classInfo.stages[i].sections.length; j++) {
      if (
        classInfo.stages[i].sections[j].capacity === "time" &&
        classInfo.stages[i].sections[j].target === "00:00:00"
      ) {
        return {
          isValid: false,
          message: `阶段${i + 1}的段落${j + 1}的目标时间不能为00:00:00`,
        };
      }
      if (classInfo.mode === 1) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].thresholdFtpRange[0] ||
            !classInfo.stages[i].sections[j].thresholdFtpRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值功率不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].thresholdFtp
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值功率不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 2) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].thresholdHeartRateRange[0] ||
            !classInfo.stages[i].sections[j].thresholdHeartRateRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值心率不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].thresholdHeartRate
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的阀值心率不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 3) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].targetFtpRange[0] ||
            !classInfo.stages[i].sections[j].targetFtpRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的固定功率范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].targetFtp
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的固定功率不能为空或者为0`,
          };
        }
      }
      if (classInfo.mode === 4) {
        if (
          classInfo.stages[i].sections[j].range === "range" &&
          (!classInfo.stages[i].sections[j].targetHeartRateRange[0] ||
            !classInfo.stages[i].sections[j].targetHeartRateRange[1])
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的心率范围不能为空或者为0`,
          };
        }
        if (
          classInfo.stages[i].sections[j].range === "target" &&
          !classInfo.stages[i].sections[j].targetHeartRate
        ) {
          return {
            isValid: false,
            message: `阶段${i + 1}的段落${j + 1}的心率不能为空或者为0`,
          };
        }
      }
    }
  }
  return { isValid: true };
};

// 消息提示
let messageInstance = null;
const resetMessage = (options) => {
  if (messageInstance) {
    messageInstance.close();
  }
  messageInstance = Message(options);
};
["error", "success", "info", "warning"].forEach((type) => {
  resetMessage[type] = (options) => {
    if (typeof options === "string") {
      options = {
        message: options,
      };
    }
    options.type = type;
    return resetMessage(options);
  };
});
export const message = resetMessage;
