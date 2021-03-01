import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { SiteName, Description, devHost, useHttping, usePagination, usePaginationDrops, scrollIntoView } from '@/utils/index'
import { getBookById, getMenusByBookId } from '@/utils/request'
import * as dayjs from 'dayjs'
import Image from 'next/image'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Footer from '@@/footer/index'
import Recommends from "@@/recommends/index";
import Link from '@@/link/index'
import Page404 from '@@/404/index'

import styles from '@/styles/Book.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const defaultPageSize = 20
const oppositeDefaultPageSize = 100
const realRequestNum = 100
const useStateRef = (pageIndex, isDesc, pageSize, triggerHttp) => {
  // 每次请求limit 的 start
  const httpStartRef = useRef(0)
  const pageIndexRef = useRef(pageIndex)
  const isDescRef = useRef(isDesc)
  const [oppositePageSize, setOppositePageSize] = useState(0)
  const pageSizeRef = useRef(0)
  const triggerHttpRef = useRef(0)

  useEffect(() => {
    pageIndexRef.current = pageIndex
  }, [pageIndex])

  useEffect(() => {
    pageSizeRef.current = pageSize
    setOppositePageSize(pageSize === defaultPageSize ? oppositeDefaultPageSize : defaultPageSize)
  }, [pageSize])

  useEffect(() => {
    triggerHttpRef.current = triggerHttp
  }, [triggerHttp])

  return [httpStartRef, pageIndexRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef]
}

const getDescription = (novel) => {
  if (novel && novel.title) {
    let description = `${novel.title}小说阅读,`
    description += `${novel.typename}${novel.title}由作家${novel.author}创作,${SiteName}提供${novel.title}最新章节及章节列表,${SiteName}提供最佳阅读体验，章节阅读自动翻页，无需手动翻页，无弹窗阅读就上${SiteName}`
    return description
  }

  return Description
}

