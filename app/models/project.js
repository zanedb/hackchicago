const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
  name: String,
  submitter: Object,
  collaborators: Object,
  tagline: String,
  description: String,
  timestamp: String,
  upvotes: Object
})

module.exports = mongoose.model('Project', ProjectSchema)
