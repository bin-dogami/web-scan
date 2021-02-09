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

export const getBookById = async (id) => {
  return await axios({
    url: `${BASE_URL}scan/getBookById/`,
    method: 'get',
    params: {
      id
    },
    errorTitle: '获取书本信息错误',
  })
}

export const getMenusByBookId = async (id, skip, size = 20, desc = 0) => {
  return await axios({
    url: `${BASE_URL}scan/getMenusByBookId/`,
    method: 'get',
    params: {
      id,
      skip,
      size,
      desc
    },
    errorTitle: '获取目录列表错误',
  })
}

export const getPageById = async (id, onlypage = '') => {
  return await axios({
    url: `${BASE_URL}scan/getPageById/`,
    method: 'get',
    params: {
      id,
      onlypage
    },
    errorTitle: '获取章节信息错误',
  })
}

export const getPrevNextMenus = async (id, novelId, isPrev = 0) => {
  return await axios({
    url: `${BASE_URL}scan/getPrevNextMenus/`,
    method: 'get',
    params: {
      id,
      novelId,
      isPrev
    },
    errorTitle: '获取目录信息错误',
  })
}
