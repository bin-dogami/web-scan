import { observer, inject } from 'mobx-react';

const Top = ({ store: { common }, isIndex, noH1 }) => {
  const toSearch = () => {
    common.setShowSearch(!common.showSearch)
  }
  return (
    <header className={isIndex ? 'indexTop top' : 'top'}>
      <div className="searchBtn" onClick={toSearch}>搜索</div>
      {noH1 ? <strong>老王爱看书</strong> : <h1>老王爱看书</h1>}
      <div className="setting">设置</div>
    </header>
  )
}

export default inject('store')(observer(Top))