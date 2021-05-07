import { useEffect } from 'react'
import styles from './Book.module.scss'
import classnames from 'classnames/bind';
const cx = classnames.bind(styles);
import Link from '@@/link/index'

const BookItem = ({ isHistory, hasMenu, data: { id, title, author, authorId, pageId, pageName, index, isLast, lastId, lastName, lastIndex } }) => {
  const isNew = isHistory && isLast && lastId > pageId
  const indexText = isNew ? (lastIndex > 0 ? '第' + lastIndex + '章 ' : '') : (index > 0 ? '第' + index + '章 ' : '')
  const name = `${indexText}${(isNew ? lastName : pageName)}`
  const historyId = isNew ? lastId : pageId

  let RightLink = (
    <Link as={`/author/${authorId}`} href={`/author?id=${authorId}`} title={`作者：${author}`} className={styles.Link}>
      {author}
    </Link>
  )

  if (isHistory) {
    RightLink = (
      <Link as={`/page/${historyId}`} href={`/page?id=${historyId}`} title={name} className={cx({ half: true, new: isNew })}>
        {name}
      </Link>
    )
  }

  if (hasMenu) {
    RightLink = (
      <Link as={`/page/${pageId}`} href={`/page?id=${pageId}`} title={`${pageName}`} className={styles.Link}>
        {pageName}
      </Link>
    )
  }

  return (
    <li className={styles.bookItemSimple}>
      <Link as={`/book/${id}`} href={`/book?id=${id}`} title={`${title}`} className={cx({ title: true, half: isHistory })}>
        <strong>{title}</strong>
      </Link>
      {RightLink}
    </li>
  )
}

export default BookItem