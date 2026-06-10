<template>
  <!-- 目录 -->
  <el-sub-menu v-if="menu.menuType === 1 && menu.children" :index="menu.path || menu.id.toString()">
    <template #title>
      <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
      <span>{{ menu.menuName }}</span>
    </template>
    <MenuItem v-for="child in menu.children" :key="child.id" :menu="child" />
  </el-sub-menu>
  <!-- 菜单 -->
  <el-menu-item v-else-if="menu.menuType === 2 && menu.path" :index="menu.path">
    <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
    <span>{{ menu.menuName }}</span>
  </el-menu-item>
</template>

<script setup>
defineProps({ menu: { type: Object, required: true } })
</script>
