// routes/packageRoutes.js
const express = require('express');
const packageController = require('../controllers/packageController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Public/User
router.get('/', packageController.getAllPackages);

// Admin Only (Requires Token and Admin Role)
router.post('/', verifyToken, isAdmin, packageController.addPackage);
router.put('/:id', verifyToken, isAdmin, packageController.updatePackage);
router.delete('/:id', verifyToken, isAdmin, packageController.deletePackage);

module.exports = router;