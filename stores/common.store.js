import { makeAutoObservable, observable, computed, toJS } from 'mobx';
// import * as api from '@/requests/common';

export default class CommonStore {
  pageName = 'Home'
  showSearch = false

  constructor() {
    makeAutoObservable(this)
  }

  setPageName (name) {
    this.pageName = name
  }

  setShowSearch (status) {
    this.showSearch = status
  }
}
