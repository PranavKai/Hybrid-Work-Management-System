// models/Location.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  floor: { type: String, required: true },
});

module.exports = mongoose.model('Location', LocationSchema);
