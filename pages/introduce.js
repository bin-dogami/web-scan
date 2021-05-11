import React from 'react'
import { observer, inject } from 'mobx-react'
import { getBookInfo } from '@/utils/request'
import { SiteName, Description, Keywords, devHost } from '@/utils/index'
import * as dayjs from 'dayjs'
import { IMAGE_HOST } from '@/utils/index'

import Head from 'next/head'
import Top from '@@/top/index'
import Search from '@@/search/index'
import Nav from '@@/nav/index'
import Footer from '@@/footer/index'
import Recommends from "@@/recommends/index";
import Link from '@@/link/index'
import Page404 from '@@/404/index'

import styles from '@/styles/Book.module.scss'
import classnames from 'classnames/bind'
const cx = classnames.bind(styles)

const Introduce = ({ data, id }) => {
  const [novel, lastMenu, recommendBooks, firstPageContent] = Array.isArray(data) && data.length >= 2 ? data : [{}, null, [], '']

  let title = `${SiteName}_无弹窗免费小说`
  let description = Description
  let keywords = `${SiteName},免费看小说`

  if (novel && novel.title) {
    title = `${novel.title}小说内容介绍_${novel.title}内容详细说明_${novel.title}小说预览_${novel.title}情节剧情_${novel.title}${novel.author}_${SiteName}`
    description = `${novel.title},是作家${novel.author}创作的${novel.typename},${SiteName}提供${novel.title}小说内容介绍、预览及剧情介绍,${novel.title}无弹窗免费观看,${SiteName}提供最佳在线阅读体验，章节阅读实现连续自动翻页`
    keywords = `${novel.title}小说简介,${novel.title}内容介绍,${novel.title}剧情说明,${novel.title}情节介绍`
  }

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}></meta>
        <meta name="keywords" content={keywords}></meta>
      </Head>
      <Top noH1={true} />
      <Search />
      <Nav name={'Book'} />
      {!novel ?
        <Page404>找不到这本书哦!</Page404> :
        <>
          <article className="chunkShadow">
            <header className="header crumbs">
              <strong><Link href="/" title="首页">首页</Link></strong>
              <span>/</span>
              <strong>
                <Link href={`/introducelist`} title="小说简介">小说简介</Link>
              </strong>
              <span>/</span>
              <h1>{novel.title}小说内容介绍</h1>
            </header>
            <div className={styles.novel}>
              <div className={styles.content}>
                <div className={styles.info}>
                  <p>小说作者：&nbsp; <Link as={`/author/${novel.authorId}`} href={`/author?id=${novel.authorId}`} title={`作者：${novel.author}`} className={styles.author}>{novel.author}</Link></p>
                  <p>小说分类：&nbsp; <Link href={`/types/${novel.typeid}`}>{novel.typename}</Link>
                  </p>
                  <p>小说状态：&nbsp; {novel.isComplete ? <Link href='/complete' title="已完本">已完本</Link> : '连载中'}</p>
                  <p>最新更新时间：&nbsp; {dayjs(novel.updatetime).format('YYYY-MM-DD HH:mm')}</p>
                  <p>
                    最新更新章节：&nbsp; {lastMenu && lastMenu.id ?
                      <Link as={`/page/${lastMenu.id}`} href={`/page?id=${lastMenu.id}`} className={styles.lastMenu}>
                        {lastMenu.index ? `第${lastMenu.index}章 ` : ''}{lastMenu.mname}
                      </Link> : '暂无'
                    }
                  </p>
                </div>
                <div className={styles.thumb}>
                  <img src={`${IMAGE_HOST}/${novel.thumb}`} alt={novel.title} title={novel.title} />
                </div>
              </div>
              <div className={`${styles.description} ${styles.mt30}`}>
                <strong>{novel.title}小说内容介绍: </strong>
                {(novel.description || '').trim()}
              </div>
              {firstPageContent ? 
              <div className={`${styles.description} ${styles.mt30}`}>
                  <h2>{novel.title}小说内容预览: </h2>
                  <div dangerouslySetInnerHTML={{__html: firstPageContent}} className={styles.shortContent} />
                </div>
              : null}
              <div className={styles.knowMore}>
                <Link as={`/book/${id}`} href={`/book?id=${id}`}>
                更多{novel.title}内容介绍/剧情说明点此查看
                </Link>
              </div>
            </div>
          </article>
          <Recommends data={recommendBooks} />
          <Footer />
        </>
      }
    </>
  )
}

export async function getServerSideProps ({ query }) {
  const id = query.id && +query.id || 0
  const res = await getBookInfo(id)
  const data = res.data.data
  return { props: { data, id } }
}


export default inject('store')(observer(Introduce))