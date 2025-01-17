// utils/jwt.js
import jwt from "jsonwebtoken";

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: "strict", // Adjust as needed ('strict', 'lax', or 'none')
    maxAge: 24 * 60 * 60 * 1000, // Example: 1 day
  });
  
};
