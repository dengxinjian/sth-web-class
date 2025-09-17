import request from '@/utils/request'

export function fetchList() {
  return request({
    url: '/apple-data-center/activity/year',
    method: 'get'
  })
}

export function addYear() {
  return request({
    url: '/apple-data-center/activity/year',
    method: 'post'
  })
}

// 日期管理列表
export function bigActivity(params) {
  return request({
    url: '/apple-data-center/big/Activity',
    method: 'get',
    params
  })
}

// 删除
export function delectId(id) {
  return request({
    url: `/apple-data-center/big/Activity/${id}`,
    method: 'delete'
  })
}

// 数据上传
export function uploadAxios(file) {
  return request({
    url: `/apple-data-center/big/Activity/upload`,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取详情
export function getActivityDetail(id) {
  return request({
    url: `/apple-data-center/big/Activity/${id}`,
    method: 'get'
  })
}

// 新增
export function activityAdd(data) {
  return request({
    url: `/apple-data-center/big/Activity`,
    method: 'post',
    data
  })
}

// 修改
export function activityEditor(data) {
  return request({
    url: `/apple-data-center/big/Activity`,
    method: 'put',
    data
  })
}
