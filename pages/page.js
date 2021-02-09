import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { scrollIntoViewIfNeeded, scrollIntoView, LoadingText, useLoading, useScrollThrottle, getElementToPageTop } from '@/utils/index'
import { getPageById, getPrevNextMenus } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Footer from '@@/footer/index'
import Link from '@@/link/index'
import Recommends from "@@/recommends/index"
import Page404 from '@@/404/index'

import styles from '@/styles/Page.module.scss'
import classnames from 'classnames/bind'
import { userInfo } from 'os';
const cx = classnames.bind(styles)

const getNextId = (list, id, isPrev = false, returnIndex) => {
  if (!id || !list.length) {
    return null
  }

  const len = list.length
  let i = 0;
  let index = -1
  while (i < len - 1) {
    if (id === list[i].id) {
      index = i
      break
    }
    i++
  }
  if (index < 0) {
    return 0
  }
  const next = list[index + (isPrev ? -1 : 1)]
  if (returnIndex) {
    return next ? next.index : null
  }
  return next ? next.id : 0
}

const useStateRef = (menus, currentId) => {
  const menusRef = useRef(menus)
  const currentIdRef = useRef(currentId)

  useEffect(() => {
    menusRef.current = menus
  }, [menus])

  useEffect(() => {
    currentIdRef.current = currentId
  }, [currentId])

  return [menusRef, currentIdRef]
}

