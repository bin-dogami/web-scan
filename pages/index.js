import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import { getIndexData } from '@/utils/request'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Link from '@@/link/index'
import BookItem from '@@/bookItem/index'
import BookItemSimple from '@@/bookItemSimple/index'

import styles from '@/styles/Home.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

const Home = ({ store: { common: { pageName } }, data }) => {
  const [typesData, setTypesData] = useState([]);
  const onPreventDefault = e => {
    e.preventDefault()
  }
  const [historyBooks, setHistoryBooks] = useState([{
    id: 19912,
    lastRead: '第108章，xxxx',
    title: "三寸人间"
  }, {
    id: 19912,
    // 上次的最新章节已读完
    lastRead: '已有更新：XXX',
    title: "三寸人间"
  }]);

  useEffect(() => {
    if (typeof data === 'object') {
      Array.isArray(data.typesData) && setTypesData(data.typesData);
    }
  }, [data])

  return (
    <>
      <Head>
        <title>老王爱看书网</title>
      </Head>
      <Top isIndex={true} />
      {/* <div className="content beauty"> */}
      <Search />
      <Nav />
      {/* banner */}
      <article className={styles.typesChunk}>
        <header className={styles.chunkTitle}>
          <h2><a href="">最新阅读</a></h2>
          <a href="" className={styles.more}>更多...</a>
        </header>
        <ul className={styles.list}>
          {historyBooks.map((item, index) => (
            <BookItemSimple isHistory={true} data={item} key={index} />
          ))}
        </ul>
      </article>
      {/* 没有最新阅读的就展示推荐的 */}
      <article className={cx({ typesChunk: true, mt8: true })}>
        <header>
          <h2 style={{ display: 'none' }}>推荐小说</h2>
        </header>
        <ul className={styles.list}>
          {/* {books.map((item, index) => (
              <BookItem data={item} key={index} />
            ))} */}
        </ul>
      </article>
      <article className={styles.typesChunk}>
        <header className={styles.chunkTitle}>
          <h2><a href="">热门小说</a></h2>
          <a href="" className={styles.more}>更多...</a>
        </header>
        <ul className={styles.list}>
          {/* {books.map((item, index) => (
              index === 0 ?
                <li><BookItem data={item} key={index} /></li> :
                <BookItemSimple data={item} key={index} />
            ))} */}
        </ul>
      </article>
      {typesData.map(({ id, name, books }, index) => (
        <article className={styles.typesChunk} key={index} onClick={onPreventDefault}>
          <header className={styles.chunkTitle}>
            <h2><Link as={`/types/${id}`} href={`/types?id=${id}`} title={`${name}`}>{name}</Link></h2>
            <Link as={`/types/${id}`} href={`/types?id=${id}`} title={'更多...'} className={styles.more}>更多...</Link>
          </header>
          <ul className={styles.list}>
            {books.map((item, index) => (
              index === 0 ?
                <li key={index}><BookItem data={item} /></li> :
                <BookItemSimple data={item} key={index} />
            ))}
          </ul>
        </article>
      ))}
    </>
  )
}

export async function getServerSideProps () {
  const res = await getIndexData();
  const data = res.data.data;
  return { props: { data } }
}

export default inject('store')(observer(Home))
