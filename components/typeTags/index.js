import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './TypeTags.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

const TypeTags = ({ store: { types }, data }) => {
  const list = [{ id: 0, name: '全部分类' }, ...data]
  const onChangeType = id => e => {
    e.preventDefault()
    types.setTypeValue(id, true)
    types.setStart(0)
    types.setHttpKey()
  }

  useEffect(() => {
    if (list.length > 1) {
      const currentType = list.filter(({ id }) => id === types.typeValue)
      types.setTypeName(currentType.length ? currentType[0].name : '')
    }
  }, [list, types.typeValue])

  return (
    <div className={`types ${styles.types}`}>
      {list.map(({ id, name }, index) => (
        <a key={index} href="" className={cx({ on: id === types.typeValue })} onClick={onChangeType(id)}>{name.replace('小说', '')}</a>
      ))}
    </div>
  )
}

export default inject('store')(observer(TypeTags))

