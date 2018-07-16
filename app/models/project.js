const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
  name: String,
  link: String,
  submitter: {
    id: String,
    name: String
  },
  collaborators: Object,
  tagline: String,
  description: String,
  timestamp: String
})

module.exports = mongoose.model('Project', ProjectSchema)
