// utils/jwt.js
import jwt from "jsonwebtoken";

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true, // Ensures the cookie isn't accessible via JavaScript
    secure: process.env.NODE_ENV === "production", // Only sent over HTTPS in production
    sameSite: "none", // Use "none" for cross-origin requests
    maxAge: 24 * 60 * 60 * 1000, // Cookie lifespan (1 day in this case)
  });
  
};
