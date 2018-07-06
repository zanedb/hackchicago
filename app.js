const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passwordless = require('passwordless');
const mongoStore = require('passwordless-mongostore');

mongoose.connect(process.env.MONGODB_URI)

let sess = {
  secret: process.env.EXPRESS_SESSION_SECRET,
  cookie: {},
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}
// extra security in production environment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
  sess.cookie.secure = true
}
app.use(session(sess))

passwordless.init(new MongoStore(process.env.MONGODB_URI));
passwordless.addDelivery(function(tokenToSend, uidToSend, recipient, callback) {
  const host = 'http://localhost:3000';
  console.log(`${host}/?token=${tokenToSend}&uid=${encodeURIComponent(uidToSend)}`);
  var host = 'localhost:3000';
});

const discordBot = require('./app/controllers/discordBot')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.redirect(302, 'https://hackchicago.io')
})

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
  });

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

app.listen(port, () => {
  console.log(`Express server is running on port ${port}`)
})
