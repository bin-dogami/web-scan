import { BASE_URL } from './index'
import axios from './axios'

export const getIndexData = async () => {
  return await axios({
    url: `${BASE_URL}scan/getIndexData`,
    method: 'get',
    errorTitle: '获取首页数据错误',
  })
}

export const getBooksLastPageByIds = async (ids) => {
  return await axios({
    url: `${BASE_URL}scan/getBooksLastPageByIds`,
    method: 'get',
    params: {
      ids
    },
    errorTitle: '获取书本信息错误',
  })
}

export const getBookBySearch = async (name, id) => {
  return await axios({
    url: `${BASE_URL}scan/getBookBySearch`,
    method: 'get',
    params: {
      id,
      name
    },
    errorTitle: '查询书本信息错误',
  })
}

export const getBookByName = async (name, id) => {
  return await axios({
    url: `${BASE_URL}scan/getBookByName`,
    method: 'get',
    params: {
      id,
      name
    },
    errorTitle: '查询书本信息错误',
  })
}

export const getTypesData = async (id, skip, size = 20) => {
  return await axios({
    url: `${BASE_URL}scan/getTypesData`,
    method: 'get',
    params: {
      id,
      skip,
      size
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

export const getBooksByCompleted = async (skip, size = 20) => {
  return await axios({
    url: `${BASE_URL}scan/getBooksByCompleted/`,
    method: 'get',
    params: {
      skip,
      size
    },
    errorTitle: '获取全本小说错误',
  })
}

export const getBooksByHot = async (skip, size = 20) => {
  return await axios({
    url: `${BASE_URL}scan/getBooksByHot/`,
    method: 'get',
    params: {
      skip,
      size
    },
    errorTitle: '获取热门推荐小说错误',
  })
}

export const getBookById = async (id, skip = 0, desc = 0) => {
  return await axios({
    url: `${BASE_URL}scan/getBookById/`,
    method: 'get',
    params: {
      id,
      skip,
      desc
    },
    errorTitle: '获取书本信息错误',
  })
}

export const getBookInfo = async (id) => {
  return await axios({
    url: `${BASE_URL}scan/getBookInfo/`,
    method: 'get',
    params: {
      id,
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

export const getAuthorData = async (id) => {
  return await axios({
    url: `${BASE_URL}scan/getAuthorData/`,
    method: 'get',
    params: {
      id
    },
    errorTitle: '获取作者书本列表错误',
  })
}

export const getLastUpdates = async () => {
  return await axios({
    url: `${BASE_URL}scan/getLastUpdates/`,
    method: 'get',
    params: {},
    errorTitle: '获取最新更新错误',
  })
}
