// routes/hotelRoutes.js
const express = require('express');
const hotelController = require('../controllers/hotelController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Public/User
router.get('/', hotelController.getAllHotels);

// Admin Only
router.post('/', verifyToken, isAdmin, hotelController.addHotel);
router.put('/:id', verifyToken, isAdmin, hotelController.updateHotel);
router.delete('/:id', verifyToken, isAdmin, hotelController.deleteHotel); 

module.exports = router;