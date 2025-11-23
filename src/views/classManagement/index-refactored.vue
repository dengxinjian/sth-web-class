<template>
  <div class="container">
    <div class="athletic-container" v-loading="loading">
      <!-- 左侧菜单 -->
      <!-- <LeftMenu v-model="activeName" @change="handleTypeChange" /> -->

      <!-- 中间内容区 -->
      <div class="type-change">
        <!-- 运动员管理 -->
        <div v-if="activeName === 'athletic'">
          <AthleticManagement
            :teamId="selectedTeam"
            :teamName="getTeamName(selectedTeam)"
            @athletic-click="handleAthleticChange"
          />
        </div>

        <!-- 课程管理 -->
        <div v-else class="class-container-wrapper">
          <ClassList
            :class-list="classList"
            :active-class-type.sync="activeClassType"
            @class-type-change="handleClassTypeChange"
            @search="handleClassSearch"
            @add-class="handleAddClass"
            @add-group="handleAddGroup"
            @edit-group="handleEditGroup"
            @delete-group="handleDeleteGroup"
            @move-group="handleMoveGroup"
            @class-detail="handleClassDetail"
            @move-class="handleMoveClass"
            @delete-class="handleDeleteClass"
            @copy-class="handleCopyClassFromOfficial"
            @collapse-change="classSlideChange"
            @view-class="handleViewClass"
          />
        </div>
      </div>

      <!-- 日程表 -->
      <ScheduleCalendar
        :current-week="currentWeek"
        :team-list="teamList"
        :athletic-list="athleticList"
        :selected-team="selectedTeam"
        :selected-athletic="selectedAthletic"
        @week-change="onWeekChange"
        @team-change="handleTeamChange"
        @athletic-change="handleAthleticChange"
        @show-info="showAthleticInfoDialog = true"
        @show-statistic="showMonthStatisticDialog = true"
        @refresh="handleRefresh"
        @class-detail="handleClassScheduleDetail"
        @activity-detail="handleSportDetail"
        @delete-schedule="handleDeleteClassSchedule"
        @unbind="handleUnbind"
        @delete-activity="handleDeleteActivity"
        @device-click="handleDeviceClick"
        @edit-schedule="handleEditClassSchedule"
        @edit-activity="handleEditActivity"
        @paste-class="handlePasteClass"
        @cut-class="handleCutClass"
        @view-health-data="handleViewHealthData"
        @add-schedule="handleAddSchedule"
        @event-detail="handleEventDetail"
        @edit-event="handleEditEvent"
        @input-activity="handleInputActivity"
      />

      <!-- 右侧统计面板 -->
      <StatisticsPanel
        :sth-data="sthData"
        :statistic-data="statisticData"
        :device-list="deviceList"
        @device-change="handleDeviceChange"
      />
    </div>

    <!-- 对话框组件 -->
    <AthleticInfoDialog
      v-model="showAthleticInfoDialog"
      :data="athleticInfoData"
      @save="onSaveAthleticInfo"
    />

    <MonthStatisticDialog
      v-model="showMonthStatisticDialog"
      :triUserId="selectedAthletic"
      :currentMonth="currentMonth"
      @cancel="onCancelMonthStatistic"
    />

    <SportTypeModal
      v-model="showSportTypeModal"
      :isClass="isClass"
      @select="onSelectSportType"
      @addEvent="handleAddEvent"
    />

    <SportDetailModal
      v-model="showSportDetailModal"
      :type="sportDetailData.sportType"
      :data="sportDetailData"
      @cancel="onCancelSportDetail"
    />
    <AddClassTitle
      v-model="showAddClassTitle"
      :groups="[
        { id: 1, name: '我的课程' },
        { id: 2, name: '团队课程' },
      ]"
      :default-group-id="addGroupId"
      @save="onSaveClassTitle"
    />

    <AddGroup
      v-model="showAddGroup"
      :data="currentGroup"
      @save="onSaveAddGroup"
    />

    <MoveGroup
      v-model="showMoveGroup"
      :id="moveGroupId"
      :class-id="moveClassId"
      :type="moveType"
      @save="onSaveMoveGroup"
    />

    <BindModal
      v-model="showBindModal"
      :exercise-data="bindExerciseData"
      :course-data="bindCourseData"
      :type="bindType"
      @bind="onBind"
      @cancel="onCancelBind"
    />

    <ClassDetailModal
      v-model="showClassDetailModal"
      :type="classSportType"
      :data="classDetailData"
      :athleticThreshold="athleticThreshold"
      :triUserId="selectedAthletic"
      @save="handleClassDetailSave"
    />

    <CopyClassFromOfficial
      v-model="showCopyClassFromOfficial"
      :class-id="copyClassFromOfficialClassId"
      :group-id="copyClassFromOfficialGroupId"
      :data="copyClassFromOfficialData"
      :active-class-type="activeClassType"
      @save="onSaveCopyClassFromOfficial"
    />

    <ViewClassCard
      :visible="showViewClassCard"
      :class-item="classModalData"
      :active-class-type="activeClassType"
      @close="showViewClassCard = false"
      @move="handleMoveClass"
      @delete="handleDeleteClass"
      @copy="handleCopyClassFromOfficial"
      @save="handleUpdateClass"
    />
    <AddClassModal
      v-model="showAddClassModal"
      :sportType="classModalData.sportType"
      :type="classModalDataType"
      :originalType="activeClassType"
      :data="classModalData"
      @save="onSaveAddClass"
      @cancel="showAddClassModal = false"
    />

    <EditScheduleClass
      :visible="showEditScheduleClass"
      :class-item="classDetailData"
      :is-activity="isActivity"
      :athleticThreshold="athleticThreshold"
      :triUserId="selectedAthletic"
      @close="showEditScheduleClass = false"
      @save="handleClassDetailSave"
      @delete="handleDeleteClassSchedule"
    />

    <!-- 健康数据查看弹窗 -->
    <el-dialog
      title=""
      :visible.sync="showHealthViewDialog"
      width="90%"
      :close-on-click-modal="false"
      custom-class="health-view-dialog"
    >
      <HealthView
        v-if="showHealthViewDialog"
        :health-data="healthViewData"
        :date="healthViewDate"
        :device-list="deviceList"
        :device-type="healthViewDeviceType"
        :triUserId="selectedAthletic"
        @close="showHealthViewDialog = false"
      />
    </el-dialog>

    <!-- 添加/编辑赛事弹窗 -->
    <AddEvent
      :visible.sync="showAddEvent"
      :event-data="currentEventData"
      :is-edit-mode="isEditMode"
      @confirm="handleEventConfirm"
      @cancel="handleEventCancel"
    />
    <InputActivity
      :visible.sync="showInputActivity"
      :activityDate="inputActivityDate"
      @submit="handleInputActivitySave"
    />
  </div>
