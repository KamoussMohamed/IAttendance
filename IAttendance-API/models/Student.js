const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: String,
    midAndLastName: String
}, { collection: 'studentCollection' }); // Specify the collection name in the schema options

module.exports = mongoose.model('Student', studentSchema);