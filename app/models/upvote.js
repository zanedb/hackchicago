const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UpvoteSchema = new Schema({
  submitterId: String,
  projectId: String,
  timestamp: String
})

module.exports = mongoose.model('Upvote', UpvoteSchema)
