import React from 'react'
import { observer, inject } from 'mobx-react';
import { SiteName } from '@/utils/index'
import { getAuthorData } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

const Author = ({ data, id }) => {
  const [author, novels, authors] = Array.isArray(data) && data.length > 2 ? data : [null, [], []]
  let content = `精彩小说尽在${SiteName}. ${SiteName}提供玄幻小说,武侠小说,原创小说,网游小说,都市小说,言情小说,青春小说,历史小说,军事小说,网游小说,科幻小说,恐怖小说,首发小说,免费看小说`
  if (author) {
    const novelsText = novels.map(({ title }) => title).join(',')
    content = `${author.name}好看的书,${author.name}的书,${author.name}最新连载,${author.name}全部作品,${novelsText},小说阅读,` + content
  }

  let keywords = `${SiteName},免费看小说`
  if (author) {
    keywords = `${author.name},${author.name}全部作品,${author.name}最新连载,${author.name}好看的书,${author.name}新书,${author.name}粉丝,${author.name}大神之光,${author.name}作家主页`
  }

  return (
    <>
      <Head>
        <title>{author ? `${author.name}全部作品_${author.name}作家主页_${SiteName}_免费看小说` : `小说作者列表页_${SiteName}_免费看小说`}</title>
        <meta name="description" content={content}></meta>
        <meta name="keywords" content={keywords}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav />
      <header className="header crumbs">
        <strong><Link href="/" title="首页">首页</Link></strong>
        <span>/</span>
        {author ? <strong>小说作者列表页</strong> : <h1>小说作者列表页</h1>}
      </header>
      {author ?
        <article className="chunkShadow authorChunk">
          <header className="commonHeader">
            <h1>#{author.name}# 全部作品列表</h1>
          </header>
          <BookList books={novels} />
        </article> :
        null
      }
      <article className="chunkShadow authorChunk">
        <header className="header crumbs">
          <h2>大神作家</h2>
        </header>
        <ul className="authorList">
          {authors.map(({ id, name }) => {
            return author && author.id === id ? null : (
              <li key={id}>
                <Link as={`/author/${id}`} href={`/author?id=${id}`} title={`作者：${name}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
      </article>
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const res = await getAuthorData(id)
  const data = res.data.data
  return { props: { data, id } }
}

export default inject('store')(observer(Author))