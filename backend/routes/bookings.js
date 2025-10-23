// routes/bookings.js
const express = require('express');
const router = express.Router();

// If you have handlers, ensure they are attached to `router`, for example:
router.get('/', (req, res) => {
	// ...existing code...
	res.json({ message: 'Bookings root — implement handlers here' });
});

// ensure the router is exported
module.exports = router;