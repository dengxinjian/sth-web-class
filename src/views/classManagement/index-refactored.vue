<template>
  <div class="container">
    <div class="athletic-container" v-loading="loading">
      <!-- 左侧菜单 -->
      <LeftMenu v-model="activeName" @change="handleTypeChange" />

      <div class="content-container"
        style="display: flex; width: 100%"
        v-if="activeName === 'athletic' || activeName === 'class'">
        <!-- 中间内容区 -->
        <div class="type-change">
          <!-- 运动员管理 -->
          <div v-show="activeName === 'athletic'">
            <div v-if="loginType === '2'"
              class="team-select-container">
              <el-dropdown trigger="click" placement="bottom-start"
                @command="handleTeamChange" class="team-dropdown">
                <span class="el-dropdown-link team-name-title">
                  {{ getTeamName(selectedTeam) }}
                  <i class="el-icon-caret-bottom"></i>
                </span>
                <el-dropdown-menu slot="dropdown"
                  class="team-dropdown-menu">
                  <el-dropdown-item v-for="t in teamOrClubList"
                    :key="t.type + '_' + t.id"
                    :command="{ id: t.id, type: t.type }"
                    :class="{ 'active': selectedTeam === t.id && selectedOrgType === t.type }">
                    {{ t.displayName }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <AthleticManagement
              v-if="selectedTeam && selectedOrgType === 'team'"
              :teamId="selectedTeam"
              :teamName="getTeamName(selectedTeam)"
              :activeName="activeName"
              :defaultTeamId="defaultTeamId"
              @athletic-click="handleAthleticChange" />
            <cludList v-else :clubId="selectedTeam"
              :teamName="getTeamName(selectedTeam)"
              :activeName="activeName"
              @member-click="handleAthleticChange"></cludList>
          </div>

          <!-- 课程管理 -->
          <div v-show="activeName === 'class'"
            class="class-container-wrapper">
            <ClassList ref="planListRef" :class-list="classList"
              :team-tree-list="teamTreeList"
              :active-class-type.sync="activeClassType"
              @class-type-change="handleClassTypeChange"
              @search="handleClassSearch" @add-class="handleAddClass"
              @add-group="handleAddGroup"
              @edit-group="handleEditGroup"
              @delete-group="handleDeleteGroup"
              @move-group="handleMoveGroup"
              @class-detail="handleClassDetail"
              @share-class-detail="handleShareClassDetail"
              @move-class="handleMoveClass"
              @move-share-class="handleMoveShareClass"
              @delete-class="handleDeleteClass"
              @delete-share-class="handleDeleteShareClass"
              @copy-class="handleCopyClassFromOfficial"
              @collapse-change="classSlideChange"
              @view-class="handleViewClass"
              @view-share-class="handleViewShareClase"
              @add-share-group="handleAddShareGroup"
              @edit-share-group="handleEditShareGroup"
              @delete-share-group="handleDeleteShareGroup"
              @share-team-click="handleShareTeamClick"
              @share-team-group-click="handleShareTeamGroupClick"
              :share-group-list="shareGroupList"
              :current-share-team-id="currentShareTeamId" />
          </div>
        </div>

        <div>
          <div class="schedule-top">
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
                justify-content: space-between;
              ">
              <WeekRangePicker @week-change="onWeekChange" />
              <div
                style="display: flex; align-items: center; gap: 10px">

                <div v-if="loginType === '2'">
                  <!-- <span>运动员：</span> -->
                  <el-dropdown trigger="click"
                    placement="bottom-start"
                    @command="handleAthleticChange"
                    class="athletic-dropdown">
                    <span
                      class="el-dropdown-link athletic-select-title">
                      <img v-if="getSelectedAthleticAvatar"
                        :src="getSelectedAthleticAvatar"
                        class="athletic-avatar"
                        alt="" />
                      <span class="athletic-name-text">
                        {{ getSelectedAthleticName || "选择人员" }}
                      </span>
                      <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown"
                      class="athletic-dropdown-menu">
                      <el-dropdown-item
                        v-for="item in athleticDropdownItems"
                        :key="item.key"
                        :command="item.type === 'member' ? item.value : null"
                        :disabled="item.type === 'group'" :class="{
                          'group-header': item.type === 'group',
                          active: item.type === 'member' && selectedAthletic === item.value,
                        }">
                        <div v-if="item.type === 'member'"
                          class="athletic-menu-item">
                          <img v-if="item.raw && item.raw.userAvatar"
                            :src="!item.raw.userAvatar || item.raw.userAvatar.includes('wxfile') ? 'https://web-home.tos-cn-beijing.volces.com/avatar.png' : item.raw.userAvatar"
                            class="athletic-menu-avatar" alt="" />
                          <span>{{ item.label }}</span>
                        </div>
                        <span v-else>{{ item.label }}</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
            </div>
            <div class="schedule-search">
              <!-- <el-button
                type="text"
                size="mini"
                :disabled="!selectedAthletic"
                @click="showAthleticInfoDialog = true"
              >
                信息查看
              </el-button> -->
              <img src="@/assets/addClass/userInfo.png" alt=""
                @click="showAthleticInfoDialog = true" />
              <img src="@/assets/addClass/Statistics.png" alt=""
                @click="showMonthStatisticDialog = true" />
              <div class="schedule-table-header-cell-data">
                <el-popover placement="bottom-end" width="180"
                  trigger="hover">
                  <div v-for="item in deviceList" :key="item.id"
                    style="
                      display: flex;
                      flex-direction: row;
                      gap: 10px;
                      margin: 10px 0;
                    ">
                    <img :src="getDeviceBrandIcon(item.deviceType)"
                      alt="" class="device-brand-icon" />
                    <el-switch v-model="item.enabled"
                      :inactive-text="getDeviceName(item.deviceType)"
                      @change="handleDeviceChange(item)"></el-switch>
                  </div>
                  <span slot="reference"
                    class="device-filter-reference">
                    <img src="@/assets/addClass/Synchronization.png"
                      alt="" />
                  </span>
                </el-popover>
              </div>
              <img src="@/assets/addClass/Refresh.png" alt=""
                @click="handleRefresh" />
            </div>
          </div>

          <div style="display: flex;flex:1; width: 100%">
            <!-- 日程表 -->
            <ScheduleCalendar :current-week="currentWeek"
              :team-list="teamList" :athletic-list="athleticList"
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
              @paste-event="handlePasteEvent"
              @cut-event="handleCutEvent"
              @view-health-data="handleViewHealthData"
              @add-schedule="handleAddSchedule"
              @event-detail="handleEventDetail"
              @edit-event="handleEditEvent"
              @delete-all-schedules="handleDeleteAllSchedules"
              @input-activity="handleInputActivity"
              @click-event-activity="handleEditActivity" />

            <!-- 右侧统计面板 -->
            <StatisticsPanel :sth-data="sthData"
              :statistic-data="statisticData"
              :device-list="deviceList"
              @device-change="handleDeviceChange" />
          </div>
        </div>
      </div>
      <div class="content-container"
        style="display: flex; width: 100%"
        v-if="activeName === 'plan'">
        <PlanView :isPlan="isPlan" @choose-plan="handleChoosePlan" :selected-team="selectedTeam" />
        <!-- 日程表 -->
        <ScheduleCalendar v-if="!isPlan" :current-week="currentWeek"
          :team-list="teamList" :athletic-list="athleticList"
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
          @paste-class="handlePasteClass" @cut-class="handleCutClass"
          @paste-event="handlePasteEvent"
          @cut-event="handleCutEvent"
          @view-health-data="handleViewHealthData"
          @add-schedule="handleAddSchedule"
          @event-detail="handleEventDetail"
          @edit-event="handleEditEvent"
          @input-activity="handleInputActivity"
          @click-event-activity="handleEditActivity"
          @delete-all-schedules="handleDeleteAllSchedules" />
        <!-- 右侧统计面板 -->
        <StatisticsPanel v-if="!isPlan" :sth-data="sthData"
          :statistic-data="statisticData" :device-list="deviceList"
          @device-change="handleDeviceChange" />
      </div>
    </div>

    <!-- 对话框组件 -->
    <AthleticInfoDialog v-model="showAthleticInfoDialog"
      :data="athleticInfoData" @save="onSaveAthleticInfo" />

    <MonthStatisticDialog v-model="showMonthStatisticDialog"
      :triUserId="selectedAthletic" :currentMonth="currentMonth"
      @cancel="onCancelMonthStatistic" />

    <SportTypeModal v-model="showSportTypeModal" :isClass="isClass"
      :isSchedule="isSchedule" @select="onSelectSportType"
      @addEvent="handleAddEvent" @cancel="handleCancelSportType" />

    <SportDetailModal v-model="showSportDetailModal"
      :type="sportDetailData.sportType" :data="sportDetailData"
      :selectedAthletic="selectedAthletic"
      @cancel="onCancelSportDetail" />
    <AddClassTitle v-model="showAddClassTitle" :groups="[
      { id: 1, name: '我的课程' },
      { id: 2, name: '团队课程' },
    ]" :default-group-id="addGroupId" @save="onSaveClassTitle" />

    <AddGroup v-model="showAddGroup" :data="currentGroup"
      @save="onSaveAddGroup" />

    <MoveGroup v-model="showMoveGroup" :id="moveGroupId"
      :class-id="moveClassId" :type="moveType"
      @save="onSaveMoveGroup" />

    <BindModal v-model="showBindModal"
      :exercise-data="bindExerciseData" :course-data="bindCourseData"
      :type="bindType"
      @bind="onBind" @cancel="onCancelBind" />

    <ClassDetailModal v-model="showClassDetailModal"
      :type="classSportType" :scheduleType="scheduleType"
      :data="classDetailData" :classesDate="addScheduleDate"
      :athleticThreshold="athleticThreshold"
      :triUserId="selectedAthletic" @save="handleSaveClassDetail"
      @cancel="handleResetClassDetail" />

    <CopyClassFromOfficial v-model="showCopyClassFromOfficial"
      :class-id="copyClassFromOfficialClassId"
      :group-id="copyClassFromOfficialGroupId"
      :data="copyClassFromOfficialData"
      :active-class-type="activeClassType"
      @save="onSaveCopyClassFromOfficial" />

    <ViewClassCard :visible="showViewClassCard"
      :activeClassType="activeClassType"
      :class-item="classModalData"
      :active-class-type="activeClassType"
      @close="showViewClassCard = false" @move="handleMoveClass"
      @move-share-group="handleMoveShareGroup"
      @share-auth-edit="handleShareAuthEdit"
      @delete="handleDeleteClass" @copy="handleCopyClassFromOfficial"
      @save="handleUpdateClass" @share="handleShareClass"
      @share-history="handleShareClassHistroy" />
    <ShareClassModal v-model="showShareClassModal"
      :class-id="shareClassId" @shareSuccess="onSaveShareClass" />
    <AddClassModal v-model="showAddClassModal"
      :sportType="classModalData.sportType" :type="classModalDataType"
      :originalType="activeClassType" :data="classModalData"
      @save="onSaveAddClass"
      @cancel="showAddClassModal = false" />

    <EditScheduleClass :visible="showEditScheduleClass"
      :class-item="isActivity ? activityDetailData : classDetailData"
      :is-activity="isActivity" :athleticThreshold="athleticThreshold"
      :triUserId="selectedAthletic" @close="
        showEditScheduleClass = false
      isActivity ? (activityDetailData = {}) : (classDetailData = {})
        " @save="handleClassDetailSave" @delete="
          handleDeleteClassSchedule
        isActivity ? (activityDetailData = {}) : (classDetailData = {})
          " />

    <!-- 健康数据查看弹窗 -->
    <el-dialog title="" :visible.sync="showHealthViewDialog"
      width="90%" :close-on-click-modal="false"
      custom-class="health-view-dialog">
      <HealthView v-if="showHealthViewDialog"
        :health-data="healthViewData" :date="healthViewDate"
        :device-list="deviceList" :device-type="healthViewDeviceType"
        :triUserId="selectedAthletic"
        @close="showHealthViewDialog = false" />
    </el-dialog>

    <!-- 添加/编辑赛事弹窗 -->
    <AddEvent :visible.sync="showAddEvent"
      :event-data="currentEventData" :is-edit-mode="isEditMode"
      @confirm="handleEventConfirm" @cancel="handleEventCancel" />
    <EventInfo :visible.sync="showEventInfo"
      :event-data="currentEventData" @delete="handleEventDetail"
      @close="
        showEventInfo = false
      getScheduleData()
        " />
    <InputActivity :visible.sync="showInputActivity"
      :activityDate="inputActivityDate"
      @submit="handleInputActivitySave" />
    <!-- 添加分享分组 -->
    <AddShareGroup v-model="addShareGroupVisible"
      :data="currentShareGroup" @save="handleAddShareGroupSave" />
    <!-- 移动分享分组 -->
    <MoveShareGroup :visible.sync="moveShareGroupVisible"
      :data="currentMoveShareGroup"
      @save="handleMoveShareGroupSave" />
    <!-- 权限调整 -->
    <ShareAuthEdit v-model="shareAuthEditVisible"
      :shareAuth="currentShareAuthEdit.shareAuth"
      :planInfo="currentShareAuthEdit"
      @success="handleShareAuthEditSave" />

    <shareHistory :visible.sync="showShareHistory"
      :planInfo="shareHistoryData"
      @close="showShareHistory = false" />
  </div>
