import Document, { Html, Head, Main, NextScript } from 'next/document'

import { IS_DEV } from '@/utils'

const baiduHmScript = () => {
  return {
    __html: `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?9598bdf276817c07e9d4393a5bd0da08";
      var s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(hm, s);
    })();`,
  }
}

class MyDocument extends Document {
  // static async getInitialProps (ctx) {
  //   const initialProps = await Document.getInitialProps(ctx)
  //   return { ...initialProps }
  // }

  render () {
    return (
      <Html>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        {/* {IS_DEV ? <script src="https://cdn.bootcss.com/vConsole/3.3.4/vconsole.min.js"></script> : ''} */}
        {/* <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" /> */}
        <Head />
        <script src="/js/flexible.js"></script>
        <body>
          <Main />
          <NextScript />
          {IS_DEV ? '' : <script type="text/javascript" src="https://s9.cnzz.com/z_stat.php?id=1279768164&web_id=1279768164"></script>}
          {IS_DEV ? '' : <script dangerouslySetInnerHTML={baiduHmScript()} />}
        </body>
      </Html>
    )
  }
}

export default MyDocument