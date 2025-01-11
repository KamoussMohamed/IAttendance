const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionName: { type: String, required: true },
    sessionDuration: { type: String, required: true },
    taughtBy: { type: String, required: true }
}, {
    collection: 'sessionCollection'
});

module.exports = mongoose.model('Session', sessionSchema);