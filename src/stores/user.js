import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi } from '../api/auth'
import { getMenuTree } from '../api/menu'
import router from '../router'
import { useMenuStore } from './menu'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userId = ref('')
  const username = ref('')
  const realName = ref('')

  async function login(loginForm) {
    const res = await loginApi(loginForm)
    const data = res.data
    token.value = data.token
    userId.value = data.userId
    username.value = data.username
    realName.value = data.realName

    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('username', data.username)
    localStorage.setItem('realName', data.realName)

    // 登录后获取菜单树并注册动态路由(传入userId进行角色过滤)
    const menuRes = await getMenuTree(data.userId)
    const menuStore = useMenuStore()
    menuStore.setMenuTree(menuRes.data)
    menuStore.addDynamicRoutes()

    router.push('/dashboard')
  }

  function restoreUser() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      username.value = localStorage.getItem('username') || ''
      userId.value = localStorage.getItem('userId') || ''
      realName.value = localStorage.getItem('realName') || ''
    }
  }

  async function logout() {
    try {
      await logoutApi()
    } catch (e) {
      // 即使接口失败也清除本地状态
    }
    token.value = ''
    userId.value = ''
    username.value = ''
    realName.value = ''
    localStorage.clear()
    router.push('/login')
  }

  return { token, userId, username, realName, login, restoreUser, logout }
})
