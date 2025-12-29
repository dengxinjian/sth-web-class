<template>
  <div class="hover-plan-detail">
    <!-- <h2>概要</h2> -->
    <div class="detail-row-box">
      <div class="detail-row-title">计划名称</div>
      <div class="detail-row-content">{{ planDetail.planTitle }}</div>
    </div>
    <div class="detail-row-box" v-if="planDetail?.teamName">
      <div class="detail-row-title">团队</div>
      <div class="detail-row-content">{{ planDetail.teamName }}</div>
    </div>
    <div class="detail-row-box">
      <div class="detail-row-title">计划源</div>
      <div class="detail-row-content">
        {{
          planDetail.planSourceTeamIdName
            ? `${planDetail.planSourceTeamIdName} - ${planDetail.planSourceNickname}`
            : planDetail.planSourceNickname
        }}
      </div>
    </div>
    <div class="detail-row-box" v-for="item in renderColumns" :key="item.prop">
      <div class="detail-row-title">{{ item.label }}</div>
      <div class="detail-row-content">{{ planDetail[item.prop] }}</div>
    </div>
    <div class="detail-row-box">
      <div class="detail-row-title">计划难度</div>
      <div class="detail-row-content" style="display: flex; align-items: center; gap: 5px;">
        <el-rate
          v-model="planDetail.level"
          :allow-half="true"
          disabled
          :colors="['#F92B30', '#F92B30', '#F92B30']"
          text-color="#999999"
          disabled-void-color="#E1E4EC"
        ></el-rate>
        <span style="font-size: 10px; color: #979fb0;margin-bottom: 1px;">{{
          planDetail.level ? "" : "未评分"
        }}</span>
      </div>
    </div>
    <div class="detail-row-box">
      <div class="detail-row-title">计划周期</div>
      <div class="detail-row-content">{{ weekNumber }}周</div>
    </div>
    <div class="detail-row-box">
      <div class="detail-row-title">统计</div>
      <div class="detail-row-content">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-col :span="5" style="text-align: left">类型</el-col>
              <el-col :span="9">时长</el-col>
              <el-col :span="9">距离</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5" style="text-align: left">游泳</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekSwimmingDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekSwimmingDuration())
                }}{{
                  secondsToHHMMSS(getweekSwimmingDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9"
                >{{ getweekSwimmingDistance() || "N/A" }}
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">骑行</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekCycleDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekCycleDuration())
                }}{{
                  secondsToHHMMSS(getweekCycleDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekCycleDistance() || "N/A" }} </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">跑步</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekRunDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekRunDuration())
                }}{{
                  secondsToHHMMSS(getweekRunDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekRunDistance() || "N/A" }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">力量</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekPowerDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekPowerDuration())
                }}{{
                  secondsToHHMMSS(getweekPowerDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{
                getweekPowerAndOtherDistance("STRENGTH") || "N/A"
              }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">其他</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekOtherDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekOtherDuration())
                }}{{
                  secondsToHHMMSS(getweekOtherDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{
                getweekPowerAndOtherDistance("OTHER") || "N/A"
              }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24" style="border-top: 1px dashed #e5e6eb">
            <el-row>
              <el-col :span="5">总计</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekDuration())
                }}
                {{
                  secondsToHHMMSS(getweekDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekDistance() || "N/A" }}</el-col>
            </el-row>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- <el-form ref="formRef" label-width="70px" size="small"> -->
    <!-- <el-form-item label="计划名称" prop="planTitle">
        <span>{{ planDetail.planTitle }}</span>
      </el-form-item>

      <el-form-item label="团队" prop="teamId" v-if="planDetail?.teamName">
        <span>{{ planDetail.teamName }}</span>
      </el-form-item>

      <el-form-item label="计划源">
        <span>{{ planDetail.teamName ? `${planDetail.teamName} - ${planDetail.planSourceNickname}` : planDetail.planSourceNickname }}</span>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <span>{{ planDetail.email }}</span>
      </el-form-item>

      <el-form-item label="微信号" prop="weChat">
        <span>{{ planDetail.weChat }}</span>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <span>{{ planDetail.description }}</span>
      </el-form-item>

      <el-form-item label="计划周期" prop="groupId">
        <span>{{ weekNumber }}周</span> -->
    <!-- </el-form-item> -->

    <!-- <el-form-item label="统计">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">类型</el-col>
              <el-col :span="9">时长</el-col>
              <el-col :span="9">距离</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">游泳</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekSwimmingDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekSwimmingDuration())
                }}{{
                  secondsToHHMMSS(getweekSwimmingDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9"
                >{{ getweekSwimmingDistance() || "N/A" }}
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">骑行</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekCycleDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekCycleDuration())
                }}{{
                  secondsToHHMMSS(getweekCycleDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekCycleDistance() || "N/A" }} </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">跑步</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekRunDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekRunDuration())
                }}{{
                  secondsToHHMMSS(getweekRunDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekRunDistance() || "N/A" }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">力量</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekPowerDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekPowerDuration())
                }}{{
                  secondsToHHMMSS(getweekPowerDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{
                getweekPowerAndOtherDistance("STRENGTH") || "N/A"
              }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="5">其他</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekOtherDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekOtherDuration())
                }}{{
                  secondsToHHMMSS(getweekOtherDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{
                getweekPowerAndOtherDistance("OTHER") || "N/A"
              }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24" style="border-top: 1px dashed #e5e6eb">
            <el-row>
              <el-col :span="5">总计</el-col>
              <el-col :span="9"
                >{{
                  secondsToHHMMSS(getweekDuration()) === "00:00:00"
                    ? "N/A"
                    : secondsToHHMMSS(getweekDuration())
                }}
                {{
                  secondsToHHMMSS(getweekDuration()) === "00:00:00"
                    ? ""
                    : " /周"
                }}</el-col
              >
              <el-col :span="9">{{ getweekDistance() || "N/A" }}</el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form> -->
  </div>
</template>
<script>
import { getData, submitData } from "@/utils/request";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils/index";
// 服务和工具导入
import { planApi } from "../../services/planManagement";
export default {
  name: "HoverPlanDetail",
  props: {
    planInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      renderColumns: [
        // { label: "计划名称", prop: "planTitle" },
        // { label: "团队", prop: "teamName" },
        // { label: "计划源", prop: "planSourceNickname" },
        { label: "邮箱", prop: "email" },
        { label: "微信号", prop: "weChat" },
        { label: "描述", prop: "description" },
      ],
      groups: [],
      teams: [],
      emptyPlanClasses: [[], [], [], []],
      loginType: localStorage.getItem("loginType") || "",
      planList: [],
      weekNumber: 0,
      form: {},
      planDetail: {},
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
    },
    teamOptions() {
      return Array.isArray(this.teams) ? this.teams : [];
    },
    planClasses() {
      // 从 planInfo 中获取计划列表数据
      if (this.planInfo && this.planInfo.planList) {
        return this.planInfo.planList;
      }
      if (this.planInfo && this.planInfo.dayDetails) {
        return this.planInfo.dayDetails;
      }
      if (this.planList && this.planList.length > 0) {
        return this.planList;
      }
      return [];
    },
  },
  watch: {
    planInfo: {
      handler(newVal) {
        // console.log("newVal-planInfo", newVal);
        if (
          newVal &&
          typeof newVal === "object" &&
          Object.keys(newVal).length > 0
        ) {
          this.getPlanDetail(newVal.id);
          this.getPlanDayDetail(newVal.id);
        }
      },
      immediate: true,
      deep: true,
    },
    planClasses(newVal) {
      if (newVal && Array.isArray(newVal) && newVal.length > 0) {
        const newDayDetailList = newVal
          .flat()
          .filter(
            (item) =>
              (item.details &&
                Array.isArray(item.details) &&
                item.details.length > 0) ||
              (item.competitionDtoList &&
                Array.isArray(item.competitionDtoList) &&
                item.competitionDtoList.length > 0)
          );
        const lastItem = newDayDetailList[newDayDetailList.length - 1];
        const day = lastItem?.day;
        if (
          day != null &&
          typeof day === "number" &&
          !isNaN(day) &&
          isFinite(day)
        ) {
          this.weekNumber = Math.ceil(day / 7);
        } else {
          this.weekNumber = 0;
        }
      }
    },
  },
  methods: {
    secondsToHHMMSS,
    planSource() {
      const planSourceNickname = this.planInfo.planSourceTeamIdName || "";
      const owner = this.planInfo.planSourceNickname || "";
      if (!planSourceNickname && !owner) return "";
      if (!owner) return planSourceNickname;
      if (!planSourceNickname) return owner;
      return `${planSourceNickname} - ${owner}`;
    },
    loadPlanDetail(planId) {
      // 如果需要加载完整的计划详情，可以在这里实现
      // 考虑到这是 hover 场景，暂时不自动加载，避免性能问题
      if (!planId) return;
      // 可以在这里添加加载逻辑，如果需要的话
    },
    /**
     * 获取计划详情
     */
    async getPlanDetail(id) {
      const res = await planApi.getPlanDetail(id);
      // console.log(res.result, "*======res.result-计划详情-概要展示");
      this.planDetail = res.result;
    },
    async getPlanDayDetail(id) {
      const resDayDetail = await planApi.getPlanDayDetail(id);
      // 处理并重组数据
      const completeData = this.completePlanDayData(resDayDetail.result);
      const formattedData = this.formatPlanDayDetail(completeData);

      // return formattedData;
      this.planList = formattedData;
    },
    /**
     * 处理计划日常详情数据，重组为按天分组的格式，并按每7天一组组成二维数组
     * @param {Array} data - getPlanDayDetail接口返回的数据
     * @returns {Array} 重组后的数据格式 [[{day: 1, details: [...]}, ...], [{day: 8, details: [...]}, ...], ...]
     */
    formatPlanDayDetail(data) {
      const result = [];
      // 将data中的28条数据，按每7天一组组成二维数组
      for (let i = 0; i < data.length; i += 7) {
        result.push(data.slice(i, i + 7));
      }
      return result;
    },
    /**
     * 补充完整周数的数据
     * 根据最后一条数据的day值除以7向上取整作为周数
     * 如果周数小于4，则补充数据至4周（28天）
     * 如果周数大于等于4，则补充数据至当前周数（周数 * 7天）
     * @param {Array} data - getPlanDayDetail接口返回的原始数据
     * @returns {Array} 补充完整后的数据
     */
    completePlanDayData(data) {
      if (!Array.isArray(data) || data.length === 0) {
        // 如果数据为空，返回28天的空数据（4周）
        const result = [];
        for (let day = 1; day <= 28; day++) {
          result.push({
            day: day,
            details: [],
            competitionDtoList: [],
          });
        }
        return result;
      }

      // 创建day到数据的映射，方便查找
      const dayMap = new Map();
      data.forEach((item) => {
        dayMap.set(item.day, item);
      });

      // 找到最大的day值（最后一条数据的day）
      const maxDay = Math.max(...data.map((item) => item.day));

      // 计算周数：最后一条day的数值除以7向上取整
      const weekCount = Math.ceil(maxDay / 7);

      // 确定目标天数
      let targetDays;
      if (weekCount < 4) {
        // 如果周数小于4，补充至4周（28天）
        targetDays = 28;
      } else {
        // 如果周数大于等于4，补充至当前周数（周数 * 7天）
        targetDays = weekCount * 7;
      }

      // 确保1到目标天数的数据都存在，如果中间有缺失的天数也要补充
      const completeData = [];
      for (let day = 1; day <= targetDays; day++) {
        if (dayMap.has(day)) {
          completeData.push(dayMap.get(day));
        } else {
          const newDayData = {
            day: day,
            details: [],
            // 将原始数据中的competitionDtoList补充到新数据中
            competitionDtoList:
              data.find((item) => item.day === day)?.competitionDtoList || [],
          };
          completeData.push(newDayData);
          // 同时更新dayMap，保持一致性
          dayMap.set(day, newDayData);
        }
      }

      return completeData;
    },
    onCancel() {
      this.innerVisible = false;
      this.$emit("cancel");
    },
    onConfirm() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return;
        const params = {
          ...this.planInfo,
          ...this.form,
        };
        // console.log(params, "params");
        submitData({
          url: "/training/api/planClasses/updatePlanClasses",
          requestData: params,
        }).then((res) => {
          if (res.success) {
            this.$message.success("更新成功");
            this.innerVisible = false;
            this.$emit("cancel", true);
          }
        });
      });
    },
    validateEmail() {
      // 手动触发表单校验
      this.$refs.formRef && this.$refs.formRef.validateField("email");
    },
    resetForm() {
      this.form = {
        planTitle: undefined,
        planGroupId: undefined,
        teamId: undefined,
        email: undefined,
        weChat: undefined,
        description: undefined,
      };
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate();
        }
      });
    },
    //  计算周运动sth总值
    getweekSth(weekIndex) {
      const week = this.planList[weekIndex];
      if (!week || !Array.isArray(week)) {
        return 0;
      }

      return week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson || typeof classesJson.sth !== "number") {
              return classAcc;
            }

            return classAcc + classesJson.sth;
          }, 0)
        );
      }, 0);
    },
    // 计算周运动时长总和
    getweekDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week) || week.length === 0) {
        return 0;
      }

      // 解析 classesJson（可能是字符串）
      const parseClassesJson = (classesJson) => {
        if (typeof classesJson === "string") {
          try {
            return JSON.parse(classesJson);
          } catch (error) {
            console.error("解析 classesJson 失败:", error);
            return null;
          }
        }
        return classesJson;
      };

      // 验证时长是否有效
      const isValidDuration = (duration) => {
        return duration && duration !== "00:00:00" && duration !== "--:--:--";
      };

      // 计算单个课程项的时长
      const calculateClassDuration = (classItem, index) => {
        if (!classItem) {
          return 0;
        }
        const classesJson = parseClassesJson(classItem.classesJson);
        if (!classesJson || !isValidDuration(classesJson.duration)) {
          return 0;
        }

        return hhmmssToSeconds(classesJson.duration);
      };

      // 计算总时长
      const durationTotal = week.reduce((acc, item, index) => {
        if (!item?.details || !Array.isArray(item.details)) {
          return acc;
        }

        const itemDuration = item.details.reduce(
          (classAcc, classItem) =>
            classAcc + calculateClassDuration(classItem, index),
          0
        );

        return acc + itemDuration;
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    getTotalDistance() {
      return this.planList.reduce((total, week) => {
        return (
          total +
          week.reduce((weekTotal, item) => {
            return (
              weekTotal +
              item.details.reduce((classTotal, classItem) => {
                if (!classItem) {
                  return classTotal;
                }
                let classesJson = classItem.classesJson;
                if (typeof classesJson === "string") {
                  try {
                    classesJson = JSON.parse(classesJson);
                  } catch (error) {
                    console.error("解析 classesJson 失败:", error);
                    return classTotal;
                  }
                }
                if (!classesJson.distance) {
                  return classTotal;
                }
                if (
                  classesJson.sportType === "SWIM" &&
                  classesJson.distanceUnit === "m"
                ) {
                  return classTotal + Number(classesJson.distance) / 1000;
                }
                return classTotal + Number(classesJson.distance);
              }, 0)
            );
          }, 0)
        );
      }, 0);
    },
    // 计算周运动距离总和
    getweekDistance() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item, index) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson.distance) {
              return classAcc;
            }
            if (classesJson.distance === "--" || classesJson.distance === "-") {
              return classAcc;
            }
            if (
              classesJson.sportType === "SWIM" &&
              classesJson.distanceUnit === "m"
            ) {
              return classAcc + Number(classesJson.distance) / 1000;
            }
            // console.log("classesJson.distance-总距离", classesJson.distance, index);
            const total1 = classAcc + Number(classesJson.distance);
            return total1;
          }, 0)
        );
      }, 0);
      // console.log("distanceTotal-总距离", distanceTotal);
      const weekDistance = distanceTotal / this.weekNumber || 0;
      if (weekDistance === 0) return "N/A";
      // 如果是整数，不保留小数；如果有小数，保留两位小数
      const formattedDistance =
        weekDistance % 1 === 0 ? weekDistance : weekDistance.toFixed(2);
      return formattedDistance + " km/周";
    },
    // 计算周运动游泳时长总和
    getweekSwimmingDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week) || week.length === 0) {
        return 0;
      }

      // 解析 classesJson（可能是字符串）
      const parseClassesJson = (classesJson) => {
        if (typeof classesJson === "string") {
          try {
            return JSON.parse(classesJson);
          } catch (error) {
            console.error("解析 classesJson 失败:", error);
            return null;
          }
        }
        return classesJson;
      };

      // 验证时长是否有效
      const isValidDuration = (duration) => {
        return duration && duration !== "00:00:00" && duration !== "--:--:--";
      };

      // 计算单个课程项的时长
      const calculateClassDuration = (classItem) => {
        if (!classItem || classItem.sportType !== "SWIM") {
          return 0;
        }

        const classesJson = parseClassesJson(classItem.classesJson);
        if (!classesJson || !isValidDuration(classesJson.duration)) {
          return 0;
        }

        return hhmmssToSeconds(classesJson.duration);
      };

      // 计算总时长
      const durationTotal = week.reduce((acc, item) => {
        if (!item?.details || !Array.isArray(item.details)) {
          return acc;
        }

        const itemDuration = item.details.reduce(
          (classAcc, classItem) => classAcc + calculateClassDuration(classItem),
          0
        );

        return acc + itemDuration;
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    // 计算周游泳距离总和
    getweekSwimmingDistance() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item, index) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson.distance || classItem.sportType !== "SWIM") {
              return classAcc;
            }
            if (classesJson.distance === "--" || classesJson.distance === "-") {
              return classAcc;
            }
            if (
              classesJson.sportType === "SWIM" &&
              classesJson.distanceUnit === "km"
            ) {
              return classAcc + Number(classesJson.distance) * 1000;
            }
            // console.log("classesJson.distance-游泳", classesJson.distance, index);
            const total1 = classAcc + Number(classesJson.distance);
            // console.log("total1-游泳", total1);
            return total1;
          }, 0)
        );
      }, 0);
      // console.log("distanceTotal-游泳总和", distanceTotal);
      const weekDistance = distanceTotal / this.weekNumber || 0;
      if (weekDistance === 0) return "N/A";
      const distanceKm = weekDistance / 1000;
      // 如果是整数，不保留小数；如果有小数，保留两位小数
      const formattedDistance =
        distanceKm % 1 === 0 ? distanceKm : distanceKm.toFixed(2);
      return formattedDistance + " km/周";
    },
    getweekCycleDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week) || week.length === 0) {
        return 0;
      }

      // 解析 classesJson（可能是字符串）
      const parseClassesJson = (classesJson) => {
        if (typeof classesJson === "string") {
          try {
            return JSON.parse(classesJson);
          } catch (error) {
            console.error("解析 classesJson 失败:", error);
            return null;
          }
        }
        return classesJson;
      };

      // 验证时长是否有效
      const isValidDuration = (duration) => {
        return duration && duration !== "00:00:00" && duration !== "--:--:--";
      };
      // 计算单个课程项的时长
      const calculateClassDuration = (classItem) => {
        if (!classItem || classItem.sportType !== "CYCLE") {
          return 0;
        }

        const classesJson = parseClassesJson(classItem.classesJson);
        if (!classesJson || !isValidDuration(classesJson.duration)) {
          return 0;
        }

        return hhmmssToSeconds(classesJson.duration);
      };

      // 计算总时长
      const durationTotal = week.reduce((acc, item) => {
        if (!item?.details || !Array.isArray(item.details)) {
          return acc;
        }

        const itemDuration = item.details.reduce(
          (classAcc, classItem) => classAcc + calculateClassDuration(classItem),
          0
        );

        return acc + itemDuration;
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    // 计算周骑行距离总和
    getweekCycleDistance() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item, index) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }
            if (!classesJson.distance || classItem.sportType !== "CYCLE") {
              return classAcc;
            }
            if (classesJson.distance === "--" || classesJson.distance === "-") {
              return classAcc;
            }
            if (
              typeof classesJson.distance === "string" &&
              classesJson.distance.includes("km")
            ) {
              return classAcc + Number(classesJson.distance.replace("km", ""));
            }
            // console.log("classesJson.distance-骑行", classesJson.distance, index);
            const total1 = classAcc + Number(classesJson.distance);
            // console.log("total1-骑行", total1);
            return total1;
          }, 0)
        );
      }, 0);
      // console.log("distanceTotal-骑行总和", distanceTotal);
      const weekDistance = distanceTotal / this.weekNumber || 0;
      if (weekDistance === 0) return "N/A";
      // 如果是整数，不保留小数；如果有小数，保留两位小数
      const formattedDistance =
        weekDistance % 1 === 0 ? weekDistance : weekDistance.toFixed(2);
      return formattedDistance + " km/周";
    },
    // 计算周跑步时长总和
    getweekRunDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week) || week.length === 0) {
        return 0;
      }

      // 解析 classesJson（可能是字符串）
      const parseClassesJson = (classesJson) => {
        if (typeof classesJson === "string") {
          try {
            return JSON.parse(classesJson);
          } catch (error) {
            console.error("解析 classesJson 失败:", error);
            return null;
          }
        }
        return classesJson;
      };

      // 验证时长是否有效
      const isValidDuration = (duration) => {
        return duration && duration !== "00:00:00" && duration !== "--:--:--";
      };

      // 计算单个课程项的时长
      const calculateClassDuration = (classItem) => {
        if (!classItem || classItem.sportType !== "RUN") {
          return 0;
        }

        const classesJson = parseClassesJson(classItem.classesJson);
        if (!classesJson || !isValidDuration(classesJson.duration)) {
          return 0;
        }

        return hhmmssToSeconds(classesJson.duration);
      };

      // 计算总时长
      const durationTotal = week.reduce((acc, item) => {
        if (!item?.details || !Array.isArray(item.details)) {
          return acc;
        }

        const itemDuration = item.details.reduce(
          (classAcc, classItem) => classAcc + calculateClassDuration(classItem),
          0
        );

        return acc + itemDuration;
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    // 计算周跑步距离总和
    getweekRunDistance() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item, index) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            // console.log("classesJson.distance-跑步", classesJson.distance, index);
            if (!classesJson.distance || classItem.sportType !== "RUN") {
              return classAcc;
            }
            if (
              !classesJson.distance ||
              classesJson.distance === "--km" ||
              classesJson.distance === "--"
            ) {
              return classAcc;
            }

            // if (
            //   typeof classesJson.distance === "string" &&
            //   classesJson.distance.includes("km")
            // ) {
            //   return classAcc + Number(classesJson.distance.replace("km", "")) * 1000;
            // }
            // console.log("classesJson.distance-跑步", classesJson.distance, index);
            const total1 = classAcc + Number(classesJson.distance);
            // console.log("total1-跑步", total1);
            return total1;
            // return classAcc + Number(classesJson.distance);
          }, 0)
        );
      }, 0);
      // console.log("distanceTotal-跑步总和", distanceTotal);
      const weekDistance = distanceTotal / this.weekNumber || 0;
      // console.log("weekDistance-跑步", weekDistance);
      if (weekDistance === 0) return "N/A";
      // 如果是整数，不保留小数；如果有小数，保留两位小数
      const formattedDistance =
        weekDistance % 1 === 0 ? weekDistance : weekDistance.toFixed(2);
      return formattedDistance + " km/周";
    },
    // 计算周力量时长总和
    getweekPowerDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const durationTotal = week.reduce((acc, item) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }
        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }
            if (
              !classItem.classesJson.duration ||
              classItem.classesJson.duration === "00:00:00" ||
              classItem.classesJson.duration === "--:--:--" ||
              classItem.sportType !== "STRENGTH"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classItem.classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    // 计算周其他时长总和
    getweekOtherDuration() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week) || week.length === 0) {
        return 0;
      }

      // 解析 classesJson（可能是字符串）
      const parseClassesJson = (classesJson) => {
        if (typeof classesJson === "string") {
          try {
            return JSON.parse(classesJson);
          } catch (error) {
            console.error("解析 classesJson 失败:", error);
            return null;
          }
        }
        return classesJson;
      };

      // 验证时长是否有效
      const isValidDuration = (duration) => {
        return duration && duration !== "00:00:00" && duration !== "--:--:--";
      };

      // 计算单个课程项的时长
      const calculateClassDuration = (classItem) => {
        const allowedSportTypes = ["OTHER", "REMARK", "REST"];
        if (!classItem || !allowedSportTypes.includes(classItem.sportType)) {
          return 0;
        }

        const classesJson = parseClassesJson(classItem.classesJson);
        if (!classesJson || !isValidDuration(classesJson.duration)) {
          return 0;
        }

        return hhmmssToSeconds(classesJson.duration);
      };

      // 计算总时长
      const durationTotal = week.reduce((acc, item) => {
        if (!item?.details || !Array.isArray(item.details)) {
          return acc;
        }

        const itemDuration = item.details.reduce(
          (classAcc, classItem) => classAcc + calculateClassDuration(classItem),
          0
        );

        return acc + itemDuration;
      }, 0);
      return durationTotal / this.weekNumber || 0;
    },
    // 计算周力量或其他距离总和
    getweekPowerAndOtherDistance(type) {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item, index) => {
        if (!item || !item.details || !Array.isArray(item.details)) {
          return acc;
        }

        return (
          acc +
          item.details.reduce((classAcc, classItem) => {
            if (!classItem) {
              return classAcc;
            }

            // 处理 classesJson 可能是字符串的情况
            let classesJson = classItem.classesJson;
            if (typeof classesJson === "string") {
              try {
                classesJson = JSON.parse(classesJson);
              } catch (error) {
                console.error("解析 classesJson 失败:", error);
                return classAcc;
              }
            }

            if (!classesJson.distance || classItem.sportType !== type) {
              return classAcc;
            }
            if (
              !classesJson.distance ||
              classesJson.distance === "--km" ||
              classesJson.distance === "--"
            ) {
              return classAcc;
            }
            const total1 = classAcc + Number(classesJson.distance);
            return total1;
          }, 0)
        );
      }, 0);
      const weekDistance = distanceTotal / this.weekNumber || 0;
      if (weekDistance === 0) return "N/A";
      // 如果是整数，不保留小数；如果有小数，保留两位小数
      const formattedDistance =
        weekDistance % 1 === 0 ? weekDistance : weekDistance.toFixed(2);
      return formattedDistance + " km/周";
    },
  },
};
</script>
<style scoped>
.hover-plan-detail {
  padding: 8px;
  font-size: 12px;
  line-height: 1.5;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 16px;

  .el-form {
    max-width: 100%;
    overflow: hidden;
  }

  .el-form-item {
    margin-bottom: 8px;

    .el-form-item__content {
      overflow: hidden;
      display: flex;
      /* align-items: flex-start; */

      span {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 6;
        line-clamp: 6;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-word;
        max-width: 100%;
        font-size: 12px !important;
        color: #999 !important;
      }
    }

    &[prop="description"] .el-form-item__content span {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .el-row {
    margin: 0 !important;

    .el-col {
      padding: 0 !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .detail-row-box {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 6px;
    .detail-row-title {
      width: 50px;
      text-align: right;
      font-size: 12px;
      font-weight: bold;
    }
    .detail-row-content {
      flex: 1;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 6;
      line-clamp: 6;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      font-size: 12px;
      color: #999;
      margin-left: 12px;
    }
  }
}

.detail-item {
  display: flex;
  margin-bottom: 6px;
  align-items: flex-start;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.detail-value {
  color: #303133;
  word-break: break-word;
}

.hover-plan-detail ::v-deep(.el-rate__icon) {
  font-size: 16px;
  margin-top: 1px;
}
</style>

<style>
.hover-plan-detail .el-form-item {
  display: flex !important;
  align-items: flex-start !important;
}

.hover-plan-detail .el-form-item__label {
  font-size: 14px !important;
  line-height: 24px !important;
  padding-top: 0 !important;
}

.hover-plan-detail .el-form-item__content {
  display: flex !important;
  align-items: flex-start !important;
}

.hover-plan-detail .el-form-item__content span {
  font-size: 12px !important;
  color: #999 !important;
}

.hover-plan-detail .el-col {
  padding: 0 !important;
}
</style>
