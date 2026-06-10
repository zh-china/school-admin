import request from './request'

export function getMenuTree(accountId) {
  const params = accountId ? { accountId } : {}
  return request.get('/system/menu/tree', { params })
}

export function getMenuList() {
  return request.get('/system/menu/list')
}

export function getMenuById(id) {
  return request.get(`/system/menu/${id}`)
}

export function addMenu(data) {
  return request.post('/system/menu', data)
}

export function updateMenu(data) {
  return request.put('/system/menu', data)
}

export function deleteMenu(id) {
  return request.delete(`/system/menu/${id}`)
}

export function getMenuIdsByRoleId(roleId) {
  return request.get(`/system/menu/role/${roleId}`)
}
