const express = require("express");
const router = express.Router();
const transporter = require("../config/email");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv. config();




//verification code (OTP) sending API  //
router.post("/send-otp", async (req, res) => {
  try {
    const id = req.user.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    storeOTP[id] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 }; // Fixed: 1000 instead of 100

    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Your verification code",
      text: `Your OTP is ${otp}`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    console.log("OTP email sent:", info.messageId);

    return res.status(200).json({
      message: `OTP sent successfully ${otp}`,
      messageId: info.messageId,

      // otp, // remove this in production
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return res.status(500).json({
      message: "Failed to send OTP",
      error: err.message,
    });
  }
});

app.post("/verify-otp", authMiddleware, async (req, res) => {
  const otp = req.body.otp;
  const id = req.user.id;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  if (!storeOTP[id]) {
    return res.status(401).json({ message: "No OTP sent for this user" });
  }

  // Check expiration
  if (Date.now() > storeOTP[id].expiresAt) {
    delete storeOTP[id];
    return res.status(401).json({ message: "OTP expired" });
  }

  // Compare OTP strings
  if (storeOTP[id].otp === otp) {
    delete storeOTP[id];
    return res.status(200).json({ message: "OTP Verified Successfully" });
  } else {
    return res.status(401).json({ message: "Invalid OTP" });
  }
});
