import { makeAutoObservable, runInAction } from 'mobx'

export default class TypesStore {
  start = 0
  // httpKey = ''

  constructor() {
    makeAutoObservable(this)
  }

  // setHttpKey () {
  //   // 这种结构防止同一个请求重复执行
  //   this.httpKey = `${this.typeValue}-${this.start}`
  // }

  setStart (start) {
    this.start = start
  }
}
