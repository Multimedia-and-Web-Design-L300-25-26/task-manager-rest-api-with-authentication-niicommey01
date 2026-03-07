import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  // - Return user (without password)

  try {

    const { name, email, password } = req.body

    // - Validate input
    if (!name || !email || !password){
      return res.status(400).json({
        message: "All fields are required"
      })
    }

    // - Check if user exists
    const existingUser = await User.findOne({email})

    if (existingUser){
      return res.status(400).json({
        message : "Email already in use"
      })
    }

     // - Hash password
     const salt=10
     const hashedPassword = await bcrypt.hash(password, salt)

     // - Save user
     const user = new User({
      name:name,
      email:email,
      password:hashedPassword
    })

    await user.save()

    // - Return user (without password)
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

// POST /api/auth/login
router.post("/login", async (req, res) => {

  try {
    
    const { email , password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    // - Find user
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    // - Compare password
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    // - Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" })

    // - Return token
    return res.status(200).json({ token });

  } catch (error) {
    return res.status(500).json({
      message: "Server Error"
    })
  }
})

export default router;