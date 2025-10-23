// controllers/heroImageController.js
const { pool } = require('../config/database');

// --- Admin: Update/Set Hero Image (Only one entry) ---
exports.setHeroImage = async (req, res) => {
  const { image_url } = req.body;
  
  if (!image_url) {
    return res.status(400).json({ error: 'image_url is required.' });
  }

  try {
    // We assume there should only be one HeroImage record (ID=1). 
    // This logic ensures it's always an UPDATE or INSERT.
    const [result] = await pool.execute(
      'INSERT INTO HeroImages (id, image_url) VALUES (1, ?) ON DUPLICATE KEY UPDATE image_url = ?',
      [image_url, image_url]
    );

    const [heroImage] = await pool.execute('SELECT image_url FROM HeroImages WHERE id = 1');
    res.json(heroImage[0] || { image_url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set hero image.' });
  }
};

// --- Public: Get Hero Image ---
exports.getHeroImage = async (req, res) => {
  try {
    const [heroImage] = await pool.execute('SELECT image_url FROM HeroImages WHERE id = 1');
    
    if (heroImage.length === 0) {
        // Return a default empty response if not set
        return res.status(404).json({ error: 'Hero image not yet configured.' });
    }
    
    res.json(heroImage[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve hero image.' });
  }
};