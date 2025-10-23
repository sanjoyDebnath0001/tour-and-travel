// controllers/packageController.js
const { pool } = require('../config/database');

// --- Admin: Add Package ---
exports.addPackage = async (req, res) => {
  const { title, location, description, image_url, price, reviews, rating, activities } = req.body;

  // Manual Validation
  if (!title || !location || !description || !price || isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'Missing required package fields (title, location, description, price).' });
  }

  // Coerce activities to valid JSON for storage
  let activitiesVal = null;
  if (activities !== undefined && activities !== null) {
    try {
      if (typeof activities === 'string') {
        // try to parse JSON string
        activitiesVal = JSON.parse(activities);
      } else {
        activitiesVal = activities;
      }
    } catch (e) {
      // if parsing fails, store as single-item array
      activitiesVal = [activities];
    }
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO Packages (title, location, description, image_url, price, reviews, rating, activities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        location,
        description,
        image_url,
        parseFloat(price),
        reviews || null,
        rating !== undefined && rating !== null ? parseFloat(rating) : null,
        activitiesVal ? JSON.stringify(activitiesVal) : null,
      ]
    );

    const [packages] = await pool.execute('SELECT * FROM Packages WHERE id = ?', [result.insertId]);

    res.status(201).json(packages[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add package.' });
  }
};

// --- Public/User: Get All Packages ---
exports.getAllPackages = async (req, res) => {
  try {
    const [packages] = await pool.execute('SELECT * FROM Packages');
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch packages.' });
  }
};

// --- Admin: Update Package ---
exports.updatePackage = async (req, res) => {
  const { id } = req.params;
  const { title, location, description, image_url, price, reviews, rating, activities } = req.body;

  // Manual Validation for price and rating
  if (price && isNaN(parseFloat(price))) {
    return res.status(400).json({ error: 'Price must be a number.' });
  }
  if (rating && isNaN(parseFloat(rating))) {
    return res.status(400).json({ error: 'Rating must be a number.' });
  }

  // Normalize activities
  let activitiesVal = null;
  if (activities !== undefined) {
    try {
      if (typeof activities === 'string') {
        activitiesVal = JSON.parse(activities);
      } else {
        activitiesVal = activities;
      }
    } catch (e) {
      activitiesVal = [activities];
    }
  }

  try {
    const setClauses = [];
    const values = [];

    if (title) { setClauses.push('title = ?'); values.push(title); }
    if (location) { setClauses.push('location = ?'); values.push(location); }
    if (description) { setClauses.push('description = ?'); values.push(description); }
    if (image_url) { setClauses.push('image_url = ?'); values.push(image_url); }
    if (price) { setClauses.push('price = ?'); values.push(parseFloat(price)); }
    if (reviews) { setClauses.push('reviews = ?'); values.push(reviews); }
    if (rating !== undefined) { setClauses.push('rating = ?'); values.push(parseFloat(rating)); }
    if (activities !== undefined) { setClauses.push('activities = ?'); values.push(activitiesVal ? JSON.stringify(activitiesVal) : null); }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    values.push(id);

    const query = ` UPDATE Packages SET ${setClauses.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    const [updatedPackage] = await pool.execute('SELECT * FROM Packages WHERE id = ?', [id]);
    res.json(updatedPackage[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update package.' });
  }
};

// --- Admin: Delete Package ---
exports.deletePackage = async (req, res) => {
    try {
        const [result] = await pool.execute('DELETE FROM Packages WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Package not found.' });
        }
        res.json({ message: 'Package deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete package.' });
    }
};