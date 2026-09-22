<template>
  <div class="login-page">
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      class="login-card"
      @keyup.enter="handleSubmit"
    >
      <h1 class="login-card__title">站点容器</h1>
      <p class="login-card__tip">演示账号 <b>admin</b> / <b>123456</b>（纯前端模拟，不走接口）</p>

      <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户名" size="large" />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="密码"
          size="large"
          show-password
        />
      </el-form-item>

      <el-button
        type="primary"
        size="large"
        class="login-card__submit"
        :loading="auth.loading"
        @click="handleSubmit"
      >
        登 录
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authStore, MOCK_ACCOUNT } from '@/stores/auth'

defineOptions({ name: 'LoginPage' })

const router = useRouter()
const auth = authStore()

const formRef = ref<FormInstance>()

const form = reactive({
  username: MOCK_ACCOUNT.username,
  password: MOCK_ACCOUNT.password,
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}))

const handleSubmit = async () => {
  if (auth.loading) return

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await auth.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error((error as Error).message || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, #eef2f7 0%, #dbe4f0 100%);
}

.login-card {
  width: 360px;
  padding: 36px 32px 28px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgb(0 0 0 / 8%);
}

.login-card__title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: #0070b2;
}

.login-card__tip {
  margin: 10px 0 24px;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
  color: #909399;
}

.login-card__submit {
  width: 100%;
}
</style>
