<template>
  <div class="plan-container">
    <!-- 课程类型切换 -->
    <div class="plan-type-list">
      <div class="class-type-item"
        :class="{ 'active-title': activeClassType === 'my' }"
        @click="handleClassTypeChange('my')">
        <div class="title"
          :class="{ 'active-title': activeClassType === 'my' }">
          我的计划
        </div>
        <div class="title-icon" v-if="activeClassType === 'my'"></div>
      </div>
      <div class="class-type-item"
        :class="{ 'active-title': activeClassType === 'team' }"
        @click="handleClassTypeChange('team')"
        v-if="loginType === '2'">
        <div class="title"
          :class="{ 'active-title': activeClassType === 'team' }">
          团队计划
        </div>
        <div class="title-icon" v-if="activeClassType === 'team'">
        </div>
      </div>
      <div class="class-type-item"
        :class="{ 'active-title': activeClassType === 'official' }"
        @click="handleClassTypeChange('official')">
        <div class="title"
          :class="{ 'active-title': activeClassType === 'official' }"
          style="color: #FFFFFF; font-size: 14px;">
          <img src="../../../assets/plan/Group.svg" alt="计划示例"
            style="width: 100%; height:32px;">
          <!-- 计划示例 -->
        </div>
        <div class="title-icon" v-if="activeClassType === 'official'">
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="class-operation">
      <el-popover v-if="activeClassType === 'my' && showAddClassBtn"
        placement="bottom" width="160" trigger="click"
        popper-class="add-class-btn-popover">
        <el-button type="primary" size="mini"
          slot="reference">新增</el-button>
        <div
          style="display: flex; flex-direction: column; gap: 6px; width: 100px">
          <span>
            <div class="add-class-btn" @click="$emit('add-plan')">新增计划
            </div>
          </span>
          <span>
            <div class="add-class-btn" @click="$emit('add-group')">
              新增分组
            </div>
          </span>
        </div>
      </el-popover>

      <el-input size="mini" v-model="searchInput"
        @input="handleSearch" clearable>
        <el-button slot="append" icon="el-icon-search"
          @click="handleSearch"></el-button>
      </el-input>
    </div>

    <!-- 课程列表 -->
    <div class="schedule-plan-container"
      v-if="activeClassType !== 'team'">
      <el-collapse v-model="activeCollapse" accordion
        @change="$emit('collapse-change')" v-loading="loading">
        <el-collapse-item v-for="item in classList"
          :key="item.groupId" :name="String(item.groupId)">
          <template slot="title">
            <div class="schedule-class-title">
              <div class="group-name">
                <span
                  class="group-name-text">{{ item.groupName }}</span>
                <span class="group-name-count">({{ item.classesCount
                  }})</span>
              </div>
              <el-popover
                v-if="activeClassType === 'my' && showAddClassBtn"
                popper-class="athletic-btn-popover"
                placement="right" width="80" trigger="hover">
                <div class="group-operations">
                  <span>
                    <el-button type="text"
                      @click="$emit('add-plan', item.groupId)">
                      新增计划
                    </el-button>
                  </span>
                  <span>
                    <el-button type="text" :disabled="!item.groupId"
                      @click="$emit('edit-group', item)">
                      编辑分组
                    </el-button>
                  </span>
                  <!-- <span>
                    <el-button
                      type="text"
                      :disabled="!item.groupId"
                      @click="$emit('move-group', item.groupId)"
                    >
                      移动分组
                    </el-button>
                  </span> -->
                  <span>
                    <el-button type="text" :disabled="!item.groupId"
                      @click="$emit('delete-group', item)">
                      删除分组
                    </el-button>
                  </span>
                </div>
                <i class="el-icon-more" slot="reference"
                  @click.stop></i>
              </el-popover>
            </div>
          </template>

          <div class="plan-js-class-drag-container"
            :key="item.timespan">
            <div class="plan-item"
              :class="{ active: selectedPlanId === classItem.id }"
              v-for="classItem in item.classesList"
              :key="classItem.id"
              @click.stop="$emit('choose-plan', classItem.id, item.groupId)">
              <el-popover placement="right" width="320px"
                trigger="hover"
                :disabled="!classItem.planTitle"
                popper-class="hover-plan-detail-popover">
                <!-- <span slot="reference" @click.stop>{{ classItem.planTitle }}</span> -->
                <span slot="reference"
                  style="width: 100%; cursor: pointer">
                  <div style="width: 100%; cursor: pointer">
                    {{ classItem.planTitle }}
                  </div>
                  <div class="plan-item-meta">
                    <el-rate v-model="classItem.level"
                      :allow-half="true"
                      disabled
                      :colors="['#F92B30', '#F92B30', '#F92B30']"
                      text-color="#999999"
                      disabled-void-color="#E1E4EC"></el-rate>
                    <span class="plan-item-score-text"
                      v-if="!classItem.level">{{
                        classItem.level ? "" : "未评分"
                      }}</span>
                    <span v-if="classItem.isShare"
                     style="width: auto;"
                      class="plan-item-share-tag">{{
                        classItem.isShare ? "已分享" : ""
                      }}</span>
                  </div>
                </span>
                <HoverPlanDetail :planInfo="classItem"
                  :activeClassType="activeClassType"
                  @move="handleMovePlan">
                </HoverPlanDetail>
              </el-popover>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 团队计划 -->
    <!-- <div class="team-operation" v-if="activeClassType === 'team'">
      <ShareTree
        ref="shareTreeRef"
        :search-input="searchInput"
        @add-share-group="handleAddShareGroup"
        @edit-share-group="handleEditShareGroup"
        @delete-share-group="handleDeleteShareGroup"
        @move-share-group="handleMoveShareGroup"
        @view-plan="handleViewPlan"
      />
    </div> -->
    <!-- 团队计划 -->
    <div class="team-operation" v-if="activeClassType === 'team'">
      <div class="team-operation-container"
        v-for="shareItem in teamPlanList" :key="shareItem.id">
        <div class="team-operation-item"
          :class="{ 'is-active': currentShareTeamId === shareItem.id }"
          @click="handleShareTeamClick(shareItem.id)">
          <span
            class="team-operation-item-title-text">{{ shareItem.name }}</span>
          <i class="el-icon-arrow-right team-operation-arrow"></i>
        </div>
        <div class="team-operation-content"
          v-show="currentShareTeamId === shareItem.id">
          <el-collapse v-model="activeCollapse" accordion
            @change="handleShareGroupCollapseChange"
            v-loading="loading">
            <el-collapse-item v-for="item in currentShareGroupList"
              :key="item.id" :name="String(item.id)">
              <template slot="title">
                <div class="schedule-class-title">
                  <div class="group-name">
                    <span
                      class="group-name-text">{{ item.groupName }}</span>
                    <span class="group-name-count">({{ item.groupCount
                      }})</span>
                  </div>
                  <el-popover popper-class="athletic-btn-popover"
                    placement="right" width="80" trigger="hover">
                    <div class="group-operations">
                      <span>
                        <el-button type="text"
                          @click="handleAddShareGroup(item)">
                          新增分组
                        </el-button>
                      </span>
                      <span>
                        <el-button type="text" :disabled="!item.id"
                          @click="handleEditShareGroup(item)">
                          编辑分组
                        </el-button>
                      </span>
                      <!-- <span>
                    <el-button
                      type="text"
                      :disabled="!item.groupId"
                      @click="$emit('move-group', item.groupId)"
                    >
                      移动分组
                    </el-button>
                  </span> -->
                      <span>
                        <el-button type="text" :disabled="!item.id"
                          @click="handleDeleteShareGroup(item)">
                          删除分组
                        </el-button>
                      </span>
                    </div>
                    <i class="el-icon-more" slot="reference"
                      @click.stop></i>
                  </el-popover>
                </div>
              </template>

              <div class="plan-js-class-drag-container"
                :key="item.groupId ?? item.id">
                <div class="plan-item"
                  :class="{ active: selectedPlanId === classItem.sourcePlanId }"
                  v-for="classItem in item.classesList"
                  :key="classItem.id"
                  @click.stop="handleSharePlanClick(classItem)">
                  <el-popover placement="right" width="320px"
                    trigger="hover" :disabled="!classItem.planTitle"
                    popper-class="hover-plan-detail-popover">
                    <!-- <span slot="reference" @click.stop>{{ classItem.planTitle }}</span> -->
                    <span slot="reference"
                      style="width: 100%; cursor: pointer">
                      <div style="width: 100%; cursor: pointer">
                        {{ classItem.planTitle }}
                      </div>
                      <div class="plan-item-meta">
                        <el-rate v-model="classItem.level"
                          :allow-half="true" disabled
                          :colors="['#F92B30', '#F92B30', '#F92B30']"
                          text-color="#999999"
                          disabled-void-color="#E1E4EC"></el-rate>
                        <span class="plan-item-score-text">{{
                            classItem.level ? "" : "未评分"
                          }}</span>
                      </div>
                    </span>
                    <HoverPlanDetail :planInfo="classItem"
                      :activeClassType="activeClassType"
                      @move="handleMoveShareGroup"></HoverPlanDetail>
                  </el-popover>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from "../../classManagement/uilt"
