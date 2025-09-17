import request from '@/utils/request'

export function productList(params) {
  return request({
    url: '/apple-data-center/mapping/product/list',
    method: 'get',
    params
  })
}

// 获取所有的lob-sublob
export function productMenus() {
  return request({
    url: '/apple-data-center/mapping/product/menus',
    method: 'get'
  })
}

// 查询店铺列表
export function getShop() {
  return request({
    url: '/apple-data-center/sys/shop/getShop',
    method: 'get'
  })
}

// 删除
export function delectShop(id) {
  return request({
    url: `/apple-data-center/mapping/product/${id}`,
    method: 'delete'
  })
}

// 新增
export function addProduct(data, method) {
  return request({
    url: `/apple-data-center/mapping/product`,
    method,
    data
  })
}

// 数据上传
export function productUpload(file) {
  return request({
    url: `/apple-data-center/mapping/product/upload`,
    method: 'post',
    data: file,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取一级二级来源
export function getSource() {
  return request({
    url: '/apple-data-center/trafficStructure/getSource',
    method: 'get'
  })
}
