import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body

    
    if (!name || !email || !password){
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    
    const existingUser = await User.findOne({email})

    if (existingUser){
      return res.status(400).json({
        message : "Email already in use"
      })
    }

    
     const salt=10
     const hashedPassword = await bcrypt.hash(password, salt)

   
     const user = new User({
      name:name,
      email:email,
      password:hashedPassword
    })

    await user.save()

    
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    })
    
  } catch (error) {
    return res.status(500).json({
      message: "Server Error"
    })
  }

});


router.post("/login", async (req, res) => {

  try {
    
    const { email , password } = req.body

    
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" })

    
    return res.status(200).json({ token });

  } catch (error) {
    return res.status(500).json({
      message: "Server Error"
    })
  }
})

export default router;