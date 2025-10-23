// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Initializes the database tables.
 */
const initDatabase = async () => {
    try {
        const connection = await pool.getConnection();

        // 1. User Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Hotel Table
        // Extended schema to better match front-end `hotelData` shape.
        // Keeps `name` for backwards compatibility but adds `title`, `reviews`, `rating`, and `amenities`.
        // `amenities` is stored as JSON (MySQL 5.7+). If your MySQL version doesn't support JSON,
        // change it to TEXT and store stringified JSON instead.
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Hotels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                title VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                price DECIMAL(10, 2) NOT NULL,
                reviews VARCHAR(255),
                rating DECIMAL(3,2),
                amenities JSON
            )
        `);

        // 3. Package Table
        // Schema updated to match front-end tour/package data shape
        // Fields: title, location, description, image_url, price, reviews, rating, activities
        // `activities` is stored as JSON (MySQL 5.7+). If your MySQL version doesn't support JSON,
        // change it to TEXT and store stringified JSON instead.
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Packages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255),
                price DECIMAL(10, 2) NOT NULL,
                reviews VARCHAR(255),
                rating DECIMAL(3,2),
                activities JSON
            )
        `);

        // 4. Booking Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS Bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type ENUM('hotel', 'package') NOT NULL,
                item_id INT NOT NULL,
                booking_date DATE NOT NULL,
                status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        `);

        // 5. HeroImage Table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS HeroImages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(255) NOT NULL
            )
        `);

        connection.release();
        console.log('Database tables verified/created successfully.');
    } catch (error) {
        console.error('Error initializing database:', error.message);
        // Do not exit process if pool is running, but log error
    }
};

module.exports = {
    pool,
    initDatabase,
};