</template>

<script>
// 组件导入
import LeftMenu from "./components/LeftMenu.vue";
import ClassList from "./components/ClassList.vue";
import ScheduleCalendar from "./components/ScheduleCalendar.vue";
import StatisticsPanel from "./components/StatisticsPanel.vue";
import AthleticManagement from "./components/AthleticManagement";
import AthleticInfoDialog from "./components/AthleticInfo";
import MonthStatisticDialog from "./components/MonthStatistic";
import AddClassModal from "./components/AddClass/index.vue";
import SportTypeModal from "./components/SportTypeModal";
import AddClassTitle from "./components/AddClassTitle";
import AddGroup from "./components/AddGroup";
import MoveGroup from "./components/MoveGroup";
import BindModal from "./components/BindModal";
import SportDetailModal from "./components/SportDetailModal";
import ClassDetailModal from "./components/ClassDetailModal";
import CopyClassFromOfficial from "./components/CopyClassFromOfficial";
import ViewClassCard from "./components/ViewClassCard";
import EditScheduleClass from "./components/EditScheduleClass";
import HealthView from "./components/HealthView.vue";
import AddEvent from "./components/addEvent.vue";
import InputActivity from "./components/InputActivity.vue";

// 服务和工具导入
import {
  teamApi,
  classApi,
  scheduleApi,
  statisticsApi,
  athleteApi,
  groupApi,
  competitionApi,
} from "./services/classManagement";
import { ACTIVITY_TYPE_DICT } from "./constants";
import {
  parseClassesJson,
  isSportTypeMatch,
  generateSortData,
  getCompletionStatus,
} from "./utils/helpers";
import { getLunarDate, secondsToHHMMSS } from "@/utils/index";
import { statisticKeyToTitle, unitConversion } from "./statisticKeyToTitle";
import { CalculateRun, CalculateBike } from "./uilt";
import dragMixin from "./mixins/dragMixin";

