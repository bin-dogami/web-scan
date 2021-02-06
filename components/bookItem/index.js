import { useEffect } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import { devHost } from "@/utils/index";
import Link from '@@/link/index'

const BookItem = ({ store: { common }, data: { id, title, author, description, thumb } }) => {
  // const toBookPage = e => {
  //   e.preventDefault()
  // }

  // @TODO: 根据mobx 判断是否是主页，主页用`推荐`标签
  const isIndex = common.pageName === 'index'

  return (
    <article className={cx({ bookItem: true, isRecommend: isIndex })}>
      <div className={styles.thumb}>
        <Link as={`/book/${id}`} href={`/types?id=${id}`} title={title}>
          <img src={`http://${devHost}:3011/${thumb}`} alt={title} title={title} />
        </Link>
        {/* <img src="https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=507334429,3770328621&fm=179&app=42&f=JPEG?w=240&h=320&s=4D47CD0854A12DA5E11845D3010050B2"></img> */}
      </div>
      <div className={styles.info}>
        <header className={styles.infoTop}>
          <h3 className={styles.title}>
            <Link as={`/book/${id}`} href={`/book?id=${id}`} title={`书名：${title}`}>
              {title}
            </Link>
          </h3>
          <a href="" title={`作者：${author}`} className={styles.author}>
            {author}
          </a>
        </header>
        <p className={styles.description}>
          <Link as={`/book/${id}`} href={`/types?id=${id}`}>
            简介：{description.trim()}
          </Link>
        </p>
      </div>
    </article>
  )
}

// export default observer(BookItem)
export default inject('store')(observer(BookItem))