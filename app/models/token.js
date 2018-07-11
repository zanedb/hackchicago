const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  email: String,
  token: String,
  timestamp: String
})

module.exports = mongoose.model('Token', TokenSchema)