import HoverPlanDetail from "./HoverPlanDetail/index.vue"
// import ShareTree from "./ShareTree.vue";
import { getData } from "@/api/common.js"
import { userApi } from "../services/planManagement"
export default {
  name: "PlanList",
  components: {
    HoverPlanDetail,
    // ShareTree,
  },
  props: {
    classList: {
      type: Array,
      default: () => [],
    },
    activeClassType: {
      type: String,
      default: "my",
    },
    showAddClassBtn: {
      type: Boolean,
      default: true,
    },
    selectedPlanId: {
      type: [String, Number],
      default: null,
    },
    currentPlanGroupId: {
      type: [String, Number],
      default: null,
    },
    selectedTeam: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      searchInput: "",
      activeCollapse: null,
      loading: false,
      loginType: localStorage.getItem("loginType") || "1",
      teamPlanList: [],
      teamPlanSearchKeyword: "",
      currentShareTeamId: '',
      currentShareGroupList: [],
      currentSharePlanList: [],
    }
  },
  watch: {
    currentPlanGroupId: {
      handler(newVal) {
        // 如果有值，尝试展开
        if (newVal != null && newVal !== "") {
          // 延迟执行，确保 classList 已更新
          this.$nextTick(() => {
            this.tryExpandGroup()
          })
        }
      },
      immediate: true,
    },
    classList: {
      handler(newList) {
        // 当列表更新时隐藏 loading
        this.loading = false
        // 当列表更新时，如果 currentPlanGroupId 有值且对应的分组存在，则展开
        if (
          this.currentPlanGroupId != null &&
          Array.isArray(newList) &&
          newList.length > 0
        ) {
          this.$nextTick(() => {
            this.tryExpandGroup()
          })
        }
      },
      immediate: true,
      deep: true,
    },
    activeClassType: {
      handler(newVal, oldVal) {
        if (oldVal === undefined || newVal === oldVal) return
        this.searchInput = ""
        this.activeCollapse = null
        this.currentShareTeamId = ""
        this.currentShareGroupList = []
        this.currentSharePlanList = []
        if (newVal === "team") {
          this.getTeamPlanList(this.teamPlanSearchKeyword)
        }
      },
      immediate: false,
    },
  },
  mounted() {
    // 组件挂载后，延迟检查以确保数据已加载
    // 使用 setTimeout 确保在异步数据加载完成后也能展开
    this.handleClassTypeChange(this.activeClassType)
    setTimeout(() => {
      this.tryExpandGroup()
    }, 100)
  },
  created() {
    this.emitSearch = debounce(() => {
      this.$emit("search", this.searchInput)
    }, 500)
  },
  methods: {
    handleClassTypeChange(type) {
      // 清空搜索输入
      this.searchInput = ""
      this.$emit("update:activeClassType", type)
      // 触发 class-type-change 事件，让父组件处理类型切换
      this.$emit("class-type-change", type)
      this.currentShareTeamId = ''
      this.currentShareGroupList = []
      this.currentSharePlanList = []
      // 切换到 team 类型时，触发重新加载团队列表（使用 coach-teams-share 全量返回）
      if (type === "team") {
        this.getTeamPlanList(this.teamPlanSearchKeyword)
        // this.$emit("reload-team-list");
        // // 重置 el-tree 的当前选中节点
        // this.$nextTick(() => {
        //   if (this.$refs.shareTreeRef) {
        //     this.$refs.shareTreeRef.resetCurrentKey();
        //   }
        // });
      }
    },
    async locateTeamPlan({ teamId, groupId }) {
      if (!teamId) return
      if (!Array.isArray(this.teamPlanList) || this.teamPlanList.length === 0) {
        await this.getTeamPlanList(this.teamPlanSearchKeyword)
      }
      this.currentShareTeamId = teamId
      const team = this.teamPlanList.find((t) => String(t.id) === String(teamId))
      if (team && Array.isArray(team.groups)) {
        this.currentShareGroupList = this.mapTeamPlanGroupsToShareGroupList(
          team.groups,
          teamId
        )
      } else {
        this.currentShareGroupList = []
      }
      if (groupId != null && groupId !== "") {
        this.$nextTick(() => {
          this.activeCollapse = String(groupId)
        })
      }
    },
    async locateAndSelectTeamPlan({ teamId, groupId, planId }) {
      if (!planId) return { selected: false, teamId: null, groupId: null }
      const targetPlanId = String(planId)
      if (!Array.isArray(this.teamPlanList) || this.teamPlanList.length === 0) {
        await this.getTeamPlanList(this.teamPlanSearchKeyword, {
          ignoreSelectedTeamFilter: true,
        })
      }

      let resolvedTeamId = teamId
      let resolvedGroup = null
      let resolvedPlan = null

      const tryResolveFromCurrentGroupList = () => {
        const group = this.currentShareGroupList.find(
          (g) =>
            Array.isArray(g.classesList) &&
            g.classesList.some(
              (c) => String(c.sourcePlanId || c.id) === targetPlanId
            )
        )
        if (!group) return false
        const plan = group.classesList.find(
          (c) => String(c.sourcePlanId || c.id) === targetPlanId
        )
        if (!plan) return false
        resolvedGroup = group
        resolvedPlan = plan
        return true
      }

      if (resolvedTeamId) {
        await this.locateTeamPlan({ teamId: resolvedTeamId, groupId })
        tryResolveFromCurrentGroupList()
      }

      if (!resolvedGroup || !resolvedPlan) {
        await this.getTeamPlanList(this.teamPlanSearchKeyword, {
          ignoreSelectedTeamFilter: true,
        })
        for (const team of this.teamPlanList) {
          const mappedGroups = this.mapTeamPlanGroupsToShareGroupList(
            team.groups || [],
            team.id
          )
          const group = mappedGroups.find(
            (g) =>
              Array.isArray(g.classesList) &&
              g.classesList.some(
                (c) => String(c.sourcePlanId || c.id) === targetPlanId
              )
          )
          if (group) {
            const plan = group.classesList.find(
              (c) => String(c.sourcePlanId || c.id) === targetPlanId
            )
            if (plan) {
              resolvedTeamId = team.id
              this.currentShareTeamId = team.id
              this.currentShareGroupList = mappedGroups
              resolvedGroup = group
              resolvedPlan = plan
              break
            }
          }
        }
      }

      if (!resolvedGroup || !resolvedPlan || !resolvedTeamId) {
        return { selected: false, teamId: null, groupId: null }
      }

      this.activeCollapse = String(resolvedGroup.id)
      const emitPlanId = resolvedPlan.sourcePlanId || resolvedPlan.id
      const emitTeamId =
        resolvedGroup.teamId != null ? resolvedGroup.teamId : resolvedTeamId
      this.$emit("view-plan", emitPlanId, {
        ...resolvedPlan,
        teamId: emitTeamId,
      })
      return {
        selected: true,
        teamId: emitTeamId,
        groupId: resolvedGroup.id,
      }
    },
    async getTeamPlanList(nameKeyword, options = {}) {
      const _this = this
      const params = {
        url: "/gateway/training/teamShare/coach-teams-share",
        shareDataType: 2,
      }
      const ignoreSelectedTeamFilter = !!options.ignoreSelectedTeamFilter
      if (
        !ignoreSelectedTeamFilter &&
        this.selectedTeam != null &&
        this.selectedTeam !== ""
      ) {
        params.teamId = this.selectedTeam
      }
      if (nameKeyword != null && String(nameKeyword).trim() !== "") {
        params.nameKeyword = String(nameKeyword).trim()
      }
      const res = await getData(params)
      if (res && res.success && Array.isArray(res.result)) {
        _this.teamPlanList = res.result.map((t) => ({
          id: t.teamId,
          name: t.teamName,
          totalCount: t.totalCount,
          groups: t.groups || [],
        }))
        if (this.currentShareTeamId) {
          const team = res.result.find(
            (t) => String(t.teamId) === String(this.currentShareTeamId)
          )
          this.currentShareGroupList = team
            ? this.mapTeamPlanGroupsToShareGroupList(
              team.groups || [],
              this.currentShareTeamId
            )
            : []
        }
        _this.loading = false
        console.log(_this.teamPlanList, "list--团队计划列表")
      } else {
        _this.teamPlanList = []
        _this.loading = false
      }
    },
    mapTeamPlanGroupsToShareGroupList(groups, teamId) {
      const list = Array.isArray(groups) ? groups : []
      return list.map((g) => ({
        id: g.groupId,
        groupId: g.groupId,
        groupName: g.groupName || "未分组",
        groupCount: (g.plansList || []).length,
        teamId: teamId || g.teamId,
        classesList: (g.plansList || []).map((p) => ({ ...p, planType: "share" })),
      }))
    },
    // 点击团队（从已加载的 teamPlanList 取 groups，不再请求接口）
    handleShareTeamClick(id) {
      const isSameTeam = String(this.currentShareTeamId) === String(id)
      if (isSameTeam) {
        this.currentShareTeamId = ''
        this.currentShareGroupList = []
        return
      }
      this.currentShareTeamId = id
      const team = this.teamPlanList.find((t) => String(t.id) === String(id))
      if (team && Array.isArray(team.groups)) {
        this.currentShareGroupList = this.mapTeamPlanGroupsToShareGroupList(
          team.groups,
          id
        )
      } else {
        this.currentShareGroupList = []
      }
    },
    handleShareGroupCollapseChange(activeNames) {
      if (activeNames == null || activeNames === "") return
      // 分组与计划数据已由 coach-teams-share 接口全部返回，无需再请求
    },
    handleSharePlanClick(node) {
      console.log('====点击了分享计划', node)
      // 保持当前分组展开：找到该计划所在分组并设为激活，避免 accordion 折叠
      const group = this.currentShareGroupList.find(
        (g) => g.classesList && g.classesList.some((c) => c.sourcePlanId === node.sourcePlanId || c.id === node.id)
      )
      if (group && group.id != null) {
        this.$nextTick(() => {
          this.activeCollapse = String(group.id)
        })
      }
      const teamId = group && (group.teamId != null ? group.teamId : group.id)
      this.$emit("view-plan", node.sourcePlanId, { ...node, teamId })
    },
    handleSearch() {
      if (this.activeClassType === "team") {
        this.teamPlanSearchKeyword = this.searchInput
        this.getTeamPlanList(this.searchInput)
      }
      if (this.emitSearch) {
        this.emitSearch()
      }
    },
    /**
     * 检查指定的 groupId 是否存在于 classList 中
     * @param {String|Number} groupId - 分组ID
     * @returns {Boolean} 是否存在
     */
    isGroupExists(groupId) {
      // 检查 groupId 是否有效（不为空字符串、null、undefined，但允许0）
      if (
        groupId == null ||
        groupId === "" ||
        !Array.isArray(this.classList) ||
        this.classList.length === 0
      ) {
        return false
      }
      // 转换为字符串进行比较，支持数字和字符串类型
      const targetId = String(groupId)
      return this.classList.some((item) => {
        if (!item || item.groupId == null) return false
        return String(item.groupId) === targetId
      })
    },
    /**
     * 尝试展开指定的分组
     */
    tryExpandGroup() {
      if (
        this.currentPlanGroupId != null &&
        this.isGroupExists(this.currentPlanGroupId)
      ) {
        this.$nextTick(() => {
          this.activeCollapse = String(this.currentPlanGroupId)
        })
      }
    },
    handleAddShareGroup(node) {
      this.$emit("add-share-group", node)
    },
    handleEditShareGroup(node) {
      this.$emit("edit-share-group", node)
    },
    handleDeleteShareGroup(node) {
      this.$emit("delete-share-group", node)
    },
    handleMoveShareGroup(node, planInfo) {
      console.log(node, "node====移动分享计划", this.currentShareTeamId)
      console.log(planInfo, "planInfo====当前计划信息")
      this.$emit("move-share-group", { ...node, teamId: this.currentShareTeamId, }, planInfo)
    },
    handleViewPlan(sourcePlanId, data) {
      this.$emit("view-plan", sourcePlanId, data)
    },
    /**
     * 处理添加分组
     */
    handleAddGroup() {
      this.$emit("add-group")
    },
    /**
     * 处理编辑分组
     */
    handleEditGroup(node) {
      if (node && node.data) {
        this.$emit("edit-group", {
          groupId: node.data.id,
          groupName: node.data.label || node.data.groupName,
        })
      }
    },
    /**
     * 处理删除分组
     */
    handleDeleteGroup(node) {
      if (node && node.data) {
        this.$emit("delete-group", {
          groupId: node.data.id,
          groupName: node.data.label || node.data.groupName,
        })
      }
    },
    /**
     * 刷新团队树数据/分享分组列表（重新拉取 coach-teams-share，接口会返回全量含 groups）
     */
    refreshTeamTree() {
      this.getTeamPlanList(this.teamPlanSearchKeyword)
    },
    handleMovePlan(planDetail) {
      this.$emit("move-plan", planDetail)
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep(.el-rate) {
  width: auto;
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.plan-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 1px solid #e5e5e5;

  .plan-type-list {
    height: 46px;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 12px;
    gap: 5px;
    border-bottom: 1px solid #01010126;
    box-sizing: border-box;

    @media (max-width: 1680px) {
      padding: 0 12px;
      gap: 5px;
    }

    @media (max-width: 1440px) {
      padding: 0 10px;
      gap: 5px;
    }

    @media (max-width: 1280px) {
      padding: 0 8px;
      gap: 5px;
    }

    .class-type-item {
      padding-top: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .title {
        width: 69px;
        height: 32px;
        // border-radius: 6px;
        text-align: center;
        color: #939393;
        border-bottom: 4px solid transparent;
        font-family: PingFang SC;
        font-weight: 400;
        font-style: Regular;
        font-size: 15px;
        line-height: 32px;
        letter-spacing: 0%;
        cursor: pointer;

        @media (max-width: 1680px) {
          width: 62px;
          font-size: 13px;
        }

        @media (max-width: 1440px) {
          width: 56px;
          font-size: 12px;
        }

        @media (max-width: 1280px) {
          width: 50px;
          font-size: 11px;
        }
      }

      .title-icon {
        width: 60px;
        height: 3px;
        background: #f92b30;

        @media (max-width: 1680px) {
          width: 54px;
        }

        @media (max-width: 1440px) {
          width: 48px;
        }

        @media (max-width: 1280px) {
          width: 42px;
        }
      }

      .active-title {
        font-family: PingFang SC;
        font-weight: 500;
        font-style: Medium;
        font-size: 15px;
        color: #101010;
        // border-bottom: 4px solid #f92b30;

        @media (max-width: 1680px) {
          font-size: 13px;
        }

        @media (max-width: 1440px) {
          font-size: 12px;
        }

        @media (max-width: 1280px) {
          font-size: 11px;
        }
      }
    }
  }

  .class-operation {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 12px 10px;

    :deep(.el-button) {
      margin-left: 0;
    }

    :deep(.el-input) {
      flex: 1;
      min-width: 0;
    }

    @media (max-width: 1280px) {
      flex-wrap: wrap;
    }

    @media (max-width: 1280px) {
      :deep(.el-button) {
        flex: 1 1 100%;
      }

      :deep(.el-input) {
        flex-basis: 100%;
      }
    }
  }

  .schedule-plan-container {
    padding: 5px 5px;
    background-color: #fff;
    flex: 1;
    overflow-y: auto;

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

    .schedule-class-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 200px;
      padding: 0 10px;

      @media (max-width: 1680px) {
        width: 168px;
      }

      @media (max-width: 1440px) {
        width: 148px;
      }

      @media (max-width: 1280px) {
        width: 128px;
      }

      .group-name {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 5px;
        width: 80%;

        .group-name-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (max-width: 1680px) {
            font-size: 12px;
          }

          @media (max-width: 1440px) {
            font-size: 11px;
          }

          @media (max-width: 1280px) {
            font-size: 10px;
          }
        }

        .group-name-count {
          @media (max-width: 1680px) {
            font-size: 12px;
          }

          @media (max-width: 1440px) {
            font-size: 11px;
          }

          @media (max-width: 1280px) {
            font-size: 10px;
          }
        }
      }
    }
  }
}

