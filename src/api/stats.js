import request from './request'

export function getOverview() {
  return request.get('/biz/stats/overview')
}

export function getClassAvg(semester) {
  return request.get('/biz/stats/class-avg', { params: { semester } })
}

export function getDistribution(semester, subject) {
  return request.get('/biz/stats/distribution', { params: { semester, subject } })
}

export function getTrend(semester) {
  return request.get('/biz/stats/trend', { params: { semester } })
}
