<template>
  <div>
    <div class="sys-field__label" style="margin: 1em 0 0">主题</div>
    <ul class="sys-themes">
      <li
        v-for="theme in allThemes"
        :key="theme.name"
        :class="{
          [`bg-theme-${theme.name}`]: true,
          'cur-theme': theme.name === currentTheme,
        }"
        @click="changeTheme(theme)"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Theme } from './types'

export default Vue.extend({
  name: 'ThemeSwitchController',

  computed: {
    allThemes() {
      return this.$store.state.themes.allThemes
    },
    currentTheme() {
      return this.$store.state.themes.currentTheme
    },
  },

  methods: {
    changeTheme(theme: Theme) {
      this.$store.dispatch('themes/changeTheme', theme.name)
    },
  },
})
</script>

<style lang="less" scoped>
.sys-themes {
  margin: -5px 0 0;
  padding: 0;
  text-align: center;

  li {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    color: #fff;
    margin: 15px 8px 0;
    transition: box-shadow 0.2s;
    opacity: 0.7;
    display: inline-block;
    border-radius: 30px;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    &::before {
      content: 'T';
      font-family: Arial;
      font-size: 12px;
    }

    &.bg-dark-text-theme {
      color: #333;
    }
  }

  .cur-theme {
    box-shadow: 0 0 0 2px #fff, 0 0 0 7px #3f6ad8;
  }
}
</style>
