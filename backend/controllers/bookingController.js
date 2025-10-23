// controllers/bookingController.js
const { pool } = require('../config/database');

// --- User: Create Booking ---
exports.createBooking = async (req, res) => {
  const { type, item_id, booking_date } = req.body;
  const userId = req.user.id; // From JWT payload
  
  // Manual Validation
  if (!['hotel', 'package'].includes(type) || !item_id || !booking_date) {
    return res.status(400).json({ error: 'Invalid booking data. Requires type ("hotel" or "package"), item_id, and booking_date.' });
  }
  
  try {
    // 1. Verify item exists
    const itemTable = type === 'hotel' ? 'Hotels' : 'Packages';
    const [items] = await pool.execute(`SELECT id FROM ${itemTable} WHERE id = ?`, [item_id]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: `${type} not found. `});
    }
    
    // 2. Create booking
    const [result] = await pool.execute(
      'INSERT INTO Bookings (user_id, type, item_id, booking_date, status) VALUES (?, ?, ?, ?, "Pending")',
      [userId, type, item_id, booking_date]
    );
    
    const [booking] = await pool.execute('SELECT * FROM Bookings WHERE id = ?', [result.insertId]);
    res.status(201).json(booking[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
};

// --- User: View Own Booking History ---
exports.getUserBookings = async (req, res) => {
  const userId = req.user.id;
  try {
    const [bookings] = await pool.execute(
      `SELECT 
        b.*, u.name AS user_name 
       FROM Bookings b
       JOIN Users u ON b.user_id = u.id
       WHERE b.user_id = ? 
       ORDER BY b.booking_date DESC`, 
       [userId]
    );
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve bookings.' });
  }
};

// --- Admin: View All Bookings (Grouped by Date) ---
exports.getAllBookings = async (req, res) => {
  try {
    const [bookings] = await pool.execute(
      `SELECT 
        b.*, 
        u.name AS user_name, u.email AS user_email,
        DATE_FORMAT(b.booking_date, '%Y-%m-%d') AS booking_day
       FROM Bookings b
       JOIN Users u ON b.user_id = u.id
       ORDER BY b.booking_date ASC`
    );
    
    // Group by booking_day in the controller
    const groupedBookings = bookings.reduce((acc, booking) => {
      const dateKey = booking.booking_day;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(booking);
      return acc;
    }, {});
    
    res.json(groupedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve all bookings.' });
  }
};