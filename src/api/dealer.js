import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/apple-data-center/sys/shop/list',
    method: 'get',
    params: query
  })
}

export function delectShop(id) {
  return request({
    url: `/apple-data-center/sys/shop/delete/${id}`,
    method: 'post',
  })
}

export function shopEditor(query) {
  return request({
    url: '/apple-data-center/sys/shop/add',
    method: 'post',
    data: query
  })
}

