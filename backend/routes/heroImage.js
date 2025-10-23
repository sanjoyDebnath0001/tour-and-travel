// routes/heroImageRoutes.js
const express = require('express');
const heroImageController = require('../controllers/heroImageController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Public
router.get('/', heroImageController.getHeroImage);

// Admin Only (Requires Token and Admin Role)
router.put('/', verifyToken, isAdmin, heroImageController.setHeroImage);

module.exports = router;