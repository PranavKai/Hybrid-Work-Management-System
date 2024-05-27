// routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Location = require('../models/Location');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      res.status(201).send('User registered');
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).send('Invalid credentials');
      }
      const token = jwt.sign({ id: user._id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token, username: user.username });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('No token provided');
    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      if (err) return res.status(500).send('Failed to authenticate token');
      req.userId = decoded.id;
      next();
    });
  };
  

// Add Location
router.post('/location', verifyToken, async (req, res) => {
  const { location, floor } = req.body;
  try {
    const newLocation = new Location({ userId: req.userId, date: new Date(), location, floor });
    await newLocation.save();
    res.status(201).send('Location updated');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get('/all-locations', async (req, res) => {
    try {
      const locations = await Location.find().populate('userId', 'username');
      res.json(locations);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
// Get Locations (Analytics)
router.get('/locations', verifyToken, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.userId });
    res.json(locations);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/location/:id', verifyToken, async (req, res) => {
    const { location, floor } = req.body;
    const locationId = req.params.id;
  
    try {
      const updatedLocation = await Location.findOneAndUpdate(
        { _id: locationId, userId: req.userId },
        { location, floor },
        { new: true }
      );
      if (!updatedLocation) {
        return res.status(404).send('Location not found or not authorized');
      }
      res.json(updatedLocation);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  // Delete Location
  router.delete('/location/:id', verifyToken, async (req, res) => {
    const locationId = req.params.id;
  
    try {
      const deletedLocation = await Location.findOneAndDelete({ _id: locationId, userId: req.userId });
      if (!deletedLocation) {
        return res.status(404).send('Location not found or not authorized');
      }
      res.send('Location deleted');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });


  router.get('/locations/history', verifyToken, async (req, res) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
  
      const historicalLocations = await Location.find({ userId: req.userId, date: { $lt: yesterday } });
      res.json(historicalLocations);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  
module.exports = router;
