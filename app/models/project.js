const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
  name: String,
  link: String,
  submitter: Object,
  collaborators: Object,
  tagline: String,
  description: String,
  timestamp: String,
  upvotes: { type: Array, default: [] }
})

module.exports = mongoose.model('Project', ProjectSchema)