const Page = ({ store: { book, common }, data, id }) => {
  const [page, menuList, recommendBooks] = Array.isArray(data) && data.length >= 3 ? data : [Array.isArray(data) ? data[0] : null, [], []]
  const [menus, setMenus] = useState(menuList)
  const [currentId, setCurrentId] = useState(id)
  // @TODO: 其他的看是不是还需要扩充一下
  const [menusRef, currentIdRef] = useStateRef(menus, currentId)
  const [list, setList] = useState(page ? [page] : [])
  const listRef = useRef(list)
  const [hasMore, setHasMore] = useState(true)
  // 这个 loading 给加载下一页的时候用的
  const [loading, setLoading] = useState(false)
  const LoadingChunk = useLoading(loading, hasMore)
  const loadingRef = useRef(loading)
  const sideNavRef = useRef(null)
  const bottomHeightRef = useRef(0)
  // 这个 loading 给上一页或点击目录里链接时用的
  const [reGetPageloading, setReGetPageloading] = useState(false)
  const reGetPageloadingRef = useRef(reGetPageloading)

  // 获取 page 数据
  const getData = useCallback(async (id, toNewId = true, reGetting = false) => {
    if (loadingRef.current || reGetPageloadingRef.current) {
      return
    }
    if (reGetting) {
      reGetPageloadingRef.current = true
      setReGetPageloading(true)
    } else {
      loadingRef.current = true
      setLoading(true)
    }

    const res = await getPageById(id, 1)
    const data = res.data.data;
    const [page] = Array.isArray(data) && data.length ? data : [null]
    if (page) {
      // @TODO: need test
      const _list = listRef.current.length > 99 ? [page] : [...listRef.current, page]
      listRef.current = _list
      setList(_list)
      toNewId && scrollIntoView(document.querySelector(`#page${id}`))
    }
    if (reGetting) {
      reGetPageloadingRef.current = false
      setReGetPageloading(false)
    } else {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  const getNextPageData = async (id, toNewId = false) => {
    if (!hasMore) {
      return
    }
    let nextId = getNextId(menus, id || currentId)
    if (nextId) {
      !document.querySelector(`#page${nextId}`) && await getData(nextId, toNewId)
    } else if (nextId === 0) {
      setHasMore(false)
    }
    return nextId
  }

  // 目录弹窗里上下加载更多
  const prevNoMoreRef = useRef(false)
  const nextNoMoreRef = useRef(false)
  const menusHttpLoadingRef = useRef(false)
  const [menusHttpLoading, setMenusHttpLoading] = useState(0)
  // 获取目录数据，isPrev 决定目录里是上面的还是下面的要请求，reSetMenus 是根据当前 currentId 重新更新目录数据，有 reSetMenus 的时候 isPrev无用
  const getMenusData = useCallback(async (id, novelId, isPrev = 0, reSetMenus = false) => {
    if (menusHttpLoadingRef.current) {
      return
    } else if (!reSetMenus) {
      if (isPrev && prevNoMoreRef.current) {
        return
      } else if (!isPrev && nextNoMoreRef.current) {
        return
      }
    }
    let data = null
    menusHttpLoadingRef.current = true
    setMenusHttpLoading(reSetMenus ? 2 : (isPrev ? -1 : 1))
    // 目录太多重新请求一次
    if (reSetMenus) {
      const res = await await getPageById(currentIdRef.current)
      data = res.data.data
      data = Array.isArray(data) && data.length > 1 ? data[1] : null
    } else {
      const res = await getPrevNextMenus(id, novelId, isPrev)
      data = res.data.data;
    }

    if (Array.isArray(data) && data.length) {
      setMenus(reSetMenus ? data : (isPrev ? [...data, ...menusRef.current] : [...menusRef.current, ...data]))

      if (reSetMenus) {
        prevNoMoreRef.current = nextNoMoreRef.current = false
      } else if (data.length < 50) {
        if (isPrev) {
          prevNoMoreRef.current = true
          sideNavRef.current && scrollIntoViewIfNeeded(sideNavRef.current.querySelector(`li[data-id="${id}"]`))
        } else {
          nextNoMoreRef.current = true
        }
      }
    }

    menusHttpLoadingRef.current = false
    setMenusHttpLoading(0)
  }, [])

  // currentId 变化时探查是否要重新请求目录列表，当前目录到最前/后一个目录时，再请求就没法根据目录列表获取上/下一个目录ID了
  const detectNeedResetMenus = () => {
    const len = menusRef.current.length
    let i = 0;
    let index = -1
    while (i < len - 1) {
      if (currentIdRef.current === menusRef.current[i].id) {
        index = i
        break
      }
      i++
    }
    // @TODO: 前几个和后面几个可能都会无意义重复请求
    if (index === -1 || (index < 10 && !prevNoMoreRef.current) || (index > len - 10 && !nextNoMoreRef.current)) {
      getMenusData(currentIdRef.current, page.novelId, 0, true)
    }
  }

  // 目录滚动时上下加载新目录
  useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
    if (!menusRef.current.length) {
      return
    }
    if (scrollTop < 50) {
      getMenusData(menusRef.current[0].id, page.novelId, 1)
    } else if (scrollTop + clientHeight >= scrollHeight - 50) {
      getMenusData(menusRef.current[menusRef.current.length - 1].id, page.novelId, 0)
    }
  }, sideNavRef)

  // 上一章或目录里链接点击
  const toPage = id => {
    setHasMore(true)
    listRef.current = []
    setList([])
    setCurrentId(id)
    setTimeout(() => {
      scrollIntoViewIfNeeded(document.querySelector('.searchBtn'))
    }, 100);
    getData(id, true, true)
  }
  const onMenusItemClick = id => e => {
    e.preventDefault()
    const toDom = document.querySelector(`#page${id}`)
    toDom ? scrollIntoView(toDom) : toPage(id)
  }
  const onPrev = id => () => {
    const prevDom = document.querySelector(`#page${id}`).previousElementSibling
    if (prevDom) {
      scrollIntoView(prevDom)
    } else {
      const prevId = getNextId(menus, id, true)
      prevId && toPage(prevId)
    }
  }
  const onNext = id => async () => {
    const nextDom = document.querySelector(`#page${id}`).nextElementSibling
    if (nextDom) {
      const nextId = +nextDom.id.replace('page', '')
      scrollIntoView(nextDom)
      // 请求下下一个
      getNextPageData(nextId)
    } else {
      // 下一个页还没有，就先加载同时跳到最下面，最后接着加载下下一页
      scrollIntoView(document.querySelector('footer'))
      if (id) {
        const nextId = await getNextPageData(id, true)
        getNextPageData(nextId, false)
      } else {
        setHasMore(false)
      }
    }
  }

  // 字体大小
  const fontSizeList = ['small14', 'small16', '', 'big20', 'big22', 'big24', 'big28']
  const [fontSizeClass, setFontSizeClass] = useState('')
  const onBig = id => () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    index < fontSizeList.length - 1 && setFontSizeClass(fontSizeList[index + 1])
    setCurrentId(id)
    // 高度变化后修复滚动位置
    setTimeout(() => {
      scrollIntoView(document.querySelector(`#page${id}`))
    }, 100);
  }
  const onSmall = id => () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    index > 0 && setFontSizeClass(fontSizeList[index - 1])
    setCurrentId(id)
    setTimeout(() => {
      scrollIntoView(document.querySelector(`#page${id}`))
    }, 100);
  }

  const onSetting = () => {

  }

  const onShowMenus = () => {
    if (!sideNavRef.current) {
      return
    }

    sideNavRef.current.style = 'left: 0'
    scrollIntoViewIfNeeded(sideNavRef.current.querySelector('.on'))
  }
  const onHideMenus = () => {
    sideNavRef.current && (sideNavRef.current.style = '')
  }
  const clickHideMenus = e => {
    e.stopPropagation()
    if (e.target.classList.contains('menusHidePrevent')) {
      return false
    }

    onHideMenus()
  }

  // 滚动时设置 currentId 为当前浏览的页面id
  const changeCurrentIdWhenScroll = (scrollTop) => {
    const pages = Array.from(document.querySelectorAll('.pages'))
    while (pages.length) {
      const dom = pages[pages.length - 1]
      const domTop = getElementToPageTop(dom)
      // domTop 还是 scrollTop 似乎有点偏差
      if (scrollTop > domTop - 150) {
        dom.id && setCurrentId(+dom.id.replace('page', ''))
        break
      }
      pages.pop()
    }
  }

  // 滚动时自动加载更多 page
  useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
    if (!bottomHeightRef.current) {
      bottomHeightRef.current = document.querySelector("#recommendChunk").clientHeight + document.querySelector("#footerChunk").clientHeight
    }
    changeCurrentIdWhenScroll(scrollTop)
    if (scrollTop + clientHeight >= scrollHeight - bottomHeightRef.current) {
      const pages = document.querySelectorAll('.pages')
      const lastPage = pages.length ? pages[pages.length - 1] : null
      const nextId = lastPage ? +lastPage.id.replace('page', '') : 0
      getNextPageData(nextId, true)
    }
  })

  useEffect(() => {
    getNextPageData()
  }, [])

  useEffect(() => {
    window && window.history.replaceState(null, null, window.location.href.replace(/page\/[^\/]+/, `page/${currentId}`))
    // 自动更新下一页数据
    const currentDom = document.querySelector(`#page${currentId}`)
    if (currentDom && !currentDom.nextElementSibling) {
      getNextPageData(currentId)
    }
    // 必要时更新目录列表
    detectNeedResetMenus()
  }, [currentId])

  useEffect(() => {
    document.body.addEventListener('click', clickHideMenus)

    return () => {
      document.body.removeEventListener('click', clickHideMenus)
    }
  }, [])

  return (
    <>
      <Head>
        <title>分类</title>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav />
      {!page ?
        <Page404>此章节不存在哦!</Page404> :
        <>
          <article className="chunkShadow">
            <header className="header crumbs">
              <strong><Link href="/" title="首页">首页</Link></strong>
              <span>/</span>
              <strong><Link as={`/book/${page.novelId}`} href={`/book?id=${page.novelId}`} title={page.novelName}>{page.novelName}</Link></strong>
              <span>/</span>
              <h1>{page.mname}</h1>
            </header>
            <div className={reGetPageloading ? 'loadingOnWrapper pagesWrapper' : 'pagesWrapper'}>
              {list.map((page, index) => {
                return (
                  <article key={`${page.id}`} className={`pages ${styles.page}`} id={`page${page.id}`}>
                    <div className={styles.pageSetting}>
                      <div className={styles.pageChange}>
                        <a className="menusHidePrevent" onClick={onShowMenus} title="章节列表">章节列表</a>
                        <a className={cx({ borderRight: true, disabled: page.index === 0 })} onClick={onPrev(page.id)}>上一章</a>
                        <a onClick={onNext(page.id)}>下一章</a>
                      </div>
                      <div className={styles.setting}>
                        <span onClick={onBig(page.id)} className={cx({ borderRight: true, disabled: fontSizeList.indexOf(fontSizeClass) > fontSizeList.length - 2 })}>字号加大</span>
                        <span onClick={onSmall(page.id)} className={cx({ disabled: fontSizeList.indexOf(fontSizeClass) < 1 })}>字号加小</span>
                        <span className={styles.settingBtn} onClick={onSetting}>更多设置</span>
                      </div>
                    </div>
                    <header className={`commonHeader ${styles.pageTitleHeader}`}>
                      <h2>{page.index > 0 ? `第${page.index}章 ` : ''}{page.mname}</h2>
                    </header>
                    <div className={styles[fontSizeClass]}>
                      {page.noPage ?
                        // @TODO: 反馈功能
                        <Page404 key={`${index}`}> 此章节缺失，我们会尽快处理。<br />还有问题请<a href="">反馈</a></Page404> :
                        <div className={styles.content} dangerouslySetInnerHTML={{ __html: page.content }}></div>}
                    </div>
                  </article>
                )
              })}
            </div>
          </article>
          {LoadingChunk}
          <article className="chunkShadow sideNav menusHidePrevent navTransition" ref={sideNavRef}>
            <header>
              <h2>章节列表</h2>
            </header>
            {menusHttpLoading === -1 ? <LoadingText /> : null}
            <ul>
              {menus.map(({ id, mname, index }) => (
                <li key={`${id}`} className={currentId === id ? 'on' : ''} data-id={id}>
                  <a href={`/page/${id}`} title={mname} onClick={onMenusItemClick(id)}>{index > 0 ? `第${index}章` : ''} {mname}</a>
                </li>
              ))}
            </ul>
            {menusHttpLoading === 1 ? <LoadingText /> : null}
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
  const res = await getPageById(id);
  const data = res.data.data;
  return { props: { data, id } }
}

export default inject('store')(observer(Page))