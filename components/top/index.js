import { observer, inject } from 'mobx-react';

const Top = ({ store: { common }, isIndex }) => {
  const toSearch = () => {
    common.setShowSearch(!common.showSearch)
  }
  return (
    <header className={isIndex ? 'indexTop top' : 'top'}>
      <div className="searchBtn" onClick={toSearch}>搜索</div>
      <h1>老王爱看书</h1>
      <div className="setting">设置</div>
    </header>
  )
}

export default inject('store')(observer(Top))