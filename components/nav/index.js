import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import Link from '@@/link/index'

const Nav = ({ store: { common }, children }) => {
  // const isHome = !['Hot', 'Complete', 'Types', 'History'].includes(common.pageName)

  return (
    <nav className="nav">
      <Link href="/" className={common.pageName === 'Home' ? 'on' : ''} title="首页">首页</Link>
      <Link href="/hot" className={common.pageName === 'Hot' ? 'on' : ''} title="热门">热门</Link>
      <Link href="/complete" className={common.pageName === 'Complete' ? 'on' : ''} title="完本">完本</Link>
      <Link href="/types" className={common.pageName === 'Types' ? 'on' : ''} title="分类">分类</Link>
      {children ? children : <Link href="/history" className={common.pageName === 'History' ? 'on' : ''} title="阅读历史">阅读历史</Link>}
    </nav>
  )
}

export default inject('store')(observer(Nav))

