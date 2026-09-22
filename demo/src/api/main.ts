import templateRequest from './request'
import apiConfig from '@/api.config'

const apiPrefix = apiConfig.main

export function getCurrentUser() {
  return templateRequest({
    apiPrefix,
    url: '/getUser',
    method: 'get',
    transformResponse: (res) => {
      return res
    },
  })
}
