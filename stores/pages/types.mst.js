import { makeAutoObservable, runInAction } from 'mobx'

export default class TypesStore {
  typeValue = 0
  typeName = '全部分类'
  start = 0
  httpKey = ''

  constructor() {
    makeAutoObservable(this)
  }

  setTypeValue (value) {
    this.typeValue = value;
  }

  setTypeName (name) {
    this.typeName = name;
  }

  setHttpKey () {
    // 这种结构防止同一个请求重复执行
    this.httpKey = `${this.typeValue}-${this.start}`
  }

  setStart (start) {
    this.start = start
  }
}
