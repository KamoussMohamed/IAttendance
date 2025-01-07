const mongoose = require('mongoose');

const absentStudentSchema = new mongoose.Schema({
    firstName: String,
    midAndLastName: String,
    dateOfAbsence: String
}, { collection: 'studentAbsentFromSession' });

module.exports = mongoose.model('AbsentStudent', absentStudentSchema);