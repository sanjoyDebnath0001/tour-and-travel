// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const packageRoutes = require('./routes/packages'); // Assume created
const bookings = require('./routes/bookings');
const heroImageRoutes = require('./routes/heroImage'); // Assume created

// Initialize App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Validate app.use inputs and provide clearer errors / helpful auto-registration
// (prevents: "TypeError: argument handler must be a function")
const originalUse = app.use.bind(app);
app.use = function(...args) {
	// If first arg is a mount path string, handlers follow; otherwise all args are handlers
	const mountPath = typeof args[0] === 'string' ? args[0] : null;
	const handlers = mountPath ? args.slice(1) : args;

	for (let i = 0; i < handlers.length; i++) {
		const h = handlers[i];
		if (typeof h === 'function') continue;

		// If an object was exported that contains function-valued properties (common mistake),
		// auto-register each function found on that object under the same mount path.
		if (h && typeof h === 'object') {
			const fnKeys = Object.keys(h).filter(k => typeof h[k] === 'function');
			if (fnKeys.length > 0) {
				console.warn(
					`app.use: received object at position ${i} with function properties [${fnKeys.join(
						', '
					)}]. Auto-registering those functions under '${mountPath || '/'}'.`
				);
				fnKeys.forEach((k) => originalUse(mountPath || '/', h[k]));
				// continue to next handler (we already registered the functions)
				continue;
			}
		}

		// Otherwise throw a descriptive error
		const preview =
			h && typeof h === 'object' ? `object keys=[${Object.keys(h).join(',')}]` : String(h);
		throw new TypeError(
			`argument handler must be a function. Received ${typeof h} (${preview}) when calling app.use(${mountPath ||
				''}).`
		);
	}

	// If all handlers were functions (or auto-registered), call the original app.use
	return originalUse(...args);
};

// Initialize DB and Tables
initDatabase(); // Runs on server start to ensure tables exist

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookings);
app.use('/api/hero-image', heroImageRoutes);

// Basic default route
app.get('/', (req, res) => {
    res.send('Tour and Travel Backend API is running....');
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));