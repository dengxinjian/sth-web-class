<template>
  <div class="container">
    <div class="plan-container">
      <div class="type-change">
        <PlanList
          :class-list="classList"
          :active-class-type.sync="activeClassType"
          @class-type-change="handleClassTypeChange"
          @search="handlePlanSearch"
          :show-add-class-btn="true"
          @view-class="handleViewClass"
          @add-plan="handleAddPlan"
          @add-group="handleAddGroup"
          @edit-group="handleEditGroup"
          @delete-group="handleDeleteGroup"
          @choose-plan="handlePlanDayDetail"
        />
      </div>
      <PlannedScheduleView
        :planList="planList"
        :planTitle="planTitle"
        @options-click="handleOptionsClick"
        @view-class="handleViewPlanClass"
      />
    </div>
    <ViewPlanCard
      :visible="showViewClassCard"
      :class-item="classModalData"
      :active-class-type="activeClassType"
      @close="showViewClassCard = false"
      type="view"
    />
    <CopyClassFromOfficial
      v-model="showCopyClassFromOfficial"
      :class-id="copyClassFromOfficialClassId"
      :group-id="copyClassFromOfficialGroupId"
      :data="copyClassFromOfficialData"
      :active-class-type="activeClassType"
      @save="onSaveCopyClassFromOfficial"
    />

    <!-- 添加计划 -->
    <AddPlan v-model="addPlanVisible" />
    <!-- 添加分组 -->
    <AddGroup
      v-model="addGroupVisible"
      :data="currentGroup"
      @save="handleAddGroupSave"
    />
    <!-- 概要 -->
    <SummaryPreview
      v-model="showSummaryPreview"
      :planInfo="currentPlanDetail"
      :planClasses="planList"
      @cancel="handleSummaryPreviewCancel"
    />
    <!-- 复制 -->
    <Copy
      :defaultTitle="`${currentPlanDetail.planTitle}_复制`"
      :defaultGroupId="currentPlanDetail.planGroupId"
      v-model="showCopy"
      :planInfo="currentPlanDetail"
      :planClasses="planList"
      @save="onSaveCopy"
    />
    <!-- 应用教练 -->
    <ApplyCoach
      v-model="showApplyCoach"
      :planInfo="currentPlanDetail"
      @cancel="handleApplyCoachCancel"
    />
    <!-- 应用历史 -->
    <ApplyHistory v-model="showApplyHistory" :planInfo="currentPlanDetail" />
  </div>
</template>

<script>
import { parseClassesJson } from "../classManagement/utils/helpers";
import PlanList from "./components/PlanList.vue";
import ViewPlanCard from "./components/ViewPlanCard/index.vue";
import CopyClassFromOfficial from "../classManagement/components/CopyClassFromOfficial/index.vue";
import PlannedScheduleView from "./components/plannedScheduleView.vue";
import AddPlan from "./components/AddPlan";
import AddGroup from "./components/AddGroup";
import SummaryPreview from "./components/SummaryPreview/index.vue";
import Copy from "./components/Copy/index.vue";
import ApplyCoach from "./components/ApplyCoachhes/ApplyCoach.vue";
import ApplyHistory from "./components/ApplyCoachhes/ApplyHistory.vue";

// 服务和工具导入
import { planApi, groupApi } from "./services/planManagement";

