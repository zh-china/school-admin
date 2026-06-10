import request from './request'

export function getScorePage(params) {
  return request.get('/biz/score-admin/page', { params })
}

export function getScoreById(id) {
  return request.get(`/biz/score-admin/${id}`)
}

export function addScore(data) {
  return request.post('/biz/score-admin', data)
}

export function updateScore(data) {
  return request.put('/biz/score-admin', data)
}

export function deleteScore(id) {
  return request.delete(`/biz/score-admin/${id}`)
}
