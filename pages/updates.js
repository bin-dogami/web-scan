import React from 'react'
import { observer, inject } from 'mobx-react'
import { getLastUpdates } from '@/utils/request'
import { SiteName, Description, Keywords } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Link from '@@/link/index'
import BookItemSimple from '@@/bookItemSimple/index'

const Updates = ({ data }) => {
  const names = data.slice(0, 5).map(({title}) => title).join('最新章节,')

  return (
    <>
      <Head>
        <title>{`最新更新的小说列表,${names}最新章节_${SiteName}`}</title>
        <meta name="description" content={Description}></meta>
        <meta name="keywords" content={Keywords}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={''} />
      <article className="chunkShadow historyWrapper">
        <header className="header crumbs">
          <strong><Link href="/" title="首页">首页</Link></strong>
          <span>/</span>
          <h1>最新更新</h1>
        </header>
        <ul className="list">
          {data.map((item, index) => (
            <BookItemSimple hasMenu={true} data={item} key={index} />
          ))}
        </ul>
      </article>
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const res = await getLastUpdates()
  const data = res.data.data
  return { props: { data } }
}

export default inject('store')(observer(Updates))