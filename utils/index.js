import { useRef, useState, useEffect } from 'react'
import { getBooksLastPageByIds } from './request'
// import Link from '@@/link/index'

export const SiteName = '老王爱看书网'
export const Description = `${SiteName}提供免费最佳阅读体验，章节阅读自动翻页，无需手动翻页，页面无弹窗广告，${SiteName}提供最新小说，全本小说，玄幻小说，都市小说，科幻小说，热门小说，仙侠小说，历史小说`
export const Keywords = `${SiteName},小说网,手机小说,最新小说推荐,小说阅读网,无弹窗小说网,免费小说下载网,小说阅读器全本免费小说,${SiteName},小说网站排名,小说在线阅读,免费小说阅读`

export const devHost = 1 ? 'localhost' : '192.168.31.231'
const productionHost = 'https://m.zjjdxr.com/';
export const IS_DEV = process.env.NODE_ENV === 'development';
export const BASE_URL = IS_DEV ? `http://${devHost}:3001/` : productionHost;
export const IMAGE_HOST = 'https://m.zjjdxr.com'

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

export const NoMoreText = () => <div className="noMore"></div>
export const LoadingText = () => <div className="loadingChunk">正在加载中...</div>
export const useLoading = (loading, hasMore) => {
  return (
    !hasMore ? <NoMoreText /> : (loading ? <LoadingText /> : null)
  )
}
// const onPreventDefault = e => e.preventDefault()
// export const useLoadingWhenViewing = (loading, hasMore, as, href) => {
//   const GetMore = () => <div className="getMore">
//     <Link onClick={onPreventDefault} as={as} href={href}>下一页</Link>
//   </div>
//   return (
//     !hasMore ? <NoMoreText /> : (loading ? <LoadingText /> : <GetMore />)
//   )
// }

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

export const scrollIntoView = (selector) => {
  if (selector && selector.scrollIntoView) {
    selector.scrollIntoView({
      behavior: 'smooth'
    });
  }
}

export const scrollIntoViewIfNeeded = (selector) => {
  if (selector && selector.scrollIntoViewIfNeeded) {
    selector.scrollIntoViewIfNeeded();
  }
}

export const throttle = (fn, wait) => {
  var pre = Date.now();
  return function () {
    var context = this;
    var args = arguments;
    var now = Date.now();
    if (now - pre >= wait) {
      fn.apply(context, args);
      pre = Date.now();
    }
  }
}

// 获取元素距文档顶部（非视口）距离
export const getElementToPageTop = (el) => {
  if (el == null) {
    return
  }

  if (el.parentElement) {
    return getElementToPageTop(el.parentElement) + el.offsetTop
  }
  return el.offsetTop
}

export const scrollThrottle = (fn, timer = 150, domRef) => throttle(() => {
  const docElem = document.documentElement
  const docBody = document.body
  const scrollTop = domRef ? domRef.current.scrollTop : (docElem.scrollTop || docBody.scrollTop)
  const clientHeight = domRef ? domRef.current.clientHeight : (docElem.clientHeight || docBody.clientHeight)
  const scrollHeight = domRef ? domRef.current.scrollHeight : (docElem.scrollHeight || docBody.scrollHeight)
  fn && fn(scrollTop, clientHeight, scrollHeight)
}, timer)

export const useScrollThrottle = (fn, domRef) => {
  useEffect(() => {
    const _fn = scrollThrottle(fn, 150, domRef)
    const dom = domRef ? domRef.current : window
    if (dom) {
      dom.addEventListener('scroll', _fn)
    } else {
      // 这个好像不会执行
      setTimeout(() => {
        domRef.current && domRef.current.addEventListener('scroll', _fn)
      }, 1000)
    }

    return () => {
      if (dom) {
        dom.removeEventListener('scroll', _fn)
      } else {
        setTimeout(() => {
          domRef.current && domRef.current.removeEventListener('scroll', _fn)
        }, 1000)
      }
    }
  }, [])
}

// 阅读历史
export const getBookLastPageByIds = async (ids, list) => {
  const copyList = JSON.parse(JSON.stringify(list))
  if (!ids || !ids.length) {
    return copyList
  }
  const res = await getBooksLastPageByIds(ids)
  const data = Array.isArray(res.data.data) ? res.data.data : []
  data.map(({ novelId, id, mname, index }) => {
    for (const item of copyList) {
      if (item.id === novelId) {
        item.lastId = id
        item.lastName = mname
        item.lastIndex = index
        item.isNew = true
        break
      }
    }
  })
  return copyList
}