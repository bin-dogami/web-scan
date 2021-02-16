import React from 'react'
import { observer, inject } from 'mobx-react';
import { getBookBySearch } from '@/utils/request'
import { SiteName, Description, Keywords } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'

const Query = ({ data, name }) => {
  const novels = typeof data === 'object' && data.id ? [data] : []

  return (
    <>
      <Head>
        <title>{`${name ? name + '查询_' : ''}${SiteName}`}</title>
        <meta name="description" content={Description}></meta>
        <meta name="keywords" content={Keywords}></meta>
      </Head>
      <Top noH1={true} noSearchBtn={true} />
      <Nav />
      <Search allwaysShow={true} />
      <header className="commonHeader searchHeader">
        <h1>查询{name ? ` #${name}# 结果` : ''}</h1>
      </header>
      <BookList books={novels} />
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const name = (query.name || '').trim()
  const id = query.id || ''
  let data = []
  if (name) {
    const res = await getBookBySearch(name, id)
    data = res.data.data
  }
  return { props: { data, name } }
}

export default inject('store')(observer(Query))