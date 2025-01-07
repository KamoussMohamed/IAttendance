const mongoose = require('mongoose');
const app = require('./app');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/presenceAI')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});