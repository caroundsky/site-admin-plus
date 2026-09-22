import styles from './index.module.less'
import { getAssetsImages } from '@/utils'

const errorInfoMaps: { [key: string]: any } = {
  401: {
    img: getAssetsImages('/error-page-img/403.svg'),
    title: '401',
    desc: '请先登录',
  },
  403: {
    img: getAssetsImages('/error-page-img/403.svg'),
    title: '403',
    desc: '抱歉，你无权访问该页面',
  },
  404: {
    img: getAssetsImages('/error-page-img/404.svg'),
    title: '404',
    desc: '抱歉，你访问的页面不存在',
  },
}

export default defineComponent({
  props: {
    errType: {
      type: String,
      default: '403',
    },
  },

  setup(props) {
    let errorInfo: any
    const router = useRouter()

    watchEffect(async () => {
      errorInfo = errorInfoMaps[props.errType]
    })

    return () => (
      <div class={styles.exception}>
        <div class={styles.imgBlock}>
          <img src={errorInfo.img} />
        </div>
        <div class={styles.content}>
          <h1>{errorInfo.title}</h1>
          <div class={styles.desc}>{errorInfo.desc}</div>
          <div class={styles.actions}>
            <button class={styles.button} on-click={() => router.go(-1)}>
              返回
            </button>
          </div>
        </div>
      </div>
    )
  },
})
