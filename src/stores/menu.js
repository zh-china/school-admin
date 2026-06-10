import { defineStore } from 'pinia'
import { ref } from 'vue'
import router from '../router'

// 路径到组件的映射
const componentMap = {
  'system/account/index': () => import('../views/system/Account.vue'),
  'system/role/index': () => import('../views/system/Role.vue'),
  'system/menu/index': () => import('../views/system/Menu.vue'),
  'biz/class/index': () => import('../views/biz/Class.vue'),
  'biz/student/index': () => import('../views/biz/Student.vue'),
  'biz/score-admin/index': () => import('../views/biz/ScoreAdmin.vue'),
  'biz/schedule-admin/index': () => import('../views/biz/ScheduleAdmin.vue'),
  'biz/student-account/index': () => import('../views/biz/StudentAccount.vue'),
  'biz/parent-account/index': () => import('../views/biz/ParentAccount.vue')
}

export const useMenuStore = defineStore('menu', () => {
  const menuTree = ref([])

  function setMenuTree(tree) {
    menuTree.value = tree
  }

  function addDynamicRoutes() {
    const flatMenus = flattenTree(menuTree.value)
    flatMenus
      .filter(m => m.menuType === 2 && m.path && componentMap[m.component])
      .forEach(m => {
        router.addRoute('Layout', {
          path: m.path,
          name: m.path.replace(/\//g, '_'),
          component: componentMap[m.component],
          meta: { title: m.menuName }
        })
      })

    // 添加 /dashboard 路由（首次添加时不重复）
    if (!router.hasRoute('dashboard')) {
      router.addRoute('Layout', {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      })
    }
  }

  function flattenTree(tree) {
    const result = []
    function walk(nodes) {
      if (!nodes) return
      nodes.forEach(node => {
        result.push(node)
        if (node.children) walk(node.children)
      })
    }
    walk(tree)
    return result
  }

  return { menuTree, setMenuTree, addDynamicRoutes }
})
