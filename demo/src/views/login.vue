<template>
  <div class="login">
    <!-- 顶栏：产品标识 + 运行信息（等宽工具字体承载“工程件”的语感） -->
    <header class="login__bar">
      <span class="login__pkg">@caroundsky/lemon-admin</span>
      <span class="login__env">
        <i class="login__env-dot" />
        示例应用 · 前端模拟
      </span>
    </header>

    <div class="login__body">
      <!-- 左侧：这个库是什么，以及它的结构 -->
      <section class="login__intro">
        <h1 class="login__title">站点容器</h1>
        <p class="login__lede">
          为后台系统提供开箱即用的整体框架——导航菜单、多页签、插件体系，业务页面以 iframe 接入。
        </p>

        <!--
          签名元素：容器解剖图。
          悬停点亮对应区块并标注，登录时依次“启动”；
          空转时在「侧栏布局 / 横版布局」之间轮播（悬停即暂停）。
        -->
        <figure class="diagram" :class="{ 'is-launching': launching }">
          <div
            class="diagram__frame"
            @mouseenter="diagramHovered = true"
            @mouseleave="diagramHovered = false"
          >
            <!-- 侧栏布局：导航是左侧整高一列，操作栏与页签栏同行 -->
            <div class="diagram__scene" :class="{ 'is-active': !isHorizon }">
              <div class="diagram__block diagram__aside" :style="{ '--i': 0 }">
                <span class="diagram__tag">侧栏</span>
              </div>

              <div class="diagram__column">
                <div class="diagram__row">
                  <div class="diagram__block diagram__tabs" :style="{ '--i': 1 }">
                    <span class="diagram__tag">页签栏</span>
                  </div>
                  <div class="diagram__block diagram__action" :style="{ '--i': 1 }">
                    <span class="diagram__tag">操作栏</span>
                  </div>
                </div>

                <div class="diagram__block diagram__content" :style="{ '--i': 2 }">
                  <span class="diagram__tag">内容区</span>
                </div>

                <div class="diagram__block diagram__footer" :style="{ '--i': 3 }">
                  <span class="diagram__tag">页脚</span>
                </div>
              </div>
            </div>

            <!-- 横版布局：导航移到顶部整宽，操作栏与之同行，页签栏独占一行 -->
            <div class="diagram__scene" :class="{ 'is-active': isHorizon }">
              <div class="diagram__column">
                <div class="diagram__row">
                  <div class="diagram__block diagram__nav" :style="{ '--i': 0 }">
                    <span class="diagram__tag">导航</span>
                  </div>
                  <div class="diagram__block diagram__action" :style="{ '--i': 0 }">
                    <span class="diagram__tag">操作栏</span>
                  </div>
                </div>

                <div
                  class="diagram__block diagram__tabs"
                  :style="{ '--i': 1 }"
                  style="height: 30px; flex: none"
                >
                  <span class="diagram__tag">页签栏</span>
                </div>

                <div class="diagram__block diagram__content" :style="{ '--i': 2 }">
                  <span class="diagram__tag">内容区</span>
                </div>

                <div class="diagram__block diagram__footer" :style="{ '--i': 3 }">
                  <span class="diagram__tag">页脚</span>
                </div>
              </div>
            </div>
          </div>

          <figcaption class="diagram__caption">{{ captionText }}</figcaption>
        </figure>
      </section>

      <!-- 右侧：登录 -->
      <section class="login__panel">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login__form"
          @keyup.enter="handleSubmit"
        >
          <p class="login__form-title">欢迎回来</p>
          <p class="login__form-sub">登录后进入站点容器</p>

          <label class="field">
            <span class="field__label">用户名</span>
            <el-form-item prop="username">
              <el-input v-model="form.username" size="large" placeholder="用户名" />
            </el-form-item>
          </label>

          <label class="field">
            <span class="field__label">密码</span>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                size="large"
                placeholder="密码"
                show-password
              />
            </el-form-item>
          </label>

          <el-button
            type="primary"
            size="large"
            class="login__submit"
            :loading="auth.loading"
            @click="handleSubmit"
          >
            {{ launching ? '正在进入…' : '进入站点容器' }}
          </el-button>

          <p class="login__hint">
            演示账号 <code>admin</code> / <code>123456</code>，纯前端模拟，不走接口
          </p>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { authStore, MOCK_ACCOUNT } from '@/stores/auth'

defineOptions({ name: 'LoginPage' })

const router = useRouter()
const auth = authStore()

const formRef = ref<FormInstance>()
/** 登录中：驱动解剖图的“启动序列” */
const launching = ref(false)

/**
 * 解剖图轮播：在「侧栏布局 / 横版布局」之间来回切换，把两种布局都展示出来。
 *
 * 三种情况暂停轮播：鼠标悬停（方便细看）、登录中（正在跑启动序列）、
 * 系统开启了「减少动效」。
 */
const isHorizon = ref(false)
const diagramHovered = ref(false)

const captionText = computed(() => {
  if (launching.value) return '正在初始化容器…'
  return isHorizon.value ? '横版布局 · 导航与操作栏同行' : '侧栏布局 · 悬停暂停轮播'
})

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let layoutTimer: ReturnType<typeof setInterval> | undefined

