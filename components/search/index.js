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
    storeSearchResults.res[name.trim()] = list
  },
}

const Search = ({ store: { common }, defaultValue, allwaysShow }) => {
  // @TODO: 默认为看最新搜索过的 => 热门小说第一个
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
    if (loading) {
      return
    }

    getData(value)
  }, [loading])

  const onSearch = useCallback(e => {
    let _value = e.target.value
    setValue(_value)
    if (value !== _value.trim()) {
      _value = _value.trim()
      if (_value) {
        const cachedData = storeSearchResults.getRes(_value)
        if (cachedData) {
          setShowResult(true)
          setNovels(cachedData)
        } else {
          searchBook(_value)
        }
      } else {
        setShowResult(false)
      }
    }
  }, [value])

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
              <li key={`${id}`}>
                <Link as={`/book/${id}`} href={`/book?id=${id}`} title={`${title}`}>
                  <strong>{title}</strong><span>作者: {author}</span>
                </Link>
              </li>
            )) : (
              loading ? <LoadingText /> : <NoNovelsText />
            )
          }
        </ul> :
        null
      }
      <Link as={`/search/${value}`} href={`/search?name=${value}`} title="首页" className={styles.submitBtn}>搜一下</Link>
    </form>
  )
}

export default inject('store')(observer(Search))
