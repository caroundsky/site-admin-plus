import Cookies from 'js-cookie'
// import appConfig from '@/app.config'

/**
 * 获取 Authorization Cookie 值
 */
export default function getAuthorization(authCookieName: string | Function) {
  let auth
  if (typeof authCookieName === 'string' && !!authCookieName) {
    // 指定 cookie 获取名称，用于接口来源其他平台 auth 存储 cookie 名称与本系统不同的场景
    auth = Cookies.get(authCookieName)
  } else if (typeof authCookieName === 'function') {
    auth = authCookieName()
  } else {
    // auth = Cookies.get(appConfig.authCookieName) || ''
  }

  if (auth) {
    // Authorization 存储值的格式有可能为前后带引号，返回前先删除
    auth = auth.replace(/^"|"$/g, '')
  }

  return auth
}
