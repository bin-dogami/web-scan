import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  // static async getInitialProps (ctx) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return { ...initialProps }
  // }

  render () {
    return (
      <Html>
        <Head />
        {/* @TODO: 应该用lib-flexable 去弄这个，这里只解决了book页目录下拉选择时页面放大的问题 */}
        <meta content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument