/**
 * 计划管理API服务
 */

import { getData, submitData } from "@/api/common.js";
/**
 * 计划相关API
 */
export const planApi = {
  // 获取用户计划列表（按分组）
  getPlansByUserId(titleKeyword = "") {
    return getData({
      url: "/training/api/planClasses/listWithPlans",
      titleKeyword,
    });
  },

  // 获取官方计划
  getOfficialPlans(titleKeyword = "") {
    return getData({
      url: "/training/api/planClasses/official/listWithPlans",
      titleKeyword,
    });
  },

  // 创建个人计划
  createSelfPlan(data) {
    return submitData({
      url: "/training/api/planClasses/createPlanClasses",
      requestData: data,
    });
  },

  // 根据官方计划创建计划
  createSelfPlanByOffice(data) {
    return submitData({
      url: "/training/api/planClasses/importOfficialPlan",
      requestData: data,
    });
  },

  // 获取团队计划
  getTeamPlans(shareDataType) {
    return getData({
      url: `/training/api/teamShare/summary?shareDataType=${shareDataType}`,
    });
  },

  // 添加计划
  addPlan(data) {
    return submitData({
      url: "/training/api/planClasses/createPlanClasses",
      requestData: data,
    });
  },

  // 更新计划
  updatePlan(data) {
    return submitData({
      url: "/training/api/planClasses/updatePlanClassesDayDetail",
      requestData: data,
    });
  },

  // 获取计划详情
  getPlanDetail(id) {
    return getData({
      url: `/gateway/training/planClasses/getPlanClassesById?id=${id}`,
    });
  },

  // 获取计划详情
  getPlanDayDetail(id) {
    return getData({
      url: `/training/api/planClasses/getPlanClassesDayDetail?planClassesId=${id}`,
    });
  },

  // 删除计划
  deletePlan(id) {
    return submitData({
      url: `/training/api/planClasses/delete`,
      requestData: {
        id,
      },
    });
  },

  // 计划限制数量
  getPlanLimitCount() {
    return getData({
      url: "/training/api/planClasses/getUserPlanClassesCount",
    });
  },
};

/**
 * 分组相关API
 */
export const groupApi = {
  // 删除分组
  deleteGroup(id) {
    return submitData({
      url: `/training/api/planClassesGroup/deletePlanClassesGroup?id=${id}`,
    });
  },
  // 删除分享分组
  deleteShareGroup(params) {
    return submitData({
      url: `/training/api/shareTeamGroup/delete`,
      requestData: params,
    });
  },
};

export const teamApi = {
  // 获取我的团队
  getMyTeam() {
    return getData({
      url: "/gateway/team/my-team",
    });
  },
  // 获取团队列表
  getAllTeamList() {
    return getData({
      url: "/consumer/api/team/coach/all-teams",
    });
  },

  // 获取团队详情
  getTeamDetail(id) {
    return getData({
      url: `/consumer/api/team/info/${id}`,
    });
  },
  // 获取主教练或助教的团队列表(仅团队不含俱乐部)
  // GET /gateway/team/query/coach-teams
  // query:
  // - triUserId: 运动员用户ID
  // - filterType: 过滤数据Type（1-分享）
  // - filterDataId: 过滤数据ID
  // - filterDataType: 过滤数据type
  getCoachTeams(params = {}) {
    const { triUserId, filterType, filterDataId, filterDataType } = params || {};
    const query = []
      .concat(
        triUserId ? [`triUserId=${encodeURIComponent(triUserId)}`] : []
      )
      .concat(
        typeof filterType !== "undefined"
          ? [`filterType=${encodeURIComponent(filterType)}`]
          : []
      )
      .concat(
        typeof filterDataId !== "undefined"
          ? [`filterDataId=${encodeURIComponent(filterDataId)}`]
          : []
      )
      .concat(
        typeof filterDataType !== "undefined"
          ? [`filterDataType=${encodeURIComponent(filterDataType)}`]
          : []
      )
      .join("&");

    return getData({
      url: `/gateway/team/query/coach-teams${query ? `?${query}` : ""}`,
    });
  },
  // /gateway/team/query/athlete-team 查询运动员加入的团队
  getAthleteTeams(params = {}) {
    const { triUserId, filterType, filterDataId, filterDataType } = params || {};
    const query = []
      .concat(
        triUserId ? [`triUserId=${encodeURIComponent(triUserId)}`] : []
      )
      .concat(
        typeof filterType !== "undefined"
          ? [`filterType=${encodeURIComponent(filterType)}`]
          : []
      )
      .concat(
        typeof filterDataId !== "undefined"
          ? [`filterDataId=${encodeURIComponent(filterDataId)}`]
          : []
      )
      .concat(
        typeof filterDataType !== "undefined"
          ? [`filterDataType=${encodeURIComponent(filterDataType)}`]
          : []
      )
      .join("&");

    return getData({
      url: `/gateway/team/query/athlete-team${query ? `?${query}` : ""}`,
    });
  },
};
