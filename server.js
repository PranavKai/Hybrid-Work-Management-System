// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/work-location', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
