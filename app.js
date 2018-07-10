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
app.use('/v1/*', (req, res, next) => {
  /*if (req.get('Auth') === process.env.AUTH_KEY) {
    console.log('Request received..')
    next()
  } else {
    res.status(403).json({ message: 'Please authenticate.' })
  }*/
  next()
})
app.use('/v1/auth', require('./app/controllers/v1/auth'))
app.use('/v1/attendees', require('./app/controllers/v1/attendees'))
app.use('/v1/projects', require('./app/controllers/v1/projects'))
app.use('/v1/referrals', require('./app/controllers/v1/referrals'))

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
