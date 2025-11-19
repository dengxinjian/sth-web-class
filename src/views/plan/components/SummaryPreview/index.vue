<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="680px"
    append-to-body
    :before-close="onCancel"
    class="add-class-title-modal"
    :close-on-click-modal="false"
  >
    <span slot="title">概要</span>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
    >
      <el-form-item label="计划名称" prop="planTitle">
        <!-- <el-input
          v-model="form.planTitle"
          maxlength="20"
          show-word-limit
          placeholder="请输入计划名称"
          clearable
        /> -->
        <span>{{ planInfo.planTitle }}</span>
      </el-form-item>

      <el-form-item label="分组选择" prop="planGroupId">
        <!-- <el-select
          v-model="form.planGroupId"
          placeholder="请选择分组"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in groupOptions"
            :key="g.id"
            :label="g.planClassesGroup"
            :value="g.id"
          />
        </el-select> -->
        <span>{{ planInfo.planGroupName }}</span>
      </el-form-item>

      <el-form-item label="团队" prop="teamId">
        <!-- <el-select
          v-model="form.teamId"
          placeholder="请选择团队"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="g in teamOptions"
            :key="g.id"
            :label="g.teamName"
            :value="g.id"
          />
        </el-select> -->
        <span>{{ planInfo.teamName }}</span>
      </el-form-item>

      <el-form-item label="计划源">
        <span>{{ planInfo.teamName }} - {{ planInfo.possessNickname }}</span>
      </el-form-item>

      <el-form-item label="拥有者">
        <span>{{ planInfo.possessNickname }}</span>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <!-- <el-input v-model="form.email" placeholder="请输入邮箱" /> -->
         <span>{{ planInfo.email }}</span>
      </el-form-item>

      <el-form-item label="微信号" prop="weChat">
        <!-- <el-input v-model="form.weChat" placeholder="请输入微信号" /> -->
        <span>{{ planInfo.weChat }}</span>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <!-- <el-input
          type="textarea"
          v-model="form.description"
          placeholder="请输入描述"
        /> -->
        <span>{{ planInfo.description }}</span>
      </el-form-item>

      <el-form-item label="计划周期" prop="groupId">
        <span>{{ planClasses.length }}周</span>
      </el-form-item>

      <el-form-item label="统计">
        <el-row>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">类型</el-col>
              <el-col :span="8">时长</el-col>
              <el-col :span="8">距离</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">游泳</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekSwimmingDuration()) === "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekSwimmingDuration())
                }}/周</el-col
              >
              <el-col :span="8">{{ getweekSwimmingDistance() }}
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">骑行</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekCycleDuration()) === "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekCycleDuration())
                }}/周</el-col
              >
              <el-col :span="8"
                >{{ getweekCycleDistance() > 0 ? getweekCycleDistance() : ""
                }}{{ getweekCycleDistance() > 0 ? " km/周" : "NA" }}
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">跑步</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekRunDuration()) === "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekRunDuration())
                }}/周</el-col
              >
              <el-col :span="8">{{ getweekRunDistance() }}</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">力量</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekPowerDuration()) === "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekPowerDuration())
                }}/周</el-col
              >
              <el-col :span="8">NA</el-col>
            </el-row>
          </el-col>
          <el-col :span="24">
            <el-row>
              <el-col :span="8">其他</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekOtherDuration()) || "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekOtherDuration())
                }}/周</el-col
              >
              <el-col :span="8">NA</el-col>
            </el-row>
          </el-col>
          <el-col :span="24" style="border-top: 1px dashed #e5e6eb">
            <el-row>
              <el-col :span="8">总计</el-col>
              <el-col :span="8"
                >{{
                  secondsToHHMMSS(getweekDuration()) === "00:00:00"
                    ? "--:--:--"
                    : secondsToHHMMSS(getweekDuration())
                }}
                /周</el-col
              >
              <el-col :span="8"
                >{{ getweekDistance()
                }}</el-col
              >
            </el-row>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onCancel">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { getData, submitData } from "@/api/common.js";
