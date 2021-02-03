// import { getScan } from '@/utils/request'
import React, { useState } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './Search.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

const Search = ({ store: { common } }) => {
  // const toBookPage = e => {
  //   e.preventDefault()
  // }

  // @TODO: 默认为看最新搜索过的 => 热门小说第一个
  const [value, setValue] = useState('')
  const onSearch = e => {
    setValue(e.target.value)
  }

  return (
    <form className={cx({ search: true, hide: !common.showSearch })}>
      <fieldset className={styles.searchBtn}>
        <legend>搜索书本信息</legend>
        <label>书名</label>
        <input placeholder="请输入想要搜索的书名" value={value} onInput={onSearch} />
      </fieldset>
      <div className={styles.submitBtn}>搜一下</div>
    </form>
  )
}

export default inject('store')(observer(Search))
