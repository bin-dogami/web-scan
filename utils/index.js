import { useRef, useState, useEffect } from 'react'

export const devHost = 1 ? 'localhost' : '192.168.31.231'
const productionHost = 'http://localhost:3000/';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const BASE_URL = IS_DEV ? `http://${devHost}:3000/` : productionHost;

// 请求数据, getDataNow 为自增数
export const useHttping = (getDataNow, httpFn) => {
  const [loading, setLoading] = useState(false)
  const [httpData, setData] = useState(null)
  const httpFnRef = useRef(httpFn)

  useEffect(() => {
    if (!getDataNow) {
      return
    }
    setLoading(true)
    httpFnRef.current().then((res) => {
      setLoading(false)
      setData(res.data.data)
    })
  }, [getDataNow])

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