import { hhmmssToSeconds, secondsToHHMMSS } from "@/utils/index";
export default {
  name: "SummaryPreview",
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Boolean, default: undefined },
    defaultTitle: { type: String, default: "" },
    defaultGroupId: { type: [String, Number], default: undefined },
    planInfo: { type: Object, default: () => ({}) },
    planClasses: { type: Array, default: () => [] },
  },
  data() {
    return {
      innerVisible: this.visible || this.value || false,
      form: {
        planTitle: undefined,
        planGroupId: undefined,
        teamId: undefined,
        email: undefined,
        weChat: undefined,
        description: undefined,
      },
      rules: {
        planTitle: [
          { required: false, message: "请输入计划标题", trigger: "blur" },
          { min: 1, max: 50, message: "长度在1到20个字符", trigger: "blur" },
        ],
        planGroupId: [
          { required: false, message: "请选择分组", trigger: "change" },
        ],
        teamId: [{ required: false, message: "请选择团队", trigger: "change" }],
      },
      groups: [],
      teams: [],
      emptyPlanClasses: [[], [], [], []],
    };
  },
  computed: {
    groupOptions() {
      return Array.isArray(this.groups) ? this.groups : [];
    },
    teamOptions() {
      return Array.isArray(this.teams) ? this.teams : [];
    },
  },
  watch: {
    visible(val) {
      this.innerVisible = val;
    },
    value(val) {
      if (typeof val !== "undefined") this.innerVisible = val;
    },
    innerVisible(val) {
      this.$emit("update:visible", val);
      this.$emit("input", val);
      if (val) {
        // 获取分组和团队列表
        this.getGroupList();
        this.getTeamList();
        // 如果 planInfo 有数据，重置表单并回显数据；否则只重置表单
        if (this.planInfo && Object.keys(this.planInfo).length > 0) {
          this.resetForm();
          this.$nextTick(() => {
            this.form = {
              planTitle: this.planInfo.planTitle || undefined,
              planGroupId: this.planInfo.planGroupId || undefined,
              teamId: this.planInfo.teamId || undefined,
              email: this.planInfo.email || undefined,
              weChat: this.planInfo.weChat || undefined,
              description: this.planInfo.description || undefined,
            };
            // 清除表单验证状态
            if (this.$refs.formRef) {
              this.$refs.formRef.clearValidate();
            }
          });
        } else {
          // 没有 planInfo 数据，只重置表单
          this.resetForm();
        }
      } else {
        // clear validation when closing
        this.$nextTick(
          () =>
            this.$refs.formRef &&
            this.$refs.formRef.clearValidate &&
            this.$refs.formRef.clearValidate()
        );
      }
    },
    planInfo(val) {
      // 如果对话框已打开且有数据，则回显数据
      if (this.innerVisible && val && Object.keys(val).length > 0) {
        this.resetForm();
        this.$nextTick(() => {
          this.form = {
            planTitle: val.planTitle || undefined,
            planGroupId: val.planGroupId || undefined,
            teamId: val.teamId || undefined,
            email: val.email || undefined,
            weChat: val.weChat || undefined,
            description: val.description || undefined,
          };
          // 清除表单验证状态
          if (this.$refs.formRef) {
            this.$refs.formRef.clearValidate();
          }
        });
      }
    },
  },
  methods: {
    secondsToHHMMSS,
    getGroupList() {
      getData({
        url: "/api/planClassesGroup/option",
      }).then((res) => {
        this.groups = res.result;
      });
    },
    getTeamList() {
      getData({
        url: "/api/team/coach/all-teams",
      }).then((res) => {
        this.teams = res.result;
      });
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
        console.log(params, "params");
        submitData({
          url: "/api/planClasses/updatePlanClasses",
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

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / 4 || 0;
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
      const weekDistance = distanceTotal / 4 || 0;
      if (weekDistance === 0) return "NA";
      return weekDistance + " km/周";
    },
    // 计算周运动游泳时长总和
    getweekSwimmingDuration() {
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

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "SWIM"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / 4 || 0;
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
      const weekDistance = distanceTotal / 4 || 0;
      if (weekDistance === 0) return "NA";
      return weekDistance / 1000 + " km/周";
    },
    // 计算周骑行时长总和
    getweekCycleDuration() {
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

            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "CYCLE"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / 4 || 0;
    },
    // 计算周骑行距离总和
    getweekCycleDistance() {
      const week = this.planClasses.flat();
      if (!week || !Array.isArray(week)) {
        return 0;
      }
      const distanceTotal = week.reduce((acc, item,index) => {
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
      const weekDistance = distanceTotal / 4 || 0;
      if (weekDistance === 0) return "NA";
      return weekDistance + " km/周";
    },
    // 计算周跑步时长总和
    getweekRunDuration() {
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
            if (
              !classesJson.duration ||
              classesJson.duration === "00:00:00" ||
              classesJson.duration === "--:--:--" ||
              classItem.sportType !== "RUN"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / 4 || 0;
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
            // console.log("classesJson.distance-跑步", classesJson);
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
      const weekDistance = distanceTotal / 4 || 0;
      // console.log("weekDistance-跑步", weekDistance);
      if (weekDistance === 0) return "NA";
      return weekDistance + " km/周";
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
      return durationTotal / 4 || 0;
    },
    // 计算周其他时长总和
    getweekOtherDuration() {
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
              classItem.sportType !== "OTHER"
            ) {
              return classAcc;
            }
            return classAcc + hhmmssToSeconds(classItem.classesJson.duration);
          }, 0)
        );
      }, 0);
      return durationTotal / 4 || 0;
    },
  },
};
</script>

<style scoped>
.add-class-title-modal ::v-deep(.el-dialog__header) {
  padding: 16px 24px;
}
.add-class-title-modal ::v-deep(.el-dialog__body) {
  padding: 10px 24px 0 24px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
}
.statistics-divider-wrapper {
  margin: 8px 0;
}
.statistics-divider-wrapper ::v-deep(.el-divider__text) {
  font-size: 12px;
}
</style>
