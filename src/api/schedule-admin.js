import request from './request'

export function getSchedulePage(params) {
  return request.get('/biz/schedule-admin/page', { params })
}

export function getScheduleById(id) {
  return request.get(`/biz/schedule-admin/${id}`)
}

export function addSchedule(data) {
  return request.post('/biz/schedule-admin', data)
}

export function updateSchedule(data) {
  return request.put('/biz/schedule-admin', data)
}

export function deleteSchedule(id) {
  return request.delete(`/biz/schedule-admin/${id}`)
}
