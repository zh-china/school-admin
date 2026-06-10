import request from './request'

export function getParentAccountPage(params) {
  return request.get('/biz/parent-account/page', { params })
}

export function getParentAccountById(id) {
  return request.get(`/biz/parent-account/${id}`)
}

export function addParentAccount(data) {
  return request.post('/biz/parent-account', data)
}

export function updateParentAccount(data) {
  return request.put('/biz/parent-account', data)
}

export function deleteParentAccount(id) {
  return request.delete(`/biz/parent-account/${id}`)
}

export function resetParentPwd(id, newPassword) {
  return request.put(`/biz/parent-account/resetPwd/${id}`, null, { params: { newPassword } })
}
