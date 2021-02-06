import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { devHost, useHttping, usePagination, usePaginationDrops } from '@/utils/index'
import { getBookById, getMenusByBookId } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Footer from '@@/footer/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

import styles from '@/styles/Book.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const defaultPageSize = 5
const oppositeDefaultPageSize = 100
const requestNum = 100
const useStateRef = (start, isDesc, pageSize, triggerHttp) => {
  const startRef = useRef(0)
  const isDescRef = useRef(false)
  const [oppositePageSize, setOppositePageSize] = useState(0)
  const pageSizeRef = useRef(0)
  const triggerHttpRef = useRef(0)

  useEffect(() => {
    startRef.current = start
  }, [start])

  useEffect(() => {
    isDescRef.current = isDesc
  }, [isDesc])

  useEffect(() => {
    pageSizeRef.current = pageSize
    setOppositePageSize(pageSize === defaultPageSize ? oppositeDefaultPageSize : defaultPageSize)
  }, [pageSize])

  useEffect(() => {
    triggerHttpRef.current = triggerHttp
  }, [triggerHttp])

  return [startRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef]
}

const Book = ({ store: { book, common }, data, id }) => {
  const [novel, list, DescMenus, total, recommendBooks] = Array.isArray(data) && data.length >= 5 ? data : [{}, [], [], 0, []]

  const [triggerHttp, setTriggerHttp] = useState(0)
  const [menusData, setMenusData] = useState({
    list,
    total
  })
  const [menusList, setMenusList] = useState([])

  // 第几页、倒序、每页章数
  const [start, setStart] = useState(0)
  const [isDesc, setIsDesc] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  // 分页下拉section
  const menuOptions = usePaginationDrops(menusData.total, isDesc, pageSize)
  // 创建相关ref
  const [startRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef] = useStateRef(start, isDesc, pageSize, triggerHttp)
  // @TODO: useCallback
  const onSetPageSize = () => {
    const size = pageSize === defaultPageSize ? oppositeDefaultPageSize : defaultPageSize
    startRef.current = 0
    setStart(0)
    pageSizeRef.current = size
    setPageSize(size)
    // 重新请求
    setTriggerHttp(triggerHttpRef.current + 1)
  }
  const onDesc = useCallback(() => {
    setStart(0)
    isDescRef.current = +(!isDescRef.current)
    setIsDesc(isDescRef.current)
    setTriggerHttp(triggerHttpRef.current + 1)
  }, [])
  const pageChange = useCallback(next => {
    if (next < 0 || next >= menuOptions.length) {
      return
    }
    // const next = +e.target.value
    // 缓存了 requestNum 条数据
    if (next < startRef.current + requestNum / pageSizeRef.current) {
      setMenusList(menusData.list.slice(next * pageSizeRef.current, (next + 1) * pageSizeRef.current))
    } else {
      // 重新请求
      setTriggerHttp(triggerHttpRef.current + 1)
    }
    setStart(next)
  }, [menusData, menuOptions])
  // 下拉选择分页
  const onPageChange = useCallback(e => {
    pageChange(+e.target.value)
  }, [pageChange])
  // 上一页
  const onPrev = useCallback(e => {
    pageChange(start - 1)
  }, [start, pageChange])
  // 下一页
  const onNext = useCallback(e => {
    pageChange(start + 1)
  }, [start, pageChange])

  // @TODO: 前端缓存一下数据
  // 发请求，不管是每页20还是100 都请求100个回来，怎么处理再按每页多少来
  const getData = useCallback(async () => {
    return await getMenusByBookId(id, startRef.current * pageSizeRef.current, requestNum, isDescRef.current)
  }, [])
  const { loading, httpData } = useHttping(triggerHttp, getData)

  const onCollectBook = () => {

  }

  const onGoBottom = () => {
    const footer = document.querySelector('footer');
    if (footer && footer.scrollIntoView) {
      footer.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }

  useEffect(() => {
    const [list, total] = Array.isArray(httpData) ? httpData : [[], 0]
    // 防止 httpData 初始化时导致清空了 menusData
    if (total > 0) {
      setMenusData({
        list,
        total
      })
    }
  }, [httpData])

  useEffect(() => {
    setMenusList(menusData.list.slice(0, pageSizeRef.current))
  }, [menusData])

  return (
    <>
      <Head>
        <title>11111</title>
      </Head>
      <Top isIndex={true} noH1={true} />
      <Search />
      <Nav />
      <article className="chunkShadow">
        <header className="header crumbs">
          <strong><Link href="/" title={common.siteName}>{common.siteName}</Link></strong><span>/</span><h1>{novel.title}</h1>
        </header>
        <article className={styles.book}>
          <header className="hide">
            <h2>
              {novel.title}内容介绍
            </h2>
          </header>
          <div className={styles.detail}>
            <div className={styles.thumb}>
              <img src={`http://${devHost}:3011/${novel.thumb}`} alt={novel.title} title={novel.title} />
            </div>
            <div className={styles.info}>
              <header>
                <h3>
                  <a href="" title={`作者：${novel.author}`} className={styles.author}>
                    作者：{novel.author}
                  </a>
                </h3>
              </header>
              <ul>
                <li><strong>类别：</strong></li>
                <li><strong>状态：</strong></li>
                <li><strong>更新时间：</strong></li>
                <li><strong>最新章节：</strong></li>
              </ul>
            </div>
          </div>
          <div className={styles.btn}>
            {menusList.length ?
              <Link as={`/page/${menusList[0].id}`} href={`/page?id=${menusList[0].id}`}>
                开始阅读
              </Link> :
              null}
            <span className={styles.collectBook} onClick={onCollectBook}>收藏本书</span>
            <span className={styles.goBottom} onClick={onGoBottom}>直达底部</span>
          </div>
          <div className={styles.description}>
            <strong>简介：</strong>{(novel.description || '').trim()}
          </div>
        </article>
        <section>
          <header className="hide">
            <h2>
              {novel.title}章节列表
            </h2>
          </header>
          {!isDesc ?
            <article>
              <header className={styles.menus}>
                <h3>
                  {novel.title.length < 10 ? `${novel.title} · 最新章节` : '最新章节'}
                </h3>
                <span onClick={onDesc}>更多 (倒序)</span>
              </header>
              <ul className={cx({ menuList: true, descList: true })}>
                {DescMenus.map(({ id, mname, index }) => (
                  <li key={id}>
                    <Link as={`/page/${id}`} href={`/page?id=${id}`}>
                      <span>{index > 0 ? `第${index}章` : ''}</span><strong>{mname}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </article> : null
          }
          <article>
            <header className={styles.menus}>
              <h3>
                {novel.title.length < 10 ? `${novel.title} · 正文章节` : '正文章节'}
              </h3>
              {/* {isDesc ? <span onClick={onDesc}>正序</span> : null} */}
              <span onClick={onSetPageSize}>每页 {oppositePageSize} 章</span>
            </header>
            <ul className={cx({ menuList: true, fixBlank: menusList.length % 2 !== 0 })}>
              {menusList.map(({ id, mname, index }) => (
                <li key={id}>
                  <Link as={`/page/${id}`} href={`/page?id=${id}`}>
                    <span className={cx({ mr10: index > 0 })}>{index > 0 ? `第${index}章` : ''}</span><strong>{mname}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
          <div className={styles.pageChange}>
            <span className={cx({ disabled: loading || start === 0 })} onClick={onPrev}>上一页</span>
            <select value={start} onChange={onPageChange}>
              {menuOptions.map((v, index) => (
                <option key={v} value={index} disabled={loading}>{v}章</option>
              ))}
            </select>
            <span className={cx({ disabled: loading || start === menuOptions.length - 1 })} onClick={onNext}>下一页</span>
          </div>
        </section>
      </article>
      <article className={styles.hotRecommend}>
        <header className="header h2Header">
          <h2>
            热门推荐
            </h2>
          <a>更多...</a>
        </header>
        <BookList books={recommendBooks} />
      </article>
      <Footer />
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const res = await getBookById(id)
  const data = res.data.data
  return { props: { data, id } }
}

export default inject('store')(observer(Book))