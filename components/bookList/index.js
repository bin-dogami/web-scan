import { observer, inject } from 'mobx-react';
import styles from './List.module.scss'
import BookItem from '../bookItem/index'

const List = ({ store: { types }, books }) => {
  return (
    <section className={styles.books}>
      <header className="hide">
        <h2>{types.typeName}</h2>
      </header>
      {books.map((item, index) => (
        <BookItem data={item} index={index} key={index} />
      ))}
    </section>
  )
}

export default inject('store')(observer(List))