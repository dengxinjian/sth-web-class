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
        />
      </div>
      <PlannedScheduleView
        :planList="planList"
        @options-click="handleOptionsClick"
      />
      <!-- <PlannedSchedule /> -->
    </div>
    <ViewClassCard
      :visible="showViewClassCard"
      :class-item="classModalData"
      :active-class-type="activeClassType"
      @close="showViewClassCard = false"
      @move="handleMoveClass"
      @delete="handleDeleteClass"
      @copy="handleCopyClassFromOfficial"
      @save="handleUpdateClass"
      type="edit"
    />
    <CopyClassFromOfficial
      v-model="showCopyClassFromOfficial"
      :class-id="copyClassFromOfficialClassId"
      :group-id="copyClassFromOfficialGroupId"
      :data="copyClassFromOfficialData"
      :active-class-type="activeClassType"
      @save="onSaveCopyClassFromOfficial"
    />

    <AddPlan v-model="addPlanVisible" />
    <AddGroup
      v-model="addGroupVisible"
      :data="currentGroup"
      @save="handleAddGroupSave"
    />
    <SummaryPreview v-model="showSummaryPreview" />
    <Copy v-model="showCopy" />
    <ApplyCoach v-model="showApplyCoach" />
    <ApplyAthlete v-model="showApplyAthlete" />
    <ApplyHistory v-model="showApplyHistory" />
  </div>
</template>

<script>
// import {
//   classApi,
//   groupApi,
// } from "../classManagement/services/classManagement";
import { parseClassesJson } from "../classManagement/utils/helpers";
// import ClassList from "../classManagement/components/ClassList.vue";
import PlanList from "./components/PlanList.vue";
import ViewClassCard from "../classManagement/components/ViewClassCard.vue";
import CopyClassFromOfficial from "../classManagement/components/CopyClassFromOfficial/index.vue";
import PlannedScheduleView from "./components/plannedScheduleView.vue";
// import PlannedSchedule from "./components/plannedSchedule.vue";
import AddPlan from "./components/AddPlan";
import AddGroup from "./components/AddGroup";
import SummaryPreview from "./components/SummaryPreview/index.vue";
import Copy from "./components/Copy/index.vue";
import ApplyCoach from "./components/ApplyCoachhes/ApplyCoach.vue";
import ApplyAthlete from "./components/ApplyCoachhes/ApplyAthletes.vue";
import ApplyHistory from "./components/ApplyCoachhes/ApplyHistory.vue";

// 服务和工具导入
import { planApi,groupApi } from "./services/planManagement";

export default {
  name: "PlanView",
  components: {
    PlanList,
    ViewClassCard,
    CopyClassFromOfficial,
    PlannedScheduleView,
    // PlannedSchedule,
    AddPlan,
    AddGroup,
    SummaryPreview,
    Copy,
    ApplyCoach,
    ApplyAthlete,
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
      planList: [
        [
          {
            day: 1,
            details: [
              {
                classesJson:
                  '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
                classesTitle: "STH_轻松骑@2h30min",
                label: "[]",
                sportType: "CYCLE",
              },
            ],
          },
          {
            day: 4,
            details: [
              {
                classesJson:
                  '{"id":"","sportType":"RUN","title":"STH_马拉松赛-H(补给分段)","groupId":6,"duration":"--:--:--","distance":21.3,"sth":"","mode":1,"summary":"马拉松比赛/比赛手表可选项","tags":[],"stages":[{"times":1,"sections":[{"title":"出发","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":7,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第一支胶","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":6,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第二支胶&盐丸","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":5,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[94,97],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]},{"times":1,"sections":[{"title":"第三支胶&尽力加速","stageMode":"bike","summary":"","tags":[],"capacity":"distance","range":"range","target":"00:20:00","targetDistance":3.3,"targetUnit":"km","hasCadence":false,"thresholdSpeed":80,"thresholdSpeedRange":[95,98],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetSpeed":"05:00","targetSpeedRange":["03:30","05:00"],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[160,200],"lap":false,"targetSeconds":600}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"出发"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第一支胶"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":95.5,"title":"第二支胶&盐丸"}],"times":1},{"duration":600,"stageTimeline":[{"duration":600,"intensity":96.5,"title":"第三支胶&尽力加速"}],"times":1}],"maxIntensity":96.5}',
                classesTitle: "STH_马拉松赛-H(补给分段)",
                label: null,
                sportType: "RUN",
              },
            ],
          },
        ],
        [
          {
            day: 8,
            details: [
              {
                classesJson:
                  '{"id":282,"title":"STH_轻松骑@2h30min","groupId":10,"duration":"02:30:00","distance":"","sth":18000,"mode":1,"summary":"- 150分钟1-2区骑行","tags":[],"stages":[{"times":1,"sections":[{"title":"恢复","stageMode":"recover","summary":"","tags":[],"capacity":"time","range":"range","target":"02:30:00","hasCadence":false,"thresholdFtp":80,"thresholdFtpRange":[50,65],"thresholdHeartRate":80,"thresholdHeartRateRange":[80,85],"targetFtp":230,"targetFtpRange":[140,160],"targetHeartRate":150,"targetHeartRateRange":[110,150],"cadence":[80,90],"lap":false,"targetSeconds":9000}]}],"durationSeconds":"","distanceMeters":"","timeline":[{"duration":9000,"stageTimeline":[{"duration":9000,"intensity":57.5,"title":"恢复"}],"times":1}],"maxIntensity":57.5}',
                classesTitle: "STH_轻松骑@2h30min",
                label: "[]",
                sportType: "CYCLE",
              },
            ],
          },
        ],
        [],
        [],
      ],

      // 计划列表数据
      planSearchInput: "",
    };
  },
  mounted() {
    this.getPlanList();
  },
  methods: {
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
     * 删除课程
     */
    async handleDeleteClass(classId) {
      const res = await classApi.deleteClass(classId);
      if (res.success) {
        this.$message.success("删除成功");
        this.getPlanList();
      }
    },
    async handleUpdateClass(classData) {
      classApi.updateClass(classData).then((res) => {
        if (res.success) {
          this.$message.success("更新成功");
          this.getPlanList();
        }
      });
    },

    /**
     * 查看课程
     */
    handleViewClass(classId) {
      this.showViewClassCard = true;
      this.classModalData = this.findClassById(classId);
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
      // console.log("Options clicked:", item, index);
      // 在这里处理选项的点击事件
      // this.$message.info(`点击了选项 ${item} 的第 ${index + 1} 个`);
      switch (index) {
        case 0:
          this.showSummaryPreview = true;
          break;
        case 1:
          this.handleEditClick(item);
          break;
        case 2:
          this.showCopy = true;
          break;
        case 3:
          this.showApplyCoach = true;
          break;
        case 4:
          this.showApplyAthlete = true;
          break;
        case 5:
          this.showApplyHistory = true;
          break;
        case 6:
          this.showApplyHistory = true;
          break;
        case 7:
          this.handleDeleteGroup();
          break;
        default:
          break;
      }
    },
    handlePlanLibraryDrop(payload) {},
  },
  /**
   * 删除计划
   */
  handleDeleteGroup(groupId) {
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
