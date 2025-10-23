const express = require('express');
const router = express.Router();
// changed imports to match actual exports in controllers/authController.js
const {
    userRegister,
    userLogin,
    adminLogin
} = require('../controllers/authController');

// validate controller exports so the terminal error is descriptive if something is wrong
(() => {
    const controllers = {
        userRegister,
        userLogin,
        adminLogin
    };
    const missing = Object.entries(controllers)
        .filter(([, fn]) => typeof fn !== 'function')
        .map(([name]) => name);
    if (missing.length) {
        throw new Error(
            `auth.js route setup: Missing or invalid controller exports for: ${missing.join(
                ', '
            )}. Check ../controllers/authController.js — ensure you export these functions (named exports) and the require path is correct.`
        );
    }
})();

// add a small async wrapper so thrown/rejected promises in controllers go to next()
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// updated routes to match controller responsibilities
router.post('/register', asyncHandler(userRegister));
router.post('/login', asyncHandler(userLogin));
router.post('/admin/login', asyncHandler(adminLogin));

module.exports = router;
