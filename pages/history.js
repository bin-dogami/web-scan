import React from 'react'
import { observer, inject } from 'mobx-react'
import { SiteName, Description, Keywords } from '@/utils/index'

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
        <title>{`历史阅读_${SiteName}`}</title>
        <meta name="description" content={`我的历史阅读小说列表,精彩尽在${SiteName}。`}></meta>
        <meta name="keywords" content={Keywords}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'History'} />
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