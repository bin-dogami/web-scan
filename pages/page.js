import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { useHttping, usePagination } from '@/utils/index'
import { getPageById, getBooksByType } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Link from '@@/link/index'

import styles from '@/styles/Page.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const Page = ({ store: { book, common }, data, id }) => {
  const [page, menus] = Array.isArray(data) && data.length >= 2 ? data : [{}, []]
  console.log(page)

  // _data.types = Array.isArray(_data.types) ? _data.types : []
  // const [list, total] = Array.isArray(_data.list) && _data.list.length > 1 ? _data.list : [[], 0]

  // const startRef = useRef(types.start)
  // const [paginationData, setPagination] = useState(() => (
  //   {
  //     list, total, isReRequest: true
  //   }
  // ))
  // // @TODO: 前端缓存一下数据
  // const { mergedList, hasMore } = usePagination(paginationData)

  // // 发请求
  // const pageSize = 5
  // const getData = useCallback(async () => {
  //   // 用 startRef.current 来不及，还是得用 start
  //   return await getBooksByType(types.start * pageSize, pageSize)
  // }, [types.start])
  // const { loading, httpData } = useHttping(types.httpKey, getData)

  // // 下拉请求更多
  // const getMore = useCallback(() => {
  //   if (hasMore) {
  //     types.setStart(types.start + 1)
  //     types.setHttpKey()
  //   }
  // }, [hasMore, types.start])
  // const getMoreRef = useRef(getMore)

  // useEffect(() => {
  //   getMoreRef.current = getMore
  // }, [getMore])

  // useEffect(() => {
  //   if (Array.isArray(httpData) && httpData.length > 1) {
  //     const [list, total] = httpData
  //     setPagination({
  //       list, total, isReRequest: startRef.current === 0
  //     })
  //   }
  // }, [httpData])

  // useEffect(() => {
  //   startRef.current = types.start
  // }, [types.start])

  // @TODO: 可以抽离为自定义组件
  const scrollFn = () => {
    // const docElem = document.documentElement
    // const docBody = document.body
    // const scrollTop = docElem.scrollTop || docBody.scrollTop
    // const clientHeight = docElem.clientHeight || docBody.clientHeight
    // const scrollHeight = docElem.scrollHeight || docBody.scrollHeight
    // if (scrollTop + clientHeight >= scrollHeight) {
    //   // getMoreRef.current()
    // }
  }

  const onPrev = () => { }
  const onNext = () => { }

  const fontSizeList = ['small14', 'small16', '', 'big20', 'big22', 'big24', 'big28']
  const [fontSizeIndex, setFontSizeIndex] = useState(2)
  const [fontSizeClass, setFontSizeClass] = useState('')
  const onBig = () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    console.log(index, fontSizeClass, index < fontSizeList.length - 1)
    index < fontSizeList.length - 1 && setFontSizeClass(fontSizeList[index + 1])
  }
  const onSmall = () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    index > 0 && setFontSizeClass(fontSizeList[index - 1])
  }

  // 初始化 typeValue
  useEffect(() => {
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
      {/* @TODO: 找不到这个页面 */}
      <article className="chunkShadow">
        <header className="header crumbs">
          <strong><Link href="/" title={common.siteName}>{common.siteName}</Link></strong>
          <span>/</span>
          <strong><Link as={`/book/${page.novelId}`} href={`/book?id=${page.novelId}`} title={page.novelName}>{page.novelName}</Link></strong>
          <span>/</span>
          <strong>{page.mname}</strong>
        </header>
        <div className={styles.fontSize}>
          <strong>字号</strong>
          <span onClick={onBig} className={cx({ disabled: fontSizeList.indexOf(fontSizeClass) > fontSizeList.length - 2 })}>加大</span>
          <span onClick={onSmall} className={cx({ disabled: fontSizeList.indexOf(fontSizeClass) < 1 })}>加小</span>
        </div>
        <article className={styles.page}>
          <div className={styles.pageChange}>
            <span onClick={onPrev}>上一章</span>
            <a>章节列表</a>
            <span onClick={onNext}>下一章</span>
          </div>
          <header className="commonHeader">
            <h1>{page.index > 0 ? `第${page.index}章 ` : ''}{page.mname}</h1>
          </header>
          <div className={styles[fontSizeClass]}>
            <div className={styles.content} dangerouslySetInnerHTML={{ __html: page.content }}></div>
          </div>
        </article>
      </article>
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const res = await getPageById(id);
  const data = res.data.data;
  return { props: { data, id } }
}

export default inject('store')(observer(Page))