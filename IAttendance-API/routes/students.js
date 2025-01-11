const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authenticateToken = require('../middlewares/auth');

// Get all students
router.get('/', authenticateToken, async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search student by firstName and midAndLastName
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const { firstName, midAndLastName } = req.query;
        
        const student = await Student.findOne({
            firstName: firstName,
            midAndLastName: midAndLastName
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;