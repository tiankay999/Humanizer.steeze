const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
    try {
        const { name, email, password, phone, role  } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingAdmin = await Admin.findOne({ where: { email } });

        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists in our system" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hash,
            phone
        });

        if (!newAdmin) {
            return res.status(400).json({ message: "Admin could not be created" });
        }

        return res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin,
            email: newAdmin.email,
            name: newAdmin.name,
            phone: newAdmin.phone,
            id: newAdmin.id,
            role:newAdmin.role
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;