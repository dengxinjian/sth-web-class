<template>
  <div class="container">
    <div class="athletic-container">
      <!-- 左侧菜单 -->
      <LeftMenu v-model="activeName" @change="handleTypeChange" />
      <div class="content-container"
        v-if="activeName === 'athletic' || activeName === 'class'">
        <!-- 中间内容区 -->
        <div class="type-change"
          :class="{ 'is-collapsed': leftPanelCollapsed }">
          <div class="type-change-inner">
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
                @search="handleClassSearch"
                @add-class="handleAddClass"
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
        </div>

        <div class="schedule-center-wrapper">
          <div class="schedule-top" ref="scheduleTop"
            :class="{ 'schedule-top--with-right-panel': !rightPanelCollapsed }">
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
                    @visible-change="onAthleticDropdownVisibleChange"
                    class="athletic-dropdown">
                    <span
                      class="el-dropdown-link athletic-select-title">
                      <div v-if="getSelectedAthleticAvatar"
                        class="avatar-with-frame avatar-with-frame--sm"
                        :class="{ 'has-frame': getVipFrameSrc(getSelectedAthleticVipSubStatus) }">
                        <img
                          v-if="getVipFrameSrc(getSelectedAthleticVipSubStatus)"
                          :src="getVipFrameSrc(getSelectedAthleticVipSubStatus)"
                          class="avatar-frame"
                          alt="" />
                        <img :src="getSelectedAthleticAvatar"
                          class="athletic-avatar"
                          alt="" />
                      </div>
                      <span class="athletic-name-text">
                        {{ getSelectedAthleticName || "选择人员" }}
                      </span>
                      <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown"
                      class="athletic-dropdown-menu">
                      <div class="athletic-dropdown-search"
                        @click.stop>
                        <el-input
                          v-model="athleticDropdownSearch"
                          size="mini"
                          placeholder="搜索人员"
                          clearable
                          prefix-icon="el-icon-search" />
                      </div>
                      <div class="athletic-dropdown-list">
                        <el-dropdown-item
                          v-for="item in filteredAthleticDropdownItems"
                          :key="item.key"
                          :command="item.type === 'member' ? item.value : null"
                          :disabled="item.type === 'group'" :class="{
                            'group-header': item.type === 'group',
                            active: item.type === 'member' && selectedAthletic === item.value,
                          }">
                          <div v-if="item.type === 'member'"
                            class="athletic-menu-item">
                            <div v-if="item.raw"
                              class="avatar-with-frame avatar-with-frame--menu"
                              :class="{ 'has-frame': getVipFrameSrc(item.raw.vipSubStatus) }">
                              <img
                                v-if="getVipFrameSrc(item.raw.vipSubStatus)"
                                :src="getVipFrameSrc(item.raw.vipSubStatus)"
                                class="avatar-frame"
                                alt="" />
                              <img
                                :src="(item.raw.userAvatar && !item.raw.userAvatar.includes('wxfile')) ? item.raw.userAvatar : 'https://web-home.tos-cn-beijing.volces.com/avatar.png'"
                                class="athletic-menu-avatar" alt="" />
                            </div>
                            <span>{{ item.label }}</span>
                          </div>
                          <span v-else>{{ item.label }}</span>
                        </el-dropdown-item>
                      </div>
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
                @click="handleAthleticInfoClick()" />
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

          <!-- 日程区域：日程表 + 右侧统计（同一滚动容器，支持滚动预加载） -->
          <div
            ref="scheduleScrollRoot"
            class="schedule-scroll-root"
            :class="{ 'schedule-scroll-root--single': scheduleWeeksGrouped.length === 1 }"
            v-loading="scheduleLoadingInitial"
            element-loading-text="加载中…"
            element-loading-background="rgba(255,255,255,0.55)"
            @scroll.passive="onScheduleScroll"
            @wheel.passive="onScheduleWheelAtTop">
            <div ref="scheduleSentinelTop"
              class="schedule-sentinel schedule-sentinel--top" />

            <!-- 向上加载时视口在列表顶部，提示若放在文档底部会看不到；置顶 + sticky 始终在可视区 -->
            <div
              v-if="scheduleLoadingPrev"
              class="schedule-scroll-loading-prev"
              role="status">
              向上加载 2 周…
            </div>

            <!--
              右侧统计栏收起/展开按钮：
              - 需求：按钮固定定位在视口垂直中间，不随日程滚动变化
              - 说明：面板内容仍在日程区域内一起滚动（同一滚动容器），仅按钮做 fixed
            -->
            <div
              class="right-stat-floating-handle-row"
              :class="{ 'is-collapsed': rightPanelCollapsed }">
              <div
                class="panel-collapse-handle panel-collapse-handle--right"
                :title="rightPanelCollapsed ? '展开统计栏' : '收起统计栏'"
                @click="toggleRightPanel">
                <i
                  :class="rightPanelCollapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"></i>
              </div>
            </div>

            <div
              v-for="(week, wIdx) in scheduleWeeksGrouped"
              :key="week.key"
              class="schedule-main-row schedule-main-row--week"
              :data-week-monday="week.monday"
              :style="getScheduleWeekRowStyle(week.monday)"
              ref="scheduleWeekRows">
              <!-- 日程表（每周一块，纵向堆叠） -->
              <div class="schedule-calendar-week"
                ref="scheduleWeekCalendars">
                <ScheduleCalendar :current-week="week.days"
                  :team-list="teamList" :athletic-list="athleticList"
                  :selected-team="selectedTeam"
                  :selected-athletic="selectedAthletic"
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
              </div>

              <!-- 右侧统计面板：与日程一起滚动（当前阶段：仍展示当前周统计） -->
              <div class="right-stat-wrapper"
                :class="{ 'is-collapsed': rightPanelCollapsed }"
                ref="scheduleWeekStats">
                <StatisticsPanel v-if="!rightPanelCollapsed"
                  :sth-data="getWeekSthData(week.monday)"
                  :statistic-data="getWeekStatisticData(week.monday)"
                  :device-list="deviceList"
                  @device-change="handleDeviceChange" />
              </div>
            </div>

            <div ref="scheduleSentinelBottom"
              class="schedule-sentinel schedule-sentinel--bottom" />

            <div v-if="scheduleLoadingInitial"
              class="schedule-scroll-footer">首屏加载中…</div>
            <div v-else-if="scheduleLoadingMore"
              class="schedule-scroll-footer">向下加载 2 周…</div>
          </div>
        </div>
      </div>
      <div class="content-container"
        v-if="activeName === 'plan'">
        <!-- 中间：日程表 + 右侧统计 -->
        <div class="schedule-center-wrapper">
          <!-- 这里计划视图不需要第二个顶部工具栏，直接复用上方全局头部 -->
          <div class="schedule-main-row">
            <!-- 日程表 -->

            <PlanView :isPlan.sync="isPlan"
              :left-panel-collapsed="leftPanelCollapsed"
              @choose-plan="handleChoosePlan"
              :selected-team="selectedTeam" />
            <ScheduleCalendar v-if="!isPlan"
              :current-week="currentWeek"
              :team-list="teamList" :athletic-list="athleticList"
              :selected-team="selectedTeam"
              :selected-athletic="selectedAthletic"
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
              @input-activity="handleInputActivity"
              @click-event-activity="handleEditActivity"
              @delete-all-schedules="handleDeleteAllSchedules" />

            <!-- 右侧统计面板（同样支持收起） -->
            <div class="right-stat-wrapper" v-if="!isPlan"
              :class="{ 'is-collapsed': rightPanelCollapsed }">
              <div
                class="panel-collapse-handle panel-collapse-handle--right"
                :title="rightPanelCollapsed ? '展开统计栏' : '收起统计栏'"
                @click="toggleRightPanel">
                <i
                  :class="rightPanelCollapsed ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"></i>
              </div>
              <StatisticsPanel v-if="!isPlan && !rightPanelCollapsed"
                :sth-data="sthData"
                :statistic-data="statisticData"
                :device-list="deviceList"
                @device-change="handleDeviceChange" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框组件 -->
    <AthleticInfoDialog v-model="showAthleticInfoDialog"
      :data="athleticInfoData" @save="onSaveAthleticInfo" />

    <MonthStatisticDialog v-model="showMonthStatisticDialog"
      :triUserId="selectedAthletic" :currentMonth="currentMonth"
      @cancel="onCancelMonthStatistic" />

    <SportTypeModal v-model="showSportTypeModal" :isClass="isClass"
      :isSchedule="isSchedule" :selected-date="addScheduleDate"
      @select="onSelectSportType"
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
      /** 人员下拉框模糊搜索关键字 */
      athleticDropdownSearch: "",
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
      /** 左侧栏（运动员/课程列表区）是否收起 */
      leftPanelCollapsed: localStorage.getItem("cm_leftPanelCollapsed") === "1",
      /** 右侧统计栏是否收起 */
      rightPanelCollapsed: localStorage.getItem("cm_rightPanelCollapsed") === "1",
      scheduleTopHeight: 0,
      teamClassSearchKeyword: "",
      // 课程数量限制 -- 后续根据待用功能添加
      // currentUserClassConfig: {},

      // 日程数据
      currentWeek: [],
      currentMonth: "",
      /** 滚动预加载（按周纵向） */
      scheduleDayMap: {},
      scheduleLoadedStart: "",
      scheduleLoadedEnd: "",
      scheduleAnchorWeekStart: "",
      scheduleLoadingInitial: false,
      scheduleLoadingMore: false,
      scheduleLoadingPrev: false,
      scheduleHasMore: true,
      scheduleMaxFutureDays: 365,
      scheduleMaxPastDays: 365,
      scheduleUseIntersection: true,
      scheduleIoBottom: null,
      scheduleIoTop: null,
      scheduleScrollTimer: null,
      /** 曾离开过顶部（scrollTop 超过阈值），用于顶部 IO / 非 IO 回退；首屏若始终在顶需配合 onScheduleWheelAtTop */
      scheduleHasUserScrolledDown: false,
      scheduleLastPrevLoadAt: 0,
      scheduleLastMoreLoadAt: 0,
      /** 周行最小高度：max(最长列, 统计面板高度) */
      scheduleWeekMinHeights: {},
      /** 周统计：key=周一(YYYY-MM-DD) */
      scheduleWeekStatisticsMap: {},
      /** 预加载请求去重：key=triUserId_begin_end */
      scheduleInFlightRangeKeys: {},
      /** 首屏剩余周后台补齐 */
      scheduleLoadingBackground: false,
      /** 向上加载后轮询 scrollHeight：卡片内图表/图片异步撑高时继续对齐锚点 */
      schedulePrevLoadPollTimer: null,
      /**
       * 向上加载锚点目标微调（px）：补偿后若「整周」仍相对视口偏下，可适当增大（如 12→20）；
       * 若偏上则改为更小或负值。实际目标 offset = 记录值 − 本值。
       */
      schedulePrevLoadAnchorBiasPx: 300,

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
    /** 按关键字模糊过滤后的下拉项（匹配分组名或人员名） */
    filteredAthleticDropdownItems() {
      const keyword = (this.athleticDropdownSearch || "").trim().toLowerCase()
      if (!keyword) return this.athleticDropdownItems
      const items = []
      this.athleticGroupOptions.forEach((group) => {
        const matchLabel = (s) => (s || "").toLowerCase().includes(keyword)
        const filteredChildren = group.children.filter(
          (m) =>
            matchLabel(m.label) ||
            matchLabel(m.raw?.userNickname) ||
            matchLabel(m.raw?.name)
        )
        if (filteredChildren.length === 0) return
        items.push({
          type: "group",
          key: `group-${group.value}`,
          label: group.label,
        })
        filteredChildren.forEach((member) => {
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
        return 'https://web-home.tos-cn-beijing.volces.com/avatar.png'
      }
      return athletic && athletic.userAvatar ? athletic.userAvatar : 'https://web-home.tos-cn-beijing.volces.com/avatar.png'
    },
    getSelectedAthleticVipSubStatus() {
      if (!this.selectedAthletic) return 0
      const athletic = this.athleticList.find(
        (item) => item.triUserId === this.selectedAthletic
      )
      return (athletic && athletic.vipSubStatus != null) ? Number(athletic.vipSubStatus) : 0
    },
    scheduleSortedDates() {
      return Object.keys(this.scheduleDayMap || {}).sort()
    },
    scheduleWeeksGrouped() {
      const sorted = this.scheduleSortedDates
      if (!sorted.length) return []

      const weeks = []
      let current = []
      let blockMonday = null

      const padWeekTo7 = (monday) => {
        const out = []
        for (let i = 0; i < 7; i += 1) {
          const ds = this.addDays(monday, i)
          out.push(
            this.scheduleDayMap[ds] || {
              commonDate: ds,
              dataDate: ds,
              activityList: [],
              classSchedule: [],
              healthInfos: [],
              competitionList: [],
              timesp: new Date().getTime(),
            }
          )
        }
        return out
      }

      sorted.forEach((ds) => {
        const day = this.scheduleDayMap[ds]
        const monday = this.startOfWeekMonday(ds)
        if (blockMonday === null) blockMonday = monday
        if (monday !== blockMonday) {
          weeks.push({
            monday: blockMonday,
            key: `wk_${blockMonday}_${current?.[current.length - 1]?.commonDate || ""}`,
            days: padWeekTo7(blockMonday),
          })
          current = []
          blockMonday = monday
        }
        current.push(day)
      })
      if (current.length) {
        weeks.push({
          monday: blockMonday,
          key: `wk_${blockMonday}_${current?.[current.length - 1]?.commonDate || ""}`,
          days: padWeekTo7(blockMonday),
        })
      }
      return weeks
    },
  },
  watch: {
    // 监听路由变化，同步菜单状态；
    // 只有从 /plan/add 跳转到本页，且 URL 带 teamId 时，才用路由参数更新 selectedTeam
    $route: {
      handler(to, from) {
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
    this.$nextTick(() => {
      if (this.$refs.scheduleTop) {
        this.scheduleTopHeight = 58
      }
    })
    // 根据路由初始化菜单状态
    this.activeName = localStorage.getItem("activeName") || "class"
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
    if (this.$store.state.fromPath === "/plan/add") {
      this.isPlan = true
    }
    // 查询精英版订阅状态（存储到 Vuex，子组件通过 mapGetters 获取）
    this.$store.dispatch("user/checkEliteSubscription")
    // 监听身份切换事件
    this.$root.$on("identity-changed", this.handleIdentityChanged)
    window.addEventListener("resize", this.handleScheduleResize, { passive: true })
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off("identity-changed", this.handleIdentityChanged)
    window.removeEventListener("resize", this.handleScheduleResize)
    if (this.scheduleIoBottom) {
      this.scheduleIoBottom.disconnect()
      this.scheduleIoBottom = null
    }
    if (this.scheduleIoTop) {
      this.scheduleIoTop.disconnect()
      this.scheduleIoTop = null
    }
    this.scheduleDetachPrevLoadAnchorPoll()
  },
  methods: {
    /**
     * 从周统计对象中提取“周一 key”（尽量兼容不同字段命名）。
     * 约定：最终 key 为 YYYY-MM-DD（周一）。
     */
    getWeekKeyFromStatistics(stat) {
      if (!stat) return ""
      const pick =
        stat.monday ||
        stat.weekMonday ||
        stat.weekStart ||
        stat.weekStartDate ||
        stat.begin ||
        stat.beginDate ||
        stat.start ||
        stat.startDate ||
        ""
      if (!pick) return ""
      const ymd = String(pick).slice(0, 10)
      return this.startOfWeekMonday(ymd)
    },
    getWeekStatPayload(monday) {
      const key = monday || ""
      const payload = (this.scheduleWeekStatisticsMap && this.scheduleWeekStatisticsMap[key]) || null
      return payload
    },
    getWeekSthData(monday) {
      const payload = this.getWeekStatPayload(monday)
      // 新结构：{ begin, end, statistics: { statisticsVoList, avgSthRespDto } }
      return (payload && payload.statistics && payload.statistics.avgSthRespDto) || {}
    },
    getWeekStatisticData(monday) {
      const payload = this.getWeekStatPayload(monday)
      const list =
        (payload && payload.statistics && payload.statistics.statisticsVoList) || []
      return this.mapStatisticsVoList(list)
    },
    /**
     * 统一处理统计列表展示字段（title/icon/unit/格式化/单位换算等）。
     * 说明：StatisticsPanel 依赖这些展示字段；新接口返回的 statisticsVoList 需要在这里补齐。
     */
    mapStatisticsVoList(list) {
      const rows = Array.isArray(list) ? list : []
      return rows.map((item) => {
        if (!item) return item
        if (item.key === "totalSTH") {
          const actualValue =
            item.key === "totalSTH"
              ? Math.round(Number(item.actualValue) / 100) / 100
              : item.actualValue
          const planValue =
            item.key === "totalSTH"
              ? Math.round(Number(item.planValue) / 100) / 100
              : item.planValue
          return {
            ...item,
            actualValue:
              parseInt(item.actualValue) > 100000
                ? unitConversion(actualValue, statisticKeyToTitle[item.key]?.unit)
                : item.actualValue,
            actualValueUnit: parseInt(item.actualValue) > 100000 ? "万" : "",
            title: statisticKeyToTitle[item.key]?.title,
            color: statisticKeyToTitle[item.key]?.color,
            icon: statisticKeyToTitle[item.key]?.icon,
            unit: statisticKeyToTitle[item.key]?.unit,
            planValue:
              parseInt(item.planValue) > 100000
                ? unitConversion(planValue, statisticKeyToTitle[item.key]?.unit)
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
    },
    toggleRightPanel() {
      this.rightPanelCollapsed = !this.rightPanelCollapsed
      localStorage.setItem("cm_rightPanelCollapsed", this.rightPanelCollapsed ? "1" : "0")
      this.$nextTick(() => this.syncScheduleWeekMinHeights())
    },
    /**
     * 获取“每周一行”的最小高度样式。
     * 规则：minHeight = max(当前周 7 列中最高列高度, 统计面板可见高度)。
     * 单周特殊：当只渲染 1 周时，强制 minHeight >= calc(100vh - 60px)。
     */
    getScheduleWeekRowStyle(monday) {
      const h = this.scheduleWeekMinHeights && this.scheduleWeekMinHeights[monday]
      if (!h) return null
      return { minHeight: `${h}px` }
    },
    handleScheduleResize() {
      this.syncScheduleWeekMinHeights()
    },
    /**
     * 计算并同步每周行的最小高度。
     * - “当前行最长列”：取 ScheduleCalendar 内 `.schedule-table-cell` 的最大 offsetHeight
     * - “统计面板高度”：取 `.week-statistic` 的 scrollHeight，并受 max-height(calc(100vh - 60px)) 限制
     * - 单周：强制 >= (window.innerHeight - 60)
     * @returns {Promise<void>} minHeight 写入并再经一轮 DOM 更新后 resolve，便于向上加载后再补一次 scrollTop
     */
    syncScheduleWeekMinHeights() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const rowEls = this.$refs.scheduleWeekRows
          const calEls = this.$refs.scheduleWeekCalendars
          const statEls = this.$refs.scheduleWeekStats
          if (!rowEls || !calEls || !statEls) {
            resolve()
            return
          }

          const rows = Array.isArray(rowEls) ? rowEls : [rowEls]
          const cals = Array.isArray(calEls) ? calEls : [calEls]
          const stats = Array.isArray(statEls) ? statEls : [statEls]
          const isSingleWeek = (this.scheduleWeeksGrouped || []).length === 1
          const singleWeekCap = Math.max(0, (window.innerHeight || 0) - 60)

          rows.forEach((rowEl, idx) => {
            if (!rowEl) return
            const monday = rowEl.getAttribute("data-week-monday") || ""
            if (!monday) return

            const calEl = cals[idx]
            const statEl = stats[idx]

            // 当前周“最长列高度”：取 7 列 cell 的最大高度（包含标题+内容）
            let maxCellHeight = 0
            if (calEl) {
              const cellEls = calEl.querySelectorAll(".schedule-table-cell")
              cellEls.forEach((el) => {
                const h = el.offsetHeight || 0
                if (h > maxCellHeight) maxCellHeight = h
              })
              if (!maxCellHeight) {
                maxCellHeight = calEl.offsetHeight || 0
              }
            }

            // 统计面板高度：取面板内容的“目标高度”（scrollHeight 与 max-height 约束后的较小值）
            // 注意：某些环境下 getComputedStyle(maxHeight) 可能仍返回 calc(...)，这里用视口高度兜底。
            let statHeight = 0
            if (statEl) {
              const weekStatEl = statEl.querySelector(".week-statistic")
              if (weekStatEl) {
                const contentH = weekStatEl.scrollHeight || 0
                const cs = window.getComputedStyle(weekStatEl)
                const maxHRaw = cs && cs.maxHeight ? cs.maxHeight : ""
                const maxH =
                  maxHRaw && maxHRaw !== "none" && maxHRaw.endsWith("px")
                    ? parseFloat(maxHRaw)
                    : NaN
                // StatisticsPanel 内部 max-height: calc(100vh - 60px)
                const viewportCap = Math.max(0, (window.innerHeight || 0) - 60)
                const cap =
                  Number.isFinite(maxH) && maxH > 0
                    ? maxH
                    : (viewportCap > 0 ? viewportCap : contentH)
                statHeight = Math.min(contentH, cap)
              } else {
                statHeight = statEl.scrollHeight || statEl.offsetHeight || 0
              }
            }

            const minH = Math.max(maxCellHeight, statHeight, 0)
            const finalMinH =
              isSingleWeek && singleWeekCap > 0 ? Math.max(minH, singleWeekCap) : minH
            if (finalMinH > 0) {
              this.$set(this.scheduleWeekMinHeights, monday, finalMinH)
            }
          })
          this.$nextTick(() => resolve())
        })
      })
    },
    /**
     * 选取视口内可见面积最大的周行作锚点；偏移用「行顶 − 滚动容器顶」，避免用绝对视口 Y 时整页/侧栏布局变化带来的误差。
     */
    schedulePickAnchorWeekForScroll(scrollRoot) {
      if (!scrollRoot) return null
      const rows = scrollRoot.querySelectorAll(".schedule-main-row--week[data-week-monday]")
      if (!rows.length) return null
      const rr = scrollRoot.getBoundingClientRect()
      let bestMonday = null
      let bestArea = 0
      let bestOffsetRel = 0
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i]
        const r = row.getBoundingClientRect()
        const top = Math.max(r.top, rr.top)
        const bottom = Math.min(r.bottom, rr.bottom)
        const h = Math.max(0, bottom - top)
        if (h > bestArea) {
          bestArea = h
          bestMonday = row.getAttribute("data-week-monday")
          bestOffsetRel = r.top - rr.top
        }
      }
      if (bestMonday && bestArea > 0) {
        return { anchorMonday: bestMonday, anchorOffsetRelRoot: bestOffsetRel }
      }
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i]
        const r = row.getBoundingClientRect()
        if (r.bottom > rr.top + 2) {
          return {
            anchorMonday: row.getAttribute("data-week-monday"),
            anchorOffsetRelRoot: r.top - rr.top,
          }
        }
      }
      return null
    },
    /** 向上加载时希望对齐到的「行顶相对容器顶」目标值（含 schedulePrevLoadAnchorBiasPx） */
    scheduleGetAnchorTargetOffset(anchorOffsetRelRoot) {
      const b = Number(this.schedulePrevLoadAnchorBiasPx)
      const bias = Number.isFinite(b) ? b : 0
      return anchorOffsetRelRoot + bias
    },
    /**
     * 将锚点周行对齐到目标 offset（见 scheduleGetAnchorTargetOffset）。
     * contentY = scrollTop + (行顶−容器顶)，一次算出目标 scrollTop。
     */
    scheduleNudgeScrollToAnchor(root, anchorMonday, anchorOffsetRelRoot, maxPass = 6) {
      if (!root || !anchorMonday || typeof anchorOffsetRelRoot !== "number") return
      const target = this.scheduleGetAnchorTargetOffset(anchorOffsetRelRoot)
      for (let p = 0; p < maxPass; p += 1) {
        const row = root.querySelector(
          `.schedule-main-row--week[data-week-monday="${anchorMonday}"]`
        )
        if (!row) return
        const rr = root.getBoundingClientRect()
        const offsetNow = row.getBoundingClientRect().top - rr.top
        if (Math.abs(offsetNow - target) < 0.35) return
        const contentY = root.scrollTop + offsetNow
        let next = contentY - target
        const maxScroll = Math.max(0, root.scrollHeight - root.clientHeight)
        next = Math.max(0, Math.min(maxScroll, next))
        if (Math.abs(next - root.scrollTop) < 0.25) return
        root.scrollTop = next
      }
    },
    /** 结束向上加载后的 scrollHeight 轮询（新一次加载或销毁时调用） */
    scheduleDetachPrevLoadAnchorPoll() {
      if (this.schedulePrevLoadPollTimer != null) {
        clearInterval(this.schedulePrevLoadPollTimer)
        this.schedulePrevLoadPollTimer = null
      }
    },
    /**
     * 卡片/图表/长文本晚渲染：仅靠 scrollHeight 变化会漏（列内重排未必立刻反映到 scrollHeight 或存在多帧延迟）。
     * 每拍都尝试锚点 nudge，并同时观察 scrollHeight + 锚点误差，二者均稳定后再停。
     */
    schedulePollScrollHeightForAnchor(anchorMonday, anchorOffsetRelRoot) {
      this.scheduleDetachPrevLoadAnchorPoll()
      if (!anchorMonday || typeof anchorOffsetRelRoot !== "number") return
      const targetOffset = this.scheduleGetAnchorTargetOffset(anchorOffsetRelRoot)
      const root0 = this.$refs.scheduleScrollRoot
      if (!root0) return
      let lastH = root0.scrollHeight
      let heightStableTicks = 0
      let anchorStableTicks = 0
      let ticks = 0
      const maxTicks = 70
      const heightStableNeeded = 8
      const anchorStableNeeded = 8
      const intervalMs = 70
      this.schedulePrevLoadPollTimer = setInterval(() => {
        const root = this.$refs.scheduleScrollRoot
        if (!root) {
          this.scheduleDetachPrevLoadAnchorPoll()
          return
        }
        const h = root.scrollHeight
        if (h !== lastH) {
          lastH = h
          heightStableTicks = 0
        } else {
          heightStableTicks += 1
        }

        this.scheduleNudgeScrollToAnchor(root, anchorMonday, anchorOffsetRelRoot, 6)

        const row = root.querySelector(
          `.schedule-main-row--week[data-week-monday="${anchorMonday}"]`
        )
        if (!row) {
          this.scheduleDetachPrevLoadAnchorPoll()
          return
        }
        const rr = root.getBoundingClientRect()
        const offsetNow = row.getBoundingClientRect().top - rr.top
        const err = Math.abs(offsetNow - targetOffset)
        if (err < 0.6) {
          anchorStableTicks += 1
        } else {
          anchorStableTicks = 0
        }

        ticks += 1
        if (
          ticks >= maxTicks ||
          (heightStableTicks >= heightStableNeeded && anchorStableTicks >= anchorStableNeeded)
        ) {
          this.scheduleDetachPrevLoadAnchorPoll()
        }
      }, intervalMs)
    },
    formatYMD(date) {
      const d =
        date instanceof Date ? date : new Date(String(date).replace(/-/g, "/"))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${y}-${m}-${dd}`
    },
    /**
     * 顶部「YYYY年MM月」：跨月周若用周一日期会整周多在次月仍显示上月。
     * 用周四（index 3）所在月作为展示月，与常见周视图一致。
     */
    computeCurrentMonthFromWeek(currentWeek) {
      if (!currentWeek || !currentWeek.length) return ""
      const idx = Math.min(3, currentWeek.length - 1)
      const dayStr = currentWeek[idx].commonDate
      const date = new Date(String(dayStr).replace(/-/g, "/"))
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    },
    addDays(dateStr, n) {
      const d = new Date(String(dateStr).replace(/-/g, "/"))
      d.setDate(d.getDate() + n)
      return this.formatYMD(d)
    },
    startOfWeekMonday(dateStr) {
      const d = new Date(String(dateStr).replace(/-/g, "/"))
      const day = d.getDay()
      const diff = day === 0 ? -6 : 1 - day
      d.setDate(d.getDate() + diff)
      return this.formatYMD(d)
    },
    /**
     * 无运动员时的空数据兜底渲染。
     * - 需求：如果没有默认选中的第一个运动员，也要渲染当周空数据（仅 1 周）
     * - 说明：此时不请求接口，仅生成 scheduleDayMap，保证日程区域可见
     */
    initEmptySchedulePrefetch(anchorWeekMonday, days = 7) {
      const anchor =
        anchorWeekMonday ||
        this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate || this.formatYMD(new Date()))
      // 空数据兜底不展示首屏 loading
      this.scheduleLoadingInitial = false
      this.scheduleAnchorWeekStart = anchor
      const begin = anchor
      const safeDays = Math.max(1, Number(days) || 7)
      const end = this.addDays(begin, safeDays - 1)
      const nextMap = {}
      let cur = begin
      while (cur <= end) {
        nextMap[cur] = {
          commonDate: cur,
          dataDate: cur,
          activityList: [],
          classSchedule: [],
          healthInfos: [],
          competitionList: [],
          timesp: new Date().getTime(),
        }
        cur = this.addDays(cur, 1)
      }
      this.scheduleDayMap = nextMap
      this.scheduleLoadedStart = begin
      this.scheduleLoadedEnd = end
      this.scheduleHasMore = true
      this.scheduleHasUserScrolledDown = false
      this.scheduleLoadingInitial = false
      this.scheduleLoadingMore = false
      this.scheduleLoadingPrev = false
      this.$nextTick(() => {
        this.$forceUpdate()
        this.setupScheduleIntersection()
        this.syncScheduleWeekMinHeights()
      })
    },
    setupScheduleIntersection() {
      if (!this.scheduleUseIntersection) return
      this.$nextTick(() => {
        if (this.scheduleIoBottom) {
          this.scheduleIoBottom.disconnect()
          this.scheduleIoBottom = null
        }
        if (this.scheduleIoTop) {
          this.scheduleIoTop.disconnect()
          this.scheduleIoTop = null
        }
        const root = this.$refs.scheduleScrollRoot
        const bottom = this.$refs.scheduleSentinelBottom
        const top = this.$refs.scheduleSentinelTop
        if (!root || !bottom || !window.IntersectionObserver) return

        this.scheduleIoBottom = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) this.loadMoreScheduleTwoWeeks()
            })
          },
          // 距离底部 < 300px 时提前预取
          { root, rootMargin: "300px", threshold: 0 }
        )
        this.scheduleIoBottom.observe(bottom)

        if (top) {
          this.scheduleIoTop = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return
                if (!this.scheduleHasUserScrolledDown) return
                this.loadPreviousScheduleTwoWeeks()
              })
            },
            // 距离顶部 < 300px 时提前预取
            { root, rootMargin: "300px", threshold: 0 }
          )
          this.scheduleIoTop.observe(top)
        }
      })
    },
    onScheduleScroll() {
      const el = this.$refs.scheduleScrollRoot
      if (el && el.scrollTop > 8) {
        this.scheduleHasUserScrolledDown = true
      }
      if (this.scheduleUseIntersection) return
      if (this.scheduleScrollTimer) clearTimeout(this.scheduleScrollTimer)
      this.scheduleScrollTimer = setTimeout(() => {
        const root = this.$refs.scheduleScrollRoot
        if (!root) return
        const { scrollTop, clientHeight, scrollHeight } = root
        if (scrollHeight - scrollTop - clientHeight < 300) {
          this.loadMoreScheduleTwoWeeks()
        }
        if (this.scheduleHasUserScrolledDown && scrollTop < 300) {
          this.loadPreviousScheduleTwoWeeks()
        }
      }, 150)
    },
    /**
     * 在 scrollTop≈0 时用户无法继续向上滚，wheel 的 deltaY<0 表示「想往更早的日程拉」。
     * 与顶部 IO 互补：scrollTop=0 时无法产生 scroll 事件，用 wheel 向上手势触发更早周加载。
     */
    onScheduleWheelAtTop(e) {
      const root = this.$refs.scheduleScrollRoot
      if (!root || !this.selectedAthletic) return
      if (root.scrollTop > 2) return
      if (e.deltaY >= 0) return
      this.loadPreviousScheduleTwoWeeks()
    },
    /**
     * 拉取并合并指定日期区间的日程数据到 scheduleDayMap（滚动预加载数据源）。
     * begin/end 参数：YYYY-MM-DD 00:00:00 / 23:59:59。
     */
    /**
     * @param {Object} [opts]
     * @param {boolean} [opts.deferMinHeightSync] 为 true 时不立刻算周行 min-height（向上 prepend 时先补偿 scrollTop，再算，避免闪动）
     */
    async fetchAndMergeSchedule(beginYmd, endYmd, opts = {}) {
      if (!this.selectedAthletic) return
      // 请求去重：接口慢时避免同区间重复请求
      const rangeKey = `${this.selectedAthletic}_${beginYmd}_${endYmd}`
      if (this.scheduleInFlightRangeKeys && this.scheduleInFlightRangeKeys[rangeKey]) return
      this.$set(this.scheduleInFlightRangeKeys, rangeKey, true)
      let res
      try {
        res = await scheduleApi.getCalenderOverviewStat({
          begin: `${beginYmd} 00:00:00`,
          end: `${endYmd} 23:59:59`,
          triUserId: this.selectedAthletic,
        })
      } finally {
        this.$delete(this.scheduleInFlightRangeKeys, rangeKey)
      }
      const result = res && res.success ? res.result : null
      const calenderOverview =
        result && Array.isArray(result.calenderOverview) ? result.calenderOverview : []
      const statistics =
        result && Array.isArray(result.statistics) ? result.statistics : []

      const nextMap = { ...(this.scheduleDayMap || {}) }

      // 先补齐区间日期，确保渲染连续
      let cur = beginYmd
      while (cur <= endYmd) {
        if (!nextMap[cur]) {
          nextMap[cur] = {
            commonDate: cur,
            dataDate: cur,
            activityList: [],
            classSchedule: [],
            healthInfos: [],
            competitionList: [],
            timesp: new Date().getTime(),
          }
        }
        cur = this.addDays(cur, 1)
      }

      // 将接口结果映射到 day 结构（复用 getScheduleData 的关键清洗逻辑）
      calenderOverview.forEach((part) => {
        const ds = part && part.dataDate ? String(part.dataDate).slice(0, 10) : ""
        if (!ds) return
        const base = nextMap[ds] || {
          commonDate: ds,
          dataDate: ds,
          activityList: [],
          classSchedule: [],
          healthInfos: [],
          competitionList: [],
          timesp: new Date().getTime(),
        }

        const activityList = (part.activityOverviewList || [])
          .map((i) => ({
            ...i,
            classesJson: i.classesJson ? parseClassesJson(i.classesJson) : null,
            completion: i.classesJson ? getCompletionStatus(i.percent) : "",
            distance: Math.round(i.distance / 10) / 100,
            oldActivityDuration: i.duration,
            oldActivityDistance: Math.round(i.distance),
            preciseDistance: Math.round(i.distance),
            oldActivitySthValue: i.sthValue,
          }))
          .filter((i) => !i.bindingManualActivityId && !i.bindCompetitionId)

          ; (part.manualDeviceActivityVoList || []).forEach((i) => {
          if (!i.activityId && !i.bindCompetitionId) {
            activityList.push({
              ...i,
              classesJson: i.classesJson ? parseClassesJson(i.classesJson) : null,
              distance: Math.round(i.distance / 10) / 100,
              preciseDistance: i.distance,
              movingTime: i.activityDuration,
            })
          } else {
            activityList.forEach((item, index) => {
              if (item.manualActivityId === i.manualActivityId) {
                activityList[index] = {
                  ...i,
                  activityName: item.activityName,
                  classesJson: i.classesJson ? parseClassesJson(i.classesJson) : null,
                  distance: Math.round(i.distance / 10) / 100,
                  preciseDistance: Math.round(i.distance),
                  oldActivityDuration: item.oldActivityDuration,
                  oldActivityDistance: Math.round(item.oldActivityDistance),
                  oldActivitySthValue: item.oldActivitySthValue,
                  movingTime: i.activityDuration,
                }
              }
            })
          }
        })

        const classSchedule = (part.classScheduleVoList || [])
          .map((i) => ({
            ...i,
            classesJson: parseClassesJson(i.classesJson),
          }))
          .filter((i) => !i.bindingActivityId && !i.bindingManualActivityId)

        const healthInfos =
          part.healthInfos && part.healthInfos.length > 0 ? [part.healthInfos[0]] : []

        const competitionList = Array.isArray(part.competitionList)
          ? part.competitionList
          : []

        nextMap[ds] = {
          ...base,
          activityList,
          classSchedule,
          healthInfos,
          competitionList,
          timesp: new Date().getTime(),
        }
      })

      this.scheduleDayMap = nextMap
      // 合并周统计（按周一 key 存储）
      if (statistics && statistics.length) {
        const nextStatsMap = { ...(this.scheduleWeekStatisticsMap || {}) }
        statistics.forEach((st) => {
          const key = this.getWeekKeyFromStatistics(st)
          if (!key) return
          nextStatsMap[key] = st
        })
        this.scheduleWeekStatisticsMap = nextStatsMap
      }
      this.$nextTick(() => {
        this.$forceUpdate()
        this.initAllDrag()
        this.setupScheduleIntersection()
        if (!opts.deferMinHeightSync) {
          this.syncScheduleWeekMinHeights()
        }
      })
    },
    async loadInitialScheduleFourWeeks() {
      if (!this.scheduleAnchorWeekStart) return
      /**
       * 首屏分段加载（接口慢时更快“先看到”）：
       * - 先加载当周 1 周（7天）并立刻渲染
       * - 再后台补齐剩余 3 周（21天）
       */
      this.scheduleLoadingInitial = true
      const begin = this.scheduleAnchorWeekStart
      const firstEnd = this.addDays(begin, 6)
      await this.fetchAndMergeSchedule(begin, firstEnd)
      this.scheduleLoadedStart = begin
      this.scheduleLoadedEnd = firstEnd
      this.scheduleHasMore = true
      this.scheduleHasUserScrolledDown = false
      this.scheduleLoadingInitial = false
      this.$nextTick(() => {
        this.setupScheduleIntersection()
        this.syncScheduleWeekMinHeights()
      })

      const restBegin = this.addDays(firstEnd, 1)
      const restEnd = this.addDays(begin, 27)
      if (restBegin <= restEnd) {
        this.scheduleLoadingBackground = true
        Promise.resolve()
          .then(() => this.fetchAndMergeSchedule(restBegin, restEnd))
          .then(() => {
            this.scheduleLoadedEnd = restEnd
          })
          .finally(() => {
            this.scheduleLoadingBackground = false
          })
      }
    },
    async loadMoreScheduleTwoWeeks() {
      if (
        !this.scheduleLoadedEnd ||
        this.scheduleLoadingMore ||
        this.scheduleLoadingPrev ||
        this.scheduleLoadingInitial ||
        !this.scheduleHasMore
      ) {
        return
      }
      const now = Date.now()
      if (now - this.scheduleLastMoreLoadAt < 400) return
      this.scheduleLastMoreLoadAt = now

      const nextBegin = this.addDays(this.scheduleLoadedEnd, 1)
      const limitEnd = this.addDays(this.scheduleAnchorWeekStart, this.scheduleMaxFutureDays)
      if (nextBegin > limitEnd) {
        this.scheduleHasMore = false
        return
      }
      // 滚动预加载：每次向下加载 2 周（14 天）
      const nextEnd = this.addDays(nextBegin, 13)
      this.scheduleLoadingMore = true
      await this.fetchAndMergeSchedule(nextBegin, nextEnd)
      this.scheduleLoadedEnd = nextEnd
      this.scheduleLoadingMore = false
      this.$nextTick(() => {
        this.setupScheduleIntersection()
        this.syncScheduleWeekMinHeights()
      })
    },
    async loadPreviousScheduleTwoWeeks() {
      const now = Date.now()
      if (now - this.scheduleLastPrevLoadAt < 400) return
      if (
        !this.scheduleLoadedStart ||
        this.scheduleLoadingPrev ||
        this.scheduleLoadingMore ||
        this.scheduleLoadingInitial
      ) {
        return
      }
      const minBound = this.addDays(this.scheduleAnchorWeekStart, -this.scheduleMaxPastDays)
      if (this.scheduleLoadedStart <= minBound) return

      const prevEnd = this.addDays(this.scheduleLoadedStart, -1)
      // 滚动预加载：每次向上加载 2 周（14 天），并在 prepend 后补偿 scrollTop 防止跳动
      let prevBegin = this.addDays(this.scheduleLoadedStart, -14)
      if (prevBegin < minBound) prevBegin = minBound
      if (prevBegin > prevEnd) return

      const el = this.$refs.scheduleScrollRoot
      if (!el) return
      this.scheduleDetachPrevLoadAnchorPoll()

      const prevScrollHeight = el.scrollHeight
      const prevScrollTop = el.scrollTop
      const pick = this.schedulePickAnchorWeekForScroll(el)
      const anchorMonday = pick ? pick.anchorMonday : null
      const anchorOffsetRelRoot = pick ? pick.anchorOffsetRelRoot : null

      this.scheduleLoadingPrev = true
      await this.$nextTick()
      await this.fetchAndMergeSchedule(prevBegin, prevEnd, { deferMinHeightSync: true })
      this.scheduleLoadedStart = prevBegin
      this.scheduleLoadingPrev = false
      this.scheduleLastPrevLoadAt = Date.now()

      // 双 rAF：首轮布局后补偿；await syncScheduleWeekMinHeights 后再 nudge；再一帧处理晚一拍布局
      this.$nextTick(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(async () => {
            const root = this.$refs.scheduleScrollRoot
            if (!root) return
            if (anchorMonday && typeof anchorOffsetRelRoot === "number") {
              this.scheduleNudgeScrollToAnchor(root, anchorMonday, anchorOffsetRelRoot, 4)
            } else {
              const delta = root.scrollHeight - prevScrollHeight
              root.scrollTop = Math.round(prevScrollTop + delta)
            }
            this.setupScheduleIntersection()
            const hBeforeSync = root.scrollHeight
            await this.syncScheduleWeekMinHeights()
            await this.$nextTick()
            await new Promise((r) => requestAnimationFrame(r))
            const root2 = this.$refs.scheduleScrollRoot
            if (!root2) return
            if (anchorMonday && typeof anchorOffsetRelRoot === "number") {
              this.scheduleNudgeScrollToAnchor(root2, anchorMonday, anchorOffsetRelRoot, 4)
            } else {
              root2.scrollTop = Math.round(
                root2.scrollTop + (root2.scrollHeight - hBeforeSync)
              )
            }
            await new Promise((r) => requestAnimationFrame(r))
            const root3 = this.$refs.scheduleScrollRoot
            if (anchorMonday && typeof anchorOffsetRelRoot === "number") {
              this.scheduleNudgeScrollToAnchor(root3, anchorMonday, anchorOffsetRelRoot, 2)
              // 卡片内图表/长文本晚渲染导致 scrollHeight 继续变，轮询对齐锚点直至高度稳定
              this.schedulePollScrollHeightForAnchor(anchorMonday, anchorOffsetRelRoot)
            }
          })
        })
      })
    },
    // vipSubStatus: 0 未订阅 1 精英 2 专业 4 精英&专业 → 头框图片
    getVipFrameSrc(vipSubStatus) {
      const v = Number(vipSubStatus)
      if (v === 1) return require('@/assets/addClass/vip1.png')
      if (v === 2) return require('@/assets/addClass/vip2.png')
      if (v === 4) return require('@/assets/addClass/vip4.png')
      return null
    },
    handleAthleticInfoClick() {
      if (this.selectedAthletic) {
        this.showAthleticInfoDialog = true
        return
      }
      this.$message.error("请先选择运动员")
    },
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
      scheduleApi.deleteAllSchedules({
        day: date,
        triUserId: this.selectedAthletic,
      }).then((res) => {
        if (res.success) {
          this.$message.success("课表删除成功")
          this.getScheduleData()
        }
      })
        .catch(() => {
          this.$message.error("课表删除失败")
        })
    },
    /**
     * 处理身份切换事件
     */
    handleIdentityChanged(loginType) {
      this.loginType = loginType
      // 身份切换后重新查询精英版订阅状态
      this.$store.dispatch("user/checkEliteSubscription")
      this.activeName = "class"
      localStorage.setItem("activeName", "class")
      if (localStorage.getItem("loginType") !== "1") {
        this.getAllTeamsAndClubs()
      } else {
        this.selectedAthletic = localStorage.getItem("triUserId")
        this.getScheduleData()
        this.getAthleticThreshold(this.selectedAthletic)
        this.getAuthorizedDeviceList()
      }
      this.getClassList()
      if (this.$store.state.fromPath === "/plan/add") {
        this.isPlan = true
      }
    },

    handleChoosePlan(isPlan) {
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
            identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
          })
          .then((res) => {
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
      await this.handlePasteClass(classesDate, classItem)
      this.handleDeleteClassSchedule(classItem, true)
    },
    /**
     * 粘贴赛事
     */
    async handlePasteEvent(date, eventItem) {
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
      this.inputActivityDate = date
      this.showInputActivity = true
    },
    /**
     * 赛事确认
     */
    handleEventConfirm(data) {
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
      // 获取今天的日期（只比较日期部分，不考虑时间）
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 解析 eventItem.competitionDate（可能是 "YYYY-MM-DD" 格式或 Date 对象）
      let eventDate
      if (typeof eventItem.competitionDate === "string") {
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
    },
    async handlePasteClass(date, classItem) {
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
        identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
      })
      if (res.success) {
        this.classModalData = res.result
        this.getScheduleData()
        this.getClassList()
      }
    },
    handleEditClassSchedule(classItem) {
      this.showEditScheduleClass = true
      this.classDetailData = classItem
      this.isActivity = false
    },
    handleEditActivity(activity) {
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
     * 类型切换（运动员/课程）
     */
    handleTypeChange(type) {
      if (type === this.activeName) {
        this.leftPanelCollapsed = !this.leftPanelCollapsed
        localStorage.setItem("cm_leftPanelCollapsed", this.leftPanelCollapsed ? "1" : "0")
        return
      }

      this.activeName = type
      if (this.leftPanelCollapsed) {
        this.leftPanelCollapsed = false
        localStorage.setItem("cm_leftPanelCollapsed", "0")
      }
      this.getClassList()
      this.isPlan = false
      // 切换到课程/人员等视图时，如果当前无人员，兜底渲染当周 7 天空数据，避免日程区域空白
      if (!this.selectedAthletic) {
        this.initEmptySchedulePrefetch(null, 7)
      }
    },

    /**
     * 课程类型切换（我的/官方）
     */
    handleClassTypeChange(type) {
      this.activeClassType = type
      this.getClassList()
      if (type === "team") {
        const loginType = localStorage.getItem("loginType")
        if (loginType === "2") {
          this.getAllTeamsTreeList(this.teamClassSearchKeyword)
        } else {
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
              vipSubStatus: member.vipSubStatus,
            }))
            : [],
      }))
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
        const shouldUseRouteTeamId = fromPath === "/plan/add"
        const routeTeamId = shouldUseRouteTeamId && _this.$route.query.teamId
        const foundByRoute =
          routeTeamId &&
          _this.teamOrClubList.find(
            (item) => String(item.id) === String(routeTeamId)
          )
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
      this.currentWeek.forEach(item => {
        item.activityList = []
        item.classSchedule = []
        item.competitionList = []
        item.healthInfos = []
      })
      this.selectedAthletic = null
      this.athleticInfoData = {}
      // this.currentWeek = []
      this.getAthleticList()
      this.getAllTeamsTreeList(this.teamClassSearchKeyword)
    },

    /**
     * 运动员切换
     */
    onAthleticDropdownVisibleChange(visible) {
      if (!visible) this.athleticDropdownSearch = ""
    },
    /**
     * 运动员切换后的日程刷新逻辑。
     * - 先刷新传统单周数据（currentWeek 绑定的 ScheduleCalendar 仍需要）
     * - 再重置滚动预加载缓存并拉取首屏（避免沿用上一位运动员的 scheduleDayMap）
     */
    handleAthleticChange(athleticId) {
      this.selectedAthletic = athleticId
      this.athleticInfoData = this.athleticList.find(
        (item) => item.triUserId === athleticId
      )
      this.getScheduleData()
      // 人员切换时需要重置滚动预加载缓存，否则会继续使用上一个人的 scheduleDayMap 导致不渲染/渲染异常
      this.scheduleAnchorWeekStart = this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate)
      this.scheduleDayMap = {}
      this.scheduleLoadedStart = ""
      this.scheduleLoadedEnd = ""
      this.scheduleHasMore = true
      this.scheduleHasUserScrolledDown = false
      this.loadInitialScheduleFourWeeks()
      this.getAthleticThreshold(athleticId)
      this.getAuthorizedDeviceList()
    },

    /**
     * 获取运动员列表（团队用 teamList.members，俱乐部用 /consumer/api/club/member/list）
     */
    getAthleticList() {
      if (!this.selectedTeam) {
        this.athleticList = []
        this.selectedAthletic = null
        // 无团队/无人员：兜底渲染当周 7 天空数据，避免切换到计划/课程/团队后日程区域空白
        this.initEmptySchedulePrefetch(null, 7)
        return
      }
      if (this.selectedOrgType === "team") {
        const team = this.teamList.find((item) => item.id === this.selectedTeam)
        this.athleticList = team && team.members ? team.members : []
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
                vipSubStatus: m.vipSubStatus,
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
        // 默认选中人员时，同步重置并加载滚动预加载首屏数据（4周）
        this.scheduleAnchorWeekStart = this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate)
        this.scheduleDayMap = {}
        this.scheduleLoadedStart = ""
        this.scheduleLoadedEnd = ""
        this.scheduleHasMore = true
        this.scheduleHasUserScrolledDown = false
        this.loadInitialScheduleFourWeeks()
      } else {
        // 没有任何运动员：仍然渲染当周 1 周空数据，保证日程区域可见
        this.selectedAthletic = null
        this.athleticInfoData = {}
        this.initEmptySchedulePrefetch(null, 7)
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
      if (!this.selectedAthletic) {
        return
      }
      const res = await scheduleApi.getCalenderOverviewStat({
        begin: this.currentWeek[0].commonDate + " 00:00:00",
        end: this.currentWeek[6].commonDate + " 23:59:59",
        triUserId: this.selectedAthletic,
      })
      if (res.success && res.result) {
        // 新接口：周统计随日程一起返回
        const statsList = Array.isArray(res.result.statistics) ? res.result.statistics : []
        if (statsList.length) {
          const nextStatsMap = { ...(this.scheduleWeekStatisticsMap || {}) }
          statsList.forEach((st) => {
            const key = this.getWeekKeyFromStatistics(st)
            if (!key) return
            nextStatsMap[key] = st
          })
          this.scheduleWeekStatisticsMap = nextStatsMap
          // 同步当前周统计到旧字段（供页面其它逻辑/组件复用）
          const curKey = this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate)
          const curPayload = nextStatsMap[curKey] || statsList[0]
          this.statisticData = this.mapStatisticsVoList(
            (curPayload && curPayload.statistics && curPayload.statistics.statisticsVoList)
              ? curPayload.statistics.statisticsVoList
              : []
          )
          this.sthData =
            (curPayload && curPayload.statistics && curPayload.statistics.avgSthRespDto)
              ? curPayload.statistics.avgSthRespDto
              : {}
        } else {
          this.statisticData = []
          this.sthData = {}
        }
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

          const overviewList = Array.isArray(res.result.calenderOverview)
            ? res.result.calenderOverview
            : []
          overviewList.forEach((part) => {
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
                    movingTime: i.activityDuration,
                  })
                } else {
                  activityList.forEach((item, index) => {
                    if (item.manualActivityId === i.manualActivityId) {
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
                        movingTime: i.activityDuration,
                      }
                    }
                  })
                }
              })
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

        // 滚动预加载：当周锚点变化时，重置并加载首屏 4 周
        if (this.currentWeek && this.currentWeek.length > 0) {
          const nextAnchor = this.startOfWeekMonday(this.currentWeek[0].commonDate)
          if (nextAnchor && nextAnchor !== this.scheduleAnchorWeekStart) {
            this.scheduleAnchorWeekStart = nextAnchor
            this.scheduleDayMap = {}
            this.scheduleLoadedStart = ""
            this.scheduleLoadedEnd = ""
            this.scheduleHasMore = true
            this.scheduleHasUserScrolledDown = false
            this.loadInitialScheduleFourWeeks()
          }
        }
      }
      this.$nextTick(() => {
        // 确保视图更新 - 使用 $forceUpdate 强制重新渲染
        this.$forceUpdate()
        // 初始化拖拽
        this.initAllDrag()
      })
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
          const result = res.result
          const messages = []
          // 判断课表更新状态
          // if (result && result.classScheduleUpdateOk) {
          //   messages.push("同步成功")
          // } else if (result && result.classScheduleUpdateOk === false) {
          //   messages.push("同步失败")
          // }
          // 判断设备同步状态
          if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
            result.deviceSyncList.forEach((item) => {
              if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
                const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
                messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
              }
            })
          }
          const message = messages.length > 0 ? messages.join("<br>") : "同步成功"
          this.$message({
            message,
            dangerouslyUseHTMLString: message.includes("<br>"),
            type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
            duration: Math.max(2000, messages.length * 1000)
          })
          // this.$message.success(res.result);
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

      // 计算当前月份（跨月周用周四所在月，避免「3/30～4/5」仍显示 3 月）
      if (this.currentWeek.length > 0) {
        this.currentMonth = this.computeCurrentMonthFromWeek(this.currentWeek)
      }

      // 无人员：切周也要渲染当周 7 天空数据
      if (!this.selectedAthletic) {
        this.initEmptySchedulePrefetch(null, 7)
        return
      }
      this.getScheduleData()
      // 滚动预加载：以当前周为锚点，首屏加载 4 周
      this.scheduleAnchorWeekStart = this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate)
      this.scheduleDayMap = {}
      this.scheduleLoadedStart = ""
      this.scheduleLoadedEnd = ""
      this.scheduleHasMore = true
      this.scheduleHasUserScrolledDown = false
      this.loadInitialScheduleFourWeeks()
    },

    /**
     * 刷新数据
     */
    handleRefresh() {
      this.getScheduleData()
      /**
       * 刷新时也同步刷新滚动预加载缓存：
       * - 传统单周接口刷新 + 预加载区间刷新需保持一致
       */
      this.scheduleAnchorWeekStart = this.startOfWeekMonday(this.currentWeek?.[0]?.commonDate)
      this.scheduleDayMap = {}
      this.scheduleLoadedStart = ""
      this.scheduleLoadedEnd = ""
      this.scheduleHasMore = true
      this.scheduleHasUserScrolledDown = false
      this.loadInitialScheduleFourWeeks()
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
      //
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
      //
      // this.classDetailData = foundClass;
      // this.classSportType = sportType;
      // this.showClassDetailModal = true;
      //
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
            const result = res.result
            const messages = []
            // 判断课表更新状态
            if (result && result.classScheduleUpdateOk) {
              messages.push("课表删除成功")
            } else if (result && result.classScheduleUpdateOk === false) {
              messages.push("课表删除失败")
            }
            // 判断设备同步状态
            if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
              result.deviceSyncList.forEach((item) => {
                if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
                  const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
                  messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
                }
              })
            }
            const message = messages.length > 0 ? messages.join("<br>") : "课表删除成功"
            this.$message({
              message,
              dangerouslyUseHTMLString: message.includes("<br>"),
              type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
              duration: Math.max(2000, messages.length * 1000)
            })
            this.getScheduleData()
          }
        })
      } else {
        const res = await scheduleApi.deleteSchedule({
          id: classItem?.id,
          triUserId: this.selectedAthletic,
        })
        const result = res.result
        const messages = []
        // 判断课表更新状态
        if (result && result.classScheduleUpdateOk) {
          messages.push("课表删除成功")
        } else if (result && result.classScheduleUpdateOk === false) {
          messages.push("课表删除失败")
        }
        // 判断设备同步状态
        if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
          result.deviceSyncList.forEach((item) => {
            if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
              const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
              messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
            }
          })
        }
        const message = messages.length > 0 ? messages.join("<br>") : "课表删除成功"
        this.$message({
          message,
          dangerouslyUseHTMLString: message.includes("<br>"),
          type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
          duration: Math.max(2000, messages.length * 1000)
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
      this.activityDetailData = activity
      // this.showSportDetailModal = true;
      this.showEditScheduleClass = true
      this.isActivity = true
    },

    /**
     * 查看健康数据
     */
    handleViewHealthData(healthData) {
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
    handleCopyClassFromOfficial(classData, groupId, type) {
      // 课程数量限制 -- 后续根据待用功能添加
      // if (
      //   this.currentUserClassConfig.currentCount >=
      //   this.currentUserClassConfig.limitValue
      // ) {
      //   this.$message.error("超出课程数量上限");
      //   return;
      // }
      if (type === 'team') {
        this.copyClassFromOfficialClassId = classData.sourceClassId
      } else {
        this.copyClassFromOfficialClassId = classData.id
      }
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
        this.shareGroupList.forEach((item) => {
          if (item.classesList) {
            item.classesList.forEach((part) => {
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
      const classId = e.item.firstChild.dataset.id || e.item.dataset.id
      const date = e.to.dataset.date
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
          item.classSchedule.forEach((itemClass, oldIndex) => {
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
          currentData = JSON.parse(JSON.stringify(item.classSchedule))
          // 使用只包含课程的索引插入，避免健康数据和赛事影响排序
          currentData.splice(targetClassIndex, 0, newClassSchedule)
        }
      })

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
          identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
        })
        .then((res) => {
          if (res.success) {
            const result = res.result
            const messages = []
            // 判断课表更新状态
            if (result && result.classScheduleUpdateOk) {
              messages.push("课表移动成功")
            } else if (result && result.classScheduleUpdateOk === false) {
              messages.push("课表移动失败")
            }
            // 判断设备同步状态
            if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
              result.deviceSyncList.forEach((item) => {
                if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
                  const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
                  messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
                }
              })
            }
            const message = messages.length > 0 ? messages.join("<br>") : "课表移动成功"
            this.$message({
              message,
              dangerouslyUseHTMLString: message.includes("<br>"),
              type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
              duration: Math.max(2000, messages.length * 1000)
            })
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

      // 检查运动是否已经匹配过课表
      if (currentActivity.classScheduleId) {
        this.getScheduleData()
        this.$message.warning("该运动已经匹配过课表")
        return
      }

      // 判断是否从课程模板中拖拽
      if (type === "classTemplate") {
        currentClass = this.findClassById(classId)
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

      // 使用类型转换，支持字符串和数字类型匹配
      const competition = eventData.competitionList.find(
        (item) => String(item.id) === String(eventId)
      )
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
      const originalClassesJson = parseClassesJson(data.classesJson)
      await this.getAthleticThreshold(this.selectedAthletic, data.classesDate)

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
        identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
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
        return
      }

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
            identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
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
                  identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
                })
                .then((res) => {
                  // if (res.success) {
                  //   this.$message.success("匹配成功")
                  // } else {
                  //   this.$message.error(res.message)
                  // }
                  const result = res.result
                  const messages = []
                  // 判断课表更新状态
                  if (result && result.classScheduleUpdateOk) {
                    messages.push("匹配成功")
                  } else if (result && result.classScheduleUpdateOk === false) {
                    messages.push("匹配失败")
                  }
                  // 判断设备同步状态
                  if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
                    result.deviceSyncList.forEach((item) => {
                      if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
                        const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
                        messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
                      }
                    })
                  }
                  const message = messages.length > 0 ? messages.join("<br>") : "匹配成功"
                  this.$message({
                    message,
                    dangerouslyUseHTMLString: message.includes("<br>"),
                    type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
                    duration: Math.max(2000, messages.length * 1000)
                  })
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
          identityType: this.loginType === "1" ? "R" : "C", // R 运动员/C 教练
        })
        .then((res) => {
          if (res.success) {
            const result = res.result
            const messages = []
            // 判断课表更新状态
            if (result && result.classScheduleUpdateOk) {
              messages.push("匹配成功")
            } else if (result && result.classScheduleUpdateOk === false) {
              messages.push("匹配失败")
            }
            // 判断设备同步状态
            if (result && result.syncDevice && result.deviceSyncList && result.deviceSyncList.length > 0) {
              result.deviceSyncList.forEach((item) => {
                if (item.needSyncDevice && (item.deviceType === "1" || item.deviceType === 1 || item.deviceType === "2" || item.deviceType === 2)) {
                  const deviceName = item.deviceType === "1" || item.deviceType === 1 ? "高驰" : "佳明"
                  messages.push(item.deviceSyncOk ? `同步${deviceName}成功` : `同步${deviceName}失败`)
                }
              })
            }
            const message = messages.length > 0 ? messages.join("<br>") : "匹配成功"
            this.$message({
              message,
              dangerouslyUseHTMLString: message.includes("<br>"),
              type: messages.some((m) => m && m.includes("失败")) ? "warning" : "success",
              duration: Math.max(2000, messages.length * 1000)
            })
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
  /* 整个中间区域允许纵向滚动，横向滚动仍交给内部日历区域处理 */
  // overflow-y: auto;
  overflow-x: scroll;
  overflow-y: hidden;

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

.content-container {
  flex: 1;
  display: flex;
}

.type-change {
  flex: 0 0 240px;
  min-width: 0;
  height: 100vh;
  max-height: calc(100vh - 60px);
  background-color: #fff;
  overflow: visible;
  position: relative;
  transition: flex-basis 0.2s ease, width 0.2s ease;
  border-right: 1px solid #f0f0f0;

  @media (max-width: 1680px) {
    flex: 0 0 220px;
  }

  @media (max-width: 1440px) {
    flex: 0 0 200px;
  }

  @media (max-width: 1280px) {
    flex: 0 0 180px;
  }

  &.is-collapsed {
    flex: 0 0 0;
    width: 0;
    border-left: none;
    border-right: none;

    .type-change-inner {
      opacity: 0;
      pointer-events: none;
    }
  }
}

.type-change-inner {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;

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

.schedule-center-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.schedule-main-row {
  display: flex;
  flex: 1;
  width: 100%;
  min-width: 0;
}

.schedule-scroll-root {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
}

/* 向上加载提示：sticky 贴在滚动视口上沿，请求进行中始终可见（底部 footer 在顶部滚动时不可见） */
.schedule-scroll-loading-prev {
  position: sticky;
  top: 0;
  z-index: 8;
  flex-shrink: 0;
  text-align: center;
  padding: 8px 12px;
  font-size: 13px;
  color: #606266;
  background: rgba(255, 255, 255, 0.97);
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

/* 仅渲染一周时，固定日程区域高度 */
.schedule-scroll-root--single {
  height: calc(100vh - 60px);
  flex: 0 0 auto;
}

/* 收起按钮悬浮层：不占用布局高度，避免推挤内容 */
.right-stat-floating-handle-row {
  /* 固定在视口中间，不随滚动变化 */
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  pointer-events: none;

  /* 默认：统计栏展开时，按钮固定在统计栏左边缘（235px 宽，向左外扩 12px） */
  right: calc(235px - 12px);

  &.is-collapsed {
    /* 收起后统计栏宽度为 0，按钮贴右侧 */
    right: 0;
  }

  /* 覆盖原有绝对定位规则（原规则依赖 right-stat-wrapper） */
  .panel-collapse-handle {
    pointer-events: auto;
    position: static;
    transform: none;
  }
}

.schedule-main-row--week {
  flex: 0 0 auto;
}

.schedule-calendar-week {
  flex: 1 1 auto;
  min-width: 0;
}

.schedule-sentinel {
  height: 1px;
  margin: 0;
  pointer-events: none;
}

.schedule-scroll-footer {
  text-align: center;
  padding: 10px 0;
  font-size: 13px;
  color: #909399;
}

.right-stat-wrapper {
  position: relative;
  flex: 0 0 235px;
  width: 235px;
  // max-height: calc(100vh - 60px);
  // overflow-y: auto;
  // overflow-x: scroll;
  transition: flex-basis 0.2s ease, width 0.2s ease;
  border-left: 1px solid #e5e5e5;
  background: #fff;

  &.is-collapsed {
    flex: 0 0 0;
    width: 0;
    overflow: visible;
    border-left: none;

    /* 收起时隐藏内部内容，仅保留把手 */
    > :not(.panel-collapse-handle) {
      opacity: 0;
      pointer-events: none;
    }

    .panel-collapse-handle--right {
      left: -22px;
    }
  }

  /* 自定义滚动条样式（与左侧栏保持一致） */
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

.panel-collapse-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 40px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  color: #666;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #f7f8fa;
    color: #333;
  }
}

.panel-collapse-handle--right {
  left: -12px;
}

.class-container-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
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

    .avatar-with-frame {
      position: relative;
      flex-shrink: 0;

      &.avatar-with-frame--sm {
        width: 20px;
        height: 20px;

        .avatar-frame {
          width: 20px;
          height: 20px;
        }

        .athletic-avatar {
          width: 100%;
          height: 100%;
        }

        &.has-frame .athletic-avatar {
          width: 16px;
          height: 16px;
        }
      }

      .avatar-frame {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: contain;
        pointer-events: none;
        z-index: 0;
      }

      .athletic-avatar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        object-fit: cover;
        display: block;
        z-index: 1;
      }
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
  max-height: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .athletic-dropdown-search {
    flex-shrink: 0;
    padding: 8px;
    border-bottom: 1px solid #ebeef5;

    .el-input__inner {
      border-radius: 4px;
    }
  }

  .athletic-dropdown-list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
    }
  }

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

    .avatar-with-frame.avatar-with-frame--menu {
      position: relative;
      width: 24px;
      height: 24px;
      flex-shrink: 0;

      .avatar-frame {
        position: absolute;
        top: 0;
        left: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: contain;
        pointer-events: none;
        z-index: 0;
      }

      .athletic-menu-avatar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        z-index: 1;
      }

      &.has-frame .athletic-menu-avatar {
        width: 20px;
        height: 20px;
      }
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
  min-height: 58px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
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

/* 右侧统计栏展开时，让头部背景延伸到统计栏下方，小屏下视觉上“占满” */
.schedule-top--with-right-panel {
  margin-right: -235px;

  @media (max-width: 1680px) {
    margin-right: -220px;
  }

  @media (max-width: 1280px) {
    margin-right: -200px;
  }
}
</style>
