const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const md5 = require('md5')
const sortJsonArray = require('sort-json-array')
const multer = require('multer')

// multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const album = req.body.album
    const dir = 'albums/' + album
    return cb(null, dir)
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

let ph = []
const serverUrl = global.serverUrl;
var appDir = path.dirname(require.main.filename)

// post list photos
router.post('/list', async (req, res) => {
  try {
    ph = []
    await crawl(path.join(appDir, 'albums'))
    ph = sortJsonArray(ph, 'id', 'asc')
    const skip = req.body.skip
    const limit = req.body.limit

    let startIndex = skip
    let endIndex = skip + limit
    if (startIndex > ph.length)startIndex = 0
    if (endIndex > ph.length)endIndex = ph.length - 1

    const resultPhotos = ph.slice(skip, endIndex)

    const results = {
      message: 'OK',
      documents: resultPhotos
    }
    res.json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// upload photos
router.put('/', upload.array('documents', 20), (req, res) => {
  console.log('files', req.files)
  const responseFiles = []
  const files = req.files
  for (const file of files) {
    console.log(file.originalname)
    const fileData = {
      album: req.body.album,
      name: file.originalname,
      path: '/album' + '/' + req.body.album + '/' + file.originalname,
      raw: serverUrl + '/' + req.body.album + '/' + file.originalname
    }
    responseFiles.push(fileData)
  }
  const responseMes = {
    message: 'OK',
    data: responseFiles
  }
  res.json(responseMes)
})
// delete single photo
router.delete('/:album/:filename', (req, res) => {
  let album = req.params.album
  album = album.toLowerCase()
  const path = 'albums/' + album + '/' + req.params.filename
  console.log('path=', path)
  try {
    fs.unlinkSync(path)
    // file removed
    console.log('deleted')
    res.json({
      message: 'OK'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// delete multiple photos
router.delete('/', (req, res) => {
  try {
    const files = req.body
    for (let i = 0; i < files.length; i++) {
      let album = files[i].album
      album = album.toLowerCase()
      const documents = files[i].documents
      if (documents.indexOf(',') !== -1) {
        var segments = documents.split(',')
        for (let s = 0; s < segments.length; s++) {
          const path = 'albums/' + album + '/' + segments[s].trim()
          fs.unlinkSync(path)
        }
      } else {
        const path = 'albums/' + album + '/' + files[i].documents
        fs.unlinkSync(path)
      }
    }
    res.json({
      message: 'OK'
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// directory crawler
function crawl (dir) {
  var files = fs.readdirSync(dir)
  for (var x in files) {
    var next = path.join(dir, files[x])
    var dN = dir.split('\\')
    var albumName = dN[dN.length - 1]
    var pathName = '/albums' + '/' + albumName + '/' + files[x]
    var raw = serverUrl + '/' + albumName + '/' + files[x]
    if (fs.lstatSync(next).isDirectory() === true) {
      crawl(next)
    } else {
      const p = {
        id: md5(files[x]),
        album: capitalize(albumName),
        name: files[x],
        path: pathName,
        raw: raw
      }
      ph.push(p)
    }
  }
}

function capitalize (word) {
  let w = word.slice(0, 1)
  w = w.toUpperCase()
  w = w + word.slice(1)
  return w
}

module.exports = router
