<template>
  <div class="container">
    <div class="plan-container">
      <div class="type-change">
        <PlanList
          :class-list="classList"
          :active-class-type.sync="activeClassType"
          @class-type-change="handleClassTypeChange"
          @search="handleClassSearch"
          :show-add-class-btn="true"
          @view-class="handleViewClass"
          @add-plan="handleAddPlan"
          @add-group="handleAddGroup"
          @edit-group="handleEditGroup"
          @delete-group="handleDeleteGroup"
        />
      </div>
      <PlannedScheduleView @options-click="handleOptionsClick" />
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
    />
    <SummaryPreview v-model="showSummaryPreview" />
    <Copy v-model="showCopy" />
    <ApplyCoach v-model="showApplyCoach" />
  </div>
</template>

<script>
import { classApi } from "../classManagement/services/classManagement";
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
      currentGroup: { id: "", classesGroupName: "" },
      // 对话框状态
      addPlanVisible: false,
      addGroupVisible: false,
      showSummaryPreview: false,
      showCopy: false,
      showApplyCoach: false,
    };
  },
  mounted() {
    this.getClassList();
  },
  methods: {
    handleClassTypeChange(type) {
      this.activeClassType = type;
      this.getClassList();
    },
    handleClassSearch(keyword) {
      this.classSearchInput = keyword;
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
    /**
     * 添加计划
     */
    handleAddPlan() {
      this.addPlanVisible = true;
    },
    /**
     * 新增分组
     */
    handleAddGroup() {
      this.currentGroup = { id: "", classesGroupName: "" };
      this.addGroupVisible = true;
    },
    /*
     *编辑分组
     */
    handleEditGroup() {
      this.currentGroup = { id: "1", classesGroupName: "3" };
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
        // groupApi.deleteGroup(groupId).then((res) => {
        //   if (res.success) {
        //     this.$message.success("删除成功");
        //     this.getClassList();
        //   }
        // });
      });
    },
    /**
     * 处理选项的点击事件
     */
    handleOptionsClick(item, index) {
      console.log("Options clicked:", item, index);
      // 在这里处理选项的点击事件
      this.$message.info(`点击了选项 ${item} 的第 ${index + 1} 个`);
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
          this.handleApplyAthleteClick();
          break;
        case 5:
          this.handleHistoryCoachClick();
          break;
        case 6:
          this.handleHistoryAthleteClick();
          break;
        case 7:
          this.handleDeleteClick();
          break;
        default:
          break;
      }
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