.group-operations {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plan-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid#c3c9d72e;
  width: 100%;

  // background-color: #f9f9f9;
}

.plan-item:first-child {
  border-top: 1px solid #c3c9d72e;
}

.plan-item:last-child {
  border-bottom: none;
}

.plan-item:hover {
  background-color: #f1f1f1;
  cursor: pointer;
}

.plan-item:active {
  background-color: #c3c9d72e;
  cursor: pointer;
}

.plan-item.active {
  // color: #cc2323;
  // background-color: rgba(204, 35, 35, 0.15);
  background: #c3c9d72e;
}

.plan-item.active:first-child {
  border-bottom: 1px solid#01010126;
  border-top: 1px solid #c3c9d72e;
}

.plan-item.active:last-child {
  border-bottom: 1px solid #c3c9d72e;
  border-bottom: none;
}

.plan-item ::v-deep(.el-rate__icon) {
  font-size: 16px;
}

.plan-item-meta {
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  overflow: visible;
  min-width: 0;
}

.plan-item-score-text {
  font-size: 10px;
  color: #979fb0;
  white-space: nowrap;
  flex-shrink: 0;
}

.plan-item-share-tag {
  font-size: 10px;
  color: #979fb0;
  background: #c3c9d740;
  padding: 3px 5px;
  border-radius: 3px;
  text-align: center;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-class-btn {
  width: 84px;
  height: 32px;
  text-align: center;
  line-height: 32px;
  border-radius: 5px;
  font-size: 14px;
  color: #101010;

  &:hover {
    cursor: pointer;
    background-color: #c3c9d740;
    font-weight: 600;
  }
}

// 弹框样式优化
.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}

