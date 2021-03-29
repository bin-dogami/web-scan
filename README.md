## Getting Started

```bash
> 不琯是开发环境还是生产环境启动都不用 next 命令，而用 server.js 脚本去启动，因为要用 history 模式: `https://www.nextjs.cn/docs/advanced-features/custom-server`
// 开发环境
yarn dev
// 生产环境，得先 build 编译了文件再 start
yarn build
yarn start
(build:start 别用了，使用 pm2 开启服务)
# pm2 启动
pm2 start npm --name scan -- run start
```

## 环境变量
* .env.local，通用配置？
* .env.development， dev 用的
* .env.production，start 用的

## 调试
手机上调试 dev 环境，使用 localhost 是访问不到的，得替换成电脑本机IP

## @TODO: LIST
* 将lib-flexible内联如项目头部，保证他最快执行

## 开发
* lib-flexible 如果有css不希望被转化单位则可使用以下方法/*no*/标签 `font-size: 12px; /*no*/`
* 页面里调试使用 VConsole，在 useEffect 里加上 `window.VConsole && new VConsole();`。这插件不支持 import?真垃圾

## tips
```
// 见 https://juejin.cn/post/6850418113062649869#heading-16，为了避免冲突，脚本检测到 @zeit/next-sass 配置后会自动禁用内置的模块化功能
Warning: Built-in CSS support is being disabled due to custom CSS configuration being detected.
```
###
对于 display: none 的内容，搜索引擎不会抓取