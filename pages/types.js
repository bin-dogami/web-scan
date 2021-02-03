import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import TypeTags from '@@/typeTags/index'
import { useHttping, usePagination } from '@/utils/index'
import { getTypesData, getBooksByType } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'

import styles from '@/styles/Types.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const Types = ({ store: { types }, data, id }) => {
  const _data = typeof data === 'object' ? data : {}
  _data.types = Array.isArray(_data.types) ? _data.types : []
  const [list, total] = Array.isArray(_data.list) && _data.list.length > 1 ? _data.list : [[], 0]

  const startRef = useRef(types.start)
  const [paginationData, setPagination] = useState(() => (
    {
      list, total, isReRequest: true
    }
  ))
  // @TODO: 前端缓存一下数据
  const { mergedList, hasMore } = usePagination(paginationData)

  // 发请求
  const pageSize = 5
  const getData = useCallback(async () => {
    // 用 startRef.current 来不及，还是得用 start
    return await getBooksByType(types.typeValue, types.start * pageSize, pageSize)
  }, [types.typeValue, types.start])
  const { loading, httpData } = useHttping(types.httpKey, getData)

  // 下拉请求更多
  const getMore = useCallback(() => {
    if (hasMore) {
      types.setStart(types.start + 1)
      types.setHttpKey()
    }
  }, [hasMore, types.start])
  const getMoreRef = useRef(getMore)

  useEffect(() => {
    getMoreRef.current = getMore
  }, [getMore])

  useEffect(() => {
    if (Array.isArray(httpData) && httpData.length > 1) {
      const [list, total] = httpData
      setPagination({
        list, total, isReRequest: startRef.current === 0
      })
    }
  }, [httpData])

  useEffect(() => {
    startRef.current = types.start
  }, [types.start])

  // @TODO: 可以抽离为自定义组件
  const scrollFn = () => {
    const docElem = document.documentElement
    const docBody = document.body
    const scrollTop = docElem.scrollTop || docBody.scrollTop
    const clientHeight = docElem.clientHeight || docBody.clientHeight
    const scrollHeight = docElem.scrollHeight || docBody.scrollHeight
    if (scrollTop + clientHeight >= scrollHeight) {
      // getMoreRef.current()
    }
  }

  // 初始化 typeValue
  useEffect(() => {
    types.setTypeValue(id)

    window.addEventListener('scroll', scrollFn)

    return () => {
      window.removeEventListener('scroll', scrollFn)
    }
  }, [])

  return (
    <>
      <Head>
        <title>分类</title>
      </Head>
      <Top isIndex={true} />
      <Search />
      <Nav />
      <TypeTags data={_data.types} />
      {!loading ? <div>加载中...</div> : null}
      <BookList books={mergedList} />
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const res = await getTypesData(id);
  const data = res.data.data;
  return { props: { data, id } }
}

export default inject('store')(observer(Types))