import { BASE_URL } from './index'
import axios from './axios'

export const getIndexData = async () => {
  return await axios({
    url: `${BASE_URL}scan/getIndexData`,
    method: 'get',
    errorTitle: '获取首页数据错误',
  })
}

export const getTypesData = async (id) => {
  return await axios({
    url: `${BASE_URL}scan/getTypesData`,
    method: 'get',
    params: {
      id
    },
    errorTitle: '获取分类数据错误',
  })
}

export const getBooksByType = async (typeId, skip, size = 20) => {
  return await axios({
    url: `${BASE_URL}scan/getBooksByType/`,
    method: 'get',
    params: {
      typeId,
      skip,
      size
    },
    errorTitle: '获取分类书本错误',
  })
}