export default {
  name: "PlanView",
  components: {
    PlanList,
    ViewPlanCard,
    CopyClassFromOfficial,
    PlannedScheduleView,
    // PlannedSchedule,
    AddPlan,
    AddGroup,
    SummaryPreview,
    Copy,
    ApplyCoach,
    ApplyHistory,
  },
  data() {
    return {
      classList: [],
      activeClassType: "my",
      showViewClassCard: false,
      classModalData: {},
      moveClassId: "",
      moveGroupId: "",
      moveType: "",
      showMoveGroup: false,
      classModalDataType: "",
      copyClassFromOfficialClassId: "",
      copyClassFromOfficialGroupId: "",
      copyClassFromOfficialData: {},
      showCopyClassFromOfficial: false,
      currentGroup: { id: "", groupName: "" },
      // 对话框状态
      addPlanVisible: false,
      addGroupVisible: false,
      showSummaryPreview: false,
      showCopy: false,
      showApplyCoach: false,
      showApplyAthlete: false,
      showApplyHistory: false,
      currentPlanId: "",
      currentPlanGroupId: "",
      planTitle: "",
      planList: [
        // [
        //   {
        //     day: 1,
        //     details: [
        //       {
        //         classesJson:
        //           '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
        //         classesTitle: "STH_轻松骑@2h30min",
        //         label: "[]",
        //         sportType: "CYCLE",
        //       },
        //     ],
        //   },
        //   {
        //     day: 4,
        //     details: [
        //       {
        //         classesJson:
        //           '{"id":"","sportType":"RUN","title":"STH_马拉松赛-H(补给分段)","groupId":6,"duration":"--:--:--","distance":21.3,"sth":"","mode":1,"summary":"马拉松比赛/比赛手表可选项","tags":[],"stages":[{"times":1,"sections":[{"title":"出发","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":7,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第一支胶","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":6,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第二支胶&盐丸","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":5,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第三支胶&尽力加速","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":3.3,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[95,98],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"出发"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第一支胶"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第二支胶&盐丸"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":96.5,"title":"第三支胶&尽力加速"}],"times":1}],"maxIntensity":96.5}',
        //         classesTitle: "STH_马拉松赛-H(补给分段)",
        //         label: null,
        //         sportType: "RUN",
        //       },
        //     ],
        //   },
        // ],
        // [
        //   {
        //     day: 8,
        //     details: [
        //       {
        //         classesJson:
        //           '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
        //         classesTitle: "STH_轻松骑@2h30min",
        //         label: "[]",
        //         sportType: "CYCLE",
        //       },
        //     ],
        //   },
        // ],
        // [],
        // [],
      ],

      // 计划列表数据
      planSearchInput: "",
      currentPlanDetail: {},
      currentPlanDayDetail: [],
    };
  },
  watch: {
    currentPlanDetail: {
      handler(newVal) {
        this.planTitle = newVal?.planTitle || '';
      },
      deep: true,
    },
  },
  mounted() {
    // 判断路由是否有值
    if (Object.keys(this.$route.query).length > 0) {
      const { id, planGroupId, type } = this.$route.query;
      if (id && planGroupId) {
        console.log(id, planGroupId,type , "id, planGroupId, type");
        this.currentPlanId = id;
        this.currentPlanGroupId = planGroupId;
        this.getPlanDetail(id);
        this.getPlanDayDetail(id);
      }

      if (type === 'edit') {
        this.getPlanDetail(this.currentPlanDetail.id);
        this.getPlanDayDetail(this.currentPlanDetail.id);
      }
    }
    this.getPlanList();
  },
  methods: {
    onSaveCopy(payload) {
      this.showCopy = false;
      this.getPlanList();
    },
    handleApplyCoachCancel(payload) {
      this.showApplyCoach = false;
      // this.getPlanList();
    },
    /**
     * 处理概要预览取消事件
     * @param {boolean} payload - 是否需要重新获取计划列表
     */
    async handleSummaryPreviewCancel(payload) {
      this.showSummaryPreview = false;
      if (payload) {
        await this.getPlanList();
        // await this.getPlanDetail(this.currentPlanId);
        // await this.getPlanDayDetail(this.currentPlanId);
      }
    },
    async handlePlanDayDetail(id) {
      await this.getPlanDetail(id);
      await this.getPlanDayDetail(id);
    },
    /**
     * 获取计划详情
     */
    async getPlanDetail(id) {
      const res = await planApi.getPlanDetail(id);
      console.log("日常详情-res", res);
      this.currentPlanDetail = res.result;
    },
    /**
     * 处理计划日常详情数据，重组为按天分组的格式，并按每7天一组组成二维数组
     * @param {Array} data - getPlanDayDetail接口返回的数据
     * @returns {Array} 重组后的数据格式 [[{day: 1, details: [...]}, ...], [{day: 8, details: [...]}, ...], ...]
     */
    formatPlanDayDetail(data) {
      if (!Array.isArray(data) || data.length === 0) {
        // 如果数据为空，返回28天的空数据，按每7天一组组成二维数组
        const result = [];
        for (let week = 0; week < 4; week++) {
          const weekData = [];
          for (let day = week * 7 + 1; day <= (week + 1) * 7; day++) {
            weekData.push({
              day: day,
              details: [],
            });
          }
          result.push(weekData);
        }
        return result;
      }

      // 按day分组
      const dayMap = new Map();
      data.forEach((item) => {
        const day = item.day;
        if (!dayMap.has(day)) {
          dayMap.set(day, []);
        }

        // 解析classesJson获取title和tags
        let classesTitle = "";
        let label = null;
        try {
          const classesData = JSON.parse(item.classesJson || "{}");
          classesTitle = classesData.title || "";
          label =
            classesData.tags && classesData.tags.length > 0
              ? JSON.stringify(classesData.tags)
              : null;
        } catch (e) {
          console.warn("解析classesJson失败:", e);
        }

        // 转换为目标格式
        dayMap.get(day).push({
          classesJson: item.classesJson,
          classesTitle: classesTitle,
          label: label,
          sportType: item.sportType,
        });
      });

      // 构建结果数组（1-28天），按每7天一组重组为二维数组
      const result = [];
      for (let week = 0; week < 4; week++) {
        const weekData = [];
        for (let day = week * 7 + 1; day <= (week + 1) * 7; day++) {
          if (dayMap.has(day)) {
            weekData.push({
              day: day,
              details: dayMap.get(day),
            });
          } else {
            weekData.push({
              day: day,
              details: [],
            });
          }
        }
        result.push(weekData);
      }

      return result;
    },
    async getPlanDayDetail(id) {
      const resDayDetail = await planApi.getPlanDayDetail(id);
      console.log("日常详情-resDayDetail", resDayDetail);

      // 处理并重组数据
      const formattedData = this.formatPlanDayDetail(resDayDetail.result);
      console.log("重组后的数据-formattedData", formattedData);

      // return formattedData;
      this.planList = formattedData;
    },
    handleClassTypeChange(type) {
      this.activeClassType = type;
      this.getPlanList();
    },
    handlePlanSearch(keyword) {
      this.planSearchInput = keyword;
      this.getPlanList();
    },
    /**
     * 获取课程列表
     */
    async getPlanList() {
      const apiMethod =
        this.activeClassType === "official"
          ? planApi.getOfficialPlans
          : planApi.getPlansByUserId;

      const res = await apiMethod(this.planSearchInput);
      if (res.success) {
        this.classList = res.result.map((item) => ({
          timespan: new Date().getTime(),
          ...item,
          classesCount: item.planList.length,
          classesList: item.planList.map((part) => ({
            ...part,
            classesJson: parseClassesJson(part.classesJson),
          })),
        }));
        // this.$nextTick(() => {
        //   this.classSlideChange();
        // });
      } else {
        this.classList = [];
      }
    },
    /**
     * 移动课程
     */
    handleMoveClass(classId, groupId) {
      this.moveClassId = classId;
      this.moveGroupId = groupId;
      this.moveType = "class";
      this.showMoveGroup = true;
    },

    /**
     * 查看课程
     */
    handleViewClass(classId) {
      this.showViewClassCard = true;
      this.classModalData = this.findClassById(classId);
    },
    handleViewPlanClass(cardInfo) {
      console.log("handleViewPlanClass-cardInfo", cardInfo);
      // cardInfo 包含完整的卡片信息：
      // {
      //   classItem: 课程项数据,
      //   classIndex: 课程在当前天的索引,
      //   weekIndex: 周索引（从0开始）,
      //   weekNumber: 周数（从1开始）,
      //   globalDay: 全局天数（1-28）,
      //   boxIndex: 盒子索引（0-6）
      // }
      this.showViewClassCard = true;
      // 使用 classItem 作为课程数据
      this.classModalData = cardInfo?.classItem || cardInfo;
    },
    /**
     * 通过ID查找课程
     */
    findClassById(id) {
      let findClass = {};
      this.classList.forEach((item) => {
        item.classesList.forEach((part) => {
          if (part.id === +id) {
            findClass = part;
          }
        });
      });
      return findClass;
    },
    /**
     * 复制/添加课程
     */
    handleCopyClassFromOfficial(classData, groupId) {
      this.copyClassFromOfficialClassId = classData.id;
      this.copyClassFromOfficialGroupId = groupId;
      this.copyClassFromOfficialData = classData;
      this.showCopyClassFromOfficial = true;
    },
    /**
     * 保存复制课程
     */
    onSaveCopyClassFromOfficial() {
      this.showCopyClassFromOfficial = false;
      this.getPlanList();
    },
    /**
     * 添加计划
     */
    handleAddPlan() {
      this.addPlanVisible = true;
    },
    /**
     * 创建分组
     */
    handleAddGroup() {
      this.currentGroup = { id: "", groupName: "" };
      this.addGroupVisible = true;
    },
    /**
     * 保存分组成功
     */
    handleAddGroupSave(payload) {
      this.addGroupVisible = false;
      this.currentGroup = { id: "", groupName: "" };
      this.getPlanList();
    },
    /*
     *编辑分组
     */
    handleEditGroup(payload) {
      console.log(payload, "payload");
      this.currentGroup = {
        id: payload.groupId,
        groupName: payload.groupName,
      };
      this.addGroupVisible = true;
    },
    /**
     * 删除分组
     */
    handleDeleteGroup(groupId) {
      this.$confirm("确认删除该分组？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调用删除分组API
        groupApi.deleteGroup(groupId).then((res) => {
          if (res.success) {
            this.$message.success("删除成功");
            this.getPlanList();
          }
        });
      });
    },
    /**
     * 处理选项的点击事件
     */
    handleOptionsClick(item, index) {
      const _this = this;
      const optMap = {
        0: () => {
          _this.showSummaryPreview = true;
        },
        1: () => {
          _this.handleEditPlan();
        },
        2: () => {
          _this.showCopy = true;
        },
        3: () => {
          _this.showApplyCoach = true;
        },
        4: () => {
          _this.showApplyHistory = true;
        },
        5: () => {
          _this.handleDeleteGroup();
        },
      };
      optMap[index]();
    },
    handleEditPlan() {
      const params = {
        ...this.currentPlanDetail,
        dayDetails: this.planList,
      };
      console.log("params-编辑", params);
      // 将 params 保存到 planStore 中的 planData
      this.$store.dispatch("plan/savePlanData", params);
      // 跳转到 planEdit 页面
      this.$router.push({
        path: "/timeTable/plan/add",
        query: {
          type: "edit",
        },
      });
    },
    /**
     * 删除计划
     */
    handleDeletePlan(groupId) {
      this.$confirm("确认删除该计划？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调用删除分组API
        // groupApi.deleteGroup(groupId).then((res) => {
        //   if (res.success) {
        //     this.$message.success("删除成功");
        //     this.getPlanList();
        //   }
        // });
      });
    },
  },
};
</script>

<style scoped lang="scss">
.container {
  background-color: #f5f5f5;
}

.plan-container {
  display: flex;
  height: 100%;
  max-height: calc(100vh - 60px);
  overflow-y: hidden;
  overflow-x: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2.5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2.5px;

    &:hover {
      background: #a8a8a8;
    }
  }
  .type-change {
    flex: 0 0 260px;
    height: 100vh;
    max-height: calc(100vh - 60px);
    background-color: #f8f8f8;
    overflow-y: auto;
    overflow-x: hidden;
    border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
  }
}
</style>
