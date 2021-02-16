import { useEffect } from 'react'
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import Link from '@@/link/index'

const BookItem = ({ isHistory, data: { id, title, author, authorId, pageId, pageName, index, isLast, lastId, lastName, lastIndex } }) => {
  const isNew = isHistory && isLast && lastId > pageId
  const name = `${index > 0 ? '第' + (isNew ? lastIndex : index) + '章 ' : ''}${(isNew ? lastName : pageName)}`
  const historyId = isNew ? lastId : pageId

  return (
    <li className={styles.bookItemSimple}>
      <Link as={`/book/${id}`} href={`/book?id=${id}`} title={`书名：${title}`} className={cx({ title: true, half: isHistory })}>
        <strong>{title}</strong>
      </Link>
      {
        isHistory ?
          <Link as={`/page/${historyId}`} href={`/page?id=${historyId}`} title={name} className={cx({ half: true, new: isNew })}>
            {name}
          </Link>
          :
          <Link as={`/author/${authorId}`} href={`/author?id=${authorId}`} title={`作者：${author}`} className={styles.Link}>
            {author}
          </Link>
      }
    </li>
  )
}

export default BookItem