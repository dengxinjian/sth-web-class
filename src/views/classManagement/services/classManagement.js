/**
 * 课程管理API服务
 */

import { getData, submitData } from "@/api/common.js";
import request from "@/utils/request";

/**
 * 团队相关API
 */
export const teamApi = {
  // 获取所有团队
  getAllTeams() {
    return getData({ url: "/consumer/api/team/coach/all-teams" });
  },
};

/**
 * 课程相关API
 */
export const classApi = {
  // 获取用户课程列表（按分组）
  getClassesByUserId(classesTitle = "") {
    return getData({
      url: "/training/api/classes/getClassesByUserIdGroupedWithName",
      classesTitle,
    });
  },

  // 获取官方课程列表
  getOfficialClasses(classesTitle = "") {
    return getData({
      url: "/training/api/classes/getOfficialGroupedWithName",
      classesTitle,
    });
  },

  // 删除课程
  deleteClass(id) {
    return submitData({
      url: `/training/api/classes/deleteClasses?id=${id}`,
    });
  },
  createClass(data) {
    return submitData({
      url: "/training/api/classes/create",
      requestData: data,
    });
  },
  updateClass(data) {
    return submitData({
      url: "/training/api/classes/update",
      requestData: data,
    });
  },
  // 获取当前人 课程配置数
  getCurrentUserClassConfigCount() {
    return getData({
      url: "/training/api/classes/getUserClassesCount",
    });
  },
};

/**
 * 课表相关API
 */
export const scheduleApi = {
  // 获取日历概览
  getCalendarOverview({ begin, end, triUserId }) {
    return getData({
      url: "/gateway/training/activity/getCalenderOverview",
      begin,
      end,
      triUserId,
    });
  },

  // 获取健康数据
  getHealthData({ deviceType, date, triUserId }) {
    return getData({
      url: "/gateway/training/health",
      deviceType,
      startDate: date,
      endDate: date,
      triUserId,
    });
  },

  // 创建课表
  createSchedule(data) {
    return submitData({
      url: "/training/api/classSchedule/create",
      requestData: data,
    });
  },

  // 删除课表
  deleteSchedule(params) {
    // return submitData({
    //   url: `/api/classSchedule/deleteClassSchedule?id=${id}`,
    // });
    return request({
      url: `/training/api/classSchedule/deleteClassSchedule?id=${params.id}`,
      method: "post",
      headers: {
        requestUserInfoId: params.triUserId,
      },
    });
  },

  // 运动详细
  getActivityDetail(activityId) {
    return getData({
      url: "/gateway/training/classSchedule/getActivityDetail",
      activityId,
    });
  },

  // 课表绑定运动
  bindActivity(data) {
    return submitData({
      url: "/gateway/training/classSchedule/classBindingActivity",
      requestData: data,
    });
  },

  // 课表解绑运动
  unbindActivity(classScheduleId) {
    return submitData({
      url: "/training/api/classSchedule/classUnbindActivity",
      requestData: { classScheduleId },
    });
  },

  // 删除运动
  deleteActivity(activityId, type) {
    return submitData({
      url: `/training/api/activity/deleteActivity?activityId=${activityId}&type=${type}`,
    });
  },

  // 计算时间距离和STH
  calculateTimeDistanceSth(data) {
    return submitData({
      url: "/gateway/analysis/classCalculateTimeDistanceSth",
      requestData: data,
    });
  },

  // 重试课表同步
  retrySync({ classScheduleId, deviceType }) {
    return submitData({
      // url: `/gateway/training/classSchedule/retryClassScheduleSync?classScheduleId=${classScheduleId}&deviceType=${deviceType}`,
      url: `/training/api/classSchedule/retryClassScheduleSync`,
      requestData: {
        classScheduleId,
        deviceType,
      },
    });
  },

  // 录入运动
  createActivity(data) {
    return submitData({
      url: "/training/api/manualDeviceActivity/create",
      requestData: data,
    });
  },
};

/**
 * 统计相关API
 */
export const statisticsApi = {
  // 获取周统计数据
  getWeekStatistics({ begin, end, triUserId }) {
    return getData({
      url: "/training/api/classSchedule/getStatistics",
      begin,
      end,
      triUserId,
    });
  },
};

/**
 * 运动员相关API
 */
export const athleteApi = {
  // 获取运动员配置
  getUserProfile(triUserId, date) {
    return getData({
      url: "/consumer/wx/getUserProfile",
      triUserId,
      date,
    });
  },

  // 获取授权设备列表
  getAuthorizedDevices(triUserId) {
    return getData({
      url: "/device/api/device/authorizedDevice",
      triUserId,
    });
  },

  // 更新授权设备
  updateAuthorizedDevice({ deviceId, syncFlag }) {
    return submitData({
      url: `/device/api/device/updateAuthorizedDevice?deviceId=${deviceId}&syncFlag=${syncFlag}`,
    });
  },
  // 获取所有设备列表
  getDeviceList(triUserId) {
    return getData({
      url: "/device/api/device/authorizedAllDevice",
      triUserId,
    });
  },
};

/**
 * 分组相关API
 */
export const groupApi = {
  // 创建分组
  createGroup(data) {
    return submitData({
      url: "/training/api/classesGroup/create",
      requestData: data,
    });
  },

  // 更新分组
  updateGroup(data) {
    return submitData({
      url: "/training/api/classesGroup/update",
      requestData: data,
    });
  },

  // 删除分组
  deleteGroup(id) {
    return submitData({
      url: `/training/api/classesGroup/deleteClassesGroup?id=${id}`,
    });
  },
};

/**
 * 赛事相关API
 */
export const competitionApi = {
  // 获取比赛类型和距离下拉框数据
  getDropdownOptions() {
    return getData({
      url: "/consumer/api/competition/dropdown-options",
    });
  },
  // 行政区域
  getAdministrativeDivision(parentId = "") {
    return getData({
      url: "/training/api/resource/administrative-division",
      parentId,
    });
  },
  // 查询赛事详情
  getCompetitionDetail(id) {
    return request({
      url: `/gateway/competition/${id}`,
      method: "get",
    });
  },
  // 创建赛事
  createCompetition(data, triUserId) {
    return request({
      url: "/consumer/api/competition",
      method: "post",
      data,
      headers: {
        requestUserInfoId: triUserId,
      },
    });
  },

  // 更新赛事
  updateCompetition(data, triUserId) {
    // return submitData({
    //   url: "/api/competition",
    //   method: "put",
    //   requestData: data,
    // });
    return request({
      url: "/consumer/api/competition",
      headers: {
        requestUserInfoId: triUserId,
      },
      method: "put",
      data,
    });
  },
  // 删除赛事
  deleteCompetition(id) {
    return submitData({
      url: `/consumer/api/competition/${id}`,
      method: "delete",
    });
  },

  // 赛事绑定运动
  bindActivity(data) {
    return submitData({
      url: "/gateway/training/web/activity/activityBindCompetition",
      requestData: data,
    });
  },
  // 赛事解绑运动
  unbindActivity(data) {
    return submitData({
      url: "/gateway/training/web/activity/activityUnBindCompetition",
      requestData: data,
    });
  },
  // 保存/更新比赛成绩
  saveCompetitionResult(data) {
    return request({
      url: "/consumer/api/competition/season-results",
      method: "put",
      data,
    });
  },
  // 赛事运动位置移动
  moveActivityPosition(data) {
    return request({
      url: "/training/api/activity/web/changeTransitionNode",
      method: "post",
      data,
    });
  },
};
