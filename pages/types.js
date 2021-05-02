import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useLoading, useScrollThrottle, SiteName } from '@/utils/index'
// 其实一个接口就行了，懒得改了
import { getTypesData, getBooksByType } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

import styles from '@/styles/Types.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const pageSize = 100
// 切换type类型时缓存一下数据
const cachedTypes = {}
const Types = ({ data, id, page }) => {
  const _data = typeof data === 'object' ? data : {}
  _data.types = Array.isArray(_data.types) ? _data.types : []
  const list = Array.isArray(_data.list) ? _data.list : []
  const types = [{ id: 0, name: '全部分类' }, ..._data.types]

  const [currentTypeName, setCurrentTypeName] = useState('')
  const [typeValue, setTypeValue] = useState(id)
  const typeValueRef = useRef(typeValue)
  const [novels, setNovels] = useState(list)
  const novelsRef = useRef(novels)
  const [start, setStart] = useState(page + 1)
  const startRef = useRef(start)
  const [hasMore, setHasMore] = useState(true)
  const hasMoreRef = useRef(hasMore)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(loading)
  const LoadingChunk = useLoading(loading, hasMore)

  // 发请求
  const getData = useCallback(async () => {
    if (!hasMoreRef.current || loadingRef.current) {
      return
    }
    loadingRef.current = true
    setLoading(true)

    const res = await getBooksByType(typeValueRef.current, startRef.current * pageSize, pageSize)
    const list = Array.isArray(res.data.data) ? res.data.data : []
    const newNovels = startRef.current ? [...novelsRef.current, ...list] : list
    novelsRef.current = newNovels
    setNovels(newNovels)
    if (list.length < pageSize) {
      hasMoreRef.current = false
      setHasMore(false)
      cachedTypes[typeValueRef.current] = [JSON.parse(JSON.stringify(newNovels)), startRef.current, false]
    } else {
      const nextStart = startRef.current + 1
      startRef.current = nextStart
      setStart(nextStart)
      cachedTypes[typeValueRef.current] = [JSON.parse(JSON.stringify(newNovels)), nextStart, hasMoreRef.current]
    }

    loadingRef.current = false
    setLoading(false)
  }, [])

  const onChangeType = id => e => {
    e.preventDefault()
    typeValueRef.current = id
    setTypeValue(id)
    if (cachedTypes[id]) {
      const [newNovels, newStart, newHasMore] = cachedTypes[id]
      novelsRef.current = newNovels
      setNovels(newNovels)
      startRef.current = newStart
      setStart(newStart)
      hasMoreRef.current = newHasMore
      setHasMore(newHasMore)
    } else {
      startRef.current = 0
      setStart(0)
      hasMoreRef.current = true
      getData()
    }

    window && window.history.replaceState(null, null, window.location.href.replace(/types\/?.*$/, `types/${id}`))
  }

  useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
    if (scrollTop + clientHeight >= scrollHeight - 150) {
      getData()
    }
  })

  useEffect(() => {
    types.forEach((item) => {
      if (item.id === typeValue) {
        setCurrentTypeName(item.name)
      }
    })
  }, [typeValue])

  useEffect(() => {
    cachedTypes[id] = [novels, start, hasMore]
  }, [])

  return (
    <>
      <Head>
        <title>{`分类小说推荐_中文小说排行榜_${SiteName}`}</title>
        <meta name="description" content={`${SiteName}提供玄幻、武侠、原创、网游、都市、言情、历史、军事、科幻、恐怖、官场、穿越、重生等小说,最新全本免费手机小说阅读推荐,精彩尽在${SiteName}。`}></meta>
        <meta name="keywords" content={`玄幻小说,武侠小说,原创小说,网游小说、都市小说,言情小说,历史小说,军小说事,科幻小说,恐怖小说,官场小说,穿越小说,全本小说,免费小说下载,小说在线阅读,无弹窗小说网`}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'Types'} />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        <h1>{currentTypeName || '全部分类小说'}</h1>
      </header>
      <div className={`types ${styles.types}`}>
        {types.map(({ id, name }, index) => (
          <a href={`/types/${id}`} key={index} className={cx({ on: id === typeValue })} onClick={onChangeType(id)}>{name.replace('小说', '')}</a>
        ))}
      </div>
      <BookList books={novels} />
      <div className="notShow">
        {start > 1 ? <Link as={`/types/${typeValue}?page=${start - 2}`} href={`/types?id=${typeValue}&page=${start - 2}`} title="上一页">上一页</Link> : <span>前面没了</span>}
        {hasMore ? <Link as={`/types/${typeValue}?page=${start}`} href={`/types?id=${typeValue}&page=${start}`} title="下一页">下一页</Link> : <span>后面没了</span>}
      </div>
      {LoadingChunk}
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const page = query.page && +query.page || 0
  const res = await getTypesData(id, page * pageSize, pageSize);
  const data = res.data.data;
  return { props: { data, id, page } }
}

export default inject('store')(observer(Types))