const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import routes
const studentRoutes = require('./routes/students');
const absenceRoutes = require('./routes/absences');

// Use routes
app.use('/students', studentRoutes);  // Changed from /studentsList to /students
app.use('/absences', absenceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;