</template>

<script>
// 组件导入
import LeftMenu from "./components/LeftMenu.vue"
import ClassList from "./components/ClassList.vue"
import ScheduleCalendar from "./components/ScheduleCalendar.vue"
import StatisticsPanel from "./components/StatisticsPanel.vue"
import AthleticManagement from "./components/AthleticManagement"
import AthleticInfoDialog from "./components/AthleticInfo"
import MonthStatisticDialog from "./components/MonthStatistic"
import AddClassModal from "./components/AddClass/index.vue"
import SportTypeModal from "./components/SportTypeModal"
import AddClassTitle from "./components/AddClassTitle"
import AddGroup from "./components/AddGroup"
import MoveGroup from "./components/MoveGroup"
import BindModal from "./components/BindModal"
import SportDetailModal from "./components/SportDetailModal"
import ClassDetailModal from "./components/ClassDetailModal"
import CopyClassFromOfficial from "./components/CopyClassFromOfficial"
import ViewClassCard from "./components/ViewClassCard"
import ShareClassModal from "./components/ShareClass/index.vue"
import EditScheduleClass from "./components/EditScheduleClass"
import HealthView from "./components/HealthView.vue"
import AddEvent from "./components/addEvent.vue"
import InputActivity from "./components/InputActivity.vue"
import PlanView from "../plan/planView.vue"
import EventInfo from "./components/EventInfo.vue"
import WeekRangePicker from "@/components/WeekRangePicker/index.vue"
import AddShareGroup from "./components/AddShareGroup/index.vue"
import MoveShareGroup from "./components/MoveShareGroup/index.vue"
import cludList from "./components/cludList/index.vue"
import ShareAuthEdit from "./components/ShareClassPersion/index.vue"
import shareHistory from "./components/ShareHistory/index.vue"

