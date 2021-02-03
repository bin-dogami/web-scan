import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import Link from '@@/link/index'
import styles from './Nav.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

const Nav = ({ store: { common }, data }) => {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={cx({ on: common.pageName === 'Home' })} title="首页">首页</Link>
      <Link href="/hot" className={cx({ on: common.pageName === 'Hot' })} title="热门">热门</Link>
      <Link href="/complete" className={cx({ on: common.pageName === 'Complete' })} title="完本">完本</Link>
      <Link href="/types" className={cx({ on: common.pageName === 'Types' })} title="分类">分类</Link>
      <Link href="/history" className={cx({ on: common.pageName === 'History' })} title="阅读历史">阅读历史</Link>
    </nav>
  )
}

export default inject('store')(observer(Nav))

