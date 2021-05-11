import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useLoading, useScrollThrottle, SiteName, IS_DEV } from '@/utils/index'
import { getBooksByCompleted } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

import styles from '@/styles/Types.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const pageSize = IS_DEV ? 5 : 50
const Complete = ({ data, skip }) => {
  const [list, hasMore] = Array.isArray(data) && data.length >= 2 ? data : [[], false]

  // const [novels, setNovels] = useState(list)
  // const novelsRef = useRef(novels)
  // const [start, setStart] = useState(skip + 1)
  // const startRef = useRef(start)
  // const [hasMore, setHasMore] = useState(true)
  // const hasMoreRef = useRef(hasMore)
  // const [loading, setLoading] = useState(false)
  // const loadingRef = useRef(loading)
  // const LoadingChunk = useLoading(loading, hasMore)

  // 发请求
  // const getData = useCallback(async () => {
  //   if (!hasMoreRef.current || loading.current) {
  //     return
  //   }
  //   loadingRef.current = true
  //   setLoading(true)

  //   const res = await getBooksByCompleted(startRef.current * pageSize, pageSize)
  //   const list = Array.isArray(res.data.data) ? res.data.data : []
  //   const newNovels = [...novelsRef.current, ...list]
  //   novelsRef.current = newNovels
  //   setNovels(newNovels)
  //   if (list.length < pageSize) {
  //     hasMoreRef.current = false
  //     setHasMore(false)
  //   } else {
  //     const nextStart = startRef.current + 1
  //     startRef.current = nextStart
  //     setStart(nextStart)
  //   }

  //   loadingRef.current = false
  //   setLoading(false)
  // }, [])

  // useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
  //   if (scrollTop + clientHeight >= scrollHeight - 150) {
  //     getData()
  //   }
  // })

  const prevAs = skip === 1 ? '' : `/${skip - 1}`
  const prevHref = skip === 1 ? '' : `?id=${skip - 1}`

  return (
    <>
      <Head>
        <title>{`完本小说列表_完本小说排行榜_完本免费小说_完本小说在线阅读_${SiteName}`}</title>
        <meta name="description" content={`${SiteName}完本小说排行榜为大家提供更好看的完本免费小说,全本免费小说,方便你的在线阅读,更多精彩完本小说尽在${SiteName}。`}></meta>
        <meta name="keywords" content={`完本小说网,完本小说排行榜,完本免费阅读`}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'Complete'} />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        <h1>完本小说</h1>
      </header>
      <BookList books={list} />
      {/* <div className="notShow">
        {start > 1 ? <Link as={`/complete/${start - 2}`} href={`/complete?id=${start - 2}`} title="上一页">上一页</Link> : <span>前面没了</span>}
        {hasMore ? <Link as={`/complete/${start}`} href={`/complete?id=${start}`} title="下一页">下一页</Link> : <span>后面没了</span>}
      </div> */}
      {list.length ? 
        <div className="pagination">
          {skip > 0 ? <Link as={`/complete${prevAs}`} href={`/complete${prevHref}`} title="上一页" className="prev"><i></i>上一页</Link> : <span>前面没了</span>}
          {hasMore ? <Link as={`/complete/${skip + 1}`} href={`/complete?id=${skip + 1}`} title="下一页" className="next">下一页<i></i></Link> : <span>后面没了</span>}
        </div>
        : '此页数据为空'
      }
      {/* {LoadingChunk} */}
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const skip = query.id && +query.id || 0
  const res = await getBooksByCompleted(skip * pageSize, pageSize)
  const data = res.data.data
  return { props: { data, skip } }
}

export default inject('store')(observer(Complete))