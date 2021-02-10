import { observer, inject } from 'mobx-react';
import BookList from '@@/bookList/index'
import Link from '@@/link/index'

// @TODO: recommendBooks 数据放 store 里?
const RecommendBooks = ({ store: { common }, data }) => {
  return (
    <article className="chunkShadow" id="recommendChunk">
      <header className="header h2Header">
        <h2>
          热门推荐
          </h2>
        <Link href={`/hot`} title={'更多热门推荐小说'}>更多...</Link>
      </header>
      <BookList books={data} />
    </article>
  )
}

export default inject('store')(observer(RecommendBooks))