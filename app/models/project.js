const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProjectSchema = new Schema({
  name: String,
  link: String,
  submitter: {
    id: String
  },
  collaborators: Object,
  tagline: String,
  description: String,
  timestamp: String,
  images: {
    type: [String],
    default: [],
    validate: arr => arr.length <= 4
  }
})

module.exports = mongoose.model('Project', ProjectSchema)
