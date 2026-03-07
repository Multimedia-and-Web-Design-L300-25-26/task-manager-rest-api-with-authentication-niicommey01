import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  
  try {

  // Extract token from Authorization header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      })
    }

  const token = authHeader.split(" ")[1]

   // Verify token
   const decoded = jwt.verify(token, process.env.JWT_SECRET)

   // Find user
   const user = await User.findById(decoded.userId).select("-password")

   if (!user) {
    return res.status(401).json({
      message:"Not atuhorized, user not found"
    })
   }

   // Attach user to req.user
   req.user = user;

   // Call next()
   next();
    
  } catch (error) {
    // If invalid → return 401
    return res.status(401).json({
      message: "Not authorized, token invalid"
    })
  };
}

export default authMiddleware;