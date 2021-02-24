import { useEffect } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import Link from '@@/link/index'
import Image from 'next/image'

// @TODO: 每本书也加上最新更新时间，或者以最新更新时间排序，像 http://www.loubiqu.com/paihangbang_allvisit/1.html 这里这样有个时间列表可看
const BookItem = ({ store: { common }, data: { id, title, author, authorId, description, thumb } }) => {
  const isIndex = common.pageName === 'Home'
  const isOrder = ['Types', 'Hot', 'Complete'].includes(common.pageName)

  return (
    <article className={`bgTheme ${cx({ bookItem: true, isRecommend: isIndex, bookItemOrder: isOrder })}`}>
      <div className={styles.thumb}>
        <Link as={`/book/${id}`} href={`/book?id=${id}`} title={title}>
          <Image src={`/${thumb}`} alt={title} title={title} layout="fill"></Image>
        </Link>
      </div>
      <div className={styles.info}>
        <header className={styles.infoTop}>
          <h3 className={styles.title}>
            <Link as={`/book/${id}`} href={`/book?id=${id}`} title={`书名：${title}`}>
              {title}
            </Link>
          </h3>
          <Link as={`/author/${authorId}`} href={`/author?id=${authorId}`} title={`作者：${author}`} className={styles.author}>{author}</Link>
        </header>
        <p className={styles.description}>
          <Link as={`/book/${id}`} href={`/book?id=${id}`}>
            简介：{description.trim()}
          </Link>
        </p>
      </div>
    </article>
  )
}

export default inject('store')(observer(BookItem))