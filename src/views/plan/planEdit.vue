<template>
  <div class="container">
    <div class="plan-container">
      <div class="type-change">
        <ClassList
          :class-list="classList"
          :active-class-type.sync="activeClassType"
          @class-type-change="handleClassTypeChange"
          @search="handleClassSearch"
          :show-add-class-btn="false"
          @view-class="handleViewClass"
          @collapse-change="planSlideChange"
          group-name="planDrag"
        />
      </div>
      <PlannedSchedule
        :planList="planData.dayDetails || []"
        :planTitle="planData.planTitle"
        @box-click="handleBoxClick"
        @delete-class="handleDeletePlanClass"
        @edit-class="handleEditPlanClass"
        @delete-event="handleDeleteEvent"
        @edit-event="handleEditEvent"
        @paste-class="handlePasteClass"
        @add-week="handleAddWeek"
        @plan-item-move="handlePlanItemMove"
        @plan-library-drop="handlePlanLibraryDrop"
        @save="handleSave"
      />
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
    <SportTypeModal
      v-model="showSportTypeModal"
      @select="onSelectSportType"
      @addEvent="handleAddEvent"
    />
    <AddClassModal
      v-model="showAddClassModal"
      :sportType="selectedSportType"
      type="add"
      :data="CreatePlanCourseDialogData"
      originalType="my"
      @save="onSaveAddClass"
      @cancel="showAddClassModal = false"
    />
    <EditClassModal
      :visible="showEditPlanClassModal"
      :class-item="editPlanClassData"
      originalType="plan"
      @close="showEditPlanClassModal = false"
      @delete="
        handleDeletePlanClass(
          editPlanClassData,
          editPlanClassIndex,
          editPlanClassWeekNumber,
          editPlanClassGlobalDay
        )
      "
      @save="handleEditPlanClassSave"
    />
    <AddEvent
      :visible="showAddEvent"
      :event-data="currentEventData"
      :is-edit-mode="isEditMode"
      @confirm="handleEventConfirm"
      @cancel="handleEventCancel"
    />
    <CreatePlanCourseDialog
      v-model="showCreatePlanCourseDialog"
      @save="handleCreatePlanCourse"
    />
  </div>
</template>

