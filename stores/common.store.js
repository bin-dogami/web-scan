import { makeAutoObservable, observable, computed, toJS } from 'mobx';
import { SiteName } from '@/utils/index'
// import * as api from '@/requests/common';

export default class CommonStore {
  siteName = ''
  pageName = 'Home'
  showSearch = false

  constructor() {
    makeAutoObservable(this)
    this.siteName = SiteName
  }

  setPageName (name) {
    this.pageName = name
  }

  setShowSearch (status) {
    this.showSearch = status
  }
}
