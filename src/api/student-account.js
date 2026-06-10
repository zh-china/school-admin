import request from './request'

export function getStudentAccountPage(params) {
  return request.get('/biz/student-account/page', { params })
}

export function getStudentAccountById(id) {
  return request.get(`/biz/student-account/${id}`)
}

export function addStudentAccount(data) {
  return request.post('/biz/student-account', data)
}

export function updateStudentAccount(data) {
  return request.put('/biz/student-account', data)
}

export function deleteStudentAccount(id) {
  return request.delete(`/biz/student-account/${id}`)
}

export function resetStudentPwd(id, newPassword) {
  return request.put(`/biz/student-account/resetPwd/${id}`, null, { params: { newPassword } })
}
