/**
 * 格式化 response
 * 规定为 `success` 和 `result` 返回，业务层采用 `{ success, result } = await xxx()`取值，提高可读性
 * 若 silent 为 false，错误信息统一在此处理和弹出，这样就不需要在业务里做处理了
 */
import { AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const _validateResponse = (res: any) => {
  try {
    return res.success || res.isSuccess || res.is_success || res.code === 200
  } catch (error) {
    return false
  }
}

const _handleError = (res: any, defaultMsg?: string) => {
  try {
    return res.msg || res.message || defaultMsg
  } catch (error) {
    return defaultMsg || null
  }
}

export default function (response: AxiosResponse, silent: boolean, defaultMsg = '请求成功') {
  const isBlob = response.config.responseType === 'blob'
  const res = isBlob ? response : response.data
  if (isBlob) {
    return res
  }

  if (_validateResponse(res)) {
    const msg = _handleError(res, defaultMsg)
    !silent && ElMessage.success(msg)

    return {
      success: true,
      result: res.data || res.result,
      msg,
    }
  } else {
    const msg = _handleError(res, '接口响应出错')
    !silent && ElMessage.error(msg)

    return {
      success: false,
      result: [],
      msg,
    }
  }
}
