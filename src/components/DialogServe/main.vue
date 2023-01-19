<!--
 * dialog对话框
-->
<script lang="tsx">
import { Component, Vue, Watch } from 'vue-property-decorator'

import drag from './drag'
import FullscreenIcon from '@/assets/svg-icons/fullscreen.svg'
import MinscreenIcon from '@/assets/svg-icons/minscreen.svg'

import { isPlainObject, isFunction } from 'lodash'
import { isVNode } from '@/utils/tools'
import * as debug from '@/utils/debug'
import { VNode } from 'vue'

interface button {
  label: string
  type: string
  onClick?: Function
  // 参照 element-button 配置
  [k: string]: any
}

@Component({
  directives: { drag },
})
export default class Dialog extends Vue {
  public visible: boolean = false
  public title: string = '提示'
  public width: string = '520px'
  public height: string = ''
  public top: string = '15vh'
  public class: string = ''
  public button: Array<button> = []
  public showClose: boolean = true
  public canModalClose: boolean = false
  public fullscreen: boolean = false
  public fullScreenEnable: boolean = false
  public center: boolean = false

  public content: any = ''
  public iframeSrc: string = ''

  public afterOpen?: Function = () => {}
  public afterClose?: Function = () => {}

  private heightbackup: string = ''
  private iframeLoading: boolean = false

  get headerH(): number {
    const headerEl = this.$el.getElementsByClassName('el-dialog__header')[0]
    return headerEl.getBoundingClientRect().height
  }
  get footerH(): number {
    const footerEl = this.$el.getElementsByClassName('el-dialog__footer')[0]
    return footerEl ? footerEl.getBoundingClientRect().height : 0
  }

  @Watch('fullscreen')
  watchFullscreen(val: boolean) {
    if (val) {
      this.heightbackup = this.height
      this.height = `calc(100vh - ${this.headerH}px - ${this.footerH}px)`
    } else {
      this.height = this.heightbackup
    }
  }

  render(h: any) {
    let content = this.content
    let renderContent: string | Function | null | undefined | VNode = undefined
    if (typeof content === 'string') {
      if (/<.*?script.*?>.*?<\/.*?script.*?>/gi.test(content)) {
        // 有脚本攻击，转为实体字符
        const xss = require('xss')
        renderContent = xss(content)
      } else {
        renderContent = content
      }
    } else if (typeof content === 'function') {
      renderContent = content(h)
      if (typeof renderContent === 'undefined') {
        debug.warn('content is not return undefined')
      }
    } else if (content === null) {
      renderContent = null
    }

    if (!renderContent && this.iframeSrc) {
      renderContent = (
        <iframe
          src={this.iframeSrc}
          width="100%"
          height="100%"
          frameborder="0"
          scrolling="auto"
          on-load={() => {
            this.iframeLoading = false
          }}
        />
      )
    }

    let buttons: button[] = []
    this.button.forEach((item, index) => {
      if (typeof item === 'string') {
        debug.warn('请传入正确的 buttons 参数')
      } else if (isPlainObject(item)) {
        buttons.push(item)
      }
    })

    return (
      <el-dialog
        v-drag
        ref="bgcb-dialog"
        class={[
          'bgcb-dialog',
          { fullscreen: this.fullscreen },
          { 'is-iframe': this.iframeSrc },
          this.class,
        ]}
        title={this.title}
        visible={this.visible}
        width={this.width}
        top={this.top}
        center={this.center}
        showClose={this.showClose}
        closeOnClickModal={this.canModalClose}
        closeOnPressEscape={this.canModalClose}
        fullscreen={this.fullscreen}
        on={{
          closed: this.handleCancel,
          opened: this.handleOpen,
          'update:visible': (val: boolean) => (this.visible = val),
        }}
      >
        <template slot="title">
          <span class="el-dialog__title" domPropsInnerHTML={this.title} />
          <div class="el-dialog__touch"></div>
          {this.fullScreenEnable && (
            <div
              class="el-dialog__icon"
              on-click={() => this.handleFullScreen()}
            >
              {this.fullscreen ? <MinscreenIcon /> : <FullscreenIcon />}
            </div>
          )}
        </template>

        {isVNode(renderContent) ? (
          <div
            class="bgcb-dialog__content"
            v-loading={this.iframeLoading}
            style={{ height: this.height }}
          >
            {renderContent}
          </div>
        ) : (
          <div
            class="bgcb-dialog__content"
            domPropsInnerHTML={renderContent}
            style={{ height: this.height }}
          />
        )}

        {buttons.length !== 0 && (
          <div slot="footer" class="bg-dialog__footer">
            {buttons.map((item, index: number) => {
              return this._renderButton(item)
            })}
          </div>
        )}
      </el-dialog>
    )
  }

  _renderButton(btn: button) {
    const { label, type, ...props } = btn
    return (
      <el-button
        props={props}
        type={type}
        size="small"
        on={{ click: () => this.handleBtnClick(btn) }}
      >
        {label}
      </el-button>
    )
  }

  created() {
    if (this.fullscreen) {
      this.fullScreenEnable = true
    }

    // 如果iframeSrc和content同时存在，去content，并提示不要这样使用
    if (this.iframeSrc && this.content) {
      debug.error('dialog：参数iframeSrc、content同时存在，请去除任一参数')
    } else if (this.iframeSrc) {
      this.iframeLoading = true
    }
  }

  handleBtnClick(btn: button) {
    if (typeof btn.onClick === 'function') {
      btn.onClick(this)
    }
  }

  handleFullScreen() {
    this.fullscreen = !this.fullscreen
    // @ts-ignore
    this.$refs['bgcb-dialog'].$el.querySelector('.el-dialog').style.transform =
      'translate(0px, 0px)'
  }

  close() {
    this.visible = false
  }

  destroy() {
    document.body.removeChild(this.$el)
    this.$destroy()
  }

  handleOpen() {
    isFunction(this.afterOpen) && this.afterOpen(this)
  }

  handleCancel() {
    isFunction(this.afterClose) && this.afterClose(this)
    document.body.removeChild(this.$el)
    this.$destroy()
  }
}
</script>
<style lang="less" scoped>
.bgcb-dialog {
  /deep/ .el-dialog {
    max-width: 90%;
    &--center .el-dialog__title {
      left: 50% !important;
      transform: translateX(-50%);
    }
  }
  /deep/ .el-dialog__touch {
    padding: 10px 15px;
    height: 24px;
  }
  /deep/ .el-dialog__header {
    border-bottom: 1px solid #ebeef5;
    padding: 0;
    .el-dialog__title {
      font-size: 16px;
      position: absolute;
      top: 11px;
      left: 20px;
    }
    .el-dialog__icon {
      position: absolute;
      right: 36px;
      top: 14px;
      cursor: pointer;
      &:hover {
        color: #409eff;
      }
    }
    .el-dialog__headerbtn {
      top: 15px;
      right: 13px;
      & > i {
        color: #333;
      }
    }
  }
  /deep/ .el-dialog__body {
    padding: 0;
    color: #333;
  }
  /deep/ .el-dialog__footer {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
  }

  /deep/.el-dialog {
    &.is-fullscreen {
      max-width: initial;
      display: flex;
      flex-direction: column;
      .bgcb-dialog__content {
        max-height: initial;
      }
      .el-dialog__body {
        flex-grow: 1;
      }
    }
  }

  &.is-iframe {
    .bgcb-dialog__content {
      padding: 0;
      line-height: 0;
    }
  }
  &__content {
    max-height: calc(100vh - 340px);
    padding: 20px;
    line-height: 1.4;
    box-sizing: border-box;
    overflow: auto;
  }
}
</style>
