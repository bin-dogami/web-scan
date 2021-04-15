import React, { useEffect, useState } from 'react'
import { observer, inject } from 'mobx-react';
import { getIndexData } from '@/utils/request'
import { SiteName, Description, Keywords } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Link from '@@/link/index'
import BookItem from '@@/bookItem/index'
import BookItemSimple from '@@/bookItemSimple/index'
import HistoryRead from '@@/historyRead/index'

import styles from '@/styles/Home.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);

const Home = ({ data }) => {
  const [typesData, setTypesData] = useState([]);
  const [hotsData, setHotsData] = useState([]);
  const [updatesData, setUpdatesData] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 1) {
      const [types, hots, updates] = data
      setTypesData(types);
      setHotsData(hots)
      setUpdatesData(updates)
    }
  }, [data])

  return (
    <>
      <Head>
        <title>{`${SiteName}_免费无弹窗小书阅读_最佳阅读体验小说阅读`}</title>
        <meta name="description" content={Description}></meta>
        <meta name="keywords" content={Keywords}></meta>
      </Head>
      <Top isIndex={true} />
      <Search />
      <Nav />
      {/* banner */}
      {/* 最新更新的小说及章节 */}
      <article className={`homeHistory ${styles.typesChunk}`}>
        <header className={styles.chunkTitle}>
          <h2><Link href={`/updates`} title="最新更新">最新更新</Link></h2>
          <Link href={`/updates`} title="更多最新更新" className={styles.more}>更多...</Link>
        </header>
        <ul className={styles.list}>
          {updatesData.map((item, index) => (
            <BookItemSimple data={item} key={index} hasMenu={true} />
          ))}
        </ul>
      </article>
      <article className={`homeHistory ${styles.typesChunk}`}>
        <header className={styles.chunkTitle}>
          <h2><Link href={`/history`} title="最新阅读">最新阅读</Link></h2>
          <Link href={`/history`} title="更多最新阅读" className={styles.more}>更多...</Link>
        </header>
        <HistoryRead excluded={updatesData} />
      </article>
      <article className={styles.typesChunk}>
        <header className={styles.chunkTitle}>
          <h2><Link href="/hot" title="热门小说">热门小说</Link></h2>
          <Link href="/hot" title={'更多热门小说'} className={styles.more}>更多...</Link>
        </header>
        <ul className={styles.list}>
          {hotsData.map((item, index) => (
            index === 0 ?
              <li key={index}><BookItem data={item} key={index} /></li> :
              <BookItemSimple data={item} key={index} />
          ))}
        </ul>
      </article>
      {typesData.map(({ id, name, books }, index) => (
        <article className={styles.typesChunk} key={index}>
          <header className={styles.chunkTitle}>
            <h2><Link as={`/types/${id}`} href={`/types?id=${id}`} title={`${name}`}>{name}</Link></h2>
            <Link as={`/types/${id}`} href={`/types?id=${id}`} title={`更多${name}`} className={styles.more}>更多...</Link>
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
