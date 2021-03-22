
export const DefaultTheme = 2
export const DefaultFontSize = ""

export const MenusHideKey = 'menus-hide-key'
export const SettingHideKey = 'setting-hide-key'
export const HistoryBooksKey = 'history-books-Key'
export const ThemeKey = 'theme-Key'
export const FontSizeKey = 'font-size-Key'

const maxStoredHistoryLen = 50
export const WebStorage = {
  getAll () {
    const storages = {}
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i)
      storages[key] = WebStorage.get(key)
    }
  },
  get (name) {
    const data = WebStorage._get(name)
    return data ? data.value : null
  },
  _get (name) {
    const data = localStorage.getItem(name)
    if (data) {
      return JSON.parse(data)
    } else {
      return null
    }
  },
  set (name, value) {
    const time = new Date().getTime()
    localStorage.setItem(name, JSON.stringify({
      time,
      value
    }))
  },
  storeBookLastReadMenu (obj) {
    let historys = WebStorage.get(HistoryBooksKey) || []
    let lastView = null
    if (historys.length) {
      for (const index in historys) {
        const page = historys[index]
        if (page.id === obj.id) {
          lastView = historys.splice(index, 1)
          break
        }
      }
    }
    // 只要读过最后一章，有数据更新时就给提示有新章节
    if (lastView && lastView.isLast) {
      obj = true
    }
    historys.unshift(obj)
    historys.length > maxStoredHistoryLen && (historys = historys.splice(historys.length - maxStoredHistoryLen))
    WebStorage.set(HistoryBooksKey, historys)
  }
}