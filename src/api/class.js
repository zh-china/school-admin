import request from './request'

export function getClassPage(params) {
  return request.get('/biz/class/page', { params })
}

export function getClassList() {
  return request.get('/biz/class/list')
}

export function getClassById(id) {
  return request.get(`/biz/class/${id}`)
}

export function addClass(data) {
  return request.post('/biz/class', data)
}

export function updateClass(data) {
  return request.put('/biz/class', data)
}

export function deleteClass(id) {
  return request.delete(`/biz/class/${id}`)
}
