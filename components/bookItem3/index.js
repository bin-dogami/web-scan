import { useEffect } from 'react'
import { observer, inject } from 'mobx-react';
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import { devHost } from "@/utils/index";

const BookItem = ({ store: { common }, data: { id, title, author, description, thumb } }) => {
  const toBookPage = e => {
    e.preventDefault()
  }

  // @TODO: 根据mobx 判断是否是主页，主页用`推荐`标签
  const isIndex = common.pageName === 'index'

  return (
    <div className={cx({ bookItem: true, isRecommend: isIndex })} onClick={toBookPage}>
      <div className={styles.thumb}>
        <a href="">
          <img src={`http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071002.png`} alt={title} title={title} />
        </a>
        {/* <img src="https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=507334429,3770328621&fm=179&app=42&f=JPEG?w=240&h=320&s=4D47CD0854A12DA5E11845D3010050B2"></img> */}
      </div>
      <div className={styles.info}>
        <div className={styles.infoTop}>
          <a href="" title={`书名：${title}`} className={styles.title}>
            <strong>这是标题</strong>
          </a>
          <a href="" title={`作者：${author}`} className={styles.author}>
            这是副标题
          </a>
        </div>
        <div className={styles.description}>
          <a href="">
            简介：这是描述～～～～这是描述～～～～这是描述～～～～这是描述～～～～这是描述～～～～
          </a>
        </div>
      </div>
    </div>
  )
}

// export default observer(BookItem)
export default inject('store')(observer(BookItem))