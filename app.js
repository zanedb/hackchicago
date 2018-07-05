const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()

const discordBot = require('./app/controllers/discordBot')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.redirect(302, 'https://hackchicago.io')
})

app.use('/api/*', (req, res) => {
  res.redirect(301, `/${req.params[0]}`)
})
app.use('/v1/*', (req, res, next) => {
  if (req.get('Auth') === process.env.AUTH_KEY) {
    console.log('Request received..')
    next()
  } else {
    res.status(403).json({ message: 'Please authenticate.' })
  }
})
app.use('/v1/attendees', require('./app/controllers/v1/attendees'))
app.use('/v1/projects', require('./app/controllers/v1/projects'))
app.use('/v1/referrals', require('./app/controllers/v1/referrals'))

mongoose.connect(process.env.MONGODB_URI)

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
