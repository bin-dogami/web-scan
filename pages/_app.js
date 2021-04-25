// 公共组件、公共样式
import '@/styles/globals.scss'
import { useEffect } from 'react'
import { Provider } from 'mobx-react';
import rootStore from '@/stores';
import Router from "next/router";
import NProgress from 'nprogress'

// https://github.com/vercel/next.js/blob/canary/examples/with-loading/pages/_app.js
// https://stackoverflow.com/questions/60755316/nextjs-getserversideprops-show-loading
Router.events.on('routeChangeStart', (url) => {
  NProgress.start()
})
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

function MyApp ({ Component, pageProps }) {
  // useEffect(() => {
  //   // @TODO: 这块有问题，本地没问题，线上displayName为空
  //   if (Component.wrappedComponent) {
  //     const pageName = Component.wrappedComponent.type.displayName
  //     rootStore.common.setPageName(pageName)
  //     document.body.setAttribute('class', pageName)
  //   }
  // })

  return (
    <Provider store={rootStore}>
      <Component {...pageProps} />
    </Provider>
  )
}

export default MyApp
