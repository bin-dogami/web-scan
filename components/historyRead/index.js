import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react'
import { getBookLastPageByIds } from '@/utils/index'
import { WebStorage, HistoryBooksKey } from '@/utils/webStorage'

import BookItemSimple from '@@/bookItemSimple/index'
import NoData from '@@/noData/index'

const HistoryRead = ({ getAll, excluded }) => {
  const [loaded, setLoaded] = useState(false)
  const [novels, setNovels] = useState([])

  const init = async () => {
    const historys = WebStorage.get(HistoryBooksKey)
    if (historys) {
      let list = Object.values(historys)
      if (!getAll) {
        if (Array.isArray(excluded)) {
          const _excluded = excluded.map(({ pageId }) => pageId)
          const _list = []
          const repeatList = []
          while (list.length) {
            const item = list.shift()
            if (!_excluded.includes(item.pageId)) {
              _list.push(item)
            } else {
              repeatList.push(item)
            }
            if (_list.length >= 5) {
              break
            }
          }
          list = _list.length >= 5 ? _list : [..._list, ...repeatList].slice(0, 5)
        } else {
          list = list.slice(0, 5)
        }
      }
      setNovels(list)

      const needHttpList = list.filter(({ isLast }) => !!isLast)
      if (needHttpList.length) {
        const value = await getBookLastPageByIds(needHttpList.map(({ id, pageId }) => ({ id, pageId })), list)
        setNovels(value)
      }
    }
    setLoaded(true)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <>
      {!novels.length && loaded ?
        <NoData /> :
        <ul className="list">
          {novels.map((item, index) => (
            <BookItemSimple isHistory={true} data={item} key={index} />
          ))}
        </ul>
      }
    </>
  )
}

export default inject('store')(observer(HistoryRead))