watchEffect(() => {
  if (layoutTimer) {
    clearInterval(layoutTimer)
    layoutTimer = undefined
  }

  if (launching.value || diagramHovered.value || reducedMotion) return

  layoutTimer = setInterval(() => {
    isHorizon.value = !isHorizon.value
  }, 2600)
})

onUnmounted(() => {
  if (layoutTimer) clearInterval(layoutTimer)
})

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

  launching.value = true
  try {
    await auth.login(form.username, form.password)
    router.push('/')
  } catch (error) {
    launching.value = false
    ElMessage.error((error as Error).message || '登录失败')
  }
}
</script>

<style lang="scss" scoped>
/* ---- 设计 token ---- */
$paper: #f7f9fb; // 冷白底（刻意避开常见的暖奶油底）
$panel: #ffffff;
$rule: #d7dfe8; // 细线
$ink: #16232e; // 主文字
$ink-soft: #64748b; // 次文字
$accent: #0070b2; // 强调色 = 库的默认主题色
$signal: #17b8a6; // 状态信号色

$mono: ui-monospace, sfmono-regular, consolas, 'Liberation Mono', monospace;

.login {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: $ink;
  background: $paper;
}

/* ---- 顶栏 ---- */
.login__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  border-bottom: 1px solid $rule;
}

.login__pkg {
  font-family: $mono;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: $ink;
}

.login__env {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-family: $mono;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: $ink-soft;
  text-transform: uppercase;
}

.login__env-dot {
  width: 6px;
  height: 6px;
  background: $signal;
  border-radius: 50%;
}

/* ---- 主体：左说明 / 右登录 ---- */
.login__body {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  min-height: 0;
}

.login__intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 56px;
}

.login__title {
  margin: 0;
  font-size: clamp(34px, 4vw, 46px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.login__lede {
  max-width: 30em;
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.85;
  color: $ink-soft;
}

/* ---- 签名元素：容器解剖图 ---- */
.diagram {
  margin: 36px 0 0;
}

/*
 * 外框：高度固定，两套布局绝对定位叠放，切换只做透明度过渡 ——
 * 两种布局自身的高度差不会让周围内容跟着跳动。
 */
.diagram__frame {
  position: relative;
  max-width: 680px;
  height: 286px;
  border: 1px solid $rule;
  border-radius: 6px;
}

.diagram__scene {
  position: absolute;
  inset: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.45s ease;
  /* 未激活的一层不参与指针交互，避免挡住下面那层 */
  pointer-events: none;

  &.is-active {
    opacity: 1;
    pointer-events: auto;
  }
}

.diagram__block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid $rule;
  border-radius: 3px;
  transition: background-color 0.25s ease, border-color 0.25s ease;

  /* 启动序列：各区块按 --i 依次点亮 */
  transition-delay: calc(var(--i, 0) * 90ms);

  &:hover,
  .diagram.is-launching & {
    background: $accent;
    border-color: $accent;

    .diagram__tag {
      color: #fff;
    }
  }
}

/* 侧栏布局：导航是左侧整高一列 */
.diagram__aside {
  flex: 0 0 116px;
  align-self: stretch;
}

.diagram__column {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

/* 同一行的两块：页签栏 + 操作栏 / 导航 + 操作栏 */
.diagram__row {
  display: flex;
  flex: 0 0 30px;
  gap: 8px;
}

.diagram__nav,
.diagram__tabs {
  flex: 1;
}

.diagram__action {
  flex: 0 0 74px;
}

.diagram__content {
  flex: 1;
}

.diagram__footer {
  height: 22px;
}

.diagram__tag {
  font-family: $mono;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: $ink-soft;
  transition: color 0.25s ease;
}

.diagram__caption {
  margin: 12px 0 0;
  font-family: $mono;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: $ink-soft;
}

/* ---- 右侧登录面板 ---- */
.login__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: $panel;
  border-left: 1px solid $rule;
}

.login__form {
  width: 100%;
  max-width: 340px;
}

.login__form-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.login__form-sub {
  margin: 6px 0 26px;
  font-size: 13px;
  color: $ink-soft;
}

.field {
  display: block;
  margin-bottom: 4px;
}

.field__label {
  display: block;
  margin-bottom: 6px;
  font-family: $mono;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: $ink-soft;
  text-transform: uppercase;
}

.login__submit {
  width: 100%;
  margin-top: 6px;
}

.login__hint {
  margin: 18px 0 0;
  font-size: 12px;
  line-height: 1.8;
  color: $ink-soft;

  code {
    padding: 1px 5px;
    font-family: $mono;
    font-size: 11px;
    color: $ink;
    background: $paper;
    border: 1px solid $rule;
    border-radius: 3px;
  }
}

/* ---- 响应式：窄屏改为上下堆叠 ---- */
@media (width <= 900px) {
  .login__body {
    grid-template-columns: 1fr;
  }

  .login__intro {
    padding: 32px 24px 0;
  }

  .login__panel {
    padding: 28px 24px 40px;
    border-top: 1px solid $rule;
    border-left: none;
  }
}

/* ---- 尊重系统的减少动效设置 ---- */
@media (prefers-reduced-motion: reduce) {
  .diagram__block,
  .diagram__tag {
    transition: none;
  }
}
</style>
