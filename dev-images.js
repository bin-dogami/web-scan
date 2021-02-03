const express = require('express')
const app = express()
const path = require('path')
const ThumbPath = path.resolve(__dirname, '../api/images')

app.use(express.static(ThumbPath))

app.get('/images/*', function (req, res) {
  res.sendFile(ThumbPath + req.url.replace('/images', ''))
})

app.listen(3011, function () {
  console.log('Thumbs running at http://localhost:3011/')
})