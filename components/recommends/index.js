import { observer, inject } from 'mobx-react';
import BookList from '@@/bookList/index'

// @TODO: recommendBooks 数据放 store 里?
const RecommendBooks = ({ store: { common }, data }) => {
  return (
    <article className="chunkShadow" id="recommendChunk">
      <header className="header h2Header">
        <h2>
          热门推荐
          </h2>
        <a>更多...</a>
      </header>
      <BookList books={data} />
    </article>
  )
}

export default inject('store')(observer(RecommendBooks))