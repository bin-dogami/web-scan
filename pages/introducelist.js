import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useLoading, useScrollThrottle, SiteName, IS_DEV } from '@/utils/index'
import { getTypesData } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

import styles from '@/styles/Types.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const pageSize = IS_DEV ? 5 : 100
const Introducelist = ({ data, skip }) => {
  const _data = typeof data === 'object' ? data : {}
  const list = Array.isArray(_data.list) ? _data.list : []
  // const list = Array.isArray(data) ? data : []

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

    const res = await getTypesData(startRef.current * pageSize, pageSize)
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
        <title>{`小说简介_小说内容介绍_小说剧情说明_${SiteName}`}</title>
        <meta name="description" content={`${SiteName}提供小说简单介绍，剧情说明`}></meta>
        <meta name="keywords" content={`小说简介,小说内容介绍,小说剧情说明`}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'introducelist'} />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        <h1>小说简介</h1>
      </header>
      <ul className="simple">
        {novels.map(({id, title}, index) => (
          <li>
            <Link as={`/introduce/${id}`} href={`/introduce?id=${id}`} title={`${title}`}>
              《{title}》内容简介
            </Link>
          </li>
        ))}
      </ul>
      <div className="notShow">
        {start > 1 ? <Link as={`/introducelist/${start - 2}`} href={`/introducelist?id=${start - 2}`} title="上一页">上一页</Link> : <span>前面没了</span>}
        {hasMore ? <Link as={`/introducelist/${start}`} href={`/introducelist?id=${start}`} title="下一页">下一页</Link> : <span>后面没了</span>}
      </div>
      {LoadingChunk}
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const skip = query.id && +query.id || 0
  // @TODO: 数据貌似有点问题？加载更多没有出现
  const res = await getTypesData(skip * pageSize, pageSize)
  const data = res.data.data
  return { props: { data, skip } }
}

export default inject('store')(observer(Introducelist))