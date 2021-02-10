import { makeAutoObservable, observable, computed, toJS } from 'mobx';
import CommonStore from './common.store';
import TypesStore from './pages/types.mst';
// import BookStore from './pages/book.mst';
// import RouterStoreInstance from './router.store';

export class RootStore {
  common = new CommonStore();
  types = new TypesStore();
  // router = RouterStoreInstance;

  constructor() {
    makeAutoObservable(this);
  }
}

const rootStore = new RootStore();
export default rootStore;
