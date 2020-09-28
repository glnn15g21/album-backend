const express = require('express')
const router = express.Router()

// get all category
router.get('/', (req, res) => {
  const resmessage = {
    message: 'OK'
  }
  res.json(resmessage)
})

module.exports = router
