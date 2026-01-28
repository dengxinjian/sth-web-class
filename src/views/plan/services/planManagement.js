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
};