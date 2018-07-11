const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')

mongoose.connect(process.env.MONGODB_URI)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

let sess = {
  secret: process.env.EXPRESS_SESSION_SECRET,
  cookie: {},
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: true,
  saveUninitialized: true
}
// extra security in production environment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}
app.use(session(sess))
app.use(passport.initialize())
app.use(passport.session())

const discordBot = require('./app/controllers/discordBot')

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.redirect(302, 'https://hackchicago.io')
})

app.use('/api/*', (req, res) => {
  res.redirect(301, `/${req.params[0]}`)
})
app.use('/v1/signatures', require('./app/controllers/v1/signatures'))
app.use('/auth', require('./app/controllers/auth/auth'))
app.use('/v1/*', async (req, res, next) => {
  // only allow authenticated users to access API
  if (req.user) {
    next()
  } else {
    res.status(401).json({ message: 'Please authenticate.' })
  }
})
app.use('/v1/projects', require('./app/controllers/v1/projects'))
app.use('/v1/*', async (req, res, next) => {
  // only allow admin users to access other endpoints
  if (req.user.isAdmin) {
    next()
  } else {
    res.status(401).json({ message: 'You do not have access.' })
  }
})
app.use('/v1/attendees', require('./app/controllers/v1/attendees'))
app.use('/v1/referrals', require('./app/controllers/v1/referrals'))

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
