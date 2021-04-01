import React from 'react'
import { observer, inject } from 'mobx-react';
import { getBookByName } from '@/utils/request'
import { SiteName, Description, Keywords } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'

const Query = ({ data, name }) => {
  const novels = Array.isArray(data) ? data : []

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
        {/* 这里的 #name# 中的 name 为空的时候 为啥会显示 undefined */}
        <h1>查询{name ? ` #${name}# 共${novels.length}条结果` : ''}</h1>
      </header>
      <BookList books={novels} />
    </>
  )
}

export async function getServerSideProps ({ query }) {
  let name = decodeURI(query.name)
  name = (name || '').trim()
  let data = []
  if (name) {
    const res = await getBookByName(name)
    data = res.data.data
  }
  return { props: { data, name } }
}

export default inject('store')(observer(Query))