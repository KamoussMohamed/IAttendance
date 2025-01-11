const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: String,
    midAndLastName: String
}, { collection: 'studentCollection' });

module.exports = mongoose.model('Student', studentSchema);