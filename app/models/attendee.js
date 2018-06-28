const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
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
  hasRegistered: Boolean,
  isApproved: Boolean
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
