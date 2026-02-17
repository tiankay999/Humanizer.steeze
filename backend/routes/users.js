const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcrypt");


router.post("/", (req, res) => {

    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "User already  exist in our system" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUser = User.create({
            name,
            email,
            password: hash,
            phone
        })

        if (!newUser) {
            return res.status(400).json({ message: "User could not be created" });
        }

        return res.status(201).json({
            message: "User created successfully",
            user: newUser,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
            id: newUser.id,


        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/alluser",(req,res)=>{

    try{
    const findAllUsers= User.findAll();
     if (findAllUsers){
        return res.status(200).json({message:"This all User",findAllUsers});
     }

    }catch(err){
        return res.status(500).json({message:"Internal server error"});

    }
});




router.delete("/:id",(req,res)=>{

    try{  
        
        const deleteUser= User.destroy({where:{id:req.params.id}});
        if (deleteUser){
            return res.status(200).json({message:"User deleted successfully"});
        }else{
            return res.status(404).json({message:"User not found"});
        }




    }    catch(err){
        return res.status(500).json({message:"Internal server error"});



    }});


module.exports = router;