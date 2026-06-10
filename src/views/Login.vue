<template>
  <div class="login-page">
    <!-- 粒子背景 -->
    <div class="particles">
      <span v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)" />
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="card-header-section">
          <div class="logo-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#lgA)"/>
              <path d="M2 17l10 5 10-5" stroke="url(#lgB)" stroke-width="2" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="url(#lgC)" stroke-width="2" fill="none"/>
              <defs>
                <linearGradient id="lgA" x1="2" y1="2" x2="22" y2="7"><stop stop-color="#667eea"/><stop offset="1" stop-color="#764ba2"/></linearGradient>
                <linearGradient id="lgB" x1="2" y1="17" x2="22" y2="22"><stop stop-color="#4facfe"/><stop offset="1" stop-color="#00f2fe"/></linearGradient>
                <linearGradient id="lgC" x1="2" y1="12" x2="22" y2="17"><stop stop-color="#a18cd1"/><stop offset="1" stop-color="#fbc2eb"/></linearGradient>
              </defs>
            </svg>
          </div>
          <h1>智慧校园管理系统</h1>
          <p>Smart Campus Management</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" size="large">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入账号" :prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码"
              :prefix-icon="Lock" show-password @keyup.enter="handleLogin" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
              登 录 系 统
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <span>测试账号 admin / 123456</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const form = reactive({ username: 'admin', password: '123456' })
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function particleStyle(i) {
  const size = 2 + Math.random() * 4
  return {
    width: size + 'px', height: size + 'px',
    left: (Math.random() * 100) + '%',
    top: (Math.random() * 100) + '%',
    animationDelay: (i * 0.7) + 's',
    animationDuration: (8 + Math.random() * 12) + 's'
  }
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.login(form)
  } catch (e) {
    // 拦截器已处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  position: relative; overflow: hidden;
}
.particles { position: absolute; inset: 0; pointer-events: none; }
.particle {
  position: absolute; border-radius: 50%; background: rgba(255,255,255,0.15);
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
}
.login-container { position: relative; z-index: 1; width: 420px; }
.login-card {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px; padding: 44px 36px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
}
.card-header-section { text-align: center; margin-bottom: 32px; }
.logo-wrapper { margin-bottom: 14px; }
.card-header-section h1 {
  font-size: 22px; font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; margin: 0 0 6px;
}
.card-header-section p {
  font-size: 12px; color: #999; margin: 0; letter-spacing: 2px; text-transform: uppercase;
}
.login-btn {
  width: 100%; height: 44px; font-size: 15px; font-weight: 600; letter-spacing: 2px;
}
.login-footer { text-align: center; margin-top: 12px; font-size: 12px; color: #bbb; }
</style>
