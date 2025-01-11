// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['admin', 'teacher'],
        default: 'teacher'
    }
},{
    collection: 'accountsCollection'
});

module.exports = mongoose.model('Account', accountSchema);