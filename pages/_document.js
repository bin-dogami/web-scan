import Document, { Html, Head, Main, NextScript } from 'next/document'

import { IS_DEV } from '@/utils'

class MyDocument extends Document {
  // static async getInitialProps (ctx) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return { ...initialProps }
  // }

  render () {
    return (
      <Html>
        {IS_DEV ? <script src="https://cdn.bootcss.com/vConsole/3.3.4/vconsole.min.js"></script> : ''}
        {/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" /> */}
        <Head />
        <script src="/js/flexible.js"></script>
        <body>
          <Main />
          <NextScript />
          <script type="text/javascript" src="https://s9.cnzz.com/z_stat.php?id=1279768164&web_id=1279768164"></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument