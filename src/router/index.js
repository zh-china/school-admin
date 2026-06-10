import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useMenuStore } from '../stores/menu'
import { getMenuTree } from '../api/menu'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { noAuth: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    children: []
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 白名单路径
const whiteList = ['/login']

router.beforeEach(async (to, from, next) => {
  if (whiteList.includes(to.path)) {
    next()
    return
  }

  const userStore = useUserStore()
  const menuStore = useMenuStore()

  const token = localStorage.getItem('token')
  if (!token) {
    next('/login')
    return
  }

  // 首次进入，还原用户状态并加载菜单
  if (!userStore.username) {
    userStore.restoreUser()
    try {
      const accountId = Number(localStorage.getItem('userId'))
      const menuRes = await getMenuTree(accountId || undefined)
      menuStore.setMenuTree(menuRes.data)
      menuStore.addDynamicRoutes()
      // 动态路由注册后，重试当前目标
      next({ ...to, replace: true })
    } catch (e) {
      localStorage.clear()
      next('/login')
    }
    return
  }

  next()
})

export default router
