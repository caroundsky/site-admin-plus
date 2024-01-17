<script lang="tsx">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import MainContainer from '@/layouts/index.vue'
import bus from '@/bus'
import * as tools from '@/tools'
import '@/assets/icbg/css/icbg-font.css'

const AppModule = namespace('app')

@Component({
  name: 'RootContainer',
  provide: {
    bus,
  },
})
export default class RootContainer extends Vue {
  async created() {
    bus.$on('setMenus', (data: any) => {
      this.$store.dispatch('menu/setNavMenu', data)
    })

    bus.$emit('appCreateStart', this)

    await this.$store.dispatch('app/init')

    bus.$emit('appCreateEnd', this)
  }

  mounted() {
    bus.$emit('appMounted', this)
  }

  render() {
    return <MainContainer />
  }
}
</script>
