import request from '@/utils/request'

export function productList(params) {
  return request({
    url: '/apple-data-center/distribute/list',
    method: 'get',
    params
  })
}

// 删除
export function delectShop(id) {
  return request({
    url: `/apple-data-center/distribute/${id}`,
    method: 'delete'
  })
}

// 新增
export function addProduct(data, method) {
  return request({
    url: `/apple-data-center/distribute`,
    method,
    data
  })
}

// 数据上传
export function productUpload(file) {
  return request({
    url: `/apple-data-center/distribute/upload`,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
