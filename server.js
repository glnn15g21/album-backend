const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')

global.serverUrl = 'http://localhost:8888/photos';

// use json
app.use(express.json())
const healthRouter = require('./routes/health.js')
app.use('/health', cors(), healthRouter)

const photoRouter = require('./routes/photo.js')
app.use('/photos', cors(), photoRouter)

app.use('/photos', express.static(path.join(__dirname, 'albums')))
app.listen(8888, () => console.log('server started'))
