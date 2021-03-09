import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import Link from '@@/link/index'

const Nav = ({ name, children }) => {

  useEffect(() => {
    document.body.setAttribute('class', name)
  }, [name])

  return (
    <nav className="nav">
      <Link href="/" className={!name ? 'on' : ''} title="首页">首页</Link>
      <Link href="/hot" className={name === 'Hot' ? 'on' : ''} title="热门">热门</Link>
      <Link href="/complete" className={name === 'Complete' ? 'on' : ''} title="完本">完本</Link>
      <Link href="/types" className={name === 'Types' ? 'on' : ''} title="分类">分类</Link>
      {children ? children : <Link href="/history" className={name === 'History' ? 'on' : ''} title="阅读历史">阅读历史</Link>}
    </nav>
  )
}

export default inject('store')(observer(Nav))

