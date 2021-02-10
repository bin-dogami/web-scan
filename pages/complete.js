import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useLoading, useScrollThrottle } from '@/utils/index'
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

const pageSize = 5
const Complete = ({ data, skip }) => {
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

    const res = await getBooksByCompleted(startRef.current * pageSize, pageSize)
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
        <title>全本小说</title>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        <h1>全本小说</h1>
      </header>
      <BookList books={novels} />
      <div className="notShow">
        {start > 1 ? <Link as={`/complete/${start - 2}`} href={`/complete?id=${start - 2}`} title="上一页">上一页</Link> : <span>前面没了</span>}
        {hasMore ? <Link as={`/complete/${start}`} href={`/complete?id=${start}`} title="下一页">下一页</Link> : <span>后面没了</span>}
      </div>
      {LoadingChunk}
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