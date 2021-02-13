import React, { useRef, useState, useCallback, useEffect } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './Search.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

import { getBookByName } from '@/utils/request'
import { throttle } from '@/utils/index'
import Link from '@@/link/index'

const storeSearchResults = {
  res: {},
  getRes (name) {
    if (!name || !name.trim().length) {
      return null
    }
    const res = storeSearchResults.res
    const _name = name.trim()
    return _name in res ? res[_name] : null
  },
  updateRes (name, list) {
    if (!name || !name.trim().length) {
      return
    }
    const res = storeSearchResults.res
    res[name.trim()] = list
  },
}

const Search = ({ store: { common }, defaultId, defaultValue, allwaysShow }) => {
  // @TODO: 默认为看最新搜索过的 => 热门小说第一个
  const [id, setId] = useState(+defaultId || 0)
  const [value, setValue] = useState(defaultValue || '')
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // 发请求
  const getData = useCallback(throttle(async (name) => {
    setLoading(true)
    setShowResult(true)

    const res = await getBookByName(name.trim())
    const list = Array.isArray(res.data.data) ? res.data.data : []
    setNovels(list)
    storeSearchResults.updateRes(name, list)
    setLoading(false)
  }, 300), [])

  const searchBook = useCallback((value) => {
    if (loading || !value || !value.trim().length) {
      return
    }

    getData(value)
  }, [loading])

  const onSelectBook = (id, title) => () => {
    setValue(title)
    setId(id)
  }

  const onSearch = useCallback(e => {
    const value = e.target.value
    setValue(value)
    if (value) {
      const cachedData = storeSearchResults.getRes(value)
      if (cachedData) {
        setShowResult(true)
        setNovels(cachedData)
      } else {
        searchBook(value)
      }
    } else {
      setShowResult(false)
    }
  }, [])

  const onClearValue = () => {
    setValue('')
  }

  const LoadingText = () => {
    return (
      <li className={styles.loading}>搜索中...</li>
    )
  }

  const NoNovelsText = () => {
    return (
      <li className={styles.loading}>找不到这本书的数据</li>
    )
  }

  const clickHideResult = e => {
    setShowResult(false)
    // e.stopPropagation()
  }

  useEffect(() => {
    document.body.addEventListener('click', clickHideResult)

    return () => {
      document.body.removeEventListener('click', clickHideResult)
    }
  }, [])

  return (
    <form className={cx({ search: true, hide: !allwaysShow && !common.showSearch })}>
      <fieldset className={styles.searchBtn}>
        <legend>搜索书本信息</legend>
        <label>书名</label>
        <input placeholder="请输入想要搜索的书名" value={value} onInput={onSearch} />
        <span className={cx({ close: true, show: value.length })} onClick={onClearValue}></span>
      </fieldset>
      {showResult ?
        <ul>
          {novels.length ?
            novels.map(({ id, title, author }) => (
              <li onClick={onSelectBook(id, title)} key={`${id}`}><strong>{title}</strong><span>作者: {author}</span></li>
            )) : (
              loading ? <LoadingText /> : <NoNovelsText />
            )
          }
        </ul> :
        null
      }
      <Link as={`/search/${value}/${id}`} href={`/search?name=${value}&id=${id}`} title="首页" className={styles.submitBtn}>搜一下</Link>
    </form>
  )
}

export default inject('store')(observer(Search))
