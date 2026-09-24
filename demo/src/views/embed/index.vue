<template>
  <div class="embed">
    <header class="embed__head">
      <span class="embed__kind">路由页面</span>
      <h1 class="embed__title">这是一个 Vue 路由</h1>
      <p class="embed__lede">
        站点容器的「路由打开页」菜单项指向 <code>#/embed</code>，容器用
        iframe 加载它。与 <code>public/pages/*.html</code> 那些静态页不同，这一页是
        真正的 Vue 路由——有响应式状态、能调接口、能复用项目里的组件。
      </p>
    </header>

    <section class="embed__card">
      <div class="embed__row">
        <span class="embed__key">当前地址</span>
        <code class="embed__val">{{ href }}</code>
      </div>
      <div class="embed__row">
        <span class="embed__key">承载方式</span>
        <code class="embed__val">iframe（站点容器打开菜单时注入）</code>
      </div>
      <div class="embed__row">
        <span class="embed__key">与静态页的区别</span>
        <span class="embed__val">响应式状态可用，下面这个计数就是活的</span>
      </div>
    </section>

    <section class="embed__counter">
      <button class="embed__btn" type="button" @click="count--">−</button>
      <output class="embed__count">{{ count }}</output>
      <button class="embed__btn" type="button" @click="count++">＋</button>
      <p class="embed__counter-note">
        点几下——刷新 iframe 会归零，说明它确实是每次挂载都重新运行的 Vue 组件。
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'EmbedPage' })

const count = ref(0)
const href = window.location.href
</script>

<style lang="scss" scoped>
.embed {
  box-sizing: border-box;
  min-height: 100%;
  padding: 32px;
  font-family: -apple-system, 'Microsoft YaHei', sans-serif;
  color: #303133;
  background: #f5f7fa;

  *,
  :before,
  :after {
    box-sizing: inherit;
  }
}

.embed__kind {
  display: inline-block;
  padding: 2px 8px;
  font-family: ui-monospace, sfmono-regular, consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: #0070b2;
  text-transform: uppercase;
  border: 1px solid currentcolor;
  border-radius: 3px;
}

.embed__title {
  margin: 12px 0 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.embed__lede {
  max-width: 46em;
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.9;
  color: #606266;

  code {
    padding: 1px 5px;
    font-family: ui-monospace, sfmono-regular, consolas, monospace;
    font-size: 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 3px;
  }
}

.embed__card {
  max-width: 720px;
  padding: 8px 20px;
  margin-top: 22px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
}

.embed__row {
  display: flex;
  gap: 20px;
  align-items: baseline;
  padding: 12px 0;
  font-size: 13px;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }
}

.embed__key {
  flex: 0 0 128px;
  color: #909399;
}

.embed__val {
  flex: 1;
  min-width: 0;
  font-family: ui-monospace, sfmono-regular, consolas, monospace;
  font-size: 12px;
  color: #303133;
  overflow-wrap: anywhere;
}

.embed__counter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 24px;
}

.embed__btn {
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: #0070b2;
    border-color: #0070b2;
  }

  &:focus-visible {
    outline: 2px solid #0070b2;
    outline-offset: 2px;
  }
}

.embed__count {
  min-width: 44px;
  font-family: ui-monospace, sfmono-regular, consolas, monospace;
  font-size: 20px;
  text-align: center;
}

.embed__counter-note {
  flex: 1 0 100%;
  margin: 0;
  font-size: 12px;
  color: #909399;
}
</style>
