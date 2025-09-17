import request from '@/utils/request'

export function productList(params) {
  return request({
    url: '/apple-data-center/promotion/list',
    method: 'get',
    params
  })
}

// 删除
export function delectShop(id) {
  return request({
    url: `/apple-data-center/promotion/${id}`,
    method: 'delete'
  })
}

// 新增
export function addProduct(data, method) {
  return request({
    url: `/apple-data-center/promotion`,
    method,
    data
  })
}

// 数据上传
export function productUpload(file) {
  return request({
    url: `/apple-data-center/promotion/upload`,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 历史推广产品
export function promotionHistory() {
  return request({
    url: `/apple-data-center/promotion/history`,
    method: 'get',
  })
}

// 获取详情
export function promotionDetail(id) {
  return request({
    url: `/apple-data-center/promotion/${id}`,
    method: 'get',
  })
}

// 对应关系
export function promotionListId(id) {
  return request({
    url: `/apple-data-center/promotion/list/${id}`,
    method: 'get',
  })
}
