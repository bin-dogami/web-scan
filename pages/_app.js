// 公共组件、公共样式
import '@/styles/globals.scss'
import { useEffect } from 'react'
import { Provider } from 'mobx-react';
import rootStore from '@/stores';

function MyApp ({ Component, pageProps }) {
  const setRem = async () => {
    await require('lib-flexible')
  }

  useEffect(() => {
    setRem()
    window.addEventListener('resize', setRem)

    return () => {
      window.removeEventListener('resize', setRem)
    }
  }, [])

  useEffect(() => {
    if (Component.wrappedComponent) {
      const pageName = Component.wrappedComponent.type.displayName
      rootStore.common.setPageName(pageName)
      document.body.setAttribute('class', pageName)
    }
  })

  return (
    <Provider store={rootStore}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
