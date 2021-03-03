// https://www.nextjs.cn/docs/advanced-features/custom-server
// 只用于 dev，给 Link as 导致的 404 问题作一次转发，生产环境应该使用nginx转发
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const hasParamsPath = ['complete', 'types', 'book', 'author', 'page', 'hot', 'search', '404']

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    const filterPath = hasParamsPath.filter((p) => pathname.includes(`/${p}/`))
    if (filterPath.length) {
      const path = filterPath[0]
      const id = pathname.replace(`/${path}/`, '')
      const params = path === 'search' ? { name: id } : { id }
      app.render(req, res, `/${path}`, { ...query, ...params })
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3010, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3010')
  })
})