const Book = ({ store: { common }, data, id, page, skip }) => {
  const [novel, list, DescMenus, total, recommendBooks] = Array.isArray(data) && data.length >= 5 ? data : [{}, [], [], 0, []]

  // title
  const title = novel && novel.title ? `${novel.title}_${novel.author}著_${novel.typename}${novel.isComplete ? '全本小说_' : ''}_${novel.title}无弹窗阅读_${novel.title}免费看_${SiteName}` : `${SiteName}_免费看小说_无弹窗小说`
  const description = getDescription(novel)

  const lastMenu = DescMenus.length ? DescMenus[0] : (list.length ? list[list.length - 1] : {})

  const [triggerHttp, setTriggerHttp] = useState(0)
  const cachedMenusObj = useRef({
    [skip / realRequestNum]: list
  })
  const start = page % (realRequestNum / defaultPageSize) * defaultPageSize
  const [menusList, setMenusList] = useState(list.slice(start, start + defaultPageSize))
  // 目录当前在第几页
  const [pageIndex, setPageIndex] = useState(page)
  // 倒序
  const [isDesc, setIsDesc] = useState(0)
  // 每页章数
  const [pageSize, setPageSize] = useState(defaultPageSize)
  // 分页下拉section
  const menuOptions = usePaginationDrops(total, isDesc, pageSize)
  // 创建相关ref
  const [httpStartRef, pageIndexRef, isDescRef, oppositePageSize, pageSizeRef, triggerHttpRef] = useStateRef(pageIndex, isDesc, pageSize, triggerHttp)
  // 每页目录数切换
  const onSetPageSize = useCallback(() => {
    const size = pageSize === defaultPageSize ? oppositeDefaultPageSize : defaultPageSize
    pageIndexRef.current = 0
    setPageIndex(0)
    httpStartRef.current = 0
    pageSizeRef.current = size
    setPageSize(size)
    // 重新请求
    setTriggerHttp(triggerHttpRef.current + 1)
  }, [pageSize])
  // 正序 => 倒序
  const onDesc = useCallback(() => {
    setPageIndex(0)
    isDescRef.current = +(!isDescRef.current)
    setIsDesc(isDescRef.current)
    cachedMenusObj.current = {}
    setTriggerHttp(triggerHttpRef.current + 1)
  }, [])
  const pageChange = useCallback(next => {
    if (next < 0) {
      return
    }
    httpStartRef.current = Math.floor(next / (realRequestNum / pageSizeRef.current))
    const cachedMenusList = cachedMenusObj.current[httpStartRef.current]
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
    e.preventDefault()
    pageChange(pageIndex - 1)
  }, [pageIndex, pageChange])
  // 下一页
  const onNext = useCallback(e => {
    // a 链接的跳转和 js 跳转共存会引起pageIndex错乱，然后跳转前js 更新的数据和跳转后的数据不一样，但其实是没问题的
    e.preventDefault()
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
    scrollIntoView(document.querySelector('footer'))
  }

  useEffect(() => {
    const [list, total] = Array.isArray(httpData) ? httpData : [[], 0]
    // 防止 httpData 初始化时导致清空了 cachedMenusObj
    if (total > 0) {
      cachedMenusObj.current[httpStartRef.current] = list.length ? list : null
      pageChange(pageIndexRef.current)
    }
  }, [httpData])

  useEffect(() => {
    if (pageSizeRef.current === 100 && menusList.length) {
      scrollIntoView(document.querySelector('#menus'))
    }
  }, [menusList])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta name="keywords" content={novel && novel.title ? `${novel.title}最新章节,${novel.title}免费阅读,${novel.title}无弹窗阅读`
          : `${SiteName},免费看小说`}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav />
      {!novel ?
        <Page404>找不到这本书哦!</Page404> :
        <>
          <article className="chunkShadow">
            <header className="header crumbs">
              <strong><Link href="/" title="首页">首页</Link></strong>
              <span>/</span>
              <strong>{novel.title}</strong>
            </header>
            <article className={styles.book}>
              <header className="commonHeader">
                <h1>{novel.title}</h1>
              </header>
              <div className={styles.detail}>
                <div className={styles.thumb}>
                  <Image src={`/${novel.thumb}`} alt={novel.title} title={novel.title} layout="fill"></Image>
                </div>
                <div className={styles.info}>
                  <header>
                    <h3>
                      作者：
                      <Link as={`/author/${novel.authorId}`} href={`/author?id=${novel.authorId}`} title={`作者：${novel.author}`} className={styles.author}>{novel.author}</Link>
                    </h3>
                  </header>
                  <ul>
                    <li>
                      <strong>
                        类别：
                    <Link href={`/types/${novel.typeid}`}>
                          {novel.typename}
                        </Link>
                      </strong>
                    </li>
                    <li>
                      <strong>状态：{novel.isComplete ? <Link href='/complete' title="完本">完本</Link> : '连载'}</strong>
                    </li>
                    <li><strong>更新时间：{dayjs(novel.updatetime).format('YYYY-MM-DD HH:mm')}</strong></li>
                    <li>
                      <strong>
                        最新章节：
                    {lastMenu && lastMenu.id ?
                          <Link as={`/page/${lastMenu.id}`} href={`/page?id=${lastMenu.id}`} className={styles.lastMenu}>
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
              <header className="notShow">
                <h2>
                  {novel.title}
                  章节列表
                </h2>
              </header>
              {DescMenus.length && !isDesc ?
                <article className={styles.menusWrapper}>
                  <header className={styles.menusHeader}>
                    <h3>
                      {novel.title.length < 10 ? `${novel.title} · 最新章节` : '最新章节'}
                    </h3>
                    <span onClick={onDesc}>更多 (倒序)</span>
                  </header>
                  {/* @TODO: 如果是全本且最后一章加上 完 */}
                  <ul className={cx({ menuList: true, descList: true })}>
                    {DescMenus.map(({ id, mname, moriginalname, index }) => (
                      <li key={id}>
                        <Link as={`/page/${id}`} href={`/page?id=${id}`} title={index > 0 ? `第${index}章 ${mname}` : moriginalname}>
                          <span className={cx({ mr10: index > 0 })}>{index > 0 ? `第${index}章` : ''}</span><strong>{index > 0 ? mname : moriginalname}</strong>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article> : null
              }
              <article className={styles.menusWrapper} id="menus">
                <header className={styles.menusHeader}>
                  <h3>
                    {novel.title.length < 10 ? `${novel.title} · 正文章节` : '正文章节'}
                  </h3>
                  {/* {isDesc ? <span onClick={onDesc}>正序</span> : null} */}
                  <span onClick={onSetPageSize}>每页 {oppositePageSize} 章</span>
                </header>
                <div className={loading ? 'loadingOnWrapper' : ''}>
                  <ul className={cx({ menuList: true, fixBlank: menusList.length % 2 !== 0 })}>
                    {menusList.map(({ id, mname, moriginalname, index }) => (
                      <li key={id}>
                        <Link as={`/page/${id}`} href={`/page?id=${id}`} title={index > 0 ? `第${index}章 ${mname}` : moriginalname}>
                          <span className={cx({ mr10: index > 0 })}>{index > 0 ? `第${index}章` : ''}</span><strong>{index > 0 ? mname : moriginalname}</strong>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
              <div className={styles.pageChange}>
                {/* @TODO: 倒序的时候上一页和下一页应该反过来 */}
                {
                  pageIndex === 0 ?
                    <span className={styles.disabled}>前面没了</span> :
                    <a href={`/book/${id}?page=${pageIndex - 1}`} className={cx({ loading, prev: true })} onClick={onPrev}><i></i>上一页</a>
                }
                <select value={pageIndex} onChange={onPageChange}>
                  {menuOptions.map((v, index) => (
                    <option key={v} value={index} disabled={loading}>{v}章</option>
                  ))}
                </select>
                {
                  pageIndex === menuOptions.length - 1 ?
                    <span className={styles.disabled}>后面没了</span> :
                    <a href={`/book/${id}?page=${pageIndex + 1}`} className={cx({ loading, next: true })} onClick={onNext}>下一页<i></i></a>
                }
              </div>
            </section>
          </article>
          <Recommends data={recommendBooks} />
          <Footer />
        </>
      }
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const page = query.page && +query.page || 0
  const skip = Math.floor(page / (realRequestNum / defaultPageSize)) * realRequestNum
  console.log(skip)
  const res = await getBookById(id, skip)
  const data = res.data.data
  return { props: { data, id, page, skip } }
}

export default inject('store')(observer(Book))