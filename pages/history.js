import React from 'react'
import { observer, inject } from 'mobx-react'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Link from '@@/link/index'
import HistoryRead from '@@/historyRead/index'

const History = () => {
  return (
    <>
      <Head>
        <title>历史阅读</title>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav />
      <article className="chunkShadow historyWrapper">
        <header className="header crumbs">
          <strong><Link href="/" title="首页">首页</Link></strong>
          <span>/</span>
          <h1>我的历史阅读</h1>
        </header>
        <HistoryRead getAll={true} />
      </article>
    </>
  )
}

export default inject('store')(observer(History))