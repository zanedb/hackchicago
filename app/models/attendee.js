const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
  fname: String,
  lname: String,
  email: String,
  state: String,
  city: String,
  discordId: String,
  hasRegistered: Boolean
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
