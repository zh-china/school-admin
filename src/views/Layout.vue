<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
      <div class="logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#lg1)"/>
            <path d="M2 17l10 5 10-5" stroke="url(#lg2)" stroke-width="2" fill="none"/>
            <path d="M2 12l10 5 10-5" stroke="url(#lg3)" stroke-width="2" fill="none"/>
            <defs>
              <linearGradient id="lg1" x1="2" y1="2" x2="22" y2="7"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient>
              <linearGradient id="lg2" x1="2" y1="17" x2="22" y2="22"><stop stop-color="#4facfe"/><stop offset="1" stop-color="#00f2fe"/></linearGradient>
              <linearGradient id="lg3" x1="2" y1="12" x2="22" y2="17"><stop stop-color="#a18cd1"/><stop offset="1" stop-color="#fbc2eb"/></linearGradient>
            </defs>
          </svg>
        </div>
        <span v-if="!collapsed" class="logo-text">智慧校园</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="rgba(255,255,255,0.65)"
        active-text-color="#fff"
        router
        class="side-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>数据看板</span>
        </el-menu-item>
        <template v-for="menu in menuStore.menuTree" :key="menu.id">
          <MenuItem :menu="menu" />
        </template>
      </el-menu>
    </el-aside>

    <el-container class="main-area">
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" :size="20" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" /><Expand v-else />
          </el-icon>
          <div class="breadcrumb">
            <span class="breadcrumb-dot" />
            <span>{{ route.meta?.title || '控制台' }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="header-time">{{ timeStr }}</div>
          <div class="user-info">
            <div class="user-avatar">
              {{ (userStore.realName || userStore.username || 'A').charAt(0).toUpperCase() }}
            </div>
            <span class="username">{{ userStore.realName || userStore.username }}</span>
          </div>
          <el-button text type="danger" class="logout-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useMenuStore } from '../stores/menu'
import MenuItem from '../components/MenuItem.vue'

const route = useRoute()
const userStore = useUserStore()
const menuStore = useMenuStore()
const collapsed = ref(false)
const activeMenu = computed(() => route.path)

const timeStr = ref('')
let timer = null
function updateTime() {
  const now = new Date()
  timeStr.value = now.toLocaleDateString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' })
    + ' ' + now.toLocaleTimeString('zh-CN', { hour12: false })
}
onMounted(() => { updateTime(); timer = setInterval(updateTime, 10000) })
onUnmounted(() => clearInterval(timer))

function handleLogout() { userStore.logout() }
</script>

<style scoped>
.layout { height: 100vh; }
.aside {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  overflow-y: auto; overflow-x: hidden;
  border-right: 1px solid rgba(255,255,255,0.05);
  position: relative;
}
.aside::after {
  content: ''; position: absolute; top: 0; right: 0; width: 1px; height: 100%;
  background: linear-gradient(180deg, transparent, rgba(102,126,234,0.5), transparent);
}
.logo {
  height: 64px; display: flex; align-items: center; justify-content: center; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative;
}
.logo::after {
  content: ''; position: absolute; bottom: -1px; left: 20%; right: 20%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(102,126,234,0.6), transparent);
}
.logo-icon { display: flex; align-items: center; }
.logo-text {
  font-size: 17px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #667eea, #a18cd1);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.side-menu { border-right: none; }
.side-menu .el-menu-item {
  margin: 4px 8px; border-radius: 10px;
  transition: all 0.3s ease;
}
.side-menu .el-menu-item:hover {
  background: rgba(255,255,255,0.06) !important;
}
.side-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.25)) !important;
  color: #fff !important;
  position: relative;
}
.side-menu .el-menu-item.is-active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 20px; border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #667eea, #764ba2);
}
.main-area { background: #f0f2f5; }
.header {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.04);
  height: 56px; padding: 0 20px;
}
.header-left { display: flex; align-items: center; gap: 14px; }
.collapse-btn {
  cursor: pointer; color: #666; padding: 6px;
  border-radius: 8px; transition: all 0.2s;
}
.collapse-btn:hover { background: rgba(102,126,234,0.08); color: #667eea; }
.breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: #4a5568;
}
.breadcrumb-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.header-right { display: flex; align-items: center; gap: 16px; }
.header-time { font-size: 13px; color: #999; }
.user-info { display: flex; align-items: center; gap: 8px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600;
}
.username { font-size: 14px; font-weight: 500; color: #4a5568; }
.logout-btn { color: #e53e3e !important; }
</style>
