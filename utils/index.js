import { useRef, useState, useEffect } from 'react'

export const SiteName = '老王爱看书'
export const devHost = 1 ? 'localhost' : '192.168.31.231'
const productionHost = 'http://localhost:3000/';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const BASE_URL = IS_DEV ? `http://${devHost}:3000/` : productionHost;

// 请求数据, triggerHttp 为自增数
export const useHttping = (triggerHttp, httpFn) => {
  const [loading, setLoading] = useState(false)
  const [httpData, setData] = useState(null)
  const httpFnRef = useRef(httpFn)

  useEffect(() => {
    if (!triggerHttp) {
      return
    }
    setLoading(true)
    httpFnRef.current().then((res) => {
      setLoading(false)
      setData(res.data.data)
    })
  }, [triggerHttp])

  useEffect(() => {
    httpFnRef.current = httpFn
  }, [httpFn])

  return {
    loading,
    httpData
  }
}

// 根据http请求返回的数据生成 可用的list、hasMore
// data: {list, any[], total: 1000, isReRequest?: false}，data 必须为 useState 对象
export const usePagination = (data) => {
  const [mergedList, setList] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const listRef = useRef([])

  useEffect(() => {
    if (typeof data !== 'object' || !Array.isArray(data.list) || data.total <= 0) {
      return
    }
    if (data.isReRequest) {
      setList(data.list)
      setHasMore(data.list.length < data.total)
    } else {
      const _list = [...listRef.current, ...data.list]
      setList(_list)
      setHasMore(_list.length < data.total)
    }
  }, [data])

  useEffect(() => {
    listRef.current = mergedList
  }, [mergedList])

  return {
    mergedList,
    hasMore,
  }
}

export const useLoading = (loading, hasMore) => {

}

// 根据目录总数、倒序与否、每页数 获得分页下拉选项数据
// @TODO: 当有好多个和小说无关的章节时，这个计算和实际展示的章节会偏移的厉害
export const usePaginationDrops = (total, isDesc = false, pageSize = 20) => {
  const [menuOptions, setMenuOptions] = useState([])

  useEffect(() => {
    if (total <= 0) {
      return
    }
    const length = Math.ceil(total / pageSize)
    const options = new Array(length).fill(0).map((v, index) => {
      return isDesc ? `${(length - index - 1) * pageSize} ~ ${(length - index) * pageSize}` : `${index * pageSize + 1} ~ ${(index + 1) * pageSize}`
    })
    setMenuOptions(options)
  }, [total, isDesc, pageSize])

  return menuOptions
}