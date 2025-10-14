/**
 * 课程管理API服务
 */

import { getData, submitData } from '@/api/common.js'

/**
 * 团队相关API
 */
export const teamApi = {
  // 获取所有团队
  getAllTeams() {
    return getData({ url: '/api/team/coach/all-teams' })
  }
}

/**
 * 课程相关API
 */
export const classApi = {
  // 获取用户课程列表（按分组）
  getClassesByUserId(classesTitle = '') {
    return getData({
      url: '/api/classes/getClassesByUserIdGroupedWithName',
      classesTitle
    })
  },

  // 获取官方课程列表
  getOfficialClasses(classesTitle = '') {
    return getData({
      url: '/api/classes/getOfficialGroupedWithName',
      classesTitle
    })
  },

  // 删除课程
  deleteClass(id) {
    return submitData({
      url: `/api/classes/deleteClasses?id=${id}`
    })
  }
}

/**
 * 课表相关API
 */
export const scheduleApi = {
  // 获取日历概览
  getCalendarOverview({ begin, end, triUserId }) {
    return getData({
      url: '/api/classSchedule/getCalenderOverview',
      begin,
      end,
      triUserId
    })
  },

  // 创建课表
  createSchedule(data) {
    return submitData({
      url: '/api/classSchedule/create',
      requestData: data
    })
  },

  // 删除课表
  deleteSchedule(id) {
    return submitData({
      url: `/api/classSchedule/deleteClassSchedule?id=${id}`
    })
  },

  // 课表绑定运动
  bindActivity(data) {
    return submitData({
      url: '/api/classSchedule/classBindingActivity',
      requestData: data
    })
  },

  // 课表解绑运动
  unbindActivity(classScheduleId) {
    return submitData({
      url: '/api/classSchedule/classUnbindActivity',
      requestData: { classScheduleId }
    })
  },

  // 删除运动
  deleteActivity(activityId) {
    return submitData({
      url: '/api/classSchedule/deleteActivity',
      requestData: { activityId }
    })
  },

  // 计算时间距离和STH
  calculateTimeDistanceSth(data) {
    return submitData({
      url: '/api/classSchedule/calculateTimeDistanceSth',
      requestData: data
    })
  },

  // 重试课表同步
  retrySync({ classScheduleId, deviceType }) {
    return submitData({
      url: `/api/classSchedule/retryClassScheduleSync?classScheduleId=${classScheduleId}&deviceType=${deviceType}`
    })
  }
}

/**
 * 统计相关API
 */
export const statisticsApi = {
  // 获取周统计数据
  getWeekStatistics({ begin, end, triUserId }) {
    return getData({
      url: '/api/classSchedule/getStatistics',
      begin,
      end,
      triUserId
    })
  }
}

/**
 * 运动员相关API
 */
export const athleteApi = {
  // 获取运动员配置
  getUserProfile(triUserId) {
    return getData({
      url: '/api/classSchedule/getUserProfile',
      triUserId
    })
  },

  // 获取授权设备列表
  getAuthorizedDevices(triUserId) {
    return getData({
      url: '/api/classSchedule/authorizedDevice',
      triUserId
    })
  },

  // 更新授权设备
  updateAuthorizedDevice({ deviceId, syncFlag }) {
    return submitData({
      url: `/api/classSchedule/updateAuthorizedDevice?deviceId=${deviceId}&syncFlag=${syncFlag}`
    })
  }
}

/**
 * 分组相关API
 */
export const groupApi = {
  // 创建分组
  createGroup(data) {
    return submitData({
      url: '/api/classesGroup/create',
      requestData: data
    })
  },

  // 更新分组
  updateGroup(data) {
    return submitData({
      url: '/api/classesGroup/update',
      requestData: data
    })
  },

  // 删除分组
  deleteGroup(id) {
    return submitData({
      url: `/api/classesGroup/delete?id=${id}`
    })
  }
}

