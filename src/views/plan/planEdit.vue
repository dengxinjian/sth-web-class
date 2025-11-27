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
        @paste-event="handlePasteEvent"
        @add-week="handleAddWeek"
        @plan-item-move="handlePlanItemMove"
        @plan-library-drop="handlePlanLibraryDrop"
        @save="handleSave"
        @save-and-exit="handleSaveAndExit"
      />
    </div>
    <ViewClassCard
      class="view-class-card"
      :visible="showViewClassCard"
      :class-item="classModalData"
      :active-class-type="activeClassType"
      @close="showViewClassCard = false"
      @move="handleMoveClass"
      @delete="handleDeleteClass"
      @copy="handleCopyClassFromOfficial"
      @save="handleUpdateClass"
      type="edit"
      dialog-margin-left="260px"
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
      :type="classModalDataType"
      :data="CreatePlanCourseDialogData"
      originalType="my"
      @save="handleSaveAddClass"
      @cancel="
        showAddClassModal = false;
        isClassError = false;
      "
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
    <MoveGroup
      v-model="showMoveGroup"
      :id="moveGroupId"
      :class-id="moveClassId"
      :type="moveType"
      @save="onSaveMoveGroup"
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
import MoveGroup from "../classManagement/components/MoveGroup/index.vue";
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
    MoveGroup,
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
      classModalDataType: "add",
      copyClassFromOfficialClassId: "",
      copyClassFromOfficialGroupId: "",
      copyClassFromOfficialData: {},
      showCopyClassFromOfficial: false,
      showSportTypeModal: false,
      showAddClassModal: false,
      showEditPlanClassModal: false,
      planList: [],
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
      autoSaveTimer: null,
      // 数据变更追踪
      hasUnsavedChanges: false,
      initialPlanData: null,
      isSaving: false, // 标记是否正在保存，避免重复提示
      isClassError: false,
    };
  },
  watch: {
    // 暂不去除，后续根据功能是否需要再启用
    // 监听路由中type值，如果值为edit，则开启30s自动保存数据功能
    // '$route.query.type': {
    //   handler(newVal) {
    //     if (newVal === 'edit') {
    //       this.startAutoSave();
    //     } else if (newVal === 'add') {
    //       this.stopAutoSave();
    //     }
    //   },
    //   immediate: true,
    // },
  },
  mounted() {
    this.getClassList();
    // 课程数量限制 -- 后续根据待用功能添加
    // this.getCurrentUserClassConfigCount();
    console.log(this.$route.query, "this.$route.query");
    this.planType = this.$route.query.type;
    // 获取 store plan.js planData数据
    const storePlanData = this.$store.state.plan.planData;
    if (storePlanData) {
      this.planData = storePlanData;
    } else {
      // 如果 store 中没有数据，初始化 planData
      this.planData = {
        dayDetails: [],
      };
      // 保存初始数据到 store
      this.$store.dispatch("plan/savePlanData", this.planData);
    }
    console.log(this.planData, "this.planData");
    // this.$store.dispatch("plan", this.planType);
    // this.$route.query.planId && this.getPlanData();

    // 保存初始数据快照，用于检测变更
    this.initialPlanData = JSON.parse(JSON.stringify(this.planData));

    // 监听浏览器刷新/关闭事件
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },
  // 路由离开守卫 - 监听路由跳转
  beforeRouteLeave(to, from, next) {
    // 先检查数据是否有变更
    this.checkDataChanged();

    if (this.hasUnsavedChanges && !this.isSaving) {
      // 阻止路由跳转，等待用户选择
      // 使用 setTimeout 确保弹窗能正常显示
      setTimeout(() => {
        this.handleLeaveWithSave()
          .then((shouldLeave) => {
            if (shouldLeave) {
              next();
            } else {
              next(false);
            }
          })
          .catch((error) => {
            console.error("离开页面处理失败:", error);
            next(false);
          });
      }, 0);
    } else {
      next();
    }
  },
  // 离开页面时,清除定时器，停止自动保存
  beforeDestroy() {
    this.stopAutoSave();
    // 移除事件监听
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  methods: {
    // 检测数据是否有变更
    checkDataChanged() {
      const currentData = JSON.stringify(this.planData);
      const initialData = JSON.stringify(this.initialPlanData);
      this.hasUnsavedChanges = currentData !== initialData;
      return this.hasUnsavedChanges;
    },
    // 标记数据已修改
    markDataChanged() {
      this.hasUnsavedChanges = true;
    },
    // 标记数据已保存
    markDataSaved() {
      this.hasUnsavedChanges = false;
      this.initialPlanData = JSON.parse(JSON.stringify(this.planData));
    },
    // 处理浏览器刷新/关闭事件
    handleBeforeUnload(event) {
      if (this.hasUnsavedChanges && !this.isSaving) {
        // 标准方式
        event.preventDefault();
        // Chrome 需要设置 returnValue
        event.returnValue = "您有未保存的数据，确定要离开吗？";
        return event.returnValue;
      }
    },
    // 处理离开页面时的保存提示
    handleLeaveWithSave() {
      return new Promise((resolve) => {
        this.$confirm("您有未保存的数据，是否保存后再离开？", "提示", {
          confirmButtonText: "保存并离开",
          cancelButtonText: "不保存离开",
          distinguishCancelAndClose: true,
          type: "warning",
          closeOnClickModal: false,
          closeOnPressEscape: false,
          lockScroll: true,
        })
          .then(async () => {
            // 用户点击"保存并离开"
            try {
              this.isSaving = true;
              await this.handleSaveAndExit();
              this.isSaving = false;
              this.markDataSaved();
              resolve(true);
            } catch (error) {
              console.error("保存失败:", error);
              this.isSaving = false;
              this.$message.error("保存失败，请重试");
              resolve(false);
            }
          })
          .catch((action) => {
            if (action === "cancel") {
              // 用户点击"不保存离开"
              this.hasUnsavedChanges = false;
              resolve(true);
            } else {
              // 用户关闭对话框（点击 X 或按 ESC），取消离开
              resolve(false);
            }
          });
      });
    },
    startAutoSave() {
      // 如果已有定时器在运行，先清除旧的定时器，避免重复启动
      if (this.autoSaveTimer) {
        this.stopAutoSave();
      }
      this.autoSaveTimer = setInterval(() => {
        try {
          this.handleAutoSave();
          console.log("自动保存数据");
        } catch (error) {
          console.error("自动保存失败:", error);
          // 即使保存失败，定时器仍然继续运行
        }
      }, 30000);
    },
    stopAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
        this.autoSaveTimer = null;
      }
    },
    async handleAutoSave() {
      const dayDetails = JSON.parse(JSON.stringify(this.planData.dayDetails));
      const planList = [];
      dayDetails.forEach((item) => {
        item.forEach((week) => {
          if (week.details.length > 0 || week.competitionDtoList) {
            planList.push(week);
          }
        });
      });
      planList.forEach((item) => {
        item.details.forEach((day) => {
          day.classesJson = JSON.stringify(day.classesJson);
        });
      });

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
        // 自动保存成功后，标记数据已保存
        this.markDataSaved();
        // this.$message.success("更新成功");
      }
    },
    /**
     * 保存移动分组
     */
    onSaveMoveGroup() {
      this.showMoveGroup = false;
      this.getClassList();
    },
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
      // 标记数据已修改
      this.markDataChanged();

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
    // 保存并关闭
    async handleSaveAndExit() {
      await this.handleSave(true);
      this.$router.replace({
        path: "/timeTable/class",
        query: {
          id: this.planData.id,
          planGroupId: this.planData.planGroupId,
          type: "edit",
        },
      });
    },
    // 保存
    async handleSave(isExit = false) {
      console.log(this.planData, "this.planData");
      this.isSaving = true; // 标记正在保存
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
      try {
        if (this.planType === "add") {
          if (this.planData.id) {
            await this.updatePlan(planList, isExit, "add");
          } else {
            await this.addPlan(planList, isExit);
          }
        } else {
          await this.updatePlan(planList, isExit);
        }
      } finally {
        this.isSaving = false;
      }
      console.log(planList, "planList");
    },
    async updatePlan(planList, isExit = false, type = "update") {
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
        // 标记数据已保存
        this.markDataSaved();
        if (type === "add") {
          this.$message.success("添加成功");
        } else {
          this.$message.success(isExit ? "更新成功" : "保存成功");
        }

        if (isExit) {
          this.$router.replace({
            path: "/timeTable/class",
            query: {
              id: this.planData.id,
              planGroupId: this.planData.planGroupId,
              type: "edit",
            },
          });
        }
      }
    },
    // 添加计划
    async addPlan(planList, isExit = false) {
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
        // 标记数据已保存
        this.markDataSaved();
        this.$message.success(isExit ? "添加成功" : "保存成功");
        this.planData = {
          ...this.planData,
          ...res.result,
        };
        if (isExit) {
          this.$router.replace({
            path: "/timeTable/class",
            query: {
              id: res.result.id,
              planGroupId: this.planData.planGroupId,
            },
          });
        }
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
      console.log(
        this.moveClassId,
        this.moveGroupId,
        this.moveType,
        "this.moveClassId, this.moveGroupId, this.moveType"
      );
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
      // 课程数量限制 -- 后续根据待用功能添加
      // if (
      //   this.currentUserClassConfig.currentCount >=
      //   this.currentUserClassConfig.limitValue
      // ) {
      //   this.$message.error("超出课程数量上限");
      //   return;
      // }
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
      this.classModalDataType = "add";
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

      // if (this.classModalDataType === "add") {
      //   dayData.details.push(saveData);
      // } else {
      //   this.$set(dayData.details, dayData.details.length - 1, saveData);
      // }
      dayData.details.push(saveData);

      if (flag) {
        this.showAddClassModal = false;
        this.selectedDay = null;
        this.selectedSportType = null;
      }
      if (this.CreatePlanCourseDialogData.mode === "SAVE") {
        console.log(saveData, "saveData");
        this.savePlanCourse(JSON.parse(JSON.stringify(saveData)));
      } else {
        this.classModalDataType = "edit";
      }
      // 触发响应式更新
      this.$forceUpdate();
    },
    handleSaveAddClass(saveData, flag) {
      console.log(saveData, flag, "saveData, flag");
      if (!this.selectedDay || !this.selectedDay.globalDay) {
        console.error("selectedDay 信息不完整");
        this.showAddClassModal = false;
        return;
      }
      if (saveData.classesTitle.length < 1) {
        this.$message.error("课程标题不能为空");
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

      if (this.classModalDataType === "add") {
        this.$message.success("课程保存成功");
        dayData.details.push(saveData);
      } else {
        this.$message.success("课程保存成功");
        this.$set(dayData.details, dayData.details.length - 1, saveData);
      }

      if (flag) {
        this.showAddClassModal = false;
        this.selectedDay = null;
        this.selectedSportType = null;
      }
      if (this.CreatePlanCourseDialogData.mode === "SAVE") {
        console.log(saveData, "saveData");
        this.savePlanCourse(JSON.parse(JSON.stringify(saveData)));
      } else {
        this.classModalDataType = "edit";
      }
      // 触发响应式更新
      this.$forceUpdate();
      // 标记数据已修改
      this.markDataChanged();
    },
    // 如果是永久保存 需要走接口
    async savePlanCourse(data) {
      console.log(data, "data");
      // data.classesJson = JSON.stringify(data.classesJson);
      if (this.classModalDataType === "add") {
        this.classModalDataType = "edit";
        classApi
          .createClass(data)
          .then((res) => {
            console.log(res, "res");
            if (res.success) {
              this.CreatePlanCourseDialogData = { mode: "SAVE", ...res.result };
              this.isClassError = false;
              this.getClassList();
            } else {
              this.isClassError = true;
            }
          })
          .catch((err) => {
            console.log(err, "err");
            this.isClassError = true;
          });
      } else {
        if (this.isClassError) {
          return;
        }
        classApi.updateClass(data).then((res) => {
          if (res.success) {
            this.getClassList();
          } else {
            this.$message.error(res.message);
          }
        });
      }
    },
    /**
     * 删除计划表课程
     */
    handleDeletePlanClass(classItem, classIndex, weekNumber, globalDay, isCut) {
      console.log(
        classItem,
        classIndex,
        weekNumber,
        globalDay,
        isCut,
        "classItem, classIndex, weekNumber, globalDay, isCut"
      );
      if (isCut) {
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
        // 标记数据已修改
        this.markDataChanged();

        // 重置编辑相关数据
        this.editPlanClassData = {};
        this.editPlanClassIndex = null;
        this.editPlanClassWeekNumber = null;
        this.editPlanClassGlobalDay = null;

        this.$message.success("操作成功");
      } else {
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
          // 标记数据已修改
          this.markDataChanged();

          // 重置编辑相关数据
          this.editPlanClassData = {};
          this.editPlanClassIndex = null;
          this.editPlanClassWeekNumber = null;
          this.editPlanClassGlobalDay = null;

          this.$message.success("删除成功");
        });
      }
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
      this.CreatePlanCourseDialogData = {};
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
      // 标记数据已修改
      this.markDataChanged();

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
      this.CreatePlanCourseDialogData = {};
      this.selectedDay = { globalDay, weekNumber };
      this.onSaveAddClass(classItem, true);
    },
    handlePasteEvent(globalDay, weekNumber, eventItem) {
      console.log(globalDay, eventItem, "globalDay, eventItem");
      this.CreatePlanCourseDialogData = {};
      this.selectedDay = { globalDay, weekNumber };
      this.handleEventConfirm(eventItem);
    },
    /**
     * 添加周
     */
    handleAddWeek() {
      this.planData.dayDetails.push([]);
      // 标记数据已修改
      this.markDataChanged();
    },
    /**
     * 删除赛事
     */
    handleDeleteEvent(eventItem, eventIndex, weekNumber, globalDay, isCut) {
      console.log(
        eventItem,
        eventIndex,
        weekNumber,
        globalDay,
        isCut,
        "eventItem, eventIndex, weekNumber, globalDay, isCut"
      );
      if (isCut) {
        const weekIndex = weekNumber - 1;
        const dayData = this.planData.dayDetails[weekIndex].find(
          (item) => item.day === globalDay
        );
        if (dayData) {
          dayData.competitionDtoList.splice(eventIndex, 1);
        }
        this.$forceUpdate();
        // 标记数据已修改
        this.markDataChanged();
      } else {
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
          // 标记数据已修改
          this.markDataChanged();
          this.$message.success("删除成功");
        });
      }
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
  height: 100vh;
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
    background-color: #f8f8f8;
    overflow-y: auto;
    overflow-x: hidden;
    border-left: 1px solid #e5e5e5;
    border-right: 1px solid #e5e5e5;
  }
}
</style>
