const express = require('express');
const router = express.Router();

router.route('/')
  // accessed at GET http://localhost:3000/api/v1/referrals 
  .get((req, res) => {
    // do stuff
  });

module.exports = router;