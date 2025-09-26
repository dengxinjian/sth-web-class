import { mmssToSeconds } from "@/utils/index";
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
    console.log(this.athleticThreshold, "this.athleticThreshold");
  }
  calculateThresholdSpeedRangeNum(thresholdSpeedRange) {
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
    return Math.round(
      this.athleticThreshold.run * (1 / (thresholdSpeed / 100))
    );
  }
  calculateThresholdHeartRateRangeNum(thresholdHeartRateRange) {
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
    const reciprocal = (1 / (thresholdSpeed / 100)).toFixed(4);
    return this.calculateThresholdSpeedNumZoneFollow(reciprocal);
  }
  calculateThresholdSpeedRangeNumZone(thresholdSpeedRange) {
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
    return calculateThresholdHeartRateNumZoneFollow(
      (thresholdHeartRate / 100).toFixed(4)
    );
  }
  calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange) {
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
    const timer1 = mmssToSeconds(targetSpeed);
    return this.calculateThresholdSpeedNumZoneFollow(
      (timer1 / this.athleticThreshold.run).toFixed(4)
    );
  }
  calculateTargetHeartRateRangeNumZone(targetHeartRateRange) {
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
    return Math.round(this.athleticThreshold.cycle * (thresholdFtp / 100));
  }
  calculateThresholdFtpRangeNum(thresholdFtpRange) {
    return [
      Math.round(this.athleticThreshold.cycle * (thresholdFtpRange[0] / 100)),
      Math.round(this.athleticThreshold.cycle * (thresholdFtpRange[1] / 100)),
    ];
  }
  calculateThresholdHeartRateNum(thresholdHeartRate) {
    return Math.round(
      this.athleticThreshold.heartRate * (thresholdHeartRate / 100)
    );
  }
  calculateThresholdHeartRateRangeNum(thresholdHeartRateRange) {
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
    return this.calculateThresholdFtpRangeNumZoneFollow(
      (thresholdFtp / 100).toFixed(4)
    );
  }
  calculateThresholdFtpRangeNumZone(thresholdFtpRange) {
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
    return calculateThresholdHeartRateNumZoneFollow(
      (thresholdHeartRate / 100).toFixed(4)
    );
  }
  calculateThresholdHeartRateRangeNumZone(thresholdHeartRateRange) {
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
    return this.calculateThresholdFtpRangeNumZoneFollow(
      (targetFtp / this.athleticThreshold.cycle).toFixed(4)
    );
  }
  calculateTargetHeartRateRangeNumZone(targetHeartRateRange) {
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

export function truncateByLines(str, maxLines = 6) {
  const lines = str.split("\n");
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join("\n") + "...";
  }
  return str;
}
