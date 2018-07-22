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
  tableId: String,
  image: String
})

module.exports = mongoose.model('Project', ProjectSchema)