<script>
import { classApi } from "../classManagement/services/classManagement";
import { parseClassesJson } from "../classManagement/utils/helpers";
import ClassList from "../classManagement/components/ClassList.vue";
import ViewClassCard from "../classManagement/components/ViewClassCard.vue";
import CopyClassFromOfficial from "../classManagement/components/CopyClassFromOfficial/index.vue";
import PlannedSchedule from "./components/plannedSchedule.vue";
import SportTypeModal from "../classManagement/components/SportTypeModal/index.vue";
import AddClassModal from "../classManagement/components/AddClass/index.vue";
import EditClassModal from "../classManagement/components/EditClass.vue";
import { planApi } from "./services/planManagement";
import AddEvent from "../classManagement/components/addEvent.vue";
import CreatePlanCourseDialog from "./components/CreatePlanCourseDialog.vue";
export default {
  name: "PlanView",
  components: {
    ClassList,
    ViewClassCard,
    CopyClassFromOfficial,
    PlannedSchedule,
    SportTypeModal,
    AddClassModal,
    EditClassModal,
    AddEvent,
    CreatePlanCourseDialog,
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
      showSportTypeModal: false,
      showAddClassModal: false,
      showEditPlanClassModal: false,
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
      selectedDay: null,
      selectedSportType: "RUN",
      editPlanClassData: {},
      editPlanClassIndex: null,
      editPlanClassWeekNumber: null,
      editPlanClassGlobalDay: null,
      planType: "add",
      planData: {
        dayDetails: [],
      },
      showAddEvent: false,
      currentEventData: {},
      showCreatePlanCourseDialog: false,
      CreatePlanCourseDialogData: {},
      // 赛事编辑相关数据
      editEventIndex: null,
      editEventWeekNumber: null,
      editEventGlobalDay: null,
      isEditMode: false,
    };
  },
  mounted() {
    this.getClassList();
    console.log(this.$route.query, "this.$route.query");
    this.planType = this.$route.query.type;
    // 获取 store plan.js planData数据
    this.planData = this.$store.state.plan.planData;
    console.log(this.planData, "this.planData");
    // this.$store.dispatch("plan", this.planType);
    // this.$route.query.planId && this.getPlanData();
  },

  methods: {
    /**
     * 赛事确认
     */
    handleEventConfirm(data) {
      console.log("赛事数据:", data);
      const weekIndex = this.selectedDay.weekNumber - 1;
      const globalDay = this.selectedDay.globalDay;

      // 确保周数据存在
      if (!this.planData.dayDetails[weekIndex]) {
        this.$set(this.planData.dayDetails, weekIndex, []);
      }
      // 查找该天是否已存在数据
      let dayIndex = this.planData.dayDetails[weekIndex].findIndex(
        (item) => item.day === globalDay
      );
      let dayData = this.planData.dayDetails[weekIndex][dayIndex];
      if (!dayData) {
        // 如果该天不存在，创建新的数据对象
        dayData = {
          day: globalDay,
          details: [],
          competitionDtoList: [],
        };
        this.planData.dayDetails[weekIndex].push(dayData);
        dayIndex = this.planData.dayDetails[weekIndex].length - 1;
      }
      // 确保 competitionDtoList 数组存在
      if (!dayData.competitionDtoList) {
        this.$set(dayData, "competitionDtoList", []);
      }
      if (this.editEventIndex !== null) {
        this.$set(dayData.competitionDtoList, this.editEventIndex, data);
      } else {
        dayData.competitionDtoList.push(data);
      }
      // 保证对 dayDetails 的引用是响应式的
      this.$set(this.planData.dayDetails[weekIndex], dayIndex, {
        ...dayData,
        competitionDtoList: [...dayData.competitionDtoList],
      });
      console.log(this.planData, "this.planData");
      // 触发响应式更新
      this.$forceUpdate();

      this.editEventIndex = null;
      this.showAddEvent = false;
    },
    /**
     * 赛事取消
     */
    handleEventCancel() {
      this.currentEventData = {};
      this.editEventIndex = null;
      this.editEventWeekNumber = null;
      this.editEventGlobalDay = null;
      this.showAddEvent = false;
    },
    handleAddEvent() {
      this.currentEventData = {};
      this.showAddEvent = true;
    },
    planSlideChange() {
      // 拖拽功能已由 vuedraggable 处理，无需手动初始化
    },
    handleSave() {
      console.log(this.planData, "this.planData");
      const dayDetails = JSON.parse(JSON.stringify(this.planData.dayDetails));
      const planList = [];
      dayDetails.forEach((item) => {
        item.forEach((week) => {
          if (week.details.length > 0 || week.competitionDtoList) {
            planList.push(week);
          }
        });
      });
      console.log(planList, "planList");
      planList.forEach((item) => {
        item.details.forEach((day) => {
          day.classesJson = JSON.stringify(day.classesJson);
        });
      });
      if (this.planType === "add") {
        this.addPlan(planList);
      } else {
        this.updatePlan(planList);
      }
      console.log(planList, "planList");
    },
    async updatePlan(planList) {
      const res = await planApi.updatePlan({
        planTitle: this.planData.planTitle,
        planGroupId: this.planData.planGroupId,
        teamId: this.planData.teamId,
        email: this.planData.email,
        weChat: this.planData.weChat,
        description: this.planData.description,
        dayDetails: planList,
        planClassesId: this.planData.id,
      });
      if (res.success) {
        this.$message.success("更新成功");
        this.$router.replace({
          path: "/timeTable/plan",
          query: {
            id: this.planData.id,
            planGroupId: this.planData.planGroupId,
            type: "edit",
          },
        });
      }
    },
    // 添加计划
    async addPlan(planList) {
      const res = await planApi.addPlan({
        planTitle: this.planData.planTitle,
        planGroupId: this.planData.planGroupId,
        teamId: this.planData.teamId,
        email: this.planData.email,
        weChat: this.planData.weChat,
        description: this.planData.description,
        dayDetails: planList,
      });
      if (res.success) {
        this.$message.success("添加成功");
        this.$router.replace({
          path: "/timeTable/plan",
          query: {
            id: res.result.id,
            planGroupId: this.planData.planGroupId,
          },
        });
      }
    },
    handleClassTypeChange(type) {
      this.activeClassType = type;
      this.getClassList();
    },
    handleClassSearch(keyword) {
      this.classSearchInput = keyword;
      this.getClassList();
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
        this.getClassList();
      }
    },
    async handleUpdateClass(classData) {
      classApi.updateClass(classData).then((res) => {
        if (res.success) {
          this.$message.success("更新成功");
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
      this.getClassList();
    },
    handlePlanItemMove(payload) {
      console.log(payload, "payload");
      console.log(this.planList, "this.planList", this.planData.dayDetails);
    },
    handlePlanLibraryDrop(payload) {},
    relocatePlanClass(payload) {},

    /**
     * 点击框添加课程
     */
    handleBoxClick(day) {
      this.selectedDay = day;
      this.showSportTypeModal = true;
    },
    /**
     * 选择运动类型
     */
    onSelectSportType(sportType) {
      var Map = {
        swim: "SWIM",
        strength: "STRENGTH",
        note: "REMARK",
        other: "OTHER",
        rest: "REST",
        ride: "CYCLE",
        run: "RUN",
      };
      this.selectedSportType = Map[sportType.key];
      this.CreatePlanCourseDialogData = {};
      this.showCreatePlanCourseDialog = true;
      // this.showAddClassModal = true;
    },
    handleCreatePlanCourse(data) {
      console.log(data, "data");
      this.CreatePlanCourseDialogData = { ...data };
      this.showAddClassModal = true;
    },
    /**
     * 保存添加计划表课程
     */
    onSaveAddClass(saveData, flag) {
      console.log(saveData, flag, "saveData, flag");
      if (!this.selectedDay || !this.selectedDay.globalDay) {
        console.error("selectedDay 信息不完整");
        this.showAddClassModal = false;
        return;
      }

      const weekIndex = this.selectedDay.weekNumber - 1;
      const globalDay = this.selectedDay.globalDay;

      // 确保周数据存在
      if (!this.planData.dayDetails[weekIndex]) {
        this.$set(this.planData.dayDetails, weekIndex, []);
      }

      // 查找该天是否已存在数据
      let dayData = this.planData.dayDetails[weekIndex].find(
        (item) => item.day === globalDay
      );

      if (!dayData) {
        // 如果该天不存在，创建新的数据对象
        dayData = {
          day: globalDay,
          details: [],
          competitionDtoList: [],
        };
        this.planData.dayDetails[weekIndex].push(dayData);
      }

      // 确保 details 数组存在
      if (!dayData.details) {
        this.$set(dayData, "details", []);
      }

      // 添加课程到 details 数组
      dayData.details.push(saveData);
      console.log(this.planData.dayDetails, "this.planData.dayDetails");

      if (flag) {
        this.showAddClassModal = false;
        this.selectedDay = null;
        this.selectedSportType = null;
      }
      if (this.CreatePlanCourseDialogData.mode === "SAVE") {
        this.savePlanCourse(JSON.parse(JSON.stringify(saveData)));
      }
      // 触发响应式更新
      this.$forceUpdate();
    },

    // 如果是永久保存 需要走接口
    async savePlanCourse(data) {
      console.log(data, "data");
      data.classesJson = JSON.stringify(data.classesJson);
      classApi.createClass(data).then((res) => {
        if (res.success) {
          this.$message.success("课程保存成功");
          this.getClassList();
        } else {
          this.$message.error(res.message);
        }
      });
    },
    /**
     * 删除计划表课程
     */
    handleDeletePlanClass(classItem, classIndex, weekNumber, globalDay) {
      this.$confirm("确认删除该课程？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        if (
          weekNumber === undefined ||
          globalDay === undefined ||
          classIndex === undefined
        ) {
          console.error("删除参数不完整");
          return;
        }

        const weekIndex = weekNumber - 1;

        // 检查周数据是否存在
        if (!this.planData.dayDetails[weekIndex]) {
          console.error(`第 ${weekNumber} 周数据不存在`);
          return;
        }

        // 查找该天的数据对象
        const dayData = this.planData.dayDetails[weekIndex].find(
          (item) => item.day === globalDay
        );
        console.log(dayData, "dayData");

        if (!dayData) {
          console.error(`第 ${globalDay} 天的数据不存在`);
          return;
        }

        // 检查 details 数组是否存在
        if (!dayData.details || !Array.isArray(dayData.details)) {
          console.error(`第 ${globalDay} 天的课程数组不存在`);
          return;
        }

        // 检查索引是否有效
        if (classIndex < 0 || classIndex >= dayData.details.length) {
          console.error(`课程索引 ${classIndex} 无效`);
          return;
        }

        // 删除指定索引的课程
        dayData.details.splice(classIndex, 1);

        const dayIndex = this.planData.dayDetails[weekIndex].findIndex(
          (item) => item.day === globalDay
        );

        const hasEvents =
          Array.isArray(dayData.competitionDtoList) &&
          dayData.competitionDtoList.length > 0;

        if (dayData.details.length === 0 && !hasEvents) {
          // 当该天没有课程和赛事时才删除整天
          if (dayIndex !== -1) {
            this.planData.dayDetails[weekIndex].splice(dayIndex, 1);
          }
        } else if (dayIndex !== -1) {
          // 否则更新该天的数据以保持响应式
          this.$set(this.planData.dayDetails[weekIndex], dayIndex, {
            ...dayData,
            details: [...dayData.details],
          });
        }

        // 触发响应式更新
        this.$forceUpdate();

        // 重置编辑相关数据
        this.editPlanClassData = {};
        this.editPlanClassIndex = null;
        this.editPlanClassWeekNumber = null;
        this.editPlanClassGlobalDay = null;

        this.$message.success("删除成功");
      });
    },
    /**
     * 编辑计划表课程
     */
    handleEditPlanClass(classItem, classIndex, weekNumber, globalDay) {
      console.log(
        classItem,
        classIndex,
        weekNumber,
        globalDay,
        "classItem, classIndex, weekNumber, globalDay"
      );
      this.showEditPlanClassModal = true;
      this.editPlanClassData = JSON.parse(JSON.stringify(classItem));
      this.editPlanClassIndex = classIndex;
      this.editPlanClassWeekNumber = weekNumber;
      this.editPlanClassGlobalDay = globalDay;
    },
    /**
     * 保存编辑的计划表课程
     */
    handleEditPlanClassSave(classItem, flag) {
      // 验证编辑参数是否完整
      if (
        this.editPlanClassWeekNumber === undefined ||
        this.editPlanClassWeekNumber === null ||
        this.editPlanClassGlobalDay === undefined ||
        this.editPlanClassGlobalDay === null ||
        this.editPlanClassIndex === undefined ||
        this.editPlanClassIndex === null
      ) {
        console.error("编辑参数不完整");
        this.$message.error("编辑失败：参数不完整");
        return;
      }

      if (!classItem) {
        console.error("课程数据为空");
        this.$message.error("编辑失败：课程数据为空");
        return;
      }

      const weekIndex = this.editPlanClassWeekNumber - 1;

      // 检查周数据是否存在
      if (!this.planData.dayDetails[weekIndex]) {
        console.error(`第 ${this.editPlanClassWeekNumber} 周数据不存在`);
        this.$message.error(`第 ${this.editPlanClassWeekNumber} 周数据不存在`);
        return;
      }

      // 查找该天的数据对象
      const dayData = this.planData.dayDetails[weekIndex].find(
        (item) => item.day === this.editPlanClassGlobalDay
      );

      if (!dayData) {
        console.error(`第 ${this.editPlanClassGlobalDay} 天的数据不存在`);
        this.$message.error(`第 ${this.editPlanClassGlobalDay} 天的数据不存在`);
        return;
      }

      // 检查 details 数组是否存在
      if (!dayData.details || !Array.isArray(dayData.details)) {
        console.error(`第 ${this.editPlanClassGlobalDay} 天的课程数组不存在`);
        this.$message.error(
          `第 ${this.editPlanClassGlobalDay} 天的课程数组不存在`
        );
        return;
      }

      // 检查索引是否有效
      if (
        this.editPlanClassIndex < 0 ||
        this.editPlanClassIndex >= dayData.details.length
      ) {
        console.error(`课程索引 ${this.editPlanClassIndex} 无效`);
        this.$message.error(`课程索引无效`);
        return;
      }

      // 使用 Vue.set 确保响应式更新
      this.$set(dayData.details, this.editPlanClassIndex, classItem);

      // 触发响应式更新
      this.$forceUpdate();

      // 如果 flag 为 true，关闭编辑对话框
      if (flag) {
        this.showEditPlanClassModal = false;
        // 重置编辑相关数据
        this.editPlanClassData = {};
        this.editPlanClassIndex = null;
        this.editPlanClassWeekNumber = null;
        this.editPlanClassGlobalDay = null;
      }

      this.$message.success("编辑成功");
    },
    /**
     * 粘贴计划表课程
     */
    handlePasteClass(globalDay, weekNumber, classItem) {
      console.log(globalDay, classItem, "globalDay, classItem");
      this.selectedDay = { globalDay, weekNumber };
      this.onSaveAddClass(classItem, true);
    },
    /**
     * 添加周
     */
    handleAddWeek() {
      this.planData.dayDetails.push([]);
    },
    /**
     * 删除赛事
     */
    handleDeleteEvent(eventItem, eventIndex, weekNumber, globalDay) {
      console.log(
        eventItem,
        eventIndex,
        weekNumber,
        globalDay,
        "eventItem, eventIndex, weekNumber, globalDay"
      );
      this.$confirm("确认删除该赛事？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        console.log("删除赛事");
        const weekIndex = weekNumber - 1;
        const dayData = this.planData.dayDetails[weekIndex].find(
          (item) => item.day === globalDay
        );
        if (dayData) {
          dayData.competitionDtoList.splice(eventIndex, 1);
        }
        this.$forceUpdate();
        this.$message.success("删除成功");
      });
    },
    /**
     * 编辑赛事
     */
    handleEditEvent(eventItem, eventIndex, weekNumber, globalDay) {
      console.log(
        eventItem,
        eventIndex,
        weekNumber,
        globalDay,
        "eventItem, eventIndex, weekNumber, globalDay"
      );
      this.editEventIndex = eventIndex;
      this.editEventWeekNumber = weekNumber;
      this.editEventGlobalDay = globalDay;
      this.selectedDay = { globalDay, weekNumber };
      this.isEditMode = true;
      this.currentEventData = eventItem;
      this.showAddEvent = true;
    },
  },
};

function clampIndex(index, length) {
  const numericIndex = Number(index);
  if (!Number.isFinite(numericIndex)) {
    return 0;
  }
  const numericLength = Number(length);
  if (!Number.isFinite(numericLength) || numericLength <= 0) {
    return 0;
  }
  if (numericIndex < 0) {
    return 0;
  }
  if (numericIndex > numericLength - 1) {
    return numericLength - 1;
  }
  return Math.floor(numericIndex);
}
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
