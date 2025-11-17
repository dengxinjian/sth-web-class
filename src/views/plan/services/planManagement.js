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
      url: "/api/planClasses/listWithPlans",
      titleKeyword,
    });
  },

  // 获取官方计划
  getOfficialPlans(titleKeyword = "") {
    return getData({
      url: "/api/planClasses/official/listWithPlans",
      titleKeyword,
    });
  },

  // 创建个人计划
  createSelfPlan(data) {
    return submitData({
      url: "/api/planClasses/createPlanClasses",
      requestData: data,
    });
  },

  // 根据官方计划创建计划
  createSelfPlanByOffice(data) {
    return submitData({
      url: "/api/planClasses/importOfficialPlan",
      requestData: data,
    });
  },

  // 添加计划
  addPlan(data) {
    return submitData({
      url: "/api/planClasses/createPlanClasses",
      requestData: data,
    });
  },
  // 更新计划
  updatePlan(data) {
    return submitData({
      url: "/api/planClasses/updatePlanClassesDayDetail",
      requestData: data,
    });
  },

  // 获取计划详情
  getPlanDetail(id) {
    return getData({
      url: `/api/planClasses/getPlanClassesById?id=${id}`,
    });
  },

  // 获取计划详情
  getPlanDayDetail(id) {
    return getData({
      url: `/api/planClasses/getPlanClassesDayDetail?planClassesId=${id}`,
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
      url: `/api/planClassesGroup/deletePlanClassesGroup?id=${id}`,
    });
  },
};
