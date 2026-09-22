<template>
  <el-dropdown-item @click="handleLogout">
    退出登录（{{ auth.currentUser.name }}）
  </el-dropdown-item>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { authStore } from '@/stores/auth'

defineOptions({ name: 'UserMenu' })

const router = useRouter()
const auth = authStore()

const handleLogout = () => {
  auth.logout()
  router.push({ name: 'login' })
}
</script>
