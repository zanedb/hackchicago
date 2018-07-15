const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UpvoteSchema = new Schema({
  submitterId: String,
  projectId: String,
  timestamp: String,
  isBanned: { type: Boolean, default: false }
})

module.exports = mongoose.model('Upvote', UpvoteSchema)
