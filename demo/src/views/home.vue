<template>
  <SiteContainer />
</template>

<script setup lang="ts">
// 显式 import 而非依赖全局注册，模板类型检查才认
import { SiteContainer } from '@caroundsky/lemon-admin'

defineOptions({ name: 'HomePage' })
</script>
