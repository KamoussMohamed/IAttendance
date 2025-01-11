const express = require('express');
const router = express.Router();
const AbsentStudent = require('../models/AbsentStudent');
const authenticateToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/roleAuth');

// Get all absences
router.get('/', authenticateToken, authorizeRole('teacher'), async (req, res) => {
    try {
        const absences = await AbsentStudent.find({});
        res.json(absences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search absences by student name and date
router.get('/search',authenticateToken, authorizeRole('teacher'),  async (req, res) => {
    try {
        const { firstName, midAndLastName, dateOfAbsence } = req.query;
        
        const query = {};
        if (firstName) query.firstName = firstName;
        if (midAndLastName) query.midAndLastName = midAndLastName;
        if (dateOfAbsence) query.dateOfAbsence = dateOfAbsence;

        const absences = await AbsentStudent.find(query);

        if (!absences || absences.length === 0) {
            return res.status(404).json({ message: 'No absences found' });
        }

        res.json(absences);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;