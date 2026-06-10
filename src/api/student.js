import request from './request'

export function getStudentPage(params) {
  return request.get('/biz/student/page', { params })
}

export function getStudentById(id) {
  return request.get(`/biz/student/${id}`)
}

export function addStudent(data) {
  return request.post('/biz/student', data)
}

export function updateStudent(data) {
  return request.put('/biz/student', data)
}

export function deleteStudent(id) {
  return request.delete(`/biz/student/${id}`)
}
