const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const dotenv = require("dotenv");
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }



        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "User logged in successfully",
            user: user,
            token: token,
            email: user.email,
            name: user.name,
            phone: user.phone,
            id: user.id,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",

        });
    }
});


/* ── Google OAuth Login / Signup ── */
router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" });
        }

        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: "Google account has no email" });
        }

        // Try to find user by googleId first, then by email
        let user = await User.findOne({ where: { googleId } });

        if (!user) {
            // Check if a user with this email already exists (signed up with email/password)
            user = await User.findOne({ where: { email } });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                await user.save();
            } else {
                // Create a new user (no password needed for Google-only accounts)
                user = await User.create({
                    name: name || "Google User",
                    email,
                    googleId,
                    password: null,
                    phone: null,
                });
            }
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "Google login successful",
            user: user,
            token: token,
            email: user.email,
            name: user.name,
            id: user.id,
        });

    } catch (error) {
        console.error("Google login error:", error.message);
        return res.status(401).json({ message: "Invalid Google credential" });
    }
});


router.post("/admin-Login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const admin = Admin.findOne({ where: { email } });

        if (!admin) {
            return res.status(400).json({ message: "Admin not found" });
        }

        const isPasswordValid = bcrypt.compareSync(password, admin.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "Admin logged in successfully",
            admin: admin,
            token: token,
            email: admin.email,
            name: admin.name,
            phone: admin.phone,
            id: admin.id,
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})


module.exports = router;










module.exports = router;