// 搜索框样式
// .el-input {
//     .el-input-group__append {
//         background-color: #409eff;
//         border-color: #409eff;
//         .el-button {
//             color: #fff;
//             &:hover {
//                 background-color: #66b1ff;
//             }
//         }
//     }
// }

// 邀请弹框样式
.invite-dialog {
  .el-dialog__header {
    text-align: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 20px;
    text-align: center;
  }
}

.invite-content {
  padding: 30px 40px;
  text-align: center;

  .invite-illustration {
    // margin-bottom: 20px;

    .athlete-illustration {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      .athlete-figure {
        width: 40px;
        height: 40px;
        background: #ff4757;
        border-radius: 50%;
        position: relative;

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
        }

        &::after {
          content: "";
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(45deg, #ff4757, #ff6b7a);
          border-radius: 50%;
          z-index: -1;
        }
      }
    }
  }

  .invite-title {
    font-size: 20px;
    color: #101010;
    font-family: PingFang SC;
    font-weight: 600;
    font-style: Semibold;
    font-size: 16px;
  }

  .invite-description {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 25px;
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    margin-top: 10px;

    div {
      margin-bottom: 5px;
    }
  }

  .invite-code-container {
    background: #f92b300d;
    border: 1px solid #f92b30;
    border-radius: 8px;
    padding: 15px 15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .invite-code-label {
      color: #101010;
      font-family: PingFang SC;
      font-weight: 400;
      font-style: Regular;
      font-size: 14px;
    }

    .invite-code-value {
      font-family: PingFang SC;
      font-weight: 600;
      font-style: Semibold;
      font-size: 14px;
      color: #f92b30;
    }
  }

  .invite-code-tip {
    font-family: PingFang SC;
    font-weight: 400;
    font-style: Regular;
    font-size: 12px;
    color: #939393;
  }
}

