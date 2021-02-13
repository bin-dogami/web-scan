import { observer, inject } from 'mobx-react';
import styles from './List.module.scss'
import BookItem from '../bookItem/index'

const List = ({ books }) => {
  return (
    <section className={styles.books}>
      <div>
        {books.map((item, index) => (
          <BookItem data={item} index={index} key={index} />
        ))}
      </div>
    </section>
  )
}

export default inject('store')(observer(List))