import { makeAutoObservable, observable, computed, toJS } from 'mobx'
import CommonStore from './common.store'
// import IndexStore from './pages/index.mst'
// import BookStore from './pages/book.mst'
// import RouterStoreInstance from './router.store'

export class RootStore {
  common = new CommonStore()
  // index = new IndexStore()
  // types = new TypesStore()
  // router = RouterStoreInstance

  constructor() {
    makeAutoObservable(this)
  }
}

const rootStore = new RootStore()
export default rootStore
