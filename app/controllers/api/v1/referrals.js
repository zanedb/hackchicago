const express = require('express')
const router = express.Router()

router
  .route('/')
  // Accessed at GET /api/v1/referrals
  .get((req, res) => {
    // TODO
  })

module.exports = router