.invite-footer {
  display: flex;
  justify-content: center;
  gap: 15px;

  .copy-btn {
    background: #f92b30;
    border: 1px solid #f92b30;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 8px;

    &:hover {
      background: #ff3742;
      border-color: #ff3742;
    }
  }

  .regenerate-btn {
    border-color: #101010;
    background: #101010;
    color: #fff;
    padding: 12px 30px;
    font-size: 14px;
    font-weight: 500;
    font-family: PingFang SC;
    font-weight: 500;
    font-style: Medium;
    line-height: 8px;

    &:hover {
      background: #555;
      border-color: #555;
    }
  }
}

.team-operation-container {
  .team-operation-item {
    height: 44px;
    font-size: 14px;
    color: #101010;
    line-height: 44px;
    text-align: center;
    cursor: pointer;
    border-bottom: 1px solid #e6ebf5;
    background-color: #f6f7f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;

    @media (max-width: 1680px) {
      font-size: 12px;
      height: 38px;
      line-height: 38px;
    }

    @media (max-width: 1440px) {
      font-size: 11px;
    }

    @media (max-width: 1280px) {
      font-size: 10px;
    }

    .team-operation-arrow {
      transition: transform 0.2s ease;
    }

    &.is-active .team-operation-arrow {
      transform: rotate(90deg);
    }
  }

  .team-operation-content {
    padding: 0 1px;
    box-sizing: border-box;

    .schedule-class-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 198px;
      padding: 0 10px;

      @media (max-width: 1680px) {
        width: 168px;
      }

      @media (max-width: 1440px) {
        width: 148px;
      }

      @media (max-width: 1280px) {
        width: 128px;
      }

      .group-name {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 5px;
        width: 80%;

        .group-name-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          @media (max-width: 1680px) {
            font-size: 12px;
          }

          @media (max-width: 1440px) {
            font-size: 11px;
          }

          @media (max-width: 1280px) {
            font-size: 10px;
          }
        }

        .group-name-count {
          @media (max-width: 1680px) {
            font-size: 12px;
          }

          @media (max-width: 1440px) {
            font-size: 11px;
          }

          @media (max-width: 1280px) {
            font-size: 10px;
          }
        }
      }
    }
  }
}
</style>
