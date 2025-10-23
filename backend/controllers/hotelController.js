// controllers/hotelController.js
const { pool } = require('../config/database');

// --- Admin: Add Hotel ---
exports.addHotel = async (req, res) => {
  const { name, location, description, image_url, price } = req.body;
  
  // Manual Validation
  if (!name || !location || !price || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: 'Missing required hotel fields (name, location, price).' });
  }
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO Hotels (name, location, description, image_url, price) VALUES (?, ?, ?, ?, ?)',
      [name, location, description, image_url, parseFloat(price)]
    );
    
    // Fetch the inserted record
    const [hotels] = await pool.execute('SELECT * FROM Hotels WHERE id = ?', [result.insertId]);

    res.status(201).json(hotels[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add hotel.' });
  }
};

// --- Public/User: Get All Hotels ---
exports.getAllHotels = async (req, res) => {
  try {
    const [hotels] = await pool.execute('SELECT * FROM Hotels');
    res.json(hotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch hotels.' });
  }
};

// --- Admin: Update Hotel ---
exports.updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, location, description, image_url, price } = req.body;
  
  // Manual Validation
  if (price && isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'Price must be a number.' });
  }

  try {
    // Build dynamic update query (basic example)
    const setClauses = [];
    const values = [];

    if (name) { setClauses.push('name = ?'); values.push(name); }
    if (location) { setClauses.push('location = ?'); values.push(location); }
    if (description) { setClauses.push('description = ?'); values.push(description); }
    if (image_url) { setClauses.push('image_url = ?'); values.push(image_url); }
    if (price) { setClauses.push('price = ?'); values.push(parseFloat(price)); }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    values.push(id); // Add ID for the WHERE clause
    
    const query =` UPDATE Hotels SET ${setClauses.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Hotel not found.' });
    }

    const [updatedHotel] = await pool.execute('SELECT * FROM Hotels WHERE id = ?', [id]);
    res.json(updatedHotel[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update hotel.' });
  }
};

// --- Admin: Delete Hotel ---
exports.deleteHotel = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM Hotels WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Hotel not found.' });
        }
        res.json({ message: 'Hotel deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete hotel.' });
    }
};