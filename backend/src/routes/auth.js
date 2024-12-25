const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET ;

// Route for creating a user
router.post(
    "/createuser",
    [
        body("name", "Name must be at least 6 characters long").isLength({ min: 6 }),
        body("email", "Enter a valid email address").isEmail(),
        body("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() }); // Validation errors
        }
        
        try {
            const { name, email, password } = req.body;

            // Check if the user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ success, error: "User already exists" });
            }

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create a new user
            user = new User({
                name,
                email,
                password: hashedPassword,
            });

            // Save the user to the database
            await user.save();

            // Generate JWT token
            const data = { user: { id: user.id } };
            const authToken = jwt.sign(data, JWT_SECRET);

            success = true;
            res.json({ success, authToken }); // Send token on success
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ success, error: "Internal server error" });
        }
    }
);

// Route for logging in a user
router.post(
    "/login",
    [
        body("email", "Enter a valid email address").isEmail(),
        body("password", "Password cannot be blank").exists(),
    ],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() }); // Validation errors
        }
        
        try {
            const { email, password } = req.body;

            // Check if the user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success, error: "Invalid credentials" });
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ success, error: "Invalid credentials" });
            }

            // Generate JWT token
            const data = { user: { id: user.id } };
            const authToken = jwt.sign(data, JWT_SECRET);

            success = true;
            res.json({ success, authToken }); // Send token on successful login
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ success, error: "Internal server error" });
        }
    }
);

module.exports = router;
