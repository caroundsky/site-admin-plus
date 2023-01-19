<script lang="tsx">
import Vue from 'vue'
import MonitorIcon from './svg-icons/monitor.svg'

export default Vue.extend({
  name: 'NetTestBtn',
  methods: {
    addView(menuView: any) {
      this.$store.dispatch('menuViews/addView', menuView)
    },
  },

  render() {
    return (
      <div
        class="app-act__link"
        title="网络连接测试"
        on-click={() =>
          this.addView({
            id: 'NET-TEST',
            text: '网络连接测试',
            href: 'https://juejin.im/',
          })
        }
      >
        <MonitorIcon />
      </div>
    )
  },
})
</script>
