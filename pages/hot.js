import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useLoading, useScrollThrottle, SiteName } from '@/utils/index'
import { getBooksByHot } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

import styles from '@/styles/Types.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const pageSize = 4
const Hot = ({ data, skip }) => {
  const list = Array.isArray(data) ? data : []

  const [novels, setNovels] = useState(list)
  const novelsRef = useRef(novels)
  const [start, setStart] = useState(skip + 1)
  const startRef = useRef(start)
  const [hasMore, setHasMore] = useState(true)
  const hasMoreRef = useRef(hasMore)
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(loading)
  const LoadingChunk = useLoading(loading, hasMore)

  // 发请求
  const getData = useCallback(async () => {
    if (!hasMoreRef.current || loading.current) {
      return
    }
    loadingRef.current = true
    setLoading(true)

    const res = await getBooksByHot(startRef.current * pageSize, pageSize)
    const list = Array.isArray(res.data.data) ? res.data.data : []
    const newNovels = [...novelsRef.current, ...list]
    novelsRef.current = newNovels
    setNovels(newNovels)
    if (list.length < pageSize) {
      hasMoreRef.current = false
      setHasMore(false)
    } else {
      const nextStart = startRef.current + 1
      startRef.current = nextStart
      setStart(nextStart)
    }

    loadingRef.current = false
    setLoading(false)
  }, [])

  useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
    if (scrollTop + clientHeight >= scrollHeight - 150) {
      getData()
    }
  })

  return (
    <>
      <Head>
        <title>{`热门推荐小说_热门推荐小说排行榜_${SiteName}`}</title>
        <meta name="description" content={`最新热门网络小说排行榜是用户推举的小说排行榜,包含各类小说排行榜及热门小说推荐,小说排行榜上都是受用户欢迎的小说作品,精彩尽在${SiteName}。`}></meta>
        <meta name="keywords" content={`小说排行榜,热门小说排行榜,小说排行榜完结版,完结小说排行榜,完本小说排行榜,最新小说排行榜,网络小说排行榜`}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'Hot'} />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        <h1>热门推荐小说</h1>
      </header>
      <BookList books={novels} />
      <div className="notShow">
        {/*  @TODO: 确定这种SEO 方式有效?需要看跳转过去是一个新的路由，会刷新页面 */}
        {start > 1 ? <Link as={`/hot/${start - 2}`} href={`/hot?id=${start - 2}`} title="上一页">上一页</Link> : <span>前面没了</span>}
        {hasMore ? <Link as={`/hot/${start}`} href={`/hot?id=${start}`} title="下一页">下一页</Link> : <span>后面没了</span>}
      </div>
      {LoadingChunk}
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const skip = query.id && +query.id || 0
  const res = await getBooksByHot(skip * pageSize, pageSize)
  const data = res.data.data
  return { props: { data, skip } }
}

export default inject('store')(observer(Hot))