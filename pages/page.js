import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react';
import { SiteName, Description, scrollIntoViewIfNeeded, scrollIntoView, LoadingText, NoMoreText, useLoading, useScrollThrottle, throttle, getElementToPageTop } from '@/utils/index'
import { WebStorage, MenusHideKey, SettingHideKey, ThemeKey, FontSizeKey, DefaultTheme, DefaultFontSize } from '@/utils/webStorage'
import { getPageById, getPrevNextMenus } from '@/utils/request'
import Image from 'next/image'

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
const cx = classnames.bind(styles)

const bgColorList = [
  {
    name: '白色皮肤',
    color: '#fff'
  },
  {
    name: '灰色皮肤',
    color: '#f3f3f3'
  },
  {
    name: '黄色皮肤',
    color: '#fbf6ec'
  },
  {
    name: '黑色皮肤',
    color: '#1b1b1b'
  },
  {
    name: '蓝色皮肤',
    color: '#c3d4e7'
  }
]
const getNextId = (list, id, isPrev = false, returnIndex) => {
  if (!id || !list.length) {
    return null
  }

  const len = list.length
  let i = 0;
  let index = -1
  while (i <= len - 1) {
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

const getLeftSlipPos = e => {
  const touches = e.touches
  if (touches.length === 1) {
    const clientX = touches[0].clientX
    if (clientX > 10) {
      return {
        x: clientX,
        y: touches[0].clientY
      }
    }
  }
  return null
}

const useStateRef = (menus, currentId, hasMore) => {
  const menusRef = useRef(menus)
  const currentIdRef = useRef(currentId)
  const hasMoreRef = useRef(hasMore)

  useEffect(() => {
    menusRef.current = menus
  }, [menus])

  useEffect(() => {
    currentIdRef.current = currentId
  }, [currentId])

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  return [menusRef, currentIdRef, hasMoreRef]
}

const Page = ({ data, id }) => {
  const [page, menuList, recommendBooks] = Array.isArray(data) && data.length >= 3 ? data : [Array.isArray(data) ? data[0] : null, [], []]

  // title
  const _title = page && page.title ? page.title : ''
  const _mname = page ? ((page.index > 0 ? `第${page.index}章 ` : '') + page.mname) : ''
  const title = _title ? `${_title}_${_mname}_${SiteName}_免费看小说` : `${SiteName}_免费看小说`
  const description = _title ? `${_title}最新章节阅读，${_title}是一部${page.typename},由${page.author}创作,${SiteName}提供最新更新章节。${_mname}` : Description
  const keywords = _title ? `${_mname},${_title}最新章节,${page.typename}阅读` : SiteName

  const [menus, setMenus] = useState(menuList)
  const [currentId, setCurrentId] = useState(id)
  const [list, setList] = useState(page ? [page] : [])
  const listRef = useRef(list)
  const [hasMore, setHasMore] = useState(true)
  // 这个 loading 给加载下一页的时候用的
  const [loading, setLoading] = useState(false)
  const LoadingChunk = useLoading(loading, hasMore)
  const loadingRef = useRef(loading)
  const sideNavRef = useRef(null)
  const settingRef = useRef(null)
  const bottomHeightRef = useRef(0)
  // 这个 loading 给上一页或点击目录里链接时用的
  const [reGetPageloading, setReGetPageloading] = useState(false)
  const reGetPageloadingRef = useRef(reGetPageloading)
  // @TODO: 其他的看是不是还需要扩充一下
  const [menusRef, currentIdRef, hasMoreRef] = useStateRef(menus, currentId, hasMore)

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
      const _list = [...listRef.current, page]
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

  const getCurrentIndex = useCallback((list, id) => {
    const _list = list || menusRef.current
    const _id = id || currentIdRef.current
    const len = _list.length
    let i = 0;
    let index = -1
    while (i <= len - 1) {
      if (_id === _list[i].id) {
        index = i
        break
      }
      i++
    }
    return index
  }, [])

  // 目录弹窗里上下加载更多
  const prevNoMoreRef = useRef(false)
  const nextNoMoreRef = useRef(false)
  const [nextNoMore, setNextNoMore] = useState(false)
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

    if (Array.isArray(data)) {
      data.length && setMenus(reSetMenus ? data : (isPrev ? [...data, ...menusRef.current] : [...menusRef.current, ...data]))

      if (reSetMenus) {
        const index = getCurrentIndex(data, id)
        // prev 要少一个
        if (index !== -1 && index < 24) {
          prevNoMoreRef.current = true
        } else if (index >= data.length - 25) {
          nextNoMoreRef.current = true
          setNextNoMore(true)
        } else {
          prevNoMoreRef.current = nextNoMoreRef.current = false
          setNextNoMore(false)
        }
      } else if (data.length < 50) {
        if (isPrev) {
          prevNoMoreRef.current = true
          sideNavRef.current && scrollIntoViewIfNeeded(sideNavRef.current.querySelector(`li[data-id="${id}"]`))
        } else {
          nextNoMoreRef.current = true
          setNextNoMore(true)
        }
      }
    }

    menusHttpLoadingRef.current = false
    setMenusHttpLoading(0)
  }, [])

  // currentId 变化时探查是否要重新请求目录列表，当前目录到最前/后一个目录时，再请求就没法根据目录列表获取上/下一个目录ID了
  const detectNeedResetMenus = () => {
    const index = getCurrentIndex()
    if (index === -1 || (index < 10 && !prevNoMoreRef.current) || (index > menusRef.current.length - 10 && !nextNoMoreRef.current)) {
      getMenusData(currentIdRef.current, page.novelId, 0, true)
    }
  }

  // 目录滚动时上下加载新目录
  useScrollThrottle((scrollTop, clientHeight, scrollHeight) => {
    if (!menusRef.current.length) {
      return
    }
    if (scrollTop < 50) {
      // @TODO: 加载完了应该跳到请求前的那个位置，不然如果前面还有很多章节，那会一直触发请求，跳到本次请求数量-2位置就行
      getMenusData(menusRef.current[0].id, page.novelId, 1)
    } else if (scrollTop + clientHeight >= scrollHeight - 150) {
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
  const onPrev = id => e => {
    e.preventDefault()
    const prevDom = document.querySelector(`#page${id}`).previousElementSibling
    if (prevDom) {
      scrollIntoView(prevDom)
    } else {
      const prevId = getNextId(menus, id, true)
      prevId && toPage(prevId)
    }
  }
  const onNext = id => async e => {
    e.preventDefault()
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
        getNextPageData(nextId)
      } else {
        setHasMore(false)
      }
    }
  }

  // 字体大小
  const fontSizeList = ['small14', 'small16', '', 'big20', 'big22', 'big24', 'big28']
  const [fontSizeClass, setFontSizeClass] = useState(DefaultFontSize)
  const setFontSize = (fs) => {
    setFontSizeClass(fs)
    WebStorage.set(FontSizeKey, fs)
  }
  const onBig = id => () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    index < fontSizeList.length - 1 && setFontSize(fontSizeList[index + 1])
    if (id) {
      setCurrentId(id)
      // 高度变化后修复滚动位置
      setTimeout(() => {
        scrollIntoView(document.querySelector(`#page${id}`))
      }, 100);
    }
  }
  const onSmall = id => () => {
    const index = fontSizeList.indexOf(fontSizeClass)
    index > 0 && setFontSize(fontSizeList[index - 1])
    if (id) {
      setCurrentId(id)
      setTimeout(() => {
        scrollIntoView(document.querySelector(`#page${id}`))
      }, 100);
    }
  }

  /*   const [openTagChange, setOpenTagChange] = useState(false)
    const openTagChangeRef = useRef(openTagChange)
    const onTapChangePage = () => {
      setOpenTagChange(!openTagChange)
    }

    useEffect(() => {
      openTagChangeRef.current = openTagChange
    }, [openTagChange]) */

  const onShowSetting = (e, right) => {
    e && e.preventDefault()
    if (!settingRef.current) {
      return
    }
    sideNavRef.current && (sideNavRef.current.style = '')

    settingRef.current.style = right ? `right: -${right}px` : 'right: 0'
    document.body.classList.add('oh')
    if (!right) {
      scrollIntoViewIfNeeded(settingRef.current.querySelector('.on'))
    }
  }
  const onShowMenus = (e, left) => {
    e && e.preventDefault()
    if (!sideNavRef.current) {
      return
    }
    settingRef.current && (settingRef.current.style = '')

    sideNavRef.current.style = left ? `left: -${left}px` : 'left: 0'
    document.body.classList.add('oh')
    if (!left) {
      scrollIntoViewIfNeeded(sideNavRef.current.querySelector('.on'))
    }
  }
  const onHidePops = () => {
    sideNavRef.current && (sideNavRef.current.style = '')
    settingRef.current && (settingRef.current.style = '')
    document.body.classList.remove('oh')
  }

  // 滚动时设置 currentId 为当前浏览的页面id
  const changeCurrentIdWhenScroll = (scrollTop, clientHeight) => {
    const pages = Array.from(document.querySelectorAll('.pages'))
    while (pages.length) {
      const dom = pages[pages.length - 1]
      const domTop = getElementToPageTop(dom)
      // domTop 还是 scrollTop 似乎有点偏差
      if (scrollTop > domTop - clientHeight + 100) {
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
    changeCurrentIdWhenScroll(scrollTop, clientHeight)
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

  const storeViewHistory = () => {
    const [page] = listRef.current.filter((page) => page.id === currentId)
    if (page) {
      const { novelId, index, id, title, mname } = page
      WebStorage.storeBookLastReadMenu({
        id: novelId,
        title,
        pageId: id,
        pageName: mname,
        index,
        isLast: !hasMoreRef.current
      })
    }
  }

  useEffect(() => {
    window && window.history.replaceState(null, null, window.location.href.replace(/page\/[^\/]+/, `page/${currentId}`))

    // 存 storage 里
    storeViewHistory()

    // 自动更新下一页数据
    const currentDom = document.querySelector(`#page${currentId}`)
    if (currentDom && !currentDom.nextElementSibling) {
      getNextPageData(currentId)
    }

    // 必要时更新目录列表
    detectNeedResetMenus()
  }, [currentId])

  useEffect(() => {
    !hasMore && storeViewHistory()
  }, [hasMore])

  // storages
  const [menusTipShow, setMenusTipShow] = useState(true)
  const [settingTipShow, setSettingTipShow] = useState(true)

  // 这个功能之后弄
  // const isMovingRef = useRef(false)
  // const scrollToPage = (clientHeight, toPrev) => {

  // }
  // const onChangePage = e => {
  //   console.log(e)
  //   if (!openTagChangeRef.current) {
  //     return
  //   }
  //   setTimeout(() => {
  //     if (isMovingRef.current) {
  //       return
  //     }

  //     const clientHeight = document.documentElement.clientHeight
  //     if (e.clientX > clientHeight * 2 / 3) {
  //       scrollToPage(clientHeight)
  //     } else if (e.clientX < clientHeight * 1 / 3) {
  //       scrollToPage(clientHeight, true)
  //     }
  //   }, 300);
  // }
  const clickHideMenus = e => {
    // onChangePage(e)
    e.stopPropagation()
    if (menusTipShow) {
      setMenusTipShow(false)
      WebStorage.set(MenusHideKey, true)
    }
    if (settingTipShow) {
      setSettingTipShow(false)
      WebStorage.set(SettingHideKey, true)
    }

    if (e.target.classList.contains('menusHidePrevent')) {
      return false
    }

    onHidePops()
  }

  // 左/右滑
  const leftSlipStartRef = useRef(null)
  const leftSlipMovingRef = useRef(null)
  const isMovingUpDownRef = useRef(1)
  // 是左滑还是右滑
  const isLeftStartRef = useRef(0)
  const onTouchStart = e => {
    const leftSlipPos = getLeftSlipPos(e)
    if (!leftSlipPos) {
      return
    }

    leftSlipStartRef.current = leftSlipPos
    sideNavRef.current && sideNavRef.current.classList.remove('navTransition')
    settingRef.current && settingRef.current.classList.remove('settingTransition')
  }
  const onTouchMove = e => {
    if (!leftSlipStartRef.current) {
      return
    }
    // 防止误触出菜单
    const leftSlipPos = getLeftSlipPos(e)
    if (!leftSlipPos) {
      return
    }
    if (Math.abs(leftSlipPos.x - leftSlipStartRef.current.x) < 30) {
      isMovingUpDownRef.current += Math.abs(leftSlipPos.y - leftSlipStartRef.current.y) > Math.abs(leftSlipPos.x - leftSlipStartRef.current.x) ? 1 : -1
      isLeftStartRef.current += leftSlipPos.x > leftSlipStartRef.current.x ? 1 : -1
      return
    }
    // 上下滑动距离比左右大就让它上下滑动
    if (isMovingUpDownRef.current > 0) {
      isMovingUpDownRef.current = 1
      return
    }
    // 不在左滑和右滑条件里
    if (!isLeftStartRef.current) {
      return
    }
    const maxMenusLeft = document.documentElement.clientWidth * 0.7
    const isLeftStart = isLeftStartRef.current > 0
    const moveDistance = Math.min(Math.abs(leftSlipPos.x - leftSlipStartRef.current.x), maxMenusLeft)
    leftSlipMovingRef.current = leftSlipPos
    isLeftStart ? onShowMenus(null, maxMenusLeft - moveDistance) : onShowSetting(null, maxMenusLeft - moveDistance)
  }
  const onTouchEnd = e => {
    sideNavRef.current && sideNavRef.current.classList.add('navTransition')
    settingRef.current && settingRef.current.classList.add('settingTransition')
    if (!leftSlipStartRef.current || !leftSlipMovingRef.current) {
      return
    }
    // 不在左滑和右滑条件里
    if (!isLeftStartRef.current) {
      return
    }
    const minAutoMoveOutDistance = document.documentElement.clientWidth * 0.7 * (1 / 3)
    const isLeftStart = isLeftStartRef.current > 0
    // 左滑达到 1/3 的距离放手后就可以出菜单了
    if (Math.abs(leftSlipMovingRef.current.x - leftSlipStartRef.current.x) > minAutoMoveOutDistance) {
      isLeftStart ? onShowMenus(null) : onShowSetting(null)
    } else {
      onHidePops()
    }
    leftSlipStartRef.current = leftSlipMovingRef.current = null
    isLeftStartRef.current = 0
  }

  // 皮肤设置
  const [selectTheme, setSelectTheme] = useState(DefaultTheme)
  const onChangeTheme = (index) => () => {
    setSelectTheme(index)
    WebStorage.set(ThemeKey, index)
  }

  useEffect(() => {
    const classList = document.body.classList
    let index = bgColorList.length
    while (--index >= 0) {
      classList.contains(`pageTheme${index}`) && classList.remove(`pageTheme${index}`)
    }
    classList.add(`pageTheme${selectTheme}`)
  }, [selectTheme])

  useEffect(() => {
    // tips 提示只出现一次
    if (WebStorage.get(MenusHideKey)) {
      setMenusTipShow(false)
    }
    if (WebStorage.get(SettingHideKey)) {
      setSettingTipShow(false)
    }
    const theme = WebStorage.get(ThemeKey)
    theme && setSelectTheme(theme)
    const fontSize = WebStorage.get(FontSizeKey,)
    fontSize && setFontSizeClass(fontSize)

    document.body.addEventListener('click', clickHideMenus)

    return () => {
      document.body.removeEventListener('click', clickHideMenus)
    }
  }, [])

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta name="keywords" content={keywords}></meta>
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
              <strong><Link as={`/book/${page.novelId}`} href={`/book?id=${page.novelId}`} title={page.title}>{page.title}</Link></strong>
              <span>/</span>
              <h1>{page.mname || (page.index > 0 ? `第${page.index}章 ` : page.title)}</h1>
            </header>
            <div className={reGetPageloading ? 'loadingOnWrapper pagesWrapper' : 'pagesWrapper'} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
              {list.map((page, index) => {
                const prevId = getNextId(menus, page.id, true)
                const nextId = getNextId(menus, page.id, false)

                return (
                  <article key={`${page.id}`} className={`pages ${styles.page}`} id={`page${page.id}`}>
                    <div className={`pageSetting ${styles.pageSetting}`}>
                      <div className={styles.pageChange}>
                        <a href={`/book/${page.novelId}`} className={`${menusTipShow ? 'tipsBottomLeft' : ''} menusHidePrevent menusBtn`} onClick={onShowMenus} title="章节列表"></a>
                        {prevId ?
                          <a href={`/page/${prevId}`} className={cx({ borderRight: true })} onClick={onPrev(page.id)}>上一章</a> :
                          <span className={cx({ borderRight: true, disabled: true })}>前面没了</span>
                        }
                        {nextId ?
                          <a href={`/page/${nextId}`} onClick={onNext(page.id)}>下一章</a> :
                          <span onClick={onNext(page.id)}>后面没了</span>
                        }
                      </div>
                      <div className={styles.setting}>
                        <span onClick={onBig(page.id)} className={cx({ borderRight: true, disabled: fontSizeList.indexOf(fontSizeClass) > fontSizeList.length - 2 })}>字号加大</span>
                        <span onClick={onSmall(page.id)} className={cx({ disabled: fontSizeList.indexOf(fontSizeClass) < 1 })}>字号减小</span>
                        <span className={`${settingTipShow ? 'tipsTopRright' : ''} ${styles.settingBtn} menusHidePrevent settingBtn`} onClick={onShowSetting}></span>
                      </div>
                    </div>
                    <header className={`commonHeader ${styles.pageTitleHeader}`}>
                      <h2>{page.index > 0 ? `第${page.index}章 ` : ''}{page.mname}</h2>
                    </header>
                    <div className={styles[fontSizeClass]}>
                      {page.noPage ?
                        // @TODO: 反馈功能
                        <Page404 key={`${index}`}> 此章节缺失，我们会尽快处理。<br /></Page404> :
                        <div className={styles.content} dangerouslySetInnerHTML={{ __html: page.content }}></div>}
                    </div>
                  </article>
                )
              })}
            </div>
          </article>
          <div className={page.isComplete ? "pageLoading completeBook" : "pageLoading"}>{LoadingChunk}</div>
          <article className="chunkShadow sideNav menusHidePrevent navTransition" ref={sideNavRef}>
            <header>
              <h2>章节列表</h2>
              <p>（向右滑动出章节列表弹窗）</p>
            </header>
            {menusHttpLoading === -1 ? <LoadingText /> : null}
            <ul>
              {menus.map(({ id, mname, index }) => (
                <li key={`${id}`} className={currentId === id ? 'on' : ''} data-id={id}>
                  <a href={`/page/${id}`} title={mname} onClick={onMenusItemClick(id)}>{index > 0 ? `第${index}章` : ''} {mname}</a>
                </li>
              ))}
            </ul>
            {nextNoMore ? <NoMoreText /> : null}
            {menusHttpLoading === 1 ? <LoadingText /> : null}
          </article>
          <section className="chunkShadow sideSetting menusHidePrevent settingTransition" ref={settingRef}>
            <header>
              <h2>浏览习惯设置</h2>
              <p>（向左滑动出浏览习惯设置弹窗）</p>
            </header>
            <article className="goBackHome">
              <h3><Link href="/" title="回到首页">回到首页</Link></h3>
            </article>
            <article>
              <h3>皮肤设置</h3>
              <ul className="setTheme">
                {bgColorList.map(({ name, color }, index) => (
                  <li key={index} className={`theme${index} menusHidePrevent ` + `${index === selectTheme ? 'on' : ''}`} title={name} style={{ backgroundColor: color }} onClick={onChangeTheme(index)}>{name}</li>
                ))}
              </ul>
            </article>
            <article style={{ marginTop: '-10px' }}>
              <h3>字号设置</h3>
              <ul className="setFontSize">
                <li onClick={onBig(null)} className={`menusHidePrevent ${fontSizeList.indexOf(fontSizeClass) > fontSizeList.length - 2 ? 'disabled' : true} ${cx({ borderRight: true })}`}>+ 加大</li>
                <li onClick={onSmall(null)} className={`menusHidePrevent ${fontSizeList.indexOf(fontSizeClass) < 1 ? 'disabled' : ''}`}>- 减小</li>
              </ul>
            </article>
            {/* <article>
              <h3>阅读设置（如下图所示）</h3>
              <div className="setReadBehavior">
                <span className={`menusHidePrevent ${openTagChange ? 'disabled' : ''}`} onClick={onTapChangePage}>{openTagChange ? '已开启' : '开启'}</span>
                <div className="imageWrapper">
                  <Image src="/demo.gif" layout="fill" />
                </div>
              </div>
            </article> */}
            <article>
              <h3>更多功能开发中...</h3>
            </article>
          </section>
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