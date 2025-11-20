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
          :selected-plan-id="currentPlanId"
          :current-plan-group-id="currentPlanGroupId"
        />
      </div>
      <PlannedScheduleView
        :planList="planList"
        :planTitle="planTitle"
        :showMore="showMore"
        :activeClassType="activeClassType"
        @options-click="handleOptionsClick"
        @view-class="handleViewPlanClass"
      />
    </div>
    <!-- 查看计划详情 -->
    <ViewPlanDetail
      :visible="showViewPlanDetail"
      :class-item="classModalData"
      :click-position="clickPosition"
      @close="showViewPlanDetail = false"
    />
    <!-- 复制课程 -->
    <CopyClassFromOfficial
      v-model="showCopyClassFromOfficial"
      :class-id="copyClassFromOfficialClassId"
      :group-id="copyClassFromOfficialGroupId"
      :data="copyClassFromOfficialData"
      :active-class-type="activeClassType"
      @save="onSaveCopyClassFromOfficial"
    />

    <!-- 添加计划 -->
    <AddPlan
      v-model="addPlanVisible"
      :current-group-id="currentPlanGroupId"
      :activeClassType="activeClassType"
      :copyOfficialPlanInfo="copyOfficialPlanInfo"
      :planList="planList"
      @addPlanSuccess="handleAddPlanSuccess"
    />
    <!-- 添加分组 -->
    <AddGroup
      v-model="addGroupVisible"
      :data="currentGroup"
      @save="handleAddGroupSave"
    />
    <!-- 概要 -->
    <SummaryPreview
      v-model="showSummaryPreview"
      :active-class-type="activeClassType"
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
import ViewPlanDetail from "./components/ViewPlanDetail/index.vue";
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
    ViewPlanDetail,
    CopyClassFromOfficial,
    PlannedScheduleView,
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
      showViewPlanDetail: false,
      clickPosition: null,
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
      planList: [[], [], [], []],
      showMore: false,

      // 计划列表数据
      planSearchInput: "",
      currentPlanDetail: {},
      currentPlanDayDetail: [],
      copyOfficialPlanInfo: null,
    };
  },
  watch: {
    currentPlanDetail: {
      handler(newVal) {
        this.planTitle = newVal?.planTitle || "";
      },
      deep: true,
    },
  },
  mounted() {
    // 判断路由是否有值
    if (Object.keys(this.$route.query).length > 0) {
      const { id, planGroupId, type } = this.$route.query;
      if (id && planGroupId) {
        this.currentPlanId = id;
        this.currentPlanGroupId = planGroupId;
        this.getPlanDetail(id);
        this.getPlanDayDetail(id);
      }

      // if (type === "edit") {
      //   this.getPlanDetail(this.currentPlanDetail.id);
      //   this.getPlanDayDetail(this.currentPlanDetail.id);
      // }

      if (type === "cancel" && this.$store.state.plan.planData?.id) {
        this.currentPlanId = this.$store.state.plan.planData?.id;
        if (this.currentPlanId) {
          this.getPlanDetail(this.currentPlanId);
          this.getPlanDayDetail(this.currentPlanId);
        }
      }
    }
    this.getPlanList();
  },
  methods: {
    handleAddPlanSuccess(payload) {
      this.getPlanDetail(payload.id);
      this.getPlanDayDetail(payload.id);
      this.$nextTick(() => {
        this.activeClassType = 'my';
        this.currentPlanId = payload.id;
        this.currentPlanGroupId = payload.planGroupId;
        this.planTitle = payload.planTitle;
        this.currentPlanDetail = payload;
        this.copyOfficialPlanInfo = null;
        this.addPlanVisible = false;
      });
    },
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
        await this.getPlanDetail(this.currentPlanId);
        await this.getPlanDayDetail(this.currentPlanId);
      }
    },
    async handlePlanDayDetail(id, groupId) {
      this.currentPlanId = id;
      this.currentPlanGroupId = groupId;
      await this.getPlanDetail(id);
      await this.getPlanDayDetail(id);
    },
    /**
     * 获取计划详情
     */
    async getPlanDetail(id) {
      const res = await planApi.getPlanDetail(id);
      // console.log("日常详情-res", res);
      this.currentPlanDetail = res.result;
      this.currentPlanId = res.result.id;
      this.currentPlanGroupId = res.result.planGroupId;
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
    async getPlanDayDetail(id) {
      const resDayDetail = await planApi.getPlanDayDetail(id);
      // console.log("日常详情-resDayDetail", resDayDetail);
      // 处理并重组数据
      const completeData = this.completePlanDayData(resDayDetail.result);
      // console.log("completeData", completeData);
      const formattedData = this.formatPlanDayDetail(completeData);
      // console.log("重组后的数据-formattedData", formattedData);

      // return formattedData;
      this.planList = formattedData;
      this.showMore = true;
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
    handleClassTypeChange(type) {
      this.activeClassType = type;
      this.showMore = false;
      this.planList = [[], [], [], []];
      this.currentPlanId = "";
      this.currentPlanGroupId = "";
      this.planTitle = "";
      this.currentPlanDetail = {};
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
     * 课程折叠变化 - 初始化拖拽
     */
    // classSlideChange() {
    //   this.initClassDrag();
    // },
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
    handleViewPlanClass(classItem, clickPosition) {
      this.showViewPlanDetail = true;
      // 使用 classItem 作为课程数据
      this.classModalData = classItem || {};
      // 保存点击位置
      this.clickPosition = clickPosition || null;
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
    handleAddPlan(payload) {
      this.currentPlanGroupId = payload;
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
          if (_this.activeClassType === "official") {
            _this.copyOfficialPlanInfo = _this.currentPlanDetail;
            _this.handleAddPlan(_this.currentPlanDetail.planGroupId);
          } else {
            _this.handleEditPlan();
          }
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
          // _this.handleDeleteGroup();
          _this.handleDeletePlan();
        },
      };
      optMap[index]();
    },
    handleEditPlan() {
      const params = {
        ...this.currentPlanDetail,
        dayDetails: this.planList,
      };
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
    handleDeletePlan() {
      const _this = this;
      if (_this.currentPlanDetail.id) {
        this.$confirm("确认删除该计划？", "提示", {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }).then(() => {
          // 调用删除分组API
          planApi.deletePlan(_this.currentPlanDetail.id).then((res) => {
            if (res.success) {
              this.$message.success("删除成功");
              this.getPlanList();
              this.planTitle = "";
              this.planList = [[], [], [], []];
            }
          });
        });
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
