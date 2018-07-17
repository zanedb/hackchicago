const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AttendeeSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  state: String,
  city: String,
  school: String,
  ref: String,
  grade: String,
  timestamp: String,
  internalNotes: String,
  note: String,
  phone: String,
  shirtSize: String,
  dietRestrictions: String,
  gender: String,
  discordId: String,
  hasRegistered: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  parentName: String,
  parentPhone: String,
  parentEmail: String,
  role: { type: String, default: 'attendee' }
})

module.exports = mongoose.model('Attendee', AttendeeSchema)