export default {
  name: "ClassManagement",
  components: {
    LeftMenu,
    ClassList,
    ScheduleCalendar,
    StatisticsPanel,
    AthleticManagement,
    AthleticInfoDialog,
    MonthStatisticDialog,
    SportTypeModal,
    AddClassModal,
    AddClassTitle,
    AddGroup,
    MoveGroup,
    BindModal,
    SportDetailModal,
    ClassDetailModal,
    CopyClassFromOfficial,
    ViewClassCard,
    EditScheduleClass,
    HealthView,
    AddEvent,
    InputActivity,
  },
  mixins: [dragMixin],
  data() {
    return {
      loading: false,
      activeName: "class",
      activeClassType: "my",

      // 团队和运动员数据
      teamList: [],
      athleticList: [],
      selectedTeam: null,
      selectedAthletic: null,
      athleticInfoData: {},
      athleticThreshold: {
        run: 0,
        cycle: 0,
        swim: 0,
        heartRate: 0,
      },

      // 课程数据
      classList: [],
      classSearchInput: "",
      currentUserClassConfig: {},

      // 日程数据
      currentWeek: [],
      currentMonth: "",

      // 统计数据
      sthData: {},
      statisticData: [],

      // 设备数据
      deviceList: [],

      // 对话框状态
      showAthleticInfoDialog: false,
      showMonthStatisticDialog: false,
      showSportTypeModal: false,
      showSportDetailModal: false,
      showAddClassModal: false,
      showAddClassTitle: false,
      showAddGroup: false,
      showMoveGroup: false,
      showBindModal: false,
      showClassDetailModal: false,
      showCopyClassFromOfficial: false,
      showHealthViewDialog: false,

      // 对话框数据
      classModalData: { title: "", groupId: "" },
      classModalDataType: "",
      currentGroup: { id: "", classesGroupName: "" },
      moveGroupId: "",
      moveClassId: "",
      moveType: "",
      bindExerciseData: [],
      bindCourseData: {},
      bindType: "",
      sportDetailData: {},
      classSportType: "",
      classType: "class",
      classDetailData: {},
      addScheduleDate: "",
      copyClassFromOfficialClassId: "",
      copyClassFromOfficialGroupId: "",
      copyClassFromOfficialData: {},
      addGroupId: "",
      isClass: true,
      // 查看课程
      showViewClassCard: false,
      showEditScheduleClass: false,
      isActivity: false,
      // 健康数据
      healthViewData: {},
      healthViewDate: "",
      healthViewDeviceType: null,

      // 添加/编辑赛事
      showAddEvent: false,
      currentEventData: {},
      isEditMode: false,

      // 录入运动
      showInputActivity: false,
      inputActivityDate: "",
    };
  },
  watch: {
    // 监听路由变化，同步菜单状态
    $route: {
      handler(to) {
        this.initMenuFromRoute();
      },
      immediate: false,
    },
  },
  mounted() {
    // 根据路由初始化菜单状态
    this.initMenuFromRoute();
    this.getCurrentUserClassConfigCount();

    if (localStorage.getItem("loginType") !== "1") {
      this.getTeamAndAthleticData();
    } else {
      this.selectedAthletic = localStorage.getItem("triUserId");
      this.getScheduleData();
      this.getAthleticThreshold(this.selectedAthletic);
      this.getAuthorizedDeviceList();
      this.getClassList();
    }
  },
  methods: {
    handleCutClass(classesDate, classItem) {
      console.log(classesDate, "classesDate");
      console.log(classItem, "classItem");
      this.handlePasteClass(classesDate, classItem);
      this.handleDeleteClassSchedule(classItem.id, true);
    },
    handleInputActivitySave(data) {
      console.log(data, "data");
      data.triUserId = this.selectedAthletic;
      scheduleApi.createActivity(data).then((res) => {
        if (res.success) {
          this.$message.success("运动录入成功");
          this.showInputActivity = false;
          this.getScheduleData();
        }
      });
    },
    /**
     * 添加赛事
     */
    handleAddEvent(eventData = {}) {
      this.currentEventData = eventData; // 如果有数据则是编辑模式，否则是添加模式
      this.showAddEvent = true;
      this.isEditMode = false;
    },
    handleInputActivity(date) {
      console.log(date, "date");
      this.inputActivityDate = date;
      this.showInputActivity = true;
    },
    /**
     * 赛事确认
     */
    handleEventConfirm(data) {
      console.log("赛事数据:", data);
      data.competitionTime = this.addScheduleDate;
      if (!this.isEditMode) {
        competitionApi
          .createCompetition(data, this.selectedAthletic)
          .then(() => {
            this.$message.success("赛事保存成功");
            this.showAddEvent = false;
            // this.getScheduleData();
          })
          .catch((err) => {
            const message = err?.message || err || "赛事保存失败";
            this.$message.error(message);
          });
      } else {
        competitionApi
          .updateCompetition(data, this.selectedAthletic)
          .then((res) => {
            if (res.success) {
              this.$message.success("赛事保存成功");
              this.showAddEvent = false;
            }
          });
      }
      this.getScheduleData();
      // 这里可以添加保存成功后的处理逻辑，比如刷新列表等
      // 如果需要刷新日程数据，可以调用 this.getScheduleData();
    },
    handleEventDetail(eventItem) {
      console.log(eventItem, "eventItem");
      this.$confirm("确认删除该赛事？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        competitionApi.deleteCompetition(eventItem.id).then((res) => {
          if (res.success) {
            this.$message.success("赛事删除成功");
            this.getScheduleData();
          }
        });
      });
    },
    handleEditEvent(eventItem) {
      console.log(eventItem, "eventItem");
      this.currentEventData = eventItem;
      this.showAddEvent = true;
      this.isEditMode = true;
    },
    /**
     * 赛事取消
     */
    handleEventCancel() {
      this.currentEventData = {};
      this.showAddEvent = false;
    },
    handleAddSchedule(date) {
      this.classModalDataType = "addSchedule";
      this.addScheduleDate = date;
      this.showSportTypeModal = true;
      this.isClass = false;
      console.log(date, "date");
    },
    async handlePasteClass(date, classItem) {
      console.log(date, classItem, "date, classItem");
      await this.getAthleticThreshold(this.selectedAthletic, date);
      const newData = JSON.parse(JSON.stringify(classItem));
      newData.classesDate = date + " 00:00:00";
      // 根据运动类型计算阈值
      if (newData.sportType === "RUN") {
        newData.classesJson = new CalculateRun(
          this.athleticThreshold,
          newData.classesJson
        ).updateClassInfoCalculatedValues();
      } else if (newData.sportType === "CYCLE") {
        newData.classesJson = new CalculateBike(
          this.athleticThreshold,
          newData.classesJson
        ).updateClassInfoCalculatedValues();
      }
      // 计算时间距离STH
      if (["RUN", "CYCLE"].includes(newData.sportType)) {
        const res = await scheduleApi.calculateTimeDistanceSth({
          ...newData,
          classesJson: JSON.stringify(newData.classesJson),
          triUserId: this.selectedAthletic,
        });

        if (newData.sportType === "RUN") {
          newData.classesJson = {
            ...newData.classesJson,
            duration: secondsToHHMMSS(res.result.time || 0),
            distance: (res.result.distance || 0) + "km",
            sth: res.result.sth,
          };
        } else if (newData.sportType === "CYCLE") {
          newData.classesJson = {
            ...newData.classesJson,
            duration: newData.classesJson.duration,
            distance: newData.classesJson.distance,
            sth: res.result.sth,
          };
        }
      }
      newData.classesJson = JSON.stringify(newData.classesJson);
      const res = await scheduleApi.createSchedule({
        ...newData,
        triUserId: this.selectedAthletic,
      });

      if (res.success) {
        this.getScheduleData();
        this.getClassList();
      }
    },
    handleEditClassSchedule(classItem) {
      console.log(classItem, "classItem");
      this.showEditScheduleClass = true;
      this.classDetailData = classItem;
      this.isActivity = false;
    },
    handleEditActivity(activity) {
      console.log(activity, "activity");
      this.showEditScheduleClass = true;
      this.classDetailData = activity;
      this.isActivity = true;
    },
    /**
     * 获取团队名称
     */
    getTeamName(teamId) {
      const team = this.teamList.find((item) => item.id === teamId);
      return team ? team.name : "";
    },

    /**
     * 根据路由初始化菜单状态
     */
    initMenuFromRoute() {
      const path = this.$route.path;
      if (path.includes("athletic")) {
        this.activeName = "athletic";
      } else if (path.includes("class") || path.includes("timeTable")) {
        this.activeName = "class";
      }
    },
    /**
     * 类型切换（运动员/课程）
     */
    handleTypeChange(type) {
      this.activeName = type;
    },

    /**
     * 课程类型切换（我的/官方）
     */
    handleClassTypeChange(type) {
      this.activeClassType = type;
      this.getClassList();
    },

    /**
     * 课程搜索
     */
    handleClassSearch(keyword) {
      this.classSearchInput = keyword;
      this.getClassList();
    },

    /**
     * 获取团队和运动员数据
     */
    async getTeamAndAthleticData() {
      const res = await teamApi.getAllTeams();
      if (res.success) {
        this.teamList = res.result.map((item) => ({
          id: item.id,
          name: item.teamName,
          members: item.members.map((member) => ({
            id: member.id,
            name: member.userNickname,
            triUserId: member.triUserId,
            lastMatchType: member.lastMatchType,
          })),
        }));

        // 默认选中第一个团队
        if (this.teamList.length > 0) {
          this.selectedTeam = this.teamList[0].id;
          this.getAthleticList();
          this.getScheduleData();
        }
      }
    },

    /**
     * 团队切换
     */
    handleTeamChange(teamId) {
      this.selectedTeam = teamId;
      this.getAthleticList();
    },

    /**
     * 运动员切换
     */
    handleAthleticChange(athleticId) {
      this.selectedAthletic = athleticId;
      this.athleticInfoData = this.athleticList.find(
        (item) => item.triUserId === athleticId
      );
      this.getScheduleData();
      this.getAthleticThreshold(athleticId);
      this.getAuthorizedDeviceList();
    },

    /**
     * 获取运动员列表
     */
    getAthleticList() {
      this.athleticList = this.teamList.find(
        (item) => item.id === this.selectedTeam
      ).members;

      // 默认选中第一个运动员
      if (this.athleticList.length > 0) {
        this.selectedAthletic = this.athleticList[0].triUserId;
        this.athleticInfoData = this.athleticList[0];
        this.getClassList();
        this.getAthleticThreshold(this.selectedAthletic);
        this.getAuthorizedDeviceList();
        this.getScheduleData();
      }
    },

    /**
     * 获取课程列表
     */
    async getClassList() {
      const apiMethod =
        this.activeClassType === "official"
          ? classApi.getOfficialClasses
          : classApi.getClassesByUserId;

      const res = await apiMethod(this.classSearchInput);
      if (res.success) {
        this.classList = res.result.map((item) => ({
          timespan: new Date().getTime(),
          ...item,
          classesCount: item.classesList.length,
          classesList: item.classesList.map((part) => ({
            ...part,
            classesJson: parseClassesJson(part.classesJson),
          })),
        }));
        this.$nextTick(() => {
          this.classSlideChange();
        });
      } else {
        this.classList = [];
      }
    },

    /**
     * 获取日程数据
     */
    async getScheduleData() {
      if (!this.selectedAthletic) return;
      this.loading = true;

      const res = await scheduleApi.getCalendarOverview({
        begin: this.currentWeek[0].commonDate + " 00:00:00",
        end: this.currentWeek[6].commonDate + " 23:59:59",
        triUserId: this.selectedAthletic,
      });
      if (res.success && res.result) {
        this.getStatisticData();
        this.currentWeek = this.currentWeek.map((item) => {
          let activityList = [];
          let classSchedule = [];
          let healthInfos = [];
          let competitionList = [];

          res.result.forEach((part) => {
            if (item.commonDate === part.dataDate) {
              // 处理运动记录
              activityList = (part.activityOverviewList || [])
                .map((i) => ({
                  ...i,
                  classesJson: i.classesJson
                    ? parseClassesJson(i.classesJson)
                    : "",
                  completion: i.classesJson
                    ? getCompletionStatus(i.percent)
                    : "",
                  distance: Math.round(i.distance / 10) / 100,
                  oldActivityDuration: i.duration,
                  oldActivityDistance: Math.round(i.distance),
                  preciseDistance: Math.round(i.distance),
                  oldActivitySthValue: i.sthValue,
                }))
                .filter((i) => !i.bindingManualActivityId);

              // 处理虚拟运动记录
              part.manualDeviceActivityVoList.forEach((i) => {
                if (!i.activityId) {
                  activityList.push({
                    ...i,
                    classesJson: i.classesJson
                      ? parseClassesJson(i.classesJson)
                      : "",
                    distance: Math.round(i.distance / 10) / 100,
                    preciseDistance: i.distance,
                  });
                  console.log(activityList, "activityList");
                } else {
                  activityList.forEach((item, index) => {
                    if (item.manualActivityId === i.manualActivityId) {
                      console.log(i);
                      activityList[index] = {
                        ...i,
                        activityName: item.activityName,
                        classesJson: i.classesJson
                          ? parseClassesJson(i.classesJson)
                          : "",
                        distance: Math.round(i.distance / 10) / 100,
                        preciseDistance: Math.round(i.distance),
                        oldActivityDuration: item.oldActivityDuration,
                        oldActivityDistance: Math.round(
                          item.oldActivityDistance
                        ),
                        oldActivitySthValue: item.oldActivitySthValue,
                      };
                      console.log(activityList[index], "activityList[index]");
                    }
                  });
                }
              });
              console.log(activityList, "activityList");
              // 处理课表
              classSchedule = (part.classScheduleVoList || [])
                .map((i) => ({
                  ...i,
                  classesJson: parseClassesJson(i.classesJson),
                }))
                .filter(
                  (i) => !i.bindingActivityId && !i.bindingManualActivityId
                );

              // 处理健康数据
              console.log(part.healthInfos, "part.healthInfos");
              healthInfos =
                part.healthInfos && part.healthInfos.length > 0
                  ? [part.healthInfos[0]]
                  : [];
              competitionList = part.competitionList || [];
            }
          });

          return {
            ...item,
            activityList,
            classSchedule,
            healthInfos,
            competitionList,
            timesp: new Date().getTime(),
          };
        });
        console.log(this.currentWeek, "this.currentWeek");

        // 初始化拖拽
        this.initAllDrag();
      }

      this.loading = false;
    },

    /**
     * 获取统计数据
     */
    async getStatisticData() {
      if (!this.selectedAthletic) return;

      const res = await statisticsApi.getWeekStatistics({
        begin: this.currentWeek[0].commonDate,
        end: this.currentWeek[6].commonDate,
        triUserId: this.selectedAthletic,
      });

      if (res.success) {
        this.statisticData = res.result.statisticsVoList.map((item) => ({
          ...item,
          actualValue: unitConversion(
            item.actualValue,
            statisticKeyToTitle[item.key]?.unit
          ),
          title: statisticKeyToTitle[item.key]?.title,
          color: statisticKeyToTitle[item.key]?.color,
          icon: statisticKeyToTitle[item.key]?.icon,
          unit: statisticKeyToTitle[item.key]?.unit,
        }));
        this.sthData = res.result.avgSthRespDto;
      }
    },

    /**
     * 获取运动员阈值
     */
    async getAthleticThreshold(id, date) {
      const res = await athleteApi.getUserProfile(id, date);
      res.result.thresholdRecordList.forEach((item) => {
        switch (item.thresholdType) {
          case 1:
            this.athleticThreshold.heartRate = item.threshold;
            break;
          case 2:
            this.athleticThreshold.cycle = item.threshold;
            break;
          case 3:
            this.athleticThreshold.run = item.threshold;
            break;
          case 4:
            this.athleticThreshold.swim = item.threshold;
            break;
        }
      });
    },

    /**
     * 获取授权设备列表
     */
    async getAuthorizedDeviceList() {
      const res = await athleteApi.getAuthorizedDevices(this.selectedAthletic);
      this.deviceList = (res.result || []).map((device) => ({
        ...device,
        enabled: device.syncFlag === 1,
        deviceType: device.deviceType || 0,
      }));
    },

    /**
     * 设备状态变更
     */
    async handleDeviceChange(item) {
      const syncFlag = item.enabled ? 1 : 0;
      const res = await athleteApi.updateAuthorizedDevice({
        deviceId: item.id,
        syncFlag,
      });
      if (res.success) {
        this.$message.success("操作成功");
        this.getAuthorizedDeviceList();
      }
    },

    /**
     * 设备点击重试同步
     */
    handleDeviceClick(classItem, device) {
      const date = this.currentWeek.find((w) =>
        w.classSchedule.some((c) => c.id === classItem.id)
      )?.commonDate;

      if (date && date < new Date().toISOString().split("T")[0]) {
        this.$message.error("该课程已过期");
        return;
      }
      console.log(device, "device");

      if (device.syncStatus === 1) {
        this.$message.info("该设备已同步成功");
        return;
      }

      this.$confirm("确定同步课表至设备吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await scheduleApi.retrySync({
          classScheduleId: classItem.id,
          deviceType: device.deviceType,
        });
        if (res.success) {
          this.$message.success(res.result);
          this.getScheduleData();
        } else {
          this.$message.error(res.message);
        }
      });
    },

    /**
     * 周切换
     */
    onWeekChange(payload) {
      this.currentWeek = payload.currentWeek.list.map((item) => {
        const date = getLunarDate(item);
        return {
          commonDate: item,
          lunarDate: date.fullName,
          date: item,
          activityList: [],
          classSchedule: [],
        };
      });

      // 计算当前月份
      if (this.currentWeek.length > 0) {
        const firstDay = this.currentWeek[0].commonDate;
        const date = new Date(firstDay);
        this.currentMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      }

      this.getScheduleData();
    },

    /**
     * 刷新数据
     */
    handleRefresh() {
      this.getScheduleData();
    },
    async getCurrentUserClassConfigCount() {
      const res = await classApi.getCurrentUserClassConfigCount();
      if (res.success) {
        this.currentUserClassConfig = res.result;
      }
    },

    /**
     * 新增课程
     */
    handleAddClass(groupId) {
      if (
        this.currentUserClassConfig.currentCount >=
        this.currentUserClassConfig.limitValue
      ) {
        this.$message.error("超出课程数量上限");
        return;
      }
      this.isClass = true;
      this.addGroupId = groupId;

      this.showAddClassTitle = true;
    },

    /**
     * 新增分组
     */
    handleAddGroup() {
      this.currentGroup = { id: "", classesGroupName: "" };
      this.showAddGroup = true;
    },

    /**
     * 编辑分组
     */
    handleEditGroup(group) {
      this.currentGroup = {
        id: group.groupId,
        classesGroupName: group.groupName,
      };
      this.showAddGroup = true;
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
            this.getClassList();
          }
        });
      });
    },

    /**
     * 移动分组
     */
    handleMoveGroup(groupId) {
      this.moveGroupId = groupId;
      this.moveType = "group";
      this.showMoveGroup = true;
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
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await classApi.deleteClass(classId);
        if (res.success) {
          this.$message.success("删除成功");
          this.getClassList();
        }
      });
    },
    async handleUpdateClass(classData, flag) {
      classApi.updateClass(classData).then((res) => {
        if (res.success) {
          this.$message.success("更新成功");
          if (flag) this.showViewClassCard = false;
          this.getClassList();
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
     * 课程详情
     */
    handleClassDetail(classId, sportType) {
      this.classModalData = this.findClassById(classId);
      // console.log(this.classDetailData, "classDetailData");
      // this.showClassDetailModal = true;
      this.classModalDataType = "edit";
      console.log(sportType, "sportType");
      // this.showAddClassModal = true;
    },

    /**
     * 课表详情
     */
    handleClassScheduleDetail(classItem, sportType) {
      // this.classSportType = sportType;
      // 从currentWeek中查找课表数据
      // let foundClass = null;
      // this.currentWeek.forEach((day) => {
      //   const found = day.classSchedule.find((c) => c.id === classId);
      //   if (found) foundClass = found;
      // });
      // console.log(foundClass, "foundClass");
      // this.classDetailData = foundClass;
      // this.classSportType = sportType;
      // this.showClassDetailModal = true;
      console.log(classItem, "classItem");
      this.classSportType = sportType;
      this.classDetailData = classItem;
      this.$nextTick(() => {
        this.showClassDetailModal = true;
      });
    },

    /**
     * 删除课表
     */
    async handleDeleteClassSchedule(classId, isCut = false) {
      if (!isCut) {
        this.$confirm("确认删除该课表？", "提示", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }).then(async () => {
          const res = await scheduleApi.deleteSchedule(classId);
          if (res.success) {
            this.$message.success("删除成功");
            this.getScheduleData();
          }
        });
      } else {
        const res = await scheduleApi.deleteSchedule(classId);
      }
    },

    /**
     * 运动详情
     */
    handleSportDetail(activity) {
      // this.sportDetailData = {
      //   activityId,
      //   id: classScheduleId,
      //   sportType,
      // };
      console.log(this.sportDetailData, "this.sportDetailData");
      this.classDetailData = activity;
      // this.showSportDetailModal = true;
      this.showEditScheduleClass = true;
      this.isActivity = true;
    },

    /**
     * 查看健康数据
     */
    handleViewHealthData(healthData) {
      console.log("healthData:", healthData);
      this.healthViewData = healthData;
      this.healthViewDate =
        healthData.date || new Date().toISOString().split("T")[0];
      this.healthViewDeviceType = healthData.deviceType || null;
      this.showHealthViewDialog = true;
    },

    /**
     * 解除匹配
     */
    handleUnbind(classScheduleId) {
      this.$confirm("确定要将这条运动和课表解除匹配吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await scheduleApi.unbindActivity(classScheduleId);
        if (res.success) {
          this.$message.success("解除匹配成功");
          this.getScheduleData();
        }
      });
    },

    /**
     * 删除运动
     */
    handleDeleteActivity(activity) {
      this.$confirm("确认删除该运动？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const type = activity.activityId ? 1 : 2;
        const activityId = activity.activityId
          ? activity.activityId
          : activity.manualActivityId;
        console.log(activity, activityId, type, "activityId, type");
        const res = await scheduleApi.deleteActivity(activityId, type);
        if (res.success) {
          this.$message.success("删除成功");
          this.getScheduleData();
        }
      });
    },

    /**
     * 复制/添加课程
     */
    handleCopyClassFromOfficial(classData, groupId) {
      if (
        this.currentUserClassConfig.currentCount >=
        this.currentUserClassConfig.limitValue
      ) {
        this.$message.error("超出课程数量上限");
        return;
      }
      this.copyClassFromOfficialClassId = classData.id;
      this.copyClassFromOfficialGroupId = groupId;
      this.copyClassFromOfficialData = classData;
      this.showCopyClassFromOfficial = true;
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
     * 课程拖拽到日历
     */
    handleClassDragToSchedule(e) {
      const classItem = this.findClassById(e.item.dataset.id);
      const params = {
        classesId: classItem.id,
        classesJson: JSON.stringify(classItem.classesJson),
        classesDate: e.to.dataset.date,
        sportType: classItem.sportType,
      };
      // 移除克隆的DOM元素，避免显示课程模板
      if (e.item && e.item.parentNode) {
        e.item.parentNode.removeChild(e.item);
      }
      this.AddScheduleClass(params, "", e.newIndex);
    },

    /**
     * 日历拖拽添加
     */
    handleScheduleDragAdd(e) {
      console.log(e);
      const classId = e.item.dataset.id;
      const date = e.to.dataset.date;

      let newClassSchedule = {};
      const sortVoList = [];
      if (e.item.dataset.type === "classTemplate") {
        this.handleClassDragToSchedule(e);
        return;
      }

      // 移除拖拽产生的DOM元素，避免显示重复的课表
      if (e.item && e.item.parentNode) {
        e.item.parentNode.removeChild(e.item);
      }

      // 删除原数据
      this.currentWeek.forEach((item) => {
        if (item.commonDate.includes(e.item.dataset.date)) {
          item.classSchedule.forEach((itemClass, oldIndex) => {
            if (itemClass.id === +classId) {
              newClassSchedule = itemClass;
              item.classSchedule.splice(oldIndex, 1);
            }
          });
        }
      });

      // 插入新数据
      let currentData = [];
      this.currentWeek.forEach((item) => {
        if (item.commonDate.includes(date)) {
          currentData = JSON.parse(JSON.stringify(item.classSchedule));
          currentData.splice(e.newIndex, 0, newClassSchedule);
        }
      });

      // 生成排序数据
      currentData.forEach((item, index) => {
        sortVoList.push({
          id: item.id,
          sort: index,
        });
      });
      scheduleApi
        .bindActivity({
          classScheduleId: classId,
          classesDate: date,
          triUserId: this.selectedAthletic,
          sortVoList,
        })
        .then((res) => {
          if (res.success) {
            this.$message.success("课表移动成功");
          }
        })
        .finally(() => {
          this.getScheduleData();
        });
    },

    /**
     * 运动和课表匹配
     */
    handleMatchClass({ classId, activityId, manualActivityId, type }) {
      let currentClass = {};
      let currentActivity = {};
      let activityDate = "";
      console.log(activityId, manualActivityId, "activityId, manualActivityId");

      this.currentWeek.forEach((item) => {
        item.activityList.forEach((activity) => {
          if (activity.activityId === activityId) {
            currentActivity = activity;
            activityDate = item.commonDate;
          } else if (activity.manualActivityId === manualActivityId) {
            currentActivity = activity;
            activityDate = item.commonDate;
          }
        });
        item.classSchedule.forEach((classItem) => {
          if (classItem.id === +classId) {
            currentClass = classItem;
          }
        });
      });
      console.log(currentActivity, "currentActivity");

      // 检查运动是否已经匹配过课表
      if (currentActivity.classScheduleId) {
        this.$message.warning("该运动已经匹配过课表");
        return;
      }

      // 判断是否从课程模板中拖拽
      if (type === "classTemplate") {
        currentClass = this.findClassById(classId);
        if (
          currentClass.sportType ===
          ACTIVITY_TYPE_DICT[currentActivity.sportType]
        ) {
          this.handleBind(
            currentClass,
            {
              ...currentActivity,
              dataDate: activityDate,
            },
            "classTemplate"
          );
        } else {
          console.log(
            currentClass.sportType,
            currentActivity.sportType,
            "currentClass.sportType, currentActivity.sportType"
          );
          this.$message.error("该运动类型与课程类型不匹配");
          this.getScheduleData();
        }
      } else {
        if (
          isSportTypeMatch(currentClass.sportType, currentActivity.sportType)
        ) {
          this.handleBind(currentClass, {
            ...currentActivity,
            dataDate: activityDate,
          });
        } else {
          console.log(
            currentClass.sportType,
            currentActivity.sportType,
            "currentClass.sportType, currentActivity.sportType"
          );
          this.$message.error("该运动类型与课程类型不匹配");
          this.getScheduleData();
        }
      }
    },

    /**
     * 绑定课程和运动
     */
    handleBind(classItem, activityItem, type) {
      const exerciseData = {
        name: activityItem.activityName,
        duration: activityItem.duration,
        sth: activityItem.sthValue,
        activityId: activityItem.activityId,
        manualActivityId: activityItem.manualActivityId,
        dataDate: activityItem.dataDate,
        distance: activityItem.distance,
        sportType: activityItem.sportType,
      };
      // 模拟课程数据 - 这里可以从课程列表中选择
      const courseData = {
        name: classItem.classesJson.title,
        duration: classItem.classesJson.duration,
        sth: classItem.classesJson.sth,
        id: classItem.id,
        classesJson: classItem.classesJson,
        distance: classItem.classesJson.distance,
        distanceUnit: classItem.classesJson.distanceUnit,
        sportType: classItem.sportType,
      };
      console.log(exerciseData, "exerciseData");
      this.bindCourseData = courseData;
      this.bindExerciseData = [exerciseData];
      this.bindType = type;
      this.showBindModal = true;
    },

    /**
     * 添加课表到日历
     */
    async AddScheduleClass(data, type = "", index = 0) {
      if (!this.selectedAthletic) return;
      console.log(this.athleticThreshold, "old athleticThreshold");
      const originalClassesJson = parseClassesJson(data.classesJson);
      await this.getAthleticThreshold(this.selectedAthletic, data.classesDate);
      console.log(this.athleticThreshold, "new athleticThreshold");

      // 根据运动类型计算阈值
      let calculatedClassesJson = originalClassesJson;
      if (data.sportType === "RUN") {
        calculatedClassesJson = new CalculateRun(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues();
      } else if (data.sportType === "CYCLE") {
        calculatedClassesJson = new CalculateBike(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues();
      }

      // 计算时间距离STH
      if (["RUN", "CYCLE"].includes(data.sportType)) {
        const res = await scheduleApi.calculateTimeDistanceSth({
          ...data,
          classesJson: JSON.stringify(calculatedClassesJson),
          triUserId: this.selectedAthletic,
        });

        if (data.sportType === "RUN") {
          calculatedClassesJson = {
            ...calculatedClassesJson,
            duration: secondsToHHMMSS(res.result.time || 0),
            distance: (res.result.distance || 0) + "km",
            sth: res.result.sth,
          };
        } else if (data.sportType === "CYCLE") {
          calculatedClassesJson = {
            ...calculatedClassesJson,
            duration: calculatedClassesJson.duration,
            distance: calculatedClassesJson.distance,
            sth: res.result.sth,
          };
        }
      }

      // 将计算后的classesJson字符串化
      const finalClassesJsonString = JSON.stringify(calculatedClassesJson);

      // 创建更新后的data对象
      const updatedData = {
        ...data,
        classesJson: finalClassesJsonString,
      };

      if (type === "classTemplate") {
        return updatedData;
      }

      // 生成排序数据
      const sortVoList = [];
      let classSchedule = [];
      let sort = null;

      this.currentWeek.forEach((item) => {
        if (item.commonDate === updatedData.classesDate) {
          classSchedule = JSON.parse(JSON.stringify(item.classSchedule));
          classSchedule.splice(index, 0, updatedData);
        }
      });

      classSchedule.forEach((item, index) => {
        if (item.id) {
          sortVoList.push({
            id: item.id,
            sort: index,
          });
        } else {
          sort = index;
        }
      });

      const res = await scheduleApi.createSchedule({
        ...updatedData,
        triUserId: this.selectedAthletic,
        sortVoList,
        sort,
      });

      if (res.success) {
        this.getScheduleData();
        this.getClassList();
      }
    },

    /**
     * 课程折叠变化 - 初始化拖拽
     */
    classSlideChange() {
      this.initClassDrag();
    },

    /**
     * 保存课程标题
     */
    onSaveClassTitle(payload) {
      this.classModalData = { ...payload };
      this.showAddClassTitle = false;
      this.showSportTypeModal = true;
    },

    /**
     * 选择运动类型
     */
    onSelectSportType(item) {
      if (this.classModalDataType !== "addSchedule") {
        this.classModalDataType = "add";
      }
      console.log(item, "item");
      var Map = {
        swim: "SWIM",
        strength: "STRENGTH",
        note: "REMARK",
        other: "OTHER",
        rest: "REST",
        ride: "CYCLE",
        run: "RUN",
      };
      this.classModalData.sportType = Map[item.key];
      this.showAddClassModal = true;
      this.showSportTypeModal = false;
    },

    /**
     * 保存各类型课程
     */
    onSaveAddClass(saveData, flag) {
      if (this.classModalDataType === "add") {
        classApi.createClass(saveData).then((res) => {
          if (res.success) {
            this.$message.success("课程保存成功");
            if (flag) this.showAddClassModal = false;
            this.getClassList();
          } else {
            this.$message.error(res.message);
          }
        });
      } else if (this.classModalDataType === "edit") {
        classApi.updateClass(saveData).then((res) => {
          if (res.success) {
            this.$message.success("课程保存成功");
            if (flag) this.showAddClassModal = false;
            this.getClassList();
          } else {
            this.$message.error(res.message);
          }
        });
      } else if (this.classModalDataType === "addSchedule") {
        console.log(
          saveData,
          flag,
          this.classModalData,
          this.addScheduleDate,
          "saveData, flag, classModalData, addScheduleDate"
        );
        if (flag) this.showAddClassModal = false;
        this.handlePasteClass(this.addScheduleDate, saveData);
      }
    },

    /**
     * 保存分组
     */
    onSaveAddGroup() {
      this.showAddGroup = false;
      this.getClassList();
    },

    /**
     * 保存移动分组
     */
    onSaveMoveGroup() {
      this.showMoveGroup = false;
      this.getClassList();
      this.getScheduleData();
    },

    /**
     * 保存复制课程
     */
    onSaveCopyClassFromOfficial() {
      this.showCopyClassFromOfficial = false;
      this.getClassList();
    },

    /**
     * 保存运动员信息
     */
    onSaveAthleticInfo() {
      // 保存逻辑
      this.showAthleticInfoDialog = false;
      this.getScheduleData();
      this.getAthleticThreshold(this.selectedAthletic);
    },

    /**
     * 取消月度统计
     */
    onCancelMonthStatistic() {
      this.showMonthStatisticDialog = false;
    },

    /**
     * 取消运动详情
     */
    onCancelSportDetail() {
      this.showSportDetailModal = false;
    },

    /**
     * 绑定确认
     */
    async onBind(data) {
      console.log("匹配数据：", data);
      if (data.type === "classTemplate") {
        const params = {
          classesId: data.courseData.id,
          classesJson: JSON.stringify(data.courseData.classesJson),
          classesDate: data.exerciseData[0].dataDate,
          sportType: data.courseData.sportType,
        };
        const josnData = await this.AddScheduleClass(params, data.type);
        scheduleApi
          .createSchedule({
            ...josnData,
            triUserId: this.selectedAthletic,
          })
          .then((res) => {
            if (res.success) {
              const type = data.exerciseData[0].activityId ? 1 : 2;
              const bindingActivityId = data.exerciseData[0].activityId
                ? data.exerciseData[0].activityId
                : data.exerciseData[0].manualActivityId;
              scheduleApi
                .bindActivity({
                  classScheduleId: res.result.id,
                  bindingActivityId: bindingActivityId,
                  type: type,
                  classesDate: data.exerciseData[0].dataDate,
                  triUserId: this.selectedAthletic,
                })
                .then((res) => {
                  if (res.success) {
                    this.$message.success("匹配成功");
                  } else {
                    this.$message.error(res.message);
                  }
                  // 关闭对话框并刷新数据
                  this.showBindModal = false;
                  this.$nextTick(() => {
                    this.getScheduleData();
                  });
                })
                .catch((error) => {
                  console.error("绑定失败:", error);
                  this.$message.error("绑定失败");
                  this.showBindModal = false;
                  this.$nextTick(() => {
                    this.getScheduleData();
                  });
                });
            } else {
              this.$message.error(res.message);
              this.showBindModal = false;
            }
          })
          .catch((error) => {
            console.error("创建课表失败:", error);
            this.$message.error("创建课表失败");
            this.showBindModal = false;
          });
        return;
      }
      const type = data.exerciseData[0].manualActivityId ? 2 : 1;
      const bindingActivityId = data.exerciseData[0].manualActivityId
        ? data.exerciseData[0].manualActivityId
        : data.exerciseData[0].activityId;
      // 这里可以调用匹配API
      scheduleApi
        .bindActivity({
          classScheduleId: data.courseData.id,
          bindingActivityId: bindingActivityId,
          type: type,
          classesDate: data.exerciseData[0].dataDate,
          triUserId: this.selectedAthletic,
        })
        .then((res) => {
          if (res.success) {
            this.$message.success("匹配成功");
          } else {
            this.$message.error(res.message);
          }
          // 关闭对话框并刷新数据
          this.showBindModal = false;
          this.$nextTick(() => {
            this.getScheduleData();
          });
        })
        .catch((error) => {
          console.error("绑定失败:", error);
          this.$message.error("绑定失败");
          this.showBindModal = false;
          this.$nextTick(() => {
            this.getScheduleData();
          });
        });
    },

    /**
     * 取消绑定
     */
    onCancelBind() {
      this.showBindModal = false;
      this.getScheduleData();
    },

    /**
     * 保存课程详情
     */
    handleClassDetailSave(flag) {
      console.log(flag, "flag");
      if (flag) {
        this.showClassDetailModal = false;
        this.classSportType = "";
        this.classDetailData = {};
      }
      this.getScheduleData();
      this.getClassList();
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
}

.athletic-container {
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

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 5px;
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
}

.class-container-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e5e5e5;
  background-color: #fff;
}
</style>

<style lang="scss">
.health-view-dialog {
  margin-top: 5vh !important;
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    padding: 0;
  }

  .el-dialog__body {
    padding: 0;
  }
}
</style>
