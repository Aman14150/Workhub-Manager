// utils/jwt.js
import jwt from "jsonwebtoken";

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "None", // Required for cross-origin requests
    secure: true, // Required for HTTPS
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};