// 服务和工具导入
import {
  teamApi,
  classApi,
  scheduleApi,
  statisticsApi,
  athleteApi,
  groupApi,
  competitionApi,
} from "./services/classManagement"
import { ACTIVITY_TYPE_DICT, DEVICE_TYPE_DICT } from "./constants"
import {
  parseClassesJson,
  isSportTypeMatch,
  generateSortData,
  getCompletionStatus,
  getSportTypeName,
  getDeviceBrandIcon,
} from "./utils/helpers"
import { getLunarDate, secondsToHHMMSS } from "@/utils/index"
import { statisticKeyToTitle, unitConversion } from "./statisticKeyToTitle"
import { CalculateRun, CalculateBike } from "./uilt"
import dragMixin from "./mixins/dragMixin"
import { getData } from "@/api/common"
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
    PlanView,
    EventInfo,
    WeekRangePicker,
    ShareClassModal,
    AddShareGroup,
    MoveShareGroup,
    cludList,
    ShareAuthEdit,
    shareHistory
  },
  mixins: [dragMixin],
  data() {
    return {
      loading: false,
      activeName: "class",
      activeClassType: "my",
      loginType: localStorage.getItem("loginType") || "2",

      // 团队和运动员数据（下拉：团队 + 俱乐部）
      teamOrClubList: [],
      teamList: [],
      teamTreeList: [],
      selectedOrgType: "team", // 'team' | 'club'
      athleticList: [],
      selectedTeam: null,
      selectedAthletic: null,
      athleticCascaderProps: {
        emitPath: false,
        value: "value",
        label: "label",
        children: "children",
      },
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
      teamClassSearchKeyword: "",
      // 课程数量限制 -- 后续根据待用功能添加
      // currentUserClassConfig: {},

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
      scheduleType: "add",
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
      activityDetailData: {},
      addScheduleDate: "",
      copyClassFromOfficialClassId: "",
      copyClassFromOfficialGroupId: "",
      copyClassFromOfficialData: {},
      addGroupId: "",
      isClass: true,
      isSchedule: false,
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
      showEventInfo: false,

      // 录入运动
      showInputActivity: false,
      inputActivityDate: "",

      isPlan: false,

      defaultTeamId: null,
      showShareClassModal: false,
      shareClassId: "",
      addShareGroupVisible: false,
      currentShareGroup: {},
      moveShareGroupVisible: false,
      currentMoveShareGroup: {},

      currentShareTeamId: "",
      shareGroupList: [],
      shareAuthEditVisible: false,
      currentShareAuthEdit: {},
      shareHistoryData: {},
      showShareHistory: false,
    }
  },
  computed: {
    athleticGroupOptions() {
      const list = Array.isArray(this.athleticList) ? this.athleticList : []
      console.log(list, "list")
      const groups = new Map()

      list.forEach((m) => {
        const groupName = (m && m.groupName) || "未分类"
        if (!groups.has(groupName)) groups.set(groupName, [])
        groups.get(groupName).push(m)
      })

      const toLabel = (m) => (m && (m.userNickname || m.name)) || ""

      return Array.from(groups.entries()).map(([groupName, members]) => ({
        value: groupName,
        label: groupName,
        children: members
          .filter((m) => m && m.triUserId)
          .map((m) => ({
            value: m.triUserId,
            label: toLabel(m),
            raw: m,
          })),
      }))
    },
    athleticDropdownItems() {
      const items = []
      this.athleticGroupOptions.forEach((group) => {
        items.push({
          type: "group",
          key: `group-${group.value}`,
          label: group.label,
        })
        group.children.forEach((member) => {
          items.push({
            type: "member",
            key: `member-${member.value}`,
            value: member.value,
            label: member.label,
            raw: member.raw,
          })
        })
      })
      return items
    },
    getSelectedAthleticName() {
      if (!this.selectedAthletic) return ""
      const athletic = this.athleticList.find(
        (item) => item.triUserId === this.selectedAthletic
      )
      return athletic ? (athletic.userNickname || athletic.name) : ""
    },
    getSelectedAthleticAvatar() {
      if (!this.selectedAthletic) return null
      const athletic = this.athleticList.find(
        (item) => item.triUserId === this.selectedAthletic
      )
      if (athletic && athletic.userAvatar && athletic.userAvatar.includes('wxfile')) {
        console.log('=====获取运动员头像', athletic.userAvatar)
        return 'https://web-home.tos-cn-beijing.volces.com/avatar.png'
      }
      return athletic && athletic.userAvatar ? athletic.userAvatar : 'https://web-home.tos-cn-beijing.volces.com/avatar.png'
    },
  },
  watch: {
    // 监听路由变化，同步菜单状态；
    // 只有从 /plan/add 跳转到本页，且 URL 带 teamId 时，才用路由参数更新 selectedTeam
    $route: {
      handler(to, from) {
        // this.initMenuFromRoute();
        console.log(to, "to")
        console.log(from, "from")
        const fromPath = this.$store && this.$store.state && this.$store.state.fromPath
        const shouldUseRouteTeamId = fromPath === "/plan/add"
        const routeTeamId = shouldUseRouteTeamId && to && to.query && to.query.teamId
        if (!routeTeamId || this.teamOrClubList.length === 0) return
        const found = this.teamOrClubList.find(
          (item) => String(item.id) === String(routeTeamId)
        )
        if (!found) return
        this.selectedTeam = found.id
        this.selectedOrgType = found.type || "team"
        this.getAthleticList()
        this.getScheduleData()
      },
      immediate: false,
    },
  },
  mounted() {
    // 根据路由初始化菜单状态
    this.activeName = localStorage.getItem("activeName") || "class"
    console.log(this.activeName, "this.activeName")
    // this.initMenuFromRoute();
    if (localStorage.getItem("loginType") !== "1") {
      this.getAllTeamsAndClubs()
      this.getDefaultTeam()
    } else {
      this.selectedAthletic = localStorage.getItem("triUserId")
      this.getScheduleData()
      this.getAthleticThreshold(this.selectedAthletic)
      this.getAuthorizedDeviceList()
    }
    this.getClassList()
    console.log(this.$store.state.fromPath, "this.$store.state.fromPath")
    if (this.$store.state.fromPath === "/plan/add") {
      this.isPlan = true
    }
    // 监听身份切换事件
    this.$root.$on("identity-changed", this.handleIdentityChanged)
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off("identity-changed", this.handleIdentityChanged)
  },
  methods: {
    handleCloseResetViewClassCard() {
      this.showViewClassCard = false
      this.getClassList()
    },
    getDeviceBrandIcon,
    getDeviceName(deviceType) {
      return DEVICE_TYPE_DICT[deviceType] || "未知设备"
    },
    // 选择分享团队（从已加载的 teamTreeList 取 groups，不再请求接口）
    handleShareTeamClick(teamId) {
      const isSameTeam = String(this.currentShareTeamId) === String(teamId)
      if (isSameTeam) {
        this.currentShareTeamId = ''
        this.shareGroupList = []
        return
      }
      this.currentShareTeamId = teamId
      const team = this.teamTreeList.find((t) => String(t.id) === String(teamId))
      if (team && Array.isArray(team.groups)) {
        this.shareGroupList = this.mapCoachTeamsGroupsToShareGroupList(
          team.groups,
          teamId
        )
      } else {
        this.shareGroupList = []
      }
    },
    handleShareTeamGroupClick(id) {
      if (!id && id !== 0) return
      // 分组与课程数据已由 getAllTeamsTreeList 接口全部返回，无需再请求
    },
    /**
     * 删除该日期所有课表
     */
    handleDeleteAllSchedules(date) {
      console.log("handleDeleteAllSchedules-1", date)
      scheduleApi.deleteAllSchedules({
        day: date,
        triUserId: this.selectedAthletic,
      }).then((res) => {
        if (res.success) {
          this.$message.success("课表删除成功")
          this.getScheduleData()
        }
      })
        .catch((err) => {
          console.log(err, "err")
          this.$message.error("课表删除失败")
        })
    },
    /**
     * 处理身份切换事件
     */
    handleIdentityChanged(loginType) {
      console.log("监听到身份切换事件")
      // 在这里添加你需要处理的逻辑
      // 例如：重新加载数据、重置状态等
      this.activeName = "class"
      localStorage.setItem("activeName", "class")
      console.log(this.activeName, "this.activeName")
      // this.initMenuFromRoute();
      if (localStorage.getItem("loginType") !== "1") {
        this.getAllTeamsAndClubs()
      } else {
        this.selectedAthletic = localStorage.getItem("triUserId")
        this.getScheduleData()
        this.getAthleticThreshold(this.selectedAthletic)
        this.getAuthorizedDeviceList()
      }
      this.getClassList()
      console.log(this.$store.state.fromPath, "this.$store.state.fromPath")
      if (this.$store.state.fromPath === "/plan/add") {
        this.isPlan = true
      }
    },
    handleChoosePlan(isPlan) {
      console.log("handleChoosePlan")
      this.isPlan = isPlan
    },
    handleResetClassDetail() {
      this.scheduleType = "add"
      this.showClassDetailModal = false
      // 等待弹窗完全关闭后再重置数据，确保子组件能正确响应
      this.$nextTick(() => {
        // 彻底清空对象的所有属性
        const keys = Object.keys(this.classDetailData)
        keys.forEach((key) => {
          this.$delete(this.classDetailData, key)
        })
        // 确保设置为全新的空对象
        this.$set(this, "classDetailData", {})
        this.getScheduleData()
      })
    },
    handleSaveClassDetail(data) {
      if (!data.classesTitle || data.classesTitle === "") {
        this.$message.error("课表标题不能为空")
        return
      }
      if (this.scheduleType === "add" && !data.id) {
        scheduleApi
          .createSchedule({
            classesTitle: data.classesTitle,
            classesGroupId: data.classesGroupId,
            labels: data.labels,
            classesDate: this.addScheduleDate + " 00:00:00",
            sportType: data.sportType,
            classesJson: data.classesJson,
            triUserId: this.selectedAthletic,
          })
          .then((res) => {
            console.log("******创建课表", res)
            if (res.success) {
              this.classDetailData = res.result
              this.scheduleType = "edit"
              this.getScheduleData()
              this.$message.success("课表保存成功")
            }
          })
        return
      }
      this.getScheduleData()
    },
    async handleCutClass(classesDate, classItem) {
      console.log(classesDate, "classesDate")
      console.log(classItem, "classItem")
      await this.handlePasteClass(classesDate, classItem)
      this.handleDeleteClassSchedule(classItem, true)
    },
    /**
     * 粘贴赛事
     */
    async handlePasteEvent(date, eventItem) {
      console.log(date, eventItem, "handlePasteEvent date, eventItem")
      if (!eventItem) {
        this.$message.error("赛事数据无效")
        return
      }
      // 参照 addEvent.vue 的参数构建方式
      // 处理 priority：转换为数字格式
      let priority = eventItem.priority
      if (typeof priority === "string") {
        priority =
          priority === "PRIMARY" ? 1 : priority === "SECONDARY" ? 2 : 3
      } else if (typeof priority !== "number") {
        priority = 1 // 默认值
      }

      // 处理 competitionDistanceValue：确保是正确的数值
      let competitionDistanceValue = eventItem.competitionDistanceValue
      if (typeof competitionDistanceValue === "string") {
        competitionDistanceValue = parseFloat(competitionDistanceValue) || ""
      }
      // 如果单位是 km，需要转换为米（但这里应该保持原值，因为 API 可能已经处理）
      // 根据 addEvent.vue，如果单位是 km，customDistance * 1000，但这里 eventItem 应该已经是正确的值

      // 构建提交数据（按照 addEvent.vue 的格式）
      const submitData = {
        competitionDistance: eventItem.competitionDistance, // displayValue
        competitionLocation: eventItem.competitionLocation, // 字符串格式（如：湖北/武汉）
        competitionName: eventItem.competitionName,
        competitionType: eventItem.competitionType, // displayValue
        competitionDistanceValue: competitionDistanceValue,
        competitionDistanceUnit: eventItem.competitionDistanceUnit || "km",
        priority: priority,
        competitionTime: date, // 使用 competitionTime 设置新日期
      }

      try {
        await competitionApi.createCompetition(
          submitData,
          this.selectedAthletic
        )
        this.$message.success("赛事粘贴成功")
        this.getScheduleData()
      } catch (err) {
        const message = err?.message || err || "赛事粘贴失败"
        this.$message.error(message)
      }
    },
    /**
     * 剪切赛事（粘贴后删除原位置）
     */
    async handleCutEvent(date, eventItem, cutEventInfo) {
      console.log(date, eventItem, cutEventInfo, "handleCutEvent")
      // 先粘贴
      await this.handlePasteEvent(date, eventItem)
      // 然后删除原位置的赛事
      if (cutEventInfo && cutEventInfo.eventItem && cutEventInfo.eventItem.id) {
        try {
          await competitionApi.deleteCompetition(cutEventInfo.eventItem.id)
          this.$message.success("赛事剪切成功")
          this.getScheduleData()
        } catch (err) {
          const message = err?.message || err || "删除原赛事失败"
          this.$message.error(message)
        }
      }
    },
    handleInputActivitySave(data) {
      console.log(data, "data")
      data.triUserId = this.selectedAthletic
      scheduleApi.createActivity(data).then((res) => {
        if (res.success) {
          this.$message.success("运动录入成功")
          this.showInputActivity = false
          this.getScheduleData()
        }
      })
    },
    /**
     * 添加赛事
     */
    handleAddEvent(eventData = {}) {
      this.currentEventData = eventData // 如果有数据则是编辑模式，否则是添加模式
      this.showAddEvent = true
      this.isEditMode = false
    },
    handleInputActivity(date) {
      if (!this.selectedAthletic) {
        return this.$message.error(
          "当前为教练模式，请先选择运动员，或切换运动员身份，方可为当前日程视图添加课表/录入运动/添加赛事"
        )
      }
      console.log(date, "date")
      this.inputActivityDate = date
      this.showInputActivity = true
    },
    /**
     * 赛事确认
     */
    handleEventConfirm(data) {
      console.log("赛事数据:", data)
      if (!this.isEditMode) {
        data.competitionTime = this.addScheduleDate

        competitionApi
          .createCompetition(data, this.selectedAthletic)
          .then(() => {
            this.$message.success("赛事保存成功")
            this.showAddEvent = false
            this.getScheduleData()
          })
          .catch((err) => {
            const message = err?.message || err || "赛事保存失败"
            this.$message.error(message)
          })
      } else {
        console.log(data, "data")
        console.log(this.selectedAthletic, "this.selectedAthletic")
        competitionApi
          .updateCompetition(data, this.selectedAthletic)
          .then((res) => {
            if (res.success) {
              this.$message.success("赛事保存成功")
              this.showAddEvent = false
              this.getScheduleData()
            }
          })
      }
      // 这里可以添加保存成功后的处理逻辑，比如刷新列表等
      // 如果需要刷新日程数据，可以调用 this.getScheduleData();
    },
    handleEventDetail(eventItem) {
      console.log(eventItem, "eventItem")
      this.$confirm("确认删除该赛事？", "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        competitionApi.deleteCompetition(eventItem.id).then((res) => {
          if (res.success) {
            this.$message.success("赛事删除成功")
            this.showEventInfo = false
            this.getScheduleData()
          }
        })
      })
    },
    handleEditEvent(eventItem, type) {
      console.log(eventItem, "eventItem")

      // 获取今天的日期（只比较日期部分，不考虑时间）
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 解析 eventItem.competitionDate（可能是 "YYYY-MM-DD" 格式或 Date 对象）
      let eventDate
      if (typeof eventItem.competitionDate === "string") {
        console.log(eventItem.competitionDate, "eventItem.competitionDate")
        eventDate = new Date(eventItem.competitionDate)
      } else if (eventItem.competitionDate instanceof Date) {
        eventDate = new Date(eventItem.competitionDate)
      } else {
        this.$message.error("赛事日期格式无效")
        return
      }

      eventDate.setHours(0, 0, 0, 0)

      // 计算天数差
      const diffTime = eventDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      // 校验日期必须大于今天
      if (diffDays >= 0) {
        if (type === "click" && diffDays === 0) {
          this.currentEventData = eventItem
          this.showEventInfo = true
          return
        }
        this.currentEventData = eventItem
        this.showAddEvent = true
        this.isEditMode = true
      } else {
        this.currentEventData = eventItem
        this.showEventInfo = true
      }
    },
    /**
     * 赛事取消
     */
    handleEventCancel() {
      this.currentEventData = {}
      this.showAddEvent = false
    },
    handleAddSchedule(date) {
      if (!this.selectedAthletic) {
        return this.$message.error(
          "当前为教练模式，请先选择运动员，或切换运动员身份，方可为当前日程视图添加课表/录入运动/添加赛事"
        )
      }
      this.classModalDataType = "addSchedule"
      this.addScheduleDate = date
      this.showSportTypeModal = true
      this.classModalData = { title: "" }
      this.isClass = false
      this.isSchedule = true
      console.log(date, "date")
    },
    async handlePasteClass(date, classItem) {
      console.log(date, classItem, "date, classItem")
      await this.getAthleticThreshold(this.selectedAthletic, date)
      const newData = JSON.parse(JSON.stringify(classItem))
      newData.classesJson = parseClassesJson(newData.classesJson)
      newData.classesDate = date + " 00:00:00"
      // 根据运动类型计算阈值
      if (newData.sportType === "RUN") {
        newData.classesJson = new CalculateRun(
          this.athleticThreshold,
          newData.classesJson
        ).updateClassInfoCalculatedValues()
      } else if (newData.sportType === "CYCLE") {
        newData.classesJson = new CalculateBike(
          this.athleticThreshold,
          newData.classesJson
        ).updateClassInfoCalculatedValues()
      }
      console.log(newData, "newData")
      // 计算时间距离STH
      if (["RUN", "CYCLE"].includes(newData.sportType)) {
        const res = await scheduleApi.calculateTimeDistanceSth({
          ...newData,
          classesJson: JSON.stringify(newData.classesJson),
          triUserId: this.selectedAthletic,
          classesDate: date + " 00:00:00",
        })

        if (newData.sportType === "RUN") {
          newData.classesJson = {
            ...newData.classesJson,
            duration: secondsToHHMMSS((res.result && res.result.time) || 0),
            distance: ((res.result && res.result.distance) || 0) + "km",
            sth: (res.result && res.result.sth) || null,
          }
        } else if (newData.sportType === "CYCLE") {
          newData.classesJson = {
            ...newData.classesJson,
            duration: newData.classesJson.duration,
            distance: newData.classesJson.distance,
            sth: (res.result && res.result.sth) || null,
          }
        }
      }
      newData.classesJson = JSON.stringify(newData.classesJson)
      const res = await scheduleApi.createSchedule({
        ...newData,
        triUserId: this.selectedAthletic,
      })
      if (res.success) {
        this.classModalData = res.result
        this.getScheduleData()
        this.getClassList()
      }
    },
    handleEditClassSchedule(classItem) {
      console.log(classItem, "classItem")
      this.showEditScheduleClass = true
      this.classDetailData = classItem
      this.isActivity = false
    },
    handleEditActivity(activity) {
      console.log(activity, "activity")
      this.showEditScheduleClass = true
      this.activityDetailData = activity
      this.isActivity = true
    },
    /**
     * 获取团队/俱乐部名称（下拉展示：团队：xxx / 俱乐部：xxx）
     */
    getTeamName(teamId) {
      const item = this.teamOrClubList.find(
        (t) => t.id === teamId && t.type === this.selectedOrgType
      )
      return item ? item.displayName : ""
    },

    /**
     * 根据路由初始化菜单状态
     */
    // initMenuFromRoute() {
    //   const path = this.$route.path;
    //   if (path.includes("athletic")) {
    //     this.activeName = "athletic";
    //   } else if (path.includes("class") || path.includes("timeTable")) {
    //     this.activeName = "class";
    //   }
    // },
    /**
     * 类型切换（运动员/课程）
     */
    handleTypeChange(type) {
      this.activeName = type
      this.getClassList()
      this.isPlan = false
    },

    /**
     * 课程类型切换（我的/官方）
     */
    handleClassTypeChange(type) {
      console.log(type, "=======******type")
      this.activeClassType = type
      this.getClassList()
      if (type === "team") {
        const loginType = localStorage.getItem("loginType")
        console.log(loginType, "=======******loginType")
        if (loginType === "2") {
          this.getAllTeamsTreeList(this.teamClassSearchKeyword)
        } else {
          console.log("运动员登陆时")
          this.getMyTeamsTreeList()
        }
        this.refreshTeamTree()
      }
    },

    async getMyTeamsTreeList() {
      const res = await getData({ url: "/consumer/api/team/query/athlete-team?triUserId=" + localStorage.getItem("triUserId") })
      if (res.success && res.result) {
        this.teamTreeList = [res.result]
      } else {
        this.teamTreeList = []
      }
    },

    async getAllTeamsTreeList(nameKeyword) {
      const params = {
        url: "/gateway/training/teamShare/coach-teams-share",
        shareDataType: 1,
        teamId: this.selectedTeam,
      }
      if (nameKeyword != null && String(nameKeyword).trim() !== "") {
        params.nameKeyword = String(nameKeyword).trim()
      }
      const res = await getData(params)
      if (res && res.success && Array.isArray(res.result)) {
        this.teamTreeList = res.result.map((t) => ({
          id: t.teamId,
          name: t.teamName,
          totalCount: t.totalCount,
          groups: t.groups || [],
        }))
        if (this.currentShareTeamId) {
          const team = res.result.find(
            (t) => String(t.teamId) === String(this.currentShareTeamId)
          )
          this.shareGroupList = team
            ? this.mapCoachTeamsGroupsToShareGroupList(
              team.groups || [],
              this.currentShareTeamId
            )
            : []
        }
        console.log("=======******this.teamTreeList", this.teamTreeList)
      } else {
        this.teamTreeList = []
      }
    },
    mapCoachTeamsGroupsToShareGroupList(groups, teamId) {
      const list = Array.isArray(groups) ? groups : []
      return list.map((g) => ({
        id: g.groupId,
        groupId: g.groupId,
        groupName: g.groupName || "未分组",
        groupCount: (g.classesList || []).length,
        teamId: teamId || g.teamId,
        classesList: (g.classesList || []).map((c) => {
          const parsed = parseClassesJson(c.classesJson)
          return {
            ...c,
            classesJson: {
              ...(typeof parsed === "object" && parsed ? parsed : {}),
              title: (typeof parsed === "object" && parsed && parsed.title) || c.classesTitle || "",
            },
          }
        }),
      }))
    },

    /**
     * 课程搜索（我的课程用 classSearchInput + getClassList；团队课程用 nameKeyword + getAllTeamsTreeList）
     */
    handleClassSearch(keyword) {
      this.classSearchInput = keyword
      if (this.activeClassType === "team") {
        this.teamClassSearchKeyword = keyword
        this.getAllTeamsTreeList(keyword)
      } else {
        this.getClassList()
      }
    },
    async getDefaultTeam() {
      const _this = this
      const res = await getData({
        url: "/gateway/team/my-team",
      })
      if (res.success) {
        _this.defaultTeamId = res.result.id
      }
      console.log(_this.defaultTeamId, "defaultTeamId")
    },

    /**
     * 获取团队和运动员数据
     */
    async getAllTeamsAndClubs() {
      const _this = this
      const res = await teamApi.getAllTeamsAndClubs()
      if (!res || !res.success) {
        this.teamOrClubList = []
        this.teamList = []
        return
      }
      const data = res.result || res
      const teams = (data.allCoachTeamList || []).map((item) => ({
        id: item.id,
        name: item.teamName,
        teamOwnerId: item.teamOwnerId,
        members:
          item.members && item.members.length > 0
            ? item.members.map((member) => ({
              id: member.id,
              triUserId: member.triUserId,
              userNickname: member.userNickname,
              name: member.userNickname,
              groupId: member.groupId,
              groupName: member.groupName || "未分类",
              userType: member.userType,
              lastMatchType: member.lastMatchType,
              userAvatar: member.userAvatar,
            }))
            : [],
      }))
      console.log(teams, "teams")
      const clubs = (data.allCoachClubList || []).map((item) => ({
        id: item.id,
        name: item.name,
        type: "club",
        displayName: "俱乐部：" + (item.name || ""),
      }))
      const teamItems = teams.map((t) => ({
        id: t.id,
        name: t.name,
        type: "team",
        displayName: "团队：" + (t.name || ""),
      }))
      _this.teamList = teams
      _this.teamOrClubList = [...teamItems, ...clubs]
      // 默认选中：
      // - 只有从 /plan/add 跳转过来且 URL 带 teamId 时，才用路由参数
      // - 其他情况（直接进入 /timeTable/class、刷新、从其他页面来），都忽略 teamId，用当前用户团队或第一项
      if (_this.teamOrClubList.length > 0) {
        const fromPath = _this.$store.state.fromPath
        console.log(fromPath, "fromPath")
        const shouldUseRouteTeamId = fromPath === "/plan/add"
        console.log(shouldUseRouteTeamId, "shouldUseRouteTeamId")
        const routeTeamId = shouldUseRouteTeamId && _this.$route.query.teamId
        console.log(_this.$route.query.teamId, "_this.$route.query.teamId")
        console.log(routeTeamId, "routeTeamId")
        const foundByRoute =
          routeTeamId &&
          _this.teamOrClubList.find(
            (item) => String(item.id) === String(routeTeamId)
          )
        console.log(foundByRoute, "foundByRoute")
        if (foundByRoute) {
          _this.selectedTeam = foundByRoute.id
          _this.selectedOrgType = foundByRoute.type || "team"
        } else {
          const triUserId = localStorage.getItem("triUserId")
          const ownerTeam = _this.teamList.find(
            (item) => item.teamOwnerId === triUserId
          )
          if (ownerTeam) {
            _this.selectedTeam = ownerTeam.id
            _this.selectedOrgType = "team"
          } else {
            _this.selectedTeam = _this.teamOrClubList[0].id
            _this.selectedOrgType = _this.teamOrClubList[0].type
          }
        }
        _this.getAthleticList()
        _this.getScheduleData()
      }
    },

    /**
     * 团队/俱乐部切换
     */
    handleTeamChange(payload) {
      const id = payload && typeof payload === "object" ? payload.id : payload
      const type =
        payload && typeof payload === "object" ? payload.type : "team"
      this.selectedTeam = id
      this.selectedOrgType = type
      console.log(this.selectedTeam, this.selectedOrgType, "this.selectedTeam, this.selectedOrgType")
      this.currentWeek.forEach(item => {
        item.activityList = []
        item.classSchedule = []
        item.competitionList = []
        item.healthInfos = []
      })
      // this.currentWeek = []
      this.getAthleticList()
      this.getAllTeamsTreeList(this.teamClassSearchKeyword)
    },

    /**
     * 运动员切换
     */
    handleAthleticChange(athleticId) {
      this.selectedAthletic = athleticId
      this.athleticInfoData = this.athleticList.find(
        (item) => item.triUserId === athleticId
      )
      this.getScheduleData()
      this.getAthleticThreshold(athleticId)
      this.getAuthorizedDeviceList()
    },

    /**
     * 获取运动员列表（团队用 teamList.members，俱乐部用 /consumer/api/club/member/list）
     */
    getAthleticList() {
      console.log(this.selectedTeam, "this.selectedTeam")
      if (!this.selectedTeam) {
        this.athleticList = []
        this.selectedAthletic = null
        return
      }
      if (this.selectedOrgType === "team") {
        const team = this.teamList.find((item) => item.id === this.selectedTeam)
        console.log(team, "team")
        this.athleticList = team && team.members ? team.members : []
        console.log(this.athleticList, "this.athleticList")
      } else {
        // 俱乐部：参考 ApplyCoach 的 getClubMemberList
        this.fetchClubMemberList(this.selectedTeam)
        return
      }
      this.applyFirstAthleticAndSchedule()
    },

    /**
     * 俱乐部成员列表（与 ApplyCoach getClubMemberList 一致）
     */
    fetchClubMemberList(clubId) {
      if (!clubId) {
        this.athleticList = []
        this.applyFirstAthleticAndSchedule()
        return
      }
      getData({
        url: `/consumer/api/club/query/groups-with-members/${clubId}`,
        clubId,
      })
        .then((res) => {
          const list =
            res && res.success && Array.isArray(res.result) ? res.result : []
          // 接口返回的是「分组 + 该分组下成员」的結構，需要扁平化成運動員列表
          const athletes = []
          list.forEach((group) => {
            if (!group || !Array.isArray(group.members)) return
            const groupName = group.groupName || "未分类"
            const groupId = group.groupId
            group.members.forEach((m) => {
              if (!m || !m.triUserId || !m.userNickname) return
              athletes.push({
                triUserId: m.triUserId,
                userNickname: m.userNickname,
                name: m.userNickname,
                userAvatar: m.userAvatar,
                groupId,
                groupName,
              })
            })
          })
          this.athleticList = athletes
          this.applyFirstAthleticAndSchedule()
        })
        .catch(() => {
          this.athleticList = []
          this.applyFirstAthleticAndSchedule()
        })
    },

    /**
     * 默认选中第一个运动员并拉取课表等
     */
    applyFirstAthleticAndSchedule() {
      const firstTriUserId =
        this.athleticGroupOptions?.[0]?.children?.[0]?.value ||
        (this.athleticList.length > 0 ? this.athleticList[0].triUserId : null)
      if (firstTriUserId) {
        this.selectedAthletic = firstTriUserId
        this.athleticInfoData =
          this.athleticList.find((i) => i.triUserId === firstTriUserId) ||
          this.athleticList[0]
        this.getClassList()
        this.getAthleticThreshold(this.selectedAthletic)
        this.getAuthorizedDeviceList()
        this.getScheduleData()
      }
    },

    /**
     * 获取课程列表
     */
    async getClassList() {
      const apiMethod =
        this.activeClassType === "official"
          ? classApi.getOfficialClasses
          : classApi.getClassesByUserId

      console.log(apiMethod, "this.classSearchInput")
      const res = await apiMethod(this.classSearchInput)
      if (res.success) {
        this.classList = res.result.map((item) => ({
          timespan: new Date().getTime(),
          ...item,
          classesCount: item.classesList.length,
          classesList: item.classesList.map((part) => ({
            ...part,
            classesJson: parseClassesJson(part.classesJson),
          })),
        }))
        this.$nextTick(() => {
          this.classSlideChange()
        })
      } else {
        this.classList = []
      }
    },

    /**
     * 获取日程数据
     */
    async getScheduleData() {
      console.log(this.currentWeek, "this.currentWeek")
      if (!this.selectedAthletic) {
        return
      }
      this.loading = true
      const res = await scheduleApi.getCalendarOverview({
        begin: this.currentWeek[0].commonDate + " 00:00:00",
        end: this.currentWeek[6].commonDate + " 23:59:59",
        triUserId: this.selectedAthletic,
      })
      if (res.success && res.result) {
        this.getStatisticData()
        // 创建新数组确保 Vue 响应式更新
        const newCurrentWeek = this.currentWeek.map((item) => {
          let activityList = []
          let classSchedule = []
          let healthInfos = []
          let competitionList = []
          let deviceActivityBindView = {
            cycle: [],
            run: [],
            swim: [],
            otherT1: [],
            otherT2: [],
            strength: [],
          }

          res.result.forEach((part) => {
            if (item.commonDate === part.dataDate) {
              // 处理运动记录
              activityList = (part.activityOverviewList || [])
                .map((i) => ({
                  ...i,
                  classesJson: i.classesJson
                    ? parseClassesJson(i.classesJson)
                    : null,
                  completion: i.classesJson
                    ? getCompletionStatus(i.percent)
                    : "",
                  distance: Math.round(i.distance / 10) / 100,
                  oldActivityDuration: i.duration,
                  oldActivityDistance: Math.round(i.distance),
                  preciseDistance: Math.round(i.distance),
                  oldActivitySthValue: i.sthValue,
                }))
                .filter(
                  (i) => !i.bindingManualActivityId && !i.bindCompetitionId
                )

              // 处理虚拟运动记录
              part.manualDeviceActivityVoList.forEach((i) => {
                if (!i.activityId && !i.bindCompetitionId) {
                  activityList.push({
                    ...i,
                    classesJson: i.classesJson
                      ? parseClassesJson(i.classesJson)
                      : null,
                    distance: Math.round(i.distance / 10) / 100,
                    preciseDistance: i.distance,
                  })
                  console.log(activityList, "activityList")
                } else {
                  activityList.forEach((item, index) => {
                    if (item.manualActivityId === i.manualActivityId) {
                      console.log(i)
                      activityList[index] = {
                        ...i,
                        activityName: item.activityName,
                        classesJson: i.classesJson
                          ? parseClassesJson(i.classesJson)
                          : null,
                        distance: Math.round(i.distance / 10) / 100,
                        preciseDistance: Math.round(i.distance),
                        oldActivityDuration: item.oldActivityDuration,
                        oldActivityDistance: Math.round(
                          item.oldActivityDistance
                        ),
                        oldActivitySthValue: item.oldActivitySthValue,
                      }
                      console.log(activityList[index], "activityList[index]")
                    }
                  })
                }
              })
              console.log(activityList, "activityList")
              // 处理课表
              classSchedule = (part.classScheduleVoList || [])
                .map((i) => ({
                  ...i,
                  classesJson: parseClassesJson(i.classesJson),
                }))
                .filter(
                  (i) => !i.bindingActivityId && !i.bindingManualActivityId
                )

              // 处理健康数据
              console.log(part.healthInfos, "part.healthInfos")
              healthInfos =
                part.healthInfos && part.healthInfos.length > 0
                  ? [part.healthInfos[0]]
                  : []

              part.competitionList.forEach((i) => {
                i.deviceActivityBindView.cycle.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.cycle.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.cycle.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                  }
                })
                i.deviceActivityBindView.run.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.run.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.run.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                  }
                  console.log(
                    deviceActivityBindView.run,
                    "============deviceActivityBindView.run"
                  )
                })
                i.deviceActivityBindView.swim.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.swim.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.swim.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                    console.log(item, "item==============")
                  }
                })
                i.deviceActivityBindView.otherT1.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.otherT1.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.otherT1.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                  }
                })
                i.deviceActivityBindView.otherT2.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.otherT2.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.otherT2.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                  }
                })
                i.deviceActivityBindView.strength.forEach((item) => {
                  if (!item.manualActivityId) {
                    deviceActivityBindView.strength.push({
                      ...item,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      completion: item.classesJson
                        ? getCompletionStatus(i.percent)
                        : "",
                      distance: Math.round(item.distance / 10) / 100,
                      oldActivityDuration: item.duration,
                      oldActivityDistance: Math.round(item.distance),
                      preciseDistance: Math.round(item.distance),
                      oldActivitySthValue: item.sthValue,
                    })
                  } else {
                    deviceActivityBindView.strength.push({
                      ...item,
                      activityName: item.activityName,
                      classesJson: item.classesJson
                        ? parseClassesJson(item.classesJson)
                        : null,
                      distance: Math.round(item.distance / 10) / 100,
                      preciseDistance: Math.round(item.distance),
                      oldActivityDuration: item.deviceActivity
                        ? item.deviceActivity.duration
                        : 0,
                      oldActivityDistance: item.deviceActivity
                        ? Math.round(item.deviceActivity.distance)
                        : 0,
                      oldActivitySthValue: item.deviceActivity
                        ? item.deviceActivity.sthValue
                        : 0,
                    })
                  }
                })
                i.deviceActivityBindView = deviceActivityBindView
                deviceActivityBindView = {
                  cycle: [],
                  run: [],
                  swim: [],
                  otherT1: [],
                  otherT2: [],
                  strength: [],
                }
              })
              competitionList = part.competitionList
              console.log(competitionList, "============competitionList")
            }
          })

          return {
            ...item,
            activityList,
            classSchedule,
            healthInfos,
            competitionList,
            timesp: new Date().getTime(),
          }
        })
        // 直接赋值新数组，确保 Vue 响应式更新
        // 对于根级别的 data 属性，直接赋值即可触发响应式更新
        this.currentWeek = [...newCurrentWeek]
        console.log(this.currentWeek, "this.currentWeek")
      }
      this.$nextTick(() => {
        // 确保视图更新 - 使用 $forceUpdate 强制重新渲染
        this.$forceUpdate()
        // 初始化拖拽
        this.initAllDrag()
        setTimeout(() => {
          this.loading = false
        }, 1000)
      })
    },

    /**
     * 获取统计数据
     */
    async getStatisticData() {
      if (!this.selectedAthletic) return

      const res = await statisticsApi.getWeekStatistics({
        begin: this.currentWeek[0].commonDate,
        end: this.currentWeek[6].commonDate,
        triUserId: this.selectedAthletic,
      })

      if (res.success) {
        this.statisticData = res.result.statisticsVoList.map((item) => {
          if (item.key === "totalSTH") {
            const actualValue =
              item.key === "totalSTH"
                ? Math.round(item.actualValue / 100) / 100
                : item.actualValue
            const planValue =
              item.key === "totalSTH"
                ? Math.round(item.planValue / 100) / 100
                : item.planValue
            return {
              ...item,
              actualValue:
                parseInt(item.actualValue) > 100000
                  ? unitConversion(
                    actualValue,
                    statisticKeyToTitle[item.key]?.unit
                  )
                  : item.actualValue,
              actualValueUnit: parseInt(item.actualValue) > 100000 ? "万" : "",
              title: statisticKeyToTitle[item.key]?.title,
              color: statisticKeyToTitle[item.key]?.color,
              icon: statisticKeyToTitle[item.key]?.icon,
              unit: statisticKeyToTitle[item.key]?.unit,
              planValue:
                parseInt(item.planValue) > 100000
                  ? unitConversion(
                    planValue,
                    statisticKeyToTitle[item.key]?.unit
                  )
                  : item.planValue,
              planValueUnit: parseInt(item.planValue) > 100000 ? "万" : "",
            }
          }
          if (item.key === "totalCalories") {
            return {
              ...item,
              actualValue:
                parseInt(item.actualValue) > 10000
                  ? unitConversion(
                    item.actualValue,
                    statisticKeyToTitle[item.key]?.unit || "kcal"
                  )
                  : item.actualValue,
              actualValueUnit: parseInt(item.actualValue) > 10000 ? "万" : "",
              title: statisticKeyToTitle[item.key]?.title,
              color: statisticKeyToTitle[item.key]?.color,
              icon: statisticKeyToTitle[item.key]?.icon,
              unit: statisticKeyToTitle[item.key]?.unit,
              planValue:
                parseInt(item.planValue) > 10000
                  ? unitConversion(
                    item.planValue,
                    statisticKeyToTitle[item.key]?.unit || "kcal"
                  )
                  : item.planValue,
              planValueUnit: parseInt(item.planValue) > 10000 ? "万" : "",
            }
          }
          return {
            ...item,
            actualValue: unitConversion(
              item.actualValue,
              statisticKeyToTitle[item.key]?.unit
            ),
            title: statisticKeyToTitle[item.key]?.title,
            color: statisticKeyToTitle[item.key]?.color,
            icon: statisticKeyToTitle[item.key]?.icon,
            unit: statisticKeyToTitle[item.key]?.unit,
          }
        })
        this.sthData = res.result.avgSthRespDto
      }
    },

    /**
     * 获取运动员阈值
     */
    async getAthleticThreshold(id, date) {
      const res = await athleteApi.getUserProfile(id, date)
      window.localStorage.setItem("avatarUrl", res.result.avatarUrl)
      res.result.thresholdRecordList.forEach((item) => {
        switch (item.thresholdType) {
          case 1:
            this.athleticThreshold.heartRate = item.threshold
            break
          case 2:
            this.athleticThreshold.cycle = item.threshold
            break
          case 3:
            this.athleticThreshold.run = item.threshold
            break
          case 4:
            this.athleticThreshold.swim = item.threshold
            break
        }
      })
    },

    /**
     * 获取授权设备列表
     */
    async getAuthorizedDeviceList() {
      const res = await athleteApi.getAuthorizedDevices(this.selectedAthletic)
      this.deviceList = (res.result || []).map((device) => ({
        ...device,
        enabled: device.syncFlag === 1,
        deviceType: device.deviceType || 0,
      }))
    },

    /**
     * 设备状态变更
     */
    async handleDeviceChange(item) {
      const syncFlag = item.enabled ? 1 : 0
      const res = await athleteApi.updateAuthorizedDevice({
        deviceId: item.id,
        syncFlag,
      })
      if (res.success) {
        this.$message.success("操作成功")
        this.getAuthorizedDeviceList()
      }
    },

    /**
     * 设备点击重试同步
     */
    handleDeviceClick(classItem, device) {
      const date = this.currentWeek.find((w) =>
        w.classSchedule.some((c) => c.id === classItem.id)
      )?.commonDate

      if (date && date < new Date().toISOString().split("T")[0]) {
        this.$message.error("该课表已过期")
        return
      }
      console.log(device, "device")

      // if (device.syncStatus === 1) {
      //   this.$message.info("该设备已同步成功");
      //   return;
      // }

      this.$confirm("确定同步课表至设备吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await scheduleApi.retrySync({
          classScheduleId: classItem.id,
          deviceType: device.deviceType,
        })
        if (res.success) {
          // this.$message.success(res.result);
          this.$message.success("同步成功")
          this.getScheduleData()
        } else {
          // this.$message.error(res.message);
          this.$message.error("同步失败")
        }
      })
    },

    /**
     * 周切换
     */
    onWeekChange(payload) {
      this.currentWeek = payload.currentWeek.list.map((item) => {
        const date = getLunarDate(item)
        return {
          commonDate: item,
          lunarDate: date.fullName,
          date: item,
          activityList: [],
          classSchedule: [],
        }
      })

      // 计算当前月份
      if (this.currentWeek.length > 0) {
        const firstDay = this.currentWeek[0].commonDate
        const date = new Date(firstDay)
        this.currentMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`
      }

      this.getScheduleData()
    },

    /**
     * 刷新数据
     */
    handleRefresh() {
      this.getScheduleData()
    },

    /**
     * 新增课程
     */
    handleAddClass(groupId) {
      // 课程数量限制 -- 后续根据待用功能添加
      // if (
      //   this.currentUserClassConfig.currentCount >=
      //   this.currentUserClassConfig.limitValue
      // ) {
      //   this.$message.error("超出课程数量上限");
      //   return;
      // }
      // if (!this.selectedAthletic) return this.$message.error("您未加入团队，不可给团队人员添加课程，请加入团队后操作！");
      this.classModalDataType = "add"
      this.isClass = true
      this.addGroupId = groupId
      this.showAddClassTitle = true
    },

    /**
     * 新增分组
     */
    handleAddGroup() {
      this.currentGroup = { id: "", classesGroupName: "" }
      this.showAddGroup = true
    },

    /**
     * 编辑分组
     */
    handleEditGroup(group) {
      this.currentGroup = {
        id: group.groupId,
        classesGroupName: group.groupName,
      }
      this.showAddGroup = true
    },

    /**
     * 删除分组
     */
    handleDeleteGroup(item) {
      this.$confirm(`确认删除分组【${item.groupName}】？`, "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调用删除分组API
        groupApi.deleteGroup(item.groupId).then((res) => {
          if (res.success) {
            this.$message.success("删除成功")
            this.getClassList()
          }
        })
      })
    },

    /**
     * 移动分组
     */
    handleMoveGroup(groupId) {
      this.moveGroupId = groupId
      this.moveType = "group"
      this.showMoveGroup = true
    },

    /**
     * 移动课程
     */
    handleMoveClass(classId, groupId) {
      this.moveClassId = classId
      this.moveGroupId = groupId
      this.moveType = "class"
      this.showMoveGroup = true
    },

    /**
     * 移动分享课程
     */
    handleMoveShareClass(classId, groupId) {
      this.moveClassId = classId
      this.moveGroupId = groupId
      this.moveType = "class"
      this.showMoveGroup = true
    },

    /**
     * 分享课程
     */
    handleShareClass(classId) {
      console.log(classId, "classId===分享课程id")
      this.shareClassId = classId
      this.showShareClassModal = true
    },

    /**
     * 删除课程
     */
    async handleDeleteClass(classItem) {
      this.$confirm(`确认删除课程【${classItem?.classesTitle}】？`, "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        const res = await classApi.deleteClass(classItem?.id)
        if (res.success) {
          this.$message.success("删除成功")
          this.getClassList()
        }
      })
    },
    // 删除分享课程 -- 缺少接口
    async handleDeleteShareClass(classItem) {

    },
    async handleUpdateClass(classData, flag) {
      console.log(classData, "classData")
      console.log(this.classModalData, "this.classModalData")
      console.log(flag, "flag")
      if (this.activeClassType === "team") {
        classData.id = this.classModalData.sourceClassId
        delete classData.classesGroupId
        delete classData.classesGroupName
      }
      classApi.updateClass(classData).then((res) => {
        if (res.success) {
          this.$message.success("更新成功")
          if (flag) this.showViewClassCard = false
          if (this.activeClassType === "team") {
            this.refreshShareGroupList()
          } else {
            this.getClassList()
          }
        }
      })
    },

    // 分享历史
    async handleShareClassHistroy(classData) {
      this.shareHistoryData = classData
      this.showShareHistory = true
    },

    /**
     * 查看课程
     */
    handleViewClass(classId) {
      this.showViewClassCard = true
      this.classModalData = this.findClassById(classId)
    },

    handleViewShareClase(item) {
      this.showViewClassCard = true
      const findClass = this.shareGroupList.find(el => el.id === item.classesGroupId)?.classesList.find(el => el.id === item.id)
      this.classModalData = findClass
    },

    /**
     * 课程详情
     */
    handleClassDetail(classId, sportType) {
      this.classModalData = this.findClassById(classId)
      // console.log(this.classDetailData, "classDetailData");
      // this.showClassDetailModal = true;
      this.classModalDataType = "edit"
      // this.showAddClassModal = true;
    },

    handleShareClassDetail(item) {
      const findClass = this.shareGroupList.find(el => el.id === item.classesGroupId)?.classesList.find(el => el.id === item.id)
      this.classModalData = findClass
      this.classModalDataType = "edit"
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
      // console.log(classItem, "classItem")
      this.classSportType = sportType
      this.classDetailData = classItem
      this.$nextTick(() => {
        this.showClassDetailModal = true
      })
    },

    /**
     * 删除课表
     */
    async handleDeleteClassSchedule(classItem, isCut = false) {
      if (!isCut) {
        this.$confirm(
          `确认删除课表【${classItem?.classesJson?.title}】？`,
          "提示",
          {
            confirmButtonText: "删除",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(async () => {
          const res = await scheduleApi.deleteSchedule({
            id: classItem?.id,
            triUserId: this.selectedAthletic,
          })
          if (res.success) {
            this.$message.success("删除成功")
            this.getScheduleData()
          }
        })
      } else {
        const res = await scheduleApi.deleteSchedule({
          id: classItem?.id,
          triUserId: this.selectedAthletic,
        })
        if (res.success) {
          this.$message.success("课表剪切成功")
          this.getScheduleData()
        }
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
      console.log(this.sportDetailData, "this.sportDetailData")
      this.activityDetailData = activity
      // this.showSportDetailModal = true;
      this.showEditScheduleClass = true
      this.isActivity = true
    },

    /**
     * 查看健康数据
     */
    handleViewHealthData(healthData) {
      console.log("healthData:", healthData)
      this.healthViewData = healthData
      this.healthViewDate =
        healthData.date || new Date().toISOString().split("T")[0]
      this.healthViewDeviceType = healthData.deviceType || null
      this.showHealthViewDialog = true
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
        const res = await scheduleApi.unbindActivity(classScheduleId)
        if (res.success) {
          this.$message.success("解除匹配成功")
          this.getScheduleData()
        }
      })
    },

    getSportTypeName(sportType) {
      return getSportTypeName(sportType)
    },

    /**
     * 删除运动
     */
    handleDeleteActivity(activity) {
      this.$confirm(
        `确认删除运动【${this.getSportTypeName(
          activity.sportType
        )}_手动录入】？`,
        "提示",
        {
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        const type = activity.activityId ? 1 : 2
        const activityId = activity.activityId
          ? activity.activityId
          : activity.manualActivityId
        console.log(activity, activityId, type, "activityId, type")
        const res = await scheduleApi.deleteActivity(activityId, type)
        if (res.success) {
          this.$message.success("删除成功")
          this.getScheduleData()
        }
      })
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
      this.copyClassFromOfficialClassId = classData.id
      this.copyClassFromOfficialGroupId = groupId
      this.copyClassFromOfficialData = classData
      this.showCopyClassFromOfficial = true
    },

    /**
     * 通过ID查找课程
     */
    findClassById(id) {
      let findClass = {}
      if (this.activeClassType === 'team') {
        console.log(this.shareGroupList, "this.shareGroupList")
        this.shareGroupList.forEach((item) => {
          console.log(item, "item")
          if (item.classesList) {
            item.classesList.forEach((part) => {
              console.log(part, "part")
              if (part.id === +id) {
                findClass = part
              }
            })
          }
        })
      } else {
        this.classList.forEach((item) => {
          item.classesList.forEach((part) => {
            if (part.id === +id) {
              findClass = part
            }
          })
        })
      }
      return findClass
    },

    /**
     * 课程拖拽到日历
     */
    handleClassDragToSchedule(e) {
      if (!this.selectedAthletic) {
        return this.$message.error(
          "当前为教练模式，请先选择运动员，或切换运动员身份，方可为当前日程视图添加课表/录入运动/添加赛事"
        )
      }
      const classItem = this.findClassById(e.item.dataset.id)
      const params = {
        classesId: classItem.id,
        classesJson: JSON.stringify(classItem.classesJson),
        classesDate: e.to.dataset.date,
        sportType: classItem.sportType,
      }
      // // 移除克隆的DOM元素，避免显示课程模板
      // if (e.item && e.item.parentNode) {
      //   e.item.parentNode.removeChild(e.item);
      // }
      this.$nextTick(() => {
        this.AddScheduleClass(params, "", e.newIndex)
      })
    },

    /**
     * 日历拖拽添加
     */
    handleScheduleDragAdd(e) {
      console.log(e, "======================")
      const classId = e.item.firstChild.dataset.id || e.item.dataset.id
      const date = e.to.dataset.date
      console.log(classId, date, "classId, date")
      if (!this.selectedAthletic) {
        return
      }

      let newClassSchedule = {}
      const sortVoList = []

      // 课程模板拖拽的单独处理
      if (e.item.dataset.type === "classTemplate") {
        this.handleClassDragToSchedule(e)
        return
      }

      // 计算在“仅课程卡片”中的实际索引，忽略健康数据、赛事、运动记录等非课程元素
      let targetClassIndex = 0
      const newIndex = typeof e.newIndex === "number" ? e.newIndex : 0
      const currentWeekData = []
      let topIndex = 0
      this.currentWeek.forEach((item) => {
        if (item.commonDate.includes(e.to.dataset.date)) {
          currentWeekData.push(...item.healthInfos)
          currentWeekData.push(...item.competitionList)
          topIndex = item.healthInfos.length + item.competitionList.length
          currentWeekData.push(...item.classSchedule)
          currentWeekData.push(...item.activityList)
        }
      })

      if (topIndex === 0) {
        targetClassIndex = newIndex
      } else {
        if (newIndex > topIndex) {
          targetClassIndex = newIndex - topIndex
        } else {
          targetClassIndex = 0
        }
      }

      // 移除拖拽产生的DOM元素，避免显示重复的课表
      // 注意：需要在数据操作前移除，避免 Vue 响应式更新导致 DOM 混乱
      // if (e.item && e.item.parentNode) {
      //   e.item.parentNode.removeChild(e.item);
      // }

      // 删除原数据
      this.currentWeek.forEach((item) => {
        if (item.commonDate.includes(e.item.firstChild.dataset.date)) {
          console.log(item.classSchedule, "item.classSchedule===============")
          item.classSchedule.forEach((itemClass, oldIndex) => {
            console.log(itemClass.id, classId, "itemClass.id, classId")
            if (itemClass.id === +classId) {
              newClassSchedule = itemClass
              item.classSchedule.splice(oldIndex, 1)
            }
          })
        }
      })

      // 插入新数据
      let currentData = []
      this.currentWeek.forEach((item) => {
        if (item.commonDate.includes(date)) {
          console.log(item.classSchedule, "item.classSchedule")
          currentData = JSON.parse(JSON.stringify(item.classSchedule))
          // 使用只包含课程的索引插入，避免健康数据和赛事影响排序
          currentData.splice(targetClassIndex, 0, newClassSchedule)
        }
      })
      console.log(currentData, "currentData===============")

      // 生成排序数据
      currentData.forEach((item, index) => {
        sortVoList.push({
          id: item.id,
          sort: index,
        })
      })
      scheduleApi
        .bindActivity({
          classScheduleId: classId,
          classesDate: date,
          triUserId: this.selectedAthletic,
          sortVoList,
        })
        .then((res) => {
          if (res.success) {
            this.$message.success("课表移动成功")
          }
        })
        .finally(() => {
          this.getScheduleData()
        })
    },

    /**
     * 运动和课表匹配
     */
    handleMatchClass(data) {
      const { classId, activityId, manualActivityId, type } = data
      let currentClass = {}
      let currentActivity = {}
      let activityDate = ""
      console.log(data, "data")

      this.currentWeek.forEach((item) => {
        item.activityList.forEach((activity) => {
          if (activity.activityId === activityId) {
            currentActivity = activity
            activityDate = item.commonDate
          } else if (activity.manualActivityId === manualActivityId) {
            currentActivity = activity
            activityDate = item.commonDate
          }
        })
        item.classSchedule.forEach((classItem) => {
          if (classItem.id === +classId) {
            currentClass = classItem
          }
        })
      })
      console.log(currentActivity, "currentActivity")
      console.log(currentClass, "currentClass")

      // 检查运动是否已经匹配过课表
      if (currentActivity.classScheduleId) {
        this.getScheduleData()
        this.$message.warning("该运动已经匹配过课表")
        return
      }

      // 判断是否从课程模板中拖拽
      if (type === "classTemplate") {
        currentClass = this.findClassById(classId)
        console.log(currentClass, "currentClass===================")
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
          )
        } else {
          console.log(
            currentClass.sportType,
            currentActivity.sportType,
            "currentClass.sportType, currentActivity.sportType"
          )
          this.$message.error("该运动类型与课程类型不匹配")
          this.getScheduleData()
        }
      } else {
        if (
          isSportTypeMatch(currentClass.sportType, currentActivity.sportType)
        ) {
          this.handleBind(currentClass, {
            ...currentActivity,
            dataDate: activityDate,
          })
        } else {
          console.log(
            currentClass.sportType,
            currentActivity.sportType,
            "currentClass.sportType, currentActivity.sportType"
          )
          this.$message.error("该运动类型与课程类型不匹配")
          this.getScheduleData()
        }
      }
    },

    /**
     * 运动和赛事匹配
     */
    handleMatchEvent({
      eventId,
      eventDate,
      activityId,
      manualActivityId,
      activityDate,
    }) {
      console.log(
        eventId,
        eventDate,
        activityId,
        manualActivityId,
        activityDate,
        "eventId, eventDate, activityId, manualActivityId, activityDate"
      )
      if (!eventId) {
        this.$message.error("赛事信息无效")
        return
      }
      if (!this.currentWeek || !Array.isArray(this.currentWeek)) {
        this.$message.error("周数据未初始化")
        this.getScheduleData()
        return
      }
      const eventData = this.currentWeek.find(
        (item) => item.commonDate === eventDate
      )
      console.log(eventData, "eventData")
      if (!eventData) {
        this.$message.error("未找到对应的日期数据")
        this.getScheduleData()
        return
      }
      if (eventDate && activityDate && eventDate !== activityDate) {
        // this.$message.warning("只能匹配同一天的赛事");
        this.getScheduleData()
        return
      }
      const bindingActivityId = manualActivityId || activityId
      if (!bindingActivityId) {
        this.$message.error("运动数据无效")
        this.getScheduleData()
        return
      }

      // 找到对应的赛事数据
      // 检查 competitionList 是否存在
      if (
        !eventData.competitionList ||
        !Array.isArray(eventData.competitionList)
      ) {
        this.$message.error("赛事列表数据无效")
        this.getScheduleData()
        return
      }

      console.log("eventId:", eventId, "type:", typeof eventId)
      console.log("competitionList:", eventData.competitionList)
      console.log(
        "competitionList ids:",
        eventData.competitionList.map((item) => ({
          id: item.id,
          type: typeof item.id,
        }))
      )

      // 使用类型转换，支持字符串和数字类型匹配
      const competition = eventData.competitionList.find(
        (item) => String(item.id) === String(eventId)
      )
      console.log(competition, "competition")
      if (!competition) {
        this.$message.error(
          `未找到对应的赛事数据，eventId: ${eventId}，可用ID: ${eventData.competitionList
            .map((item) => item.id)
            .join(", ")}`
        )
        this.getScheduleData()
        return
      }

      // 找到对应的运动数据
      const activity = eventData?.activityList?.find(
        (item) =>
          (activityId && item.activityId === activityId) ||
          (manualActivityId && item.manualActivityId === manualActivityId)
      )
      console.log(activity, "activity")
      if (!activity) {
        this.$message.error("未找到对应的运动数据")
        this.getScheduleData()
        return
      }

      // 获取比赛类型（可能是 displayValue 数字、value 字符串或 label 中文）
      const rawCompetitionType = competition.competitionType

      // 比赛类型映射表（参照 addEvent.vue 和 API 返回的数据结构）
      // displayValue: 数字, value: 英文值, label: 中文
      const COMPETITION_TYPE_MAP = {
        // 通过 displayValue（数字）映射
        2: { value: "TRIATHLON", label: "铁三" },
        1: { value: "RUNNING", label: "路跑" },
        4: { value: "CYCLE", label: "骑行" },
        5: { value: "SWIM", label: "游泳" },
        3: { value: "OTHER", label: "其他" },
        // 通过 value（英文）映射
        TRIATHLON: { value: "TRIATHLON", label: "铁三" },
        RUNNING: { value: "RUNNING", label: "路跑" },
        CYCLE: { value: "CYCLE", label: "骑行" },
        SWIM: { value: "SWIM", label: "游泳" },
        OTHER: { value: "OTHER", label: "其他" },
        // 通过 label（中文）映射
        铁三: { value: "TRIATHLON", label: "铁三" },
        路跑: { value: "RUNNING", label: "路跑" },
        骑行: { value: "CYCLE", label: "骑行" },
        游泳: { value: "SWIM", label: "游泳" },
        其他: { value: "OTHER", label: "其他" },
      }

      // 规范化比赛类型，统一转换为 value
      const normalizeCompetitionType = (type) => {
        if (type === null || type === undefined) return null
        // 先尝试直接匹配
        if (COMPETITION_TYPE_MAP[type]) {
          return COMPETITION_TYPE_MAP[type].value
        }
        // 尝试转换为字符串匹配
        const typeStr = String(type)
        if (COMPETITION_TYPE_MAP[typeStr]) {
          return COMPETITION_TYPE_MAP[typeStr].value
        }
        // 尝试转换为数字匹配（处理 displayValue）
        const typeNum = Number(type)
        if (!isNaN(typeNum) && COMPETITION_TYPE_MAP[typeNum]) {
          return COMPETITION_TYPE_MAP[typeNum].value
        }
        return null
      }

      const normalizedCompetitionType =
        normalizeCompetitionType(rawCompetitionType)
      if (!normalizedCompetitionType) {
        this.$message.warning(`未知的比赛类型: ${rawCompetitionType}`)
        this.getScheduleData()
        return
      }

      // 获取运动类型（可能是数字 1,2,3 或字符串 CYCLE, RUN, SWIM）
      let activitySportType = activity.sportType

      // 将数字类型转换为字符串类型
      const ACTIVITY_TYPE_DICT = {
        1: "CYCLE",
        2: "RUN",
        3: "SWIM",
        4: "STRENGTH",
        5: "OTHER",
      }
      if (typeof activitySportType === "number") {
        activitySportType =
          ACTIVITY_TYPE_DICT[activitySportType] || activitySportType
      }

      // 比赛类型到运动类型的映射（根据 value 匹配）
      const competitionTypeToSportTypes = {
        TRIATHLON: ["SWIM", "CYCLE", "RUN", "OTHER"], // 铁三可以关联游泳、骑行、跑步、其他
        RUNNING: ["RUN"], // 路跑只能匹配跑步
        CYCLE: ["CYCLE"], // 骑行只能匹配骑行
        SWIM: ["SWIM"], // 游泳只能匹配游泳
        OTHER: ["SWIM", "CYCLE", "RUN", "OTHER", "STRENGTH"], // 其他类型可以关联游泳、骑行、跑步、其他、力量
      }

      // 检查比赛类型和运动类型是否允许关联
      const allowedSportTypes =
        competitionTypeToSportTypes[normalizedCompetitionType]
      if (!allowedSportTypes || allowedSportTypes.length === 0) {
        const competitionInfo = Object.values(COMPETITION_TYPE_MAP).find(
          (item) => item.value === normalizedCompetitionType
        )
        const competitionTypeName =
          competitionInfo?.label || normalizedCompetitionType
        this.$message.warning(
          `比赛类型为${competitionTypeName}时，暂不支持关联运动数据`
        )
        this.getScheduleData()
        return
      }

      if (!allowedSportTypes.includes(activitySportType)) {
        const competitionInfo = Object.values(COMPETITION_TYPE_MAP).find(
          (item) => item.value === normalizedCompetitionType
        )
        const competitionTypeName =
          competitionInfo?.label || normalizedCompetitionType

        // 运动类型中文名称映射
        const sportTypeNameMap = {
          SWIM: "游泳",
          CYCLE: "骑行",
          RUN: "跑步",
          STRENGTH: "力量",
          OTHER: "其他",
        }

        // 根据比赛类型生成允许的运动类型提示信息
        let allowedTypesText = ""
        if (normalizedCompetitionType === "TRIATHLON") {
          // 铁三：当前规则允许关联「骑行、游泳、跑步、其他」
          allowedTypesText = "游泳、骑行、跑步、其他"
        } else {
          // 获取允许的运动类型的中文名称
          const allowedNames = allowedSportTypes
            .map((type) => sportTypeNameMap[type] || type)
            .join("、")
          allowedTypesText = allowedNames
        }

        this.$message.warning(
          `比赛类型为${competitionTypeName}时，只能关联${allowedTypesText}的运动数据`
        )
        this.getScheduleData()
        return
      }

      // 关联成功，继续后续处理
      competitionApi
        .bindActivity({
          activityId: activity.activityId,
          manualActivityId: activity.manualActivityId,
          competitionId: competition.id,
          day: eventDate,
        })
        .then((res) => {
          if (res.success) {
            this.$message.success("关联成功")
          }
          this.getScheduleData()
        })
        .catch((err) => {
          console.error("关联失败:", err)
          this.getScheduleData()
        })
      // const type = manualActivityId ? 2 : 1;
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
      }
      // 模拟课程数据 - 这里可以从课程列表中选择
      const courseData = {
        name: (classItem.classesJson && classItem.classesJson.title) || null,
        duration:
          (classItem.classesJson && classItem.classesJson.duration) || null,
        sth: (classItem.classesJson && classItem.classesJson.sth) || null,
        id: classItem.id,
        classesJson: classItem.classesJson,
        distance:
          (classItem.classesJson && classItem.classesJson.distance) || null,
        distanceUnit:
          (classItem.classesJson && classItem.classesJson.distanceUnit) || null,
        sportType: classItem.sportType,
      }
      console.log(exerciseData, "exerciseData")
      this.bindCourseData = courseData
      this.bindExerciseData = [exerciseData]
      this.bindType = type
      this.showBindModal = true
    },

    /**
     * 添加课表到日历
     */
    async AddScheduleClass(data, type = "", index = 0) {
      if (!this.selectedAthletic) return
      console.log(this.athleticThreshold, "old athleticThreshold")
      const originalClassesJson = parseClassesJson(data.classesJson)
      await this.getAthleticThreshold(this.selectedAthletic, data.classesDate)
      console.log(this.athleticThreshold, "new athleticThreshold")

      // 根据运动类型计算阈值
      let calculatedClassesJson = originalClassesJson
      if (data.sportType === "RUN") {
        calculatedClassesJson = new CalculateRun(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues()
      } else if (data.sportType === "CYCLE") {
        calculatedClassesJson = new CalculateBike(
          this.athleticThreshold,
          originalClassesJson
        ).updateClassInfoCalculatedValues()
      }

      // 计算时间距离STH
      if (["RUN", "CYCLE"].includes(data.sportType)) {
        const res = await scheduleApi.calculateTimeDistanceSth({
          ...data,
          classesJson: JSON.stringify(calculatedClassesJson),
          triUserId: this.selectedAthletic,
        })

        if (data.sportType === "RUN") {
          calculatedClassesJson = {
            ...calculatedClassesJson,
            duration: secondsToHHMMSS((res.result && res.result.time) || 0),
            distance: ((res.result && res.result.distance) || 0) + "km",
            sth: (res.result && res.result.sth) || null,
          }
        } else if (data.sportType === "CYCLE") {
          calculatedClassesJson = {
            ...calculatedClassesJson,
            duration: calculatedClassesJson.duration,
            distance: calculatedClassesJson.distance,
            sth: (res.result && res.result.sth) || null,
          }
        }
      }

      // 将计算后的classesJson字符串化
      const finalClassesJsonString = JSON.stringify(calculatedClassesJson)

      // 创建更新后的data对象
      const updatedData = {
        ...data,
        classesJson: finalClassesJsonString,
      }

      if (type === "classTemplate") {
        return updatedData
      }

      // 生成排序数据
      const sortVoList = []
      let classSchedule = []
      let sort = null

      this.currentWeek.forEach((item) => {
        if (item.commonDate === updatedData.classesDate) {
          classSchedule = JSON.parse(JSON.stringify(item.classSchedule))
          classSchedule.splice(index, 0, updatedData)
        }
      })

      classSchedule.forEach((item, index) => {
        if (item.id) {
          sortVoList.push({
            id: item.id,
            sort: index,
          })
        } else {
          sort = index
        }
      })

      const res = await scheduleApi.createSchedule({
        ...updatedData,
        triUserId: this.selectedAthletic,
        sortVoList,
        sort,
      })

      if (res.success) {
        this.getScheduleData()
        // this.getClassList();
      }
    },

    /**
     * 课程折叠变化 - 初始化拖拽
     */
    classSlideChange() {
      // this.initClassDrag();
    },

    handleClassDragEndFromClassList(e) {
      console.log(e, "handleClassDragEndFromClassList===================")
      if (
        e.originalEvent.srcElement.offsetParent &&
        e.originalEvent.srcElement.offsetParent.dataset &&
        e.originalEvent.srcElement.offsetParent.dataset.type &&
        e.originalEvent.srcElement.offsetParent.dataset.type === "activity"
      ) {
        this.handleMatchClass({
          classId: e.item.dataset.id,
          activityId:
            e.originalEvent.srcElement.offsetParent.dataset.activityid,
          manualActivityId:
            e.originalEvent.srcElement.offsetParent.dataset.manualactivityid,
          type: e.item.dataset.type,
        })
      } else if (e.to.dataset.date) {
        this.handleScheduleDragAdd(e)
      }
    },

    /**
     * 保存课程标题
     */
    onSaveClassTitle(payload) {
      this.classModalData = { ...payload }
      this.showAddClassTitle = false
      this.showSportTypeModal = true
    },

    /**
     * 选择运动类型
     */
    onSelectSportType(item) {
      if (this.classModalDataType !== "addSchedule") {
        this.classModalDataType = "add"
      }
      var Map = {
        swim: "SWIM",
        strength: "STRENGTH",
        note: "REMARK",
        other: "OTHER",
        rest: "REST",
        ride: "CYCLE",
        run: "RUN",
      }

      if (this.classModalDataType === "addSchedule") {
        // 新增模式，确保数据为空
        this.scheduleType = "add"
        this.classDetailData = {}
        this.classSportType = Map[item.key]
        this.$nextTick(() => {
          this.showClassDetailModal = true
        })
        console.log(this.addScheduleDate, "this.addScheduleDate")
        return
      }
      console.log(item, "item")

      this.classModalData.sportType = Map[item.key]
      this.showAddClassModal = true
      this.showSportTypeModal = false
    },

    handleCancelSportType() {
      this.showSportTypeModal = false
      this.isSchedule = false
    },

    /**
     * 保存各类型课程
     */
    onSaveAddClass(saveData, flag) {
      console.log(saveData, "saveData")
      if (this.classModalDataType === "add") {
        classApi.createClass(saveData).then((res) => {
          if (res.success) {
            this.$message.success("课程保存成功")
            this.classModalData = res.result
            this.classModalDataType = "edit"
            if (flag) this.showAddClassModal = false
            this.getClassList()
          } else {
            this.$message.error(res.message)
          }
        })
      } else if (this.classModalDataType === "edit") {
        console.log(saveData, "saveData")
        console.log(this.classModalData, "this.classModalData")
        classApi.updateClass(saveData).then((res) => {
          if (res.success) {
            this.$message.success("课程保存成功")
            if (flag) this.showAddClassModal = false
            this.getClassList()
          } else {
            this.$message.error(res.message)
          }
        })
      } else if (this.classModalDataType === "addSchedule") {
        console.log(
          saveData,
          flag,
          this.classModalData,
          this.addScheduleDate,
          "saveData, flag, classModalData, addScheduleDate"
        )
        if (flag) this.showAddClassModal = false
        this.handlePasteClass(this.addScheduleDate, saveData)
      }
    },
    onSaveShareClass(classId) {
      this.showShareClassModal = false
      this.getClassList()
    },

    // 添加分享分组
    handleAddShareGroup(node) {
      console.log(node, "node--添加分享分组---分享组节点信息")
      this.currentShareGroup = {
        id: "",
        groupName: "",
        teamId: node.teamId,
      }
      this.addShareGroupVisible = true
    },
    // 编辑分享分组
    handleEditShareGroup(node) {
      this.currentShareGroup = { ...node }
      this.addShareGroupVisible = true
    },
    // 删除分享分组
    handleDeleteShareGroup(node) {
      this.$confirm(`确认删除分组【${node?.groupName}】？`, "提示", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 调用删除分组API
        groupApi
          .deleteShareGroup({
            requestUserId: localStorage.getItem("triUserId"),
            id: node.id,
            shareDataType: 1, // 1 团队课程  2 分享计划
            teamId: node.teamId,
          })
          .then((res) => {
            if (res.success) {
              this.$message.success("删除成功")
              // 刷新团队树与当前团队的分享分组列表
              this.refreshTeamTree()
              this.refreshShareGroupList()
            }
          })
      })
    },
    // 权限调整
    handleShareAuthEdit(node) {
      this.currentShareAuthEdit = { ...node }
      this.shareAuthEditVisible = true
    },
    handleShareAuthEditSave(payload) {
      this.shareAuthEditVisible = false
      this.currentShareAuthEdit = { id: "", teamId: null }
      // 刷新团队树与当前团队的分享分组列表
      this.refreshTeamTree()
      this.refreshShareGroupList()
    },
    // 移动分享分组
    handleMoveShareGroup(node) {
      this.currentMoveShareGroup = { ...node }
      this.moveShareGroupVisible = true
    },
    // 保存分享分组（添加/编辑成功后）
    handleAddShareGroupSave(payload) {
      this.addShareGroupVisible = false
      this.currentShareGroup = { id: "", groupName: "", teamId: null }
      // 刷新团队树与当前团队的分享分组列表
      this.refreshTeamTree()
      this.refreshShareGroupList()
    },
    handleMoveShareGroupSave(payload) {
      this.moveShareGroupVisible = false
      this.currentMoveShareGroup = { id: "", teamId: null }
      // 刷新团队树与当前团队的分享分组列表
      this.refreshTeamTree()
      this.refreshShareGroupList()
    },
    // 刷新团队树数据
    refreshTeamTree() {
      // 只在团队计划类型时刷新
      if (this.activeClassType === 'team' && this.$refs.planListRef && this.$refs.planListRef.refreshTeamTree) {
        this.$refs.planListRef.refreshTeamTree()
      }
    },
    // 刷新当前团队的分享分组列表（重新拉取 coach-teams-share，接口会返回全量含 groups）
    refreshShareGroupList() {
      this.getAllTeamsTreeList(this.teamClassSearchKeyword)
    },
    /**
     * 保存分组
     */
    onSaveAddGroup() {
      this.showAddGroup = false
      this.getClassList()
    },

    /**
     * 保存移动分组
     */
    onSaveMoveGroup() {
      this.showMoveGroup = false
      this.getClassList()
      this.getScheduleData()
    },

    /**
     * 保存复制课程
     */
    onSaveCopyClassFromOfficial() {
      this.showCopyClassFromOfficial = false
      this.getClassList()
    },

    /**
     * 保存运动员信息
     */
    onSaveAthleticInfo(payload, type) {
      // 保存逻辑
      if (type) {
        this.showAthleticInfoDialog = false
      }
      this.getScheduleData()
      this.getAthleticThreshold(this.selectedAthletic)
    },

    /**
     * 取消月度统计
     */
    onCancelMonthStatistic() {
      this.showMonthStatisticDialog = false
    },

    /**
     * 取消运动详情
     */
    onCancelSportDetail() {
      this.showSportDetailModal = false
    },

    /**
     * 绑定确认
     */
    async onBind(data) {
      console.log("匹配数据：", data)
      if (data.type === "classTemplate") {
        const params = {
          classesId: data.courseData.id,
          classesJson: JSON.stringify(data.courseData.classesJson),
          classesDate: data.exerciseData[0].dataDate,
          sportType: data.courseData.sportType,
        }
        const josnData = await this.AddScheduleClass(params, data.type)
        scheduleApi
          .createSchedule({
            ...josnData,
            triUserId: this.selectedAthletic,
          })
          .then((res) => {
            if (res.success) {
              const type = data.exerciseData[0].activityId ? 1 : 2
              const bindingActivityId = data.exerciseData[0].activityId
                ? data.exerciseData[0].activityId
                : data.exerciseData[0].manualActivityId
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
                    this.$message.success("匹配成功")
                  } else {
                    this.$message.error(res.message)
                  }
                  // 关闭对话框并刷新数据
                  this.showBindModal = false
                  this.$nextTick(() => {
                    this.getScheduleData()
                  })
                })
                .catch((error) => {
                  console.error("绑定失败:", error)
                  this.$message.error("绑定失败")
                  this.showBindModal = false
                  this.$nextTick(() => {
                    this.getScheduleData()
                  })
                })
            } else {
              this.$message.error(res.message)
              this.showBindModal = false
            }
          })
          .catch((error) => {
            console.error("创建课表失败:", error)
            this.$message.error("创建课表失败")
            this.showBindModal = false
          })
        return
      }
      const type = data.exerciseData[0].manualActivityId ? 2 : 1
      const bindingActivityId = data.exerciseData[0].manualActivityId
        ? data.exerciseData[0].manualActivityId
        : data.exerciseData[0].activityId
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
            this.$message.success("匹配成功")
          } else {
            this.$message.error(res.message)
          }
          // 关闭对话框并刷新数据
          this.showBindModal = false
          this.$nextTick(() => {
            this.getScheduleData()
          })
        })
        .catch((error) => {
          console.error("绑定失败:", error)
          this.$message.error("绑定失败")
          this.showBindModal = false
          this.$nextTick(() => {
            this.getScheduleData()
          })
        })
    },

    /**
     * 取消绑定
     */
    onCancelBind() {
      this.showBindModal = false
      this.getScheduleData()
    },

    /**
     * 保存课程详情
     */
    handleClassDetailSave(data, flag) {
      console.log(flag, "flag")
      if (flag) {
        this.showClassDetailModal = false
        this.showEditScheduleClass = false
        this.classSportType = ""
        if (this.isActivity) {
          this.activityDetailData = {}
        } else {
          this.classDetailData = {}
        }
      }
      this.getScheduleData()
      this.getClassList()
    },
  },

}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
}

.athletic-container {
  width: 100%;
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
  background-color: #fff;
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

.team-select-container {
  padding: 16px 10px 0;
  margin-bottom: 5px;

  .team-dropdown {
    cursor: pointer;
    width: 100%;

    .team-name-title {
      display: flex;
      align-items: center;
      color: #101010;
      font-family: PingFang SC;
      font-weight: 600;
      font-style: Semibold;
      font-size: 15px;

      i {
        margin-left: 8px;
        font-size: 12px;
        color: #999;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>

<style lang="scss">
.device-brand-icon {
  width: 22px;
  margin-right: 10px;
}

.team-dropdown-menu {
  .el-dropdown-menu__item.active {
    color: #CC2323;
    font-weight: bold;
  }
}

.athletic-dropdown {
  cursor: pointer;
  display: inline-block;

  .athletic-select-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    width: 200px;
    font-family: PingFang SC;
    font-size: 14px;
    color: #101010;
    transition: all 0.3s;

    &:hover {
      border-color: #c0c4cc;
    }

    .athletic-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .athletic-name-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    i {
      margin-left: auto;
      font-size: 12px;
      color: #999;
      flex-shrink: 0;
    }
  }
}

.athletic-dropdown-menu {
  min-width: 200px;

  .group-header {
    font-weight: 600;
    color: #101010;
    background-color: #f5f7fa;
    cursor: default;
    padding: 8px 20px;
    font-size: 13px;

    &:hover {
      background-color: #f5f7fa;
      color: #101010;
    }
  }

  .athletic-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .athletic-menu-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
  }

  .el-dropdown-menu__item.active {
    color: #CC2323;
    font-weight: bold;
    background-color: #fef0f0;
  }
}

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

.schedule-top {
  // padding: 10px;
  height: 58px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  max-width: 1640px;
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: 0px 1px 0px 0px #00000026;
  border-bottom: 1px solid #e5e5e5;

  .schedule-search {
    width: 230px;
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    padding-right: 20px;

    img {
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
  }
}
</style>
