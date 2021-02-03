import { useEffect } from 'react'
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import Link from '@@/link/index'

const BookItem = ({ isHistory, data: { id, title, author, lastRead }, index }) => {
  const toBookPage = e => {
    e.preventDefault()
  }

  return (
    <li className={styles.bookItemSimple} onClick={toBookPage}>
      <Link as={`/book/${id}`} href={`/page?id=${id}`} title={`书名：${title}`} className={cx({ title: true, half: isHistory })}>
        <strong>{title}</strong>
      </Link>
      {
        isHistory ?
          <Link as={`/page/${id}`} href={`/page?id=${id}`} title={`章节：${lastRead}`} className={styles.half}>
            {lastRead}
          </Link>
          :
          <Link as={`/author/${id}`} href={`/author?id=${id}`} title={`作者：${author}`} className={styles.Link}>
            {author}
          </Link>
      }
    </li>
  )
}

export default BookItem