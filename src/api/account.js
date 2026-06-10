import request from './request'

export function getAccountPage(params) {
  return request.get('/system/account/page', { params })
}

export function getAccountById(id) {
  return request.get(`/system/account/${id}`)
}

export function addAccount(data) {
  return request.post('/system/account', data)
}

export function updateAccount(data) {
  return request.put('/system/account', data)
}

export function deleteAccount(id) {
  return request.delete(`/system/account/${id}`)
}

export function resetPassword(id, newPassword) {
  return request.put(`/system/account/resetPwd/${id}`, null, { params: { newPassword } })
}
