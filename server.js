// https://www.nextjs.cn/docs/advanced-features/custom-server
// 只用于 dev，给 Link as 导致的 404 问题作一次转发，生产环境应该使用nginx转发
const { createServer, request } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const hasParamsPath = ['complete', 'types', 'book', 'author', 'page', 'hot', 'search', '404']

const collectUserVisitInfo = (data) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/scan/collectMHostUserVisit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }

  const req = request(options, res => {
    console.log(`（收集用户设备信息请求）请状态码: ${res.statusCode}`)

    res.setEncoding('utf8');
    res.on('data', d => {
      process.stdout.write(`success: ${d} \n\n`)
    })
  })

  req.on('error', error => {
    process.stdout.write(`error: ${error} \n\n`)
  })

  req.write(data);
  req.end()
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    const filterPath = hasParamsPath.filter((p) => pathname.includes(`/${p}/`))
    // console.log(parsedUrl)
    if (filterPath.length) {
      const path = filterPath[0]
      const value = pathname.replace(`/${path}/`, '')
      let params = path === 'search' ? { name: value } : { id: value }
      if (path === 'book') {
        const [id, page, desc] = value.split('/')
        params = {
          id, page, desc
        }
      }
      app.render(req, res, `/${path}`, { ...query, ...params })
      collectUserVisitInfo(JSON.stringify({ info: req.headers }))
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3010, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3010')
  })
})