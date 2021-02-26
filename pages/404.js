import React from 'react'
import { SiteName, Description, Keywords } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'

// @TODO: 未完
const Custom404 = () => {
  return (
    <>
      <Head>
        <title>404 页面-{SiteName}</title>
        <meta name="description" content={Description}></meta>
        <meta name="keywords" content={Keywords}></meta>
      </Head>
      <Top noH1={true} noSearchBtn={true} />
      <Nav />
      <Search allwaysShow={true} />
      <div className="page404">
        <h1>404，这个页面找不到了～</h1>
      </div>
    </>
  )
}

export default Custom404