// utils/jwt.js
import jwt from "jsonwebtoken";

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development", // Use secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict", // Allow cookies in cross-origin requests in production
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};