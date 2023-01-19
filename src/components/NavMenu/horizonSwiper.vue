<script lang="tsx">
import { Vue, Component, Watch, InjectReactive } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { NavMenuItem } from '~/types/interfaces'

import { debounce } from 'lodash'

const AppModule = namespace('app')

@Component
export default class horizonSwiper extends Vue {
  @InjectReactive('rootMenu') rootMenu!: any

  @AppModule.State('isInited')
  public AppInited!: boolean

  @AppModule.State('isAsideMenu')
  public isAsideMenu!: boolean

  get swiper() {
    return this.$refs.swiper
  }

  public calcWidth: number = 0
  public swiperWidth: number = 0
  public translateX: number = 0
  public swiperIndex: number = 0
  public swiperIndexMax: number = 1

  public slideNextHide: boolean = false
  public slidePrevHide: boolean = false

  @Watch('rootMenu.navMenuMode', { deep: true })
  async handle(menu: NavMenuItem[]) {
    if (!this.rootMenu.isAsideMenu) {
      await this.$nextTick()
      this.update()
      this.calcSwiperIndex()

      if (this.swiperIndexMax < 0) {
        this.swiperIndexMax = 0
        this.swiperIndex = 0
      }
    }
  }

  @Watch('rootMenu.isAsideMenu')
  handleIsAsideMenu(val: boolean) {
    if (!val) {
      this.update()
      this.calcSwiperIndex()
    }
  }

  @Watch('swiperIndex', { immediate: true })
  handleIndex(index: number) {
    this.slideNextHide = index === this.swiperIndexMax && index !== 0
  }

  @Watch('swiperIndexMax')
  handleMax(max: number) {
    if (max === 0 && this.swiperIndex === 0) {
      this.slideNextHide = true
    }
    if (max > this.swiperIndex) {
      this.slideNextHide = false
    }
  }

  @Watch('translateX', { immediate: true })
  handleTranslateX(val: number) {
    this.slidePrevHide = val === 0
  }

  render(h: any) {
    const prevBtn = (
      <div
        class="horizon-swiper-btn icon-prev el-icon-caret-left"
        style={{ opacity: this.slidePrevHide ? 0 : 1 }}
        on-click={this.slidePrev}
      />
    )
    const nextBtn = (
      <div
        class="horizon-swiper-btn icon-next el-icon-caret-right"
        style={{ opacity: this.slideNextHide ? 0 : 1 }}
        on-click={this.slideNext}
      />
    )
    const Item = h(
      'div',
      {
        ref: 'swiper',
        class: 'horizon-swiper-container',
        style: {
          width: `${this.calcWidth}px`,
          transform: `translateX(${this.translateX}px)`
        }
      },
      this.$slots.default
    )
    const warp = <div class="horizon-swiper-warp">{Item}</div>

    const nodes = [prevBtn, warp, nextBtn]
    return h(
      'div',
      { class: 'horizon-swiper', style: { width: `${this.swiperWidth}px` } },
      nodes
    )
  }

  update() {
    let horizonOperatW = (document as any)
      .getElementById('horizon-operat')
      .getBoundingClientRect().width
    this.swiperWidth = window.innerWidth - horizonOperatW - 50

    const swiper = this.swiper as HTMLElement
    const swiperItems = swiper.getElementsByClassName('nav-menu__item-lv1')

    let calcWidth = 0
    for (const ele of swiperItems) {
      calcWidth += ele.getBoundingClientRect().width
    }
    this.calcWidth = calcWidth

    // 60 -> 两个按钮的宽度
    // 100 -> 缓冲区域
    let result = Math.ceil((this.calcWidth - this.swiperWidth + 60 - 15) / 200)

    this.swiperIndexMax = result < 0 ? 0 : result
  }

  slidePrev() {
    if (this.slidePrevHide) return

    this.swiperIndex > 0 ? this.swiperIndex-- : 0
    this.translateX = -200 * this.swiperIndex
  }

  slideNext() {
    if (this.slideNextHide) return

    this.swiperIndex >= 0 ? this.swiperIndex++ : 0

    this.calcSwiperIndex(false)
  }

  calcSwiperIndex(checkZero: boolean = true) {
    if (this.swiperIndex >= this.swiperIndexMax) {
      this.swiperIndex = this.swiperIndexMax
      this.translateX = -(this.calcWidth - (this.swiperWidth - 60))
    } else {
      this.translateX = -200 * this.swiperIndex
    }

    if (!checkZero) return
    if (this.swiperIndexMax === 0 && this.swiperIndex === 0) {
      this.slidePrevHide = true
      this.slideNextHide = true
      this.translateX = 0
    }
  }

  mounted() {
    this.update()
    window.addEventListener(
      'resize',
      debounce(() => {
        if (!this.rootMenu.isAsideMenu) {
          this.update()
          this.calcSwiperIndex()
        }
      }, 200)
    )
  }
}
</script>

<style lang="less" scoped>
.horizon-swiper {
  display: inline-block;
  &-container {
    transition-duration: 300ms;
    min-width: 100%;
  }
  & > div {
    display: inline-block;
    vertical-align: middle;
    height: @menu-view-bar-height;
  }

  &-warp {
    width: calc(100% - 60px);
    overflow: hidden;
  }
  &-btn {
    width: 30px;
    line-height: 40px;
    text-align: center;
    color: white;
    cursor: pointer;
  }
}
</style>
