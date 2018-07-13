const express = require('express')
const router = express.Router()

router
  .route('/')
  .get((req,res) => {
    let user = {}
    user.id = req.user._id
    user.fname = req.user.fname
    user.lname = req.user.lname
    user.email = req.user.email
    user.phone = req.user.phone
    user.role = req.user.role
    res.status(200).json(user)
  })

module.exports = router