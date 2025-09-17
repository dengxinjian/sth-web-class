import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/apple-data-center/cal/year/list',
    method: 'get',
    params: query
  })
}

export function holidays(year) {
  return request({
    url: `/apple-data-center/cal/holidays/${year}`,
    method: 'get',
  })
}

export function calSave(data) {
  return request({
    url: `/apple-data-center/cal/save`,
    method: 'post',
    data
  })
}

