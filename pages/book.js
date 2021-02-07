import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { devHost, useHttping, usePagination, usePaginationDrops } from '@/utils/index'
import { getBookById, getMenusByBookId } from '@/utils/request'
import * as dayjs from 'dayjs'

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

const defaultPageSize = 20
const oppositeDefaultPageSize = 100
const realRequestNum = 100
const useStateRef = (pageIndex, isDesc, pageSize, triggerHttp) => {
  // 每次请求limit 的 start
  const httpStartRef = useRef(0)
  const pageIndexRef = useRef(0)
  const isDescRef = useRef(false)
  const [oppositePageSize, setOppositePageSize] = useState(0)
  const pageSizeRef = useRef(0)
  const triggerHttpRef = useRef(0)

  useEffect(() => {
    pageIndexRef.current = pageIndex
  }, [pageIndex])

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

  return [httpStartRef, pageIndexRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef]
}

const Book = ({ store: { book, common }, data, id }) => {
  const [novel, list, DescMenus, total, recommendBooks] = Array.isArray(data) && data.length >= 5 ? data : [{}, [], [], 0, []]

  const lastMenu = DescMenus.length ? DescMenus[0] : (list.length ? list[list.length - 1] : {})

  const [triggerHttp, setTriggerHttp] = useState(0)
  const cachedMenusObj = useRef({
    0: list
  })
  const [menusList, setMenusList] = useState(list.slice(0, defaultPageSize))
  // 目录当前在第几页
  const [pageIndex, setPageIndex] = useState(0)
  // 倒序
  const [isDesc, setIsDesc] = useState(0)
  // 每页章数
  const [pageSize, setPageSize] = useState(defaultPageSize)
  // 分页下拉section
  const menuOptions = usePaginationDrops(total, isDesc, pageSize)
  // 创建相关ref
  const [httpStartRef, pageIndexRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef] = useStateRef(pageIndex, isDesc, pageSize, triggerHttp)
  // @TODO: useCallback
  // 每页目录数切换
  const onSetPageSize = () => {
    const size = pageSize === defaultPageSize ? oppositeDefaultPageSize : defaultPageSize
    pageIndexRef.current = 0
    setPageIndex(0)
    httpStartRef.current = 0
    setHttpStart(0)
    pageSizeRef.current = size
    setPageSize(size)
    // 重新请求
    setTriggerHttp(triggerHttpRef.current + 1)
  }
  // 正序 => 倒序
  const onDesc = useCallback(() => {
    setPageIndex(0)
    isDescRef.current = +(!isDescRef.current)
    setIsDesc(isDescRef.current)
    setTriggerHttp(triggerHttpRef.current + 1)
  }, [])
  const pageChange = useCallback(next => {
    if (next < 0) {
      return
    }
    httpStartRef.current = Math.floor(next / (realRequestNum / pageSizeRef.current))
    const cachedMenusList = cachedMenusObj.current[httpStartRef.current]
    // console.log(httpStartRef.current, next, next % (realRequestNum / pageSizeRef.current) * pageSizeRef.current, cachedMenusObj.current)
    if (cachedMenusList) {
      const start = next % (realRequestNum / pageSizeRef.current) * pageSizeRef.current
      cachedMenusList && setMenusList(cachedMenusList.slice(start, start + pageSizeRef.current))
    } else {
      // 请求数据
      setTriggerHttp(triggerHttpRef.current + 1)
    }

    setPageIndex(next)
  }, [])
  // 下拉选择分页
  const onPageChange = useCallback(e => {
    pageChange(+e.target.value)
  }, [pageChange])
  // 上一页
  const onPrev = useCallback(e => {
    pageChange(pageIndex - 1)
  }, [pageIndex, pageChange])
  // 下一页
  const onNext = useCallback(e => {
    if (pageIndex + 1 < menuOptions.length) {
      pageChange(pageIndex + 1)
    }
  }, [pageIndex, pageChange, menuOptions])

  // 发请求，不管是每页20还是100 都请求100个回来，怎么处理再按每页多少来
  const getData = useCallback(async () => {
    return await getMenusByBookId(id, httpStartRef.current * realRequestNum, realRequestNum, isDescRef.current)
  }, [])
  const { loading, httpData } = useHttping(triggerHttp, getData)

  // @TODO: 这个不行啊 收藏本站
  const onCollectBook = () => {
    const title = `${novel.title}-${common.siteName}网`
    try {
      window.external.addFavorite(window.location.href, title);
    } catch (e) {
      try {
        window.sidebar.addPanel(title, window.location.href, "");
      } catch (e) {
        alert("抱歉，您所使用的浏览器无法自动收藏 \n\n 请手动收藏");
      }
    }
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
    // 防止 httpData 初始化时导致清空了 cachedMenusObj
    if (total > 0) {
      cachedMenusObj.current[httpStartRef.current] = list.length ? list : null
      pageChange(pageIndexRef.current)
    }
  }, [httpData])

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
          <strong><Link href="/" title={common.siteName}>{common.siteName}</Link></strong>
          <span>/</span>
          <strong>{novel.title}</strong>
        </header>
        <article className={styles.book}>
          <header className="commonHeader">
            <h1>{novel.title}</h1>
          </header>
          <div className={styles.detail}>
            <div className={styles.thumb}>
              <img src={`http://${devHost}:3011/${novel.thumb}`} alt={novel.title} title={novel.title} />
            </div>
            <div className={styles.info}>
              <header>
                <h3>
                  作者：
                  <a href="" title={`作者：${novel.author}`} className={styles.author}>
                    {novel.author}
                  </a>
                </h3>
              </header>
              <ul>
                <li>
                  <strong>
                    类别：
                    <Link href={`/types/${novel.typeid}`}>
                      {novel.typeName}
                    </Link>
                  </strong>
                </li>
                <li>
                  <strong>状态：
                    {novel.isComplete ?
                      <Link href='/complete'>
                        全本
                      </Link> : '连载'}
                  </strong>
                </li>
                <li><strong>更新时间：{dayjs(novel.updatetime).format('YYYY-MM-DD HH:mm')}</strong></li>
                <li>
                  <strong>
                    最新章节：
                    {lastMenu && lastMenu.id ?
                      <Link as={`/page/${lastMenu.id}`} href={`/page?id=${lastMenu.id}`}>
                        {lastMenu.mname}
                      </Link> : ''
                    }
                  </strong>
                </li>
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
          {DescMenus.length && !isDesc ?
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
                    <Link as={`/page/${id}`} href={`/page?id=${id}`} title={index > 0 ? `第${index}章` : ''}>
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
            <ul className={cx({ menuList: true, fixBlank: menusList.length % 2 !== 0, loading })}>
              {menusList.map(({ id, mname, index }) => (
                <li key={id}>
                  <Link as={`/page/${id}`} href={`/page?id=${id}`} title={index > 0 ? `第${index}章` : ''}>
                    <span className={cx({ mr10: index > 0 })}>{index > 0 ? `第${index}章` : ''}</span><strong>{mname}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
          <div className={styles.pageChange}>
            <span className={cx({ disabled: loading || pageIndex === 0 })} onClick={onPrev}>{pageIndex === 0 ? '前面没了' : <>&lt;上一页</>}</span>
            <select value={pageIndex} onChange={onPageChange}>
              {menuOptions.map((v, index) => (
                <option key={v} value={index} disabled={loading}>{v}章</option>
              ))}
            </select>
            <span className={cx({ disabled: loading || pageIndex === menuOptions.length - 1 })} onClick={onNext}>{pageIndex === menuOptions.length - 1 ? '后面没了' : <>下一页 &gt;</>}</span>
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