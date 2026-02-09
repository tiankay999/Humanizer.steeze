const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");



router.post("/HumanizerAi",(req,res)=>{
    try{

    }catch(error){
        return res.status(500).json({ message: "Internal server error" });
    }
})



module.exports = router;    