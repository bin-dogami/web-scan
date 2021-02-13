import React, { useState, useCallback, useEffect, useRef } from 'react'
import { observer, inject } from 'mobx-react'
import { getBookLastPageByIds } from '@/utils/index'
import { WebStorage, HistoryBooksKey } from '@/utils/webStorage'

import BookItemSimple from '@@/bookItemSimple/index'
import NoData from '@@/noData/index'

const HistoryRead = ({ getAll }) => {
  const [loaded, setLoaded] = useState(false)
  const [novels, setNovels] = useState([])

  const init = async () => {
    const historys = WebStorage.get(HistoryBooksKey)
    if (historys) {
      let list = Object.values(historys)
      if (!getAll) {
        list = list.slice(0